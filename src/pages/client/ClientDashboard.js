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

  // Navigation handler for creating service requests
  const handleCreateService = () => {
    navigate('/requests/create');
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

            // Map proposals to orders (each accepted proposal is an order)
            return transformedProposals
              .filter(proposal => proposal.status === 'accepted')
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
                status: request.status === 'completed' ? 'completed' : 
                       request.status === 'in_review' ? 'in_progress' : 
                       request.status === 'open' ? 'in_progress' : 'in_progress',
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
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'in_progress': return 'In Progress';
      case 'delivered': return 'Delivered';
      case 'completed': return 'Completed';
      case 'revision': return 'Revision Required';
      case 'cancelled': return 'Cancelled';
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
            
            <Box sx={{ display: 'flex', gap: 1 }}>
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
                  background: 'linear-gradient(135deg, #000080 0%, #3333FF 100%)',
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
                  background: 'linear-gradient(135deg, #000080 0%, #3333FF 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #000066 0%, #000080 100%)',
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
                  borderColor: '#000080',
                  color: '#000080',
                  '&:hover': {
                    borderColor: '#000066',
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
                    <Assignment sx={{ fontSize: 32, color: '#000080' }} />
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
                        <Schedule sx={{ color: '#000080', fontSize: 24 }} />
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
                  <Typography variant="h2" sx={{ fontWeight: 800, mb: 1, color: '#000080' }}>
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
            background: 'linear-gradient(135deg, #000080 0%, #3333FF 100%)',
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
