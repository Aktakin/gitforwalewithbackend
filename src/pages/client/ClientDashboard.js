import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Button,
  Chip,
  Tab,
  Tabs,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Alert,
} from '@mui/material';
import {
  ShoppingCart,
  Schedule,
  Star,
  Message,
  MoreVert,
  Download,
  Visibility,
  CheckCircle,
  Cancel,
  Warning,
  TrendingUp,
  Assignment,
  Payment,
  Refresh,
  AttachMoney,
  Add,
  Work,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { db } from '../../lib/supabase';
import paymentService from '../../lib/paymentService';
import { transformRequest, transformProposal, transformUser, formatTimeAgo } from '../../utils/dataTransform';

const ClientDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [orderStats, setOrderStats] = useState({
    activeOrders: 0,
    completedOrders: 0,
    totalSpent: 0,
    averageRating: 0
  });
  const [closeProjectDialogOpen, setCloseProjectDialogOpen] = useState(false);
  const [closeProjectAction, setCloseProjectAction] = useState(null); // 'complete' or 'cancel'
  const [closeProjectReason, setCloseProjectReason] = useState('');

  // Navigation handler for creating service requests
  const handleCreateService = () => {
    navigate('/requests/create');
  };

  // Handle closing a project (complete or cancel)
  const handleCloseProject = (order, action) => {
    setSelectedOrder(order);
    setCloseProjectAction(action);
    setCloseProjectDialogOpen(true);
  };

  const confirmCloseProject = async () => {
    if (!selectedOrder) return;

    try {
      const newStatus = closeProjectAction === 'complete' ? 'completed' : 'canceled';
      
      // Update request status
      if (selectedOrder.requestId) {
        console.log('[ClientDashboard] Updating request status:', {
          requestId: selectedOrder.requestId,
          newStatus: newStatus
        });
        const { data: updatedRequest, error: requestError } = await db.supabase
          .from('requests')
          .update({ 
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedOrder.requestId)
          .select()
          .single();
        
        if (requestError) {
          console.error('[ClientDashboard] Error updating request:', requestError);
          throw requestError;
        }
        
        console.log('[ClientDashboard] Request updated successfully:', updatedRequest);
        
        // Wait a moment for the database to sync
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Update proposal status
      // Note: If constraint doesn't allow 'completed', we'll keep proposal as 'accepted'
      // and only update the request status to 'completed'
      if (selectedOrder.proposalId) {
        if (newStatus === 'completed') {
          // Try to set proposal to 'completed', but if it fails, keep it as 'accepted'
          // The request status change is what matters for filtering
          try {
            console.log('[ClientDashboard] Attempting to update proposal status to completed');
            await db.proposals.update(selectedOrder.proposalId, { 
              status: 'completed'
            });
            console.log('[ClientDashboard] Proposal status updated to completed');
            
            // Release escrow funds to provider when project is completed
            try {
              const { data: payment, error: paymentError } = await db.supabase
                .from('payments')
                .select('id, status, is_escrow')
                .eq('proposal_id', selectedOrder.proposalId)
                .eq('status', 'held')
                .maybeSingle();
              
              if (!paymentError && payment && payment.is_escrow && payment.status === 'held') {
                console.log('[ClientDashboard] Releasing escrow funds for payment:', payment.id);
                await paymentService.releaseEscrow(payment.id, user.id);
                console.log('[ClientDashboard] Escrow funds released successfully to provider');
              } else if (paymentError) {
                console.warn('[ClientDashboard] Could not find payment for proposal:', paymentError);
              }
            } catch (escrowError) {
              console.error('[ClientDashboard] Error releasing escrow funds:', escrowError);
              // Don't fail the completion if escrow release fails
              // Funds can be released manually later
            }
          } catch (proposalError) {
            console.warn('[ClientDashboard] Could not update proposal to completed, keeping as accepted:', proposalError.message);
            // Don't throw - the request status update is more important
            // The proposal will stay as 'accepted' but request will be 'completed'
          }
        } else {
          // For canceled projects, set proposal to rejected
          try {
            await db.proposals.update(selectedOrder.proposalId, { 
              status: 'rejected'
            });
          } catch (proposalError) {
            console.warn('[ClientDashboard] Could not update proposal to rejected:', proposalError.message);
          }
        }
      }

      // Refresh orders by refetching
      const userRequests = await db.requests.getAll({
        userId: user.id,
        pageSize: 100
      });

      const ordersWithProposals = await Promise.all(
        userRequests.map(async (dbRequest) => {
          const request = transformRequest(dbRequest);
          if (!request) return null;

          const proposals = await db.proposals.getByRequest(request.id);
          const transformedProposals = proposals.map(transformProposal).filter(p => p !== null);

          return transformedProposals
            .filter(proposal => proposal.status === 'accepted' || proposal.status === 'completed')
            .map(proposal => ({
              id: `ORD-${proposal.id.substring(0, 8).toUpperCase()}`,
              requestId: request.id,
              proposalId: proposal.id,
              title: request.title,
              description: request.description,
              provider: {
                id: proposal.user?.id || proposal.userId,
                userId: proposal.userId,
                name: proposal.user?.name || 'Unknown Provider',
                avatar: proposal.user?.avatar || proposal.user?.profilePicture,
                rating: 4.5,
                responseTime: '1 hour'
              },
              package: 'Standard',
              price: proposal.proposedPrice || 0,
              status: (() => {
                // Explicitly check for completed status
                if (request.status === 'completed') {
                  return 'completed';
                } else if (request.status === 'canceled') {
                  return 'canceled';
                } else {
                  // All other statuses are in_progress
                  return 'in_progress';
                }
              })(),
              progress: request.status === 'completed' ? 100 : 
                       request.status === 'canceled' ? 0 :
                       request.status === 'in_review' ? 75 : 50,
              orderDate: request.createdAt ? request.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              expectedDelivery: request.deadline ? request.deadline.toISOString().split('T')[0] : null,
              category: request.category,
              estimatedDuration: proposal.estimatedDuration
            }));
        })
      );

      const allOrders = ordersWithProposals.flat().filter(order => order !== null);

      // Debug: Log order statuses
      console.log('[ClientDashboard] Refreshed orders:', allOrders.map(o => ({
        id: o.id,
        title: o.title,
        status: o.status,
        requestStatus: 'N/A' // We'll check this in the mapping
      })));

      setOrders(allOrders);

      const activeOrders = allOrders.filter(o => o.status === 'in_progress').length;
      const completedOrders = allOrders.filter(o => o.status === 'completed').length;
      
      console.log('[ClientDashboard] Completed orders count:', completedOrders);
      const totalSpent = allOrders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + o.price, 0);

      setOrderStats({
        activeOrders,
        completedOrders,
        totalSpent,
        averageRating: orderStats.averageRating
      });

      // Save the action before clearing state
      const wasCompleted = closeProjectAction === 'complete';
      
      setCloseProjectDialogOpen(false);
      setSelectedOrder(null);
      setCloseProjectAction(null);
      setCloseProjectReason('');
      
      // Switch to Completed tab if project was completed
      // Wait for state to update, then switch tabs
      if (wasCompleted) {
        // Use a longer timeout to ensure orders state is updated
        setTimeout(() => {
          setTabValue(2); // Tab index 2 is "Completed"
          console.log('[ClientDashboard] Switched to Completed tab');
        }, 300);
      }
      
      alert(`Project ${wasCompleted ? 'completed' : 'canceled'} successfully! ${wasCompleted ? 'Switching to Completed tab...' : ''}`);
    } catch (error) {
      console.error('Error closing project:', error);
      alert(`Failed to ${closeProjectAction} project: ${error.message}`);
    }
  };

  // Fetch client dashboard data
  useEffect(() => {
    if (!user?.id || authLoading) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all requests created by this user
        const userRequests = await db.requests.getAll({
          userId: user.id,
          pageSize: 100
        });

        // For each request, fetch its proposals
        const ordersWithProposals = await Promise.all(
          userRequests.map(async (dbRequest) => {
            const request = transformRequest(dbRequest);
            if (!request) return null;

            // Fetch proposals for this request
            const proposals = await db.proposals.getByRequest(request.id);
            const transformedProposals = proposals.map(transformProposal).filter(p => p !== null);

            // Map proposals to orders (each accepted or completed proposal is an order)
            return transformedProposals
              .filter(proposal => proposal.status === 'accepted' || proposal.status === 'completed')
              .map(proposal => ({
                id: `ORD-${proposal.id.substring(0, 8).toUpperCase()}`,
                requestId: request.id,
                proposalId: proposal.id,
                title: request.title,
                description: request.description,
                provider: {
                  id: proposal.user?.id || proposal.userId,
                  userId: proposal.userId,
                  name: proposal.user?.name || 'Unknown Provider',
                  avatar: proposal.user?.avatar || proposal.user?.profilePicture,
                  rating: 4.5, // TODO: Calculate from reviews when reviews table is added
                  responseTime: '1 hour'
                },
                package: 'Standard',
                price: proposal.proposedPrice || 0,
                status: (() => {
                  // Explicitly check for completed status
                  if (request.status === 'completed') {
                    return 'completed';
                  } else if (request.status === 'canceled') {
                    return 'canceled';
                  } else {
                    // All other statuses are in_progress
                    return 'in_progress';
                  }
                })(),
                progress: request.status === 'completed' ? 100 : 
                         request.status === 'in_review' ? 75 : 50,
                orderDate: request.createdAt ? request.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                expectedDelivery: request.deadline ? request.deadline.toISOString().split('T')[0] : null,
                category: request.category,
                estimatedDuration: proposal.estimatedDuration
              }));
          })
        );

        // Flatten the array and filter out nulls
        const allOrders = ordersWithProposals.flat().filter(order => order !== null);

        setOrders(allOrders);

        // Calculate stats
        const activeOrders = allOrders.filter(o => o.status === 'in_progress').length;
        const completedOrders = allOrders.filter(o => o.status === 'completed').length;
        const totalSpent = allOrders
          .filter(o => o.status === 'completed')
          .reduce((sum, o) => sum + (o.price || 0), 0);
        
        // Calculate satisfaction rate based on completion rate (until reviews system is implemented)
        // Satisfaction = percentage of completed orders out of total orders
        const totalOrders = allOrders.length;
        const satisfactionRate = totalOrders > 0 
          ? (completedOrders / totalOrders) * 100 
          : 0;
        
        // Convert to 5-star rating equivalent (0-100% -> 0-5 stars)
        const averageRating = totalOrders > 0 
          ? ((satisfactionRate / 100) * 5).toFixed(1) 
          : 0;

        setOrderStats({
          activeOrders,
          completedOrders,
          totalSpent,
          averageRating: parseFloat(averageRating)
        });
      } catch (error) {
        console.error('Error fetching client dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id, authLoading]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'in_progress': return 'primary';
      case 'delivered': return 'success';
      case 'completed': return 'success';
      case 'revision': return 'warning';
      case 'cancelled':
      case 'canceled': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'in_progress': return 'In Progress';
      case 'delivered': return 'Delivered';
      case 'completed': return 'Completed';
      case 'revision': return 'Revision Required';
      case 'cancelled':
      case 'canceled': return 'Canceled';
      default: return status;
    }
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );

  const OrderCard = ({ order }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card sx={{ mb: 2, '&:hover': { boxShadow: 3 } }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {order.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {order.description}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar src={order.provider.avatar} sx={{ width: 32, height: 32 }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {order.provider.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Rating value={order.provider.rating} size="small" readOnly precision={0.1} />
                    <Typography variant="caption">
                      ({order.provider.rating})
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
            
            <Box sx={{ textAlign: 'right' }}>
              <Chip 
                label={getStatusText(order.status)} 
                color={getStatusColor(order.status)}
                size="small"
                sx={{ mb: 1 }}
              />
              <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                ${order.price}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {order.package} Package
              </Typography>
            </Box>
          </Box>

          {order.status === 'in_progress' && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Progress</Typography>
                <Typography variant="body2">{order.progress}%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={order.progress} />
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Order ID: {order.id}
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary">
                {order.expectedDelivery ? `Expected: ${order.expectedDelivery}` : 'No deadline set'}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button 
                size="small" 
                startIcon={<Message />}
                onClick={() => {
                  if (order.provider.id || order.provider.userId) {
                    navigate(`/contact/${order.provider.id || order.provider.userId}`);
                  }
                }}
                disabled={!order.provider.id && !order.provider.userId}
              >
                Message
              </Button>
              {order.status === 'in_progress' && (
                <>
                  <Button 
                    size="small" 
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle />}
                    onClick={() => handleCloseProject(order, 'complete')}
                  >
                    Complete
                  </Button>
                  <Button 
                    size="small" 
                    variant="outlined"
                    color="error"
                    startIcon={<Cancel />}
                    onClick={() => handleCloseProject(order, 'cancel')}
                  >
                    Cancel
                  </Button>
                </>
              )}
              {order.status === 'delivered' && !order.rating && (
                <Button 
                  size="small" 
                  variant="outlined"
                  startIcon={<Star />}
                  onClick={() => {
                    setSelectedOrder(order);
                    setReviewDialogOpen(true);
                  }}
                >
                  Review
                </Button>
              )}
              {order.status === 'completed' && (
                <Button size="small" startIcon={<Download />}>
                  Download
                </Button>
              )}
              <IconButton 
                size="small"
                onClick={(e) => setAnchorEl(e.currentTarget)}
              >
                <MoreVert />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (loading || authLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ mb: 4 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start', 
              mb: 2,
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 2, sm: 0 }
            }}>
            <Box>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #1E90FF 0%, #5BB3FF 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                  fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' }
                }}
              >
                My Orders Dashboard
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                Track your projects and manage your orders
              </Typography>
            </Box>
            
            {/* Action Buttons */}
            <Box sx={{ 
              display: 'flex', 
              gap: { xs: 1, sm: 2 }, 
              flexWrap: 'wrap',
              width: { xs: '100%', sm: 'auto' }
            }}>
              <Button
                variant="contained"
                size={isMobile ? "medium" : "large"}
                startIcon={<Add />}
                onClick={handleCreateService}
                fullWidth={isMobile}
                sx={{
                  px: { xs: 2, sm: 3 },
                  py: { xs: 1.25, sm: 1.5 },
                  fontWeight: 600,
                  borderRadius: 2,
                  minHeight: { xs: 44, sm: 48 },
                  background: 'linear-gradient(135deg, #1E90FF 0%, #5BB3FF 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0066CC 0%, #1E90FF 100%)',
                    transform: { xs: 'none', sm: 'translateY(-2px)' },
                    boxShadow: { xs: 'none', sm: '0 6px 20px rgba(0, 0, 128, 0.3)' },
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Create Service Request
              </Button>
              
              <Button
                variant="outlined"
                size={isMobile ? "medium" : "large"}
                startIcon={<Assignment />}
                onClick={() => navigate('/proposals')}
                fullWidth={isMobile}
                sx={{
                  px: { xs: 2, sm: 3 },
                  py: { xs: 1.25, sm: 1.5 },
                  fontWeight: 600,
                  borderRadius: 2,
                  minHeight: { xs: 44, sm: 48 },
                  borderColor: '#1E90FF',
                  color: '#1E90FF',
                  '&:hover': {
                    borderColor: '#0066CC',
                    backgroundColor: 'rgba(0, 0, 128, 0.04)',
                    transform: { xs: 'none', sm: 'translateY(-2px)' },
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                View Proposals
              </Button>
            </Box>
          </Box>
        </Box>
      </motion.div>

      {/* Enhanced Stats Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card 
                sx={{ 
                  height: '100%',
                  background: 'white',
                  border: '1px solid #e0e0e0',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '100px',
                    height: '100px',
                    background: 'rgba(0,0,0,0.02)',
                    borderRadius: '50%',
                    transform: 'translate(30px, -30px)',
                  }
                }}
              >
                <CardContent sx={{ position: 'relative', zIndex: 1, textAlign: 'center', py: 3 }}>
                  <Box 
                    sx={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      backgroundColor: '#f5f5f5',
                      mb: 2,
                      border: '1px solid #e0e0e0'
                    }}
                  >
                    <Assignment sx={{ fontSize: 32, color: '#1E90FF' }} />
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, color: '#333' }}>
                    {orderStats.activeOrders}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500, color: '#666' }}>
                    Active Orders
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#999', display: 'block', mt: 1 }}>
                    Projects in progress
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card 
                sx={{ 
                  height: '100%',
                  background: 'white',
                  border: '1px solid #e0e0e0',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '80px',
                    height: '80px',
                    background: 'rgba(0,0,0,0.02)',
                    borderRadius: '50%',
                    transform: 'translate(20px, -20px)',
                  }
                }}
              >
                <CardContent sx={{ position: 'relative', zIndex: 1, textAlign: 'center', py: 3 }}>
                  <Box 
                    sx={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      backgroundColor: '#f5f5f5',
                      mb: 2,
                      border: '1px solid #e0e0e0'
                    }}
                  >
                    <CheckCircle sx={{ fontSize: 32, color: '#4caf50' }} />
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, color: '#333' }}>
                    {orderStats.completedOrders}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500, color: '#666' }}>
                    Completed Orders
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#999', display: 'block', mt: 1 }}>
                    Successfully delivered
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card 
                sx={{ 
                  height: '100%',
                  background: 'white',
                  border: '1px solid #e0e0e0',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '60px',
                    height: '60px',
                    background: 'rgba(0,0,0,0.02)',
                    borderRadius: '50%',
                    transform: 'translate(-15px, 15px)',
                  }
                }}
              >
                <CardContent sx={{ position: 'relative', zIndex: 1, textAlign: 'center', py: 3 }}>
                  <Box 
                    sx={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      backgroundColor: '#f5f5f5',
                      mb: 2,
                      border: '1px solid #e0e0e0'
                    }}
                  >
                    <AttachMoney sx={{ fontSize: 32, color: '#ff9800' }} />
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, color: '#333' }}>
                    ${orderStats.totalSpent.toLocaleString()}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500, color: '#666' }}>
                    Total Investment
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#999', display: 'block', mt: 1 }}>
                    All-time spending
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card 
                sx={{ 
                  height: '100%',
                  background: 'white',
                  border: '1px solid #e0e0e0',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: '50%',
                    right: 0,
                    width: '90px',
                    height: '90px',
                    background: 'rgba(0,0,0,0.02)',
                    borderRadius: '50%',
                    transform: 'translate(25px, -50%)',
                  }
                }}
              >
                <CardContent sx={{ position: 'relative', zIndex: 1, textAlign: 'center', py: 3 }}>
                  <Box 
                    sx={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      backgroundColor: '#f5f5f5',
                      mb: 2,
                      border: '1px solid #e0e0e0'
                    }}
                  >
                    <Star sx={{ fontSize: 32, color: '#f44336' }} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                    {orderStats.completedOrders > 0 ? (
                      <>
                        <Typography variant="h3" sx={{ fontWeight: 800, color: '#333' }}>
                          {orderStats.averageRating.toFixed(1)}
                        </Typography>
                        <Box sx={{ ml: 1, display: 'flex' }}>
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i}
                              sx={{ 
                                fontSize: 16, 
                                color: i < Math.floor(orderStats.averageRating) ? '#f44336' : '#e0e0e0'
                              }} 
                            />
                          ))}
                        </Box>
                      </>
                    ) : (
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#999' }}>
                        N/A
                      </Typography>
                    )}
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500, color: '#666' }}>
                    Completion Rate
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#999', display: 'block', mt: 1 }}>
                    {orderStats.completedOrders > 0 
                      ? `Based on ${orderStats.completedOrders} completed orders`
                      : 'Complete orders to see rating'
                    }
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
        
        {/* Additional Stats Row */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Card 
              sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#333' }}>
                  Quick Activity Overview
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Box 
                        sx={{ 
                          width: 60, 
                          height: 60, 
                          borderRadius: '50%', 
                          backgroundColor: '#f5f5f5',
                          border: '1px solid #e0e0e0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 1,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                      >
                        <Schedule sx={{ color: '#1E90FF', fontSize: 24 }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#333' }}>
                        {orders.filter(o => o.status === 'in_progress').length}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        In Progress
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Box 
                        sx={{ 
                          width: 60, 
                          height: 60, 
                          borderRadius: '50%', 
                          backgroundColor: '#f5f5f5',
                          border: '1px solid #e0e0e0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 1,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                      >
                        <Warning sx={{ color: '#ff9800', fontSize: 24 }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#333' }}>
                        {orders.filter(o => o.status === 'revision').length}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Need Review
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Box 
                        sx={{ 
                          width: 60, 
                          height: 60, 
                          borderRadius: '50%', 
                          backgroundColor: '#f5f5f5',
                          border: '1px solid #e0e0e0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 1,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                      >
                        <TrendingUp sx={{ color: '#4caf50', fontSize: 24 }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#333' }}>
                        {orders.filter(o => o.status === 'delivered').length}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Recently Delivered
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                height: '100%',
                background: 'white',
                border: '1px solid #e0e0e0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}
            >
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, textAlign: 'center', color: '#333' }}>
                  🎯 Success Rate
                </Typography>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h2" sx={{ fontWeight: 800, mb: 1, color: '#1E90FF' }}>
                    {Math.round((orderStats.completedOrders / (orderStats.activeOrders + orderStats.completedOrders)) * 100)}%
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Projects completed successfully
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>

      {/* Orders Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Paper sx={{ borderRadius: 2 }}>
          <Tabs 
            value={tabValue} 
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label={`All Orders (${orders.length})`} />
            <Tab label={`Active (${orders.filter(o => o.status === 'in_progress').length})`} />
            <Tab label={`Completed (${orders.filter(o => o.status === 'completed').length})`} />
            <Tab label={`Delivered (${orders.filter(o => o.status === 'delivered').length})`} />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            {orders.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No orders yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Create a request and accept proposals to see your orders here
                </Typography>
                <Button variant="contained" startIcon={<Add />} onClick={handleCreateService}>
                  Create Service Request
                </Button>
              </Box>
            ) : (
              orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {orders.filter(o => o.status === 'in_progress').length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="body2" color="text.secondary">
                  No active orders
                </Typography>
              </Box>
            ) : (
              orders.filter(o => o.status === 'in_progress').map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {orders.filter(o => o.status === 'completed').length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="body2" color="text.secondary">
                  No completed orders
                </Typography>
              </Box>
            ) : (
              orders.filter(o => o.status === 'completed').map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            {orders.filter(o => o.status === 'delivered' || o.status === 'completed').length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="body2" color="text.secondary">
                  No delivered orders
                </Typography>
              </Box>
            ) : (
              orders.filter(o => o.status === 'delivered' || o.status === 'completed').map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            )}
          </TabPanel>
        </Paper>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Paper 
          sx={{ 
            p: 4, 
            mt: 4, 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #1E90FF 0%, #5BB3FF 100%)',
            color: 'white'
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
            Need something done?
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
            Browse thousands of talented freelancers ready to help with your next project
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            sx={{ 
              bgcolor: 'white', 
              color: 'primary.main',
              '&:hover': { bgcolor: 'grey.100' }
            }}
            href="/skills"
          >
            Browse Services
          </Button>
        </Paper>
      </motion.div>

      {/* Review Dialog */}
      <Dialog 
        open={reviewDialogOpen} 
        onClose={() => setReviewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Rate Your Experience</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                How was your experience with <strong>{selectedOrder.provider.name}</strong>?
              </Typography>
              
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Rating size="large" defaultValue={5} />
              </Box>
              
              <TextField
                fullWidth
                label="Write a review"
                multiline
                rows={4}
                placeholder="Share your experience and help other buyers..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>
            Skip
          </Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setReviewDialogOpen(false);
              alert('Review submitted successfully! 🌟');
            }}
          >
            Submit Review
          </Button>
        </DialogActions>
      </Dialog>

      {/* Close Project Dialog */}
      <Dialog 
        open={closeProjectDialogOpen} 
        onClose={() => {
          setCloseProjectDialogOpen(false);
          setCloseProjectReason('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {closeProjectAction === 'complete' ? 'Complete Project' : 'Cancel Project'}
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              <Alert 
                severity={closeProjectAction === 'complete' ? 'success' : 'warning'} 
                sx={{ mb: 2 }}
              >
                {closeProjectAction === 'complete' 
                  ? `Are you sure you want to mark "${selectedOrder.title}" as completed?`
                  : `Are you sure you want to cancel "${selectedOrder.title}"? This action cannot be undone.`
                }
              </Alert>
              
              <TextField
                fullWidth
                label={closeProjectAction === 'complete' ? 'Completion Notes (Optional)' : 'Cancellation Reason (Optional)'}
                multiline
                rows={3}
                value={closeProjectReason}
                onChange={(e) => setCloseProjectReason(e.target.value)}
                placeholder={
                  closeProjectAction === 'complete' 
                    ? 'Add any notes about the completed project...'
                    : 'Please provide a reason for canceling this project...'
                }
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setCloseProjectDialogOpen(false);
              setCloseProjectReason('');
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color={closeProjectAction === 'complete' ? 'success' : 'error'}
            onClick={confirmCloseProject}
          >
            {closeProjectAction === 'complete' ? 'Mark as Completed' : 'Cancel Project'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Order Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => setAnchorEl(null)}>
          <Visibility sx={{ mr: 1 }} /> View Details
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <Download sx={{ mr: 1 }} /> Download Files
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <Cancel sx={{ mr: 1 }} /> Request Cancellation
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default ClientDashboard;
