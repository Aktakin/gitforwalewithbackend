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
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp,
  Schedule,
  Star,
  MonetizationOn,
  Visibility,
  Edit,
  Message,
  Person,
  Work,
  Analytics,
  Notifications,
  Add,
  PlayArrow,
  Pause,
  CheckCircle,
  AccessTime,
  ThumbUp,
  Launch,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useSocket } from '../../contexts/SimpleSocketContext';
import { db } from '../../lib/supabase';
import { transformProposal, transformRequest, transformUser, formatTimeAgo } from '../../utils/dataTransform';

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { notifications: socketNotifications } = useSocket();
  const [tabValue, setTabValue] = useState(0);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [providerStats, setProviderStats] = useState({
    totalEarnings: 0,
    thisMonthEarnings: 0,
    activeOrders: 0,
    completedOrders: 0,
    rating: 0,
    responseTime: 'N/A',
    successRate: 0,
    profileViews: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [skillsPerformance, setSkillsPerformance] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Fetch provider dashboard data
  useEffect(() => {
    if (!user?.id || authLoading) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all proposals submitted by this user (provider)
        // getUserProposals already includes requests(*) data
        const userProposals = await db.proposals.getUserProposals(user.id);
        const transformedProposals = userProposals.map(transformProposal).filter(p => p !== null);

        // Filter accepted proposals (these are the "orders")
        const acceptedProposals = transformedProposals.filter(p => p.status === 'accepted');
        
        // Map proposals to orders (request data is already included in proposal.request)
        const ordersWithRequests = acceptedProposals.map((proposal) => {
          // Request data is already fetched with the proposal
          const dbRequest = proposal.request || (userProposals.find(p => p.id === proposal.id)?.requests);
          const transformedRequest = dbRequest ? transformRequest(dbRequest) : null;
          
          // Get client info from request
          const client = transformedRequest?.user || transformedRequest?.customer;
          
          return {
            id: proposal.id,
            proposalId: proposal.id,
            requestId: proposal.requestId,
            client: client?.name || 'Unknown Client',
            clientId: client?.id,
            clientAvatar: client?.avatar || client?.profilePicture,
            service: transformedRequest?.title || 'Service',
            status: transformedRequest?.status === 'completed' ? 'Completed' : 
                   transformedRequest?.status === 'in_review' ? 'In Progress' : 
                   transformedRequest?.status === 'open' ? 'Waiting' : 'In Progress',
            amount: proposal.proposedPrice || 0,
            deadline: transformedRequest?.deadline ? transformedRequest.deadline.toISOString().split('T')[0] : null,
            progress: transformedRequest?.status === 'completed' ? 100 : 
                     transformedRequest?.status === 'in_review' ? 75 : 
                     transformedRequest?.status === 'open' ? 0 : 50,
            category: transformedRequest?.category,
            request: transformedRequest
          };
        });

        const validOrders = ordersWithRequests.filter(o => o !== null);
        setRecentOrders(validOrders.slice(0, 10)); // Show 10 most recent

        // Calculate stats
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const completedOrders = validOrders.filter(o => o.status === 'Completed');
        const activeOrders = validOrders.filter(o => o.status === 'In Progress');
        const totalEarnings = completedOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
        const thisMonthEarnings = completedOrders
          .filter(o => {
            const orderDate = o.request?.createdAt || o.request?.updatedAt;
            return orderDate && new Date(orderDate) >= startOfMonth;
          })
          .reduce((sum, o) => sum + (o.amount || 0), 0);
        
        // Calculate success rate (completed / total accepted)
        const successRate = validOrders.length > 0 
          ? Math.round((completedOrders.length / validOrders.length) * 100)
          : 0;
        
        // Calculate rating from completion rate (until reviews system is added)
        const rating = validOrders.length > 0
          ? ((completedOrders.length / validOrders.length) * 5).toFixed(1)
          : 0;

        setProviderStats({
          totalEarnings,
          thisMonthEarnings,
          activeOrders: activeOrders.length,
          completedOrders: completedOrders.length,
          rating: parseFloat(rating),
          responseTime: '1 hour', // TODO: Calculate from message response times
          successRate,
          profileViews: 0 // TODO: Add profile views tracking
        });

        // Calculate skills performance
        const skillsMap = new Map();
        
        validOrders.forEach(order => {
          const category = order.category || 'Other';
          if (!skillsMap.has(category)) {
            skillsMap.set(category, {
              name: category,
              orders: 0,
              rating: 4.5, // TODO: Calculate from reviews
              earnings: 0
            });
          }
          const skill = skillsMap.get(category);
          skill.orders += 1;
          if (order.status === 'Completed') {
            skill.earnings += order.amount || 0;
          }
        });

        const skillsArray = Array.from(skillsMap.values())
          .sort((a, b) => b.earnings - a.earnings)
          .slice(0, 5); // Top 5 skills
        
        setSkillsPerformance(skillsArray);

        // Use real notifications from socket context
        const recentNotifications = (socketNotifications || [])
          .slice(0, 4)
          .map(notif => ({
            id: notif.id,
            type: notif.type || 'info',
            message: notif.message || notif.title,
            time: formatTimeAgo(notif.timestamp),
            unread: !notif.read
          }));
        
        setNotifications(recentNotifications);

      } catch (error) {
        console.error('Error fetching provider dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id, authLoading, socketNotifications]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress': return 'info';
      case 'Completed': return 'success';
      case 'Waiting': return 'warning';
      default: return 'default';
    }
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color = 'primary', trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card sx={{ 
        height: '100%',
        background: `linear-gradient(135deg, ${color === 'primary' ? '#000080' : color === 'success' ? '#2e7d32' : color === 'warning' ? '#ed6c02' : '#d32f2f'}15, ${color === 'primary' ? '#3333FF' : color === 'success' ? '#4caf50' : color === 'warning' ? '#ff9800' : '#f44336'}05)`,
        border: `1px solid ${color === 'primary' ? '#000080' : color === 'success' ? '#2e7d32' : color === 'warning' ? '#ed6c02' : '#d32f2f'}20`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                {value}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="caption" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
              {trend && (
                <Chip 
                  label={trend} 
                  size="small" 
                  color={trend.startsWith('+') ? 'success' : 'error'} 
                  sx={{ mt: 1 }}
                />
              )}
            </Box>
            <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>
              <Icon sx={{ fontSize: 28 }} />
            </Avatar>
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
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #000080 0%, #3333FF 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
            }}
          >
            Provider Dashboard
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Manage your services, track earnings, and grow your business
          </Typography>
        </Box>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                🚀 Ready to grow your business?
              </Typography>
              <Typography variant="body2">
                Add new skills, optimize your pricing, or promote your services to attract more clients
              </Typography>
            </Box>
            <Button variant="contained" startIcon={<Add />} href="/skills/create">
              Add New Skill
            </Button>
          </Box>
        </Alert>
      </motion.div>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Earnings"
            value={`$${providerStats.totalEarnings.toLocaleString()}`}
            subtitle={`+$${providerStats.thisMonthEarnings} this month`}
            icon={MonetizationOn}
            color="success"
            trend="+12%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Orders"
            value={providerStats.activeOrders}
            subtitle={`${providerStats.completedOrders} completed`}
            icon={Work}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Rating"
            value={providerStats.rating}
            subtitle="From 47 reviews"
            icon={Star}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Profile Views"
            value={providerStats.profileViews}
            subtitle="This month"
            icon={Visibility}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={8}>
          {/* Recent Orders */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Recent Orders
                </Typography>
                <Button variant="outlined" size="small" onClick={() => navigate('/proposals')}>
                  View All
                </Button>
              </Box>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Client</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Service</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Progress</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                          <Typography variant="body2" color="text.secondary">
                            No accepted proposals yet. Submit proposals to requests to see them here.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentOrders.map((order) => (
                        <TableRow key={order.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar 
                                src={order.clientAvatar}
                                sx={{ width: 32, height: 32 }}
                              >
                                {order.client.charAt(0)}
                              </Avatar>
                              <Typography variant="body2">{order.client}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{order.service}</TableCell>
                          <TableCell>
                            <Chip 
                              label={order.status} 
                              size="small" 
                              color={getStatusColor(order.status)}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>${order.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={order.progress} 
                                sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                              />
                              <Typography variant="caption">{order.progress}%</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              {order.clientId && (
                                <IconButton 
                                  size="small" 
                                  color="info"
                                  onClick={() => navigate(`/contact/${order.clientId}`)}
                                >
                                  <Message />
                                </IconButton>
                              )}
                              {order.requestId && (
                                <IconButton 
                                  size="small" 
                                  color="primary"
                                  onClick={() => navigate(`/requests/${order.requestId}`)}
                                >
                                  <Visibility />
                                </IconButton>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Skills Performance */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Skills Performance
              </Typography>
              
              {skillsPerformance.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    No skills performance data yet
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Accepted proposals will appear here grouped by category
                  </Typography>
                </Box>
              ) : (
                skillsPerformance.map((skill, index) => {
                  const maxEarnings = Math.max(...skillsPerformance.map(s => s.earnings), 1);
                  return (
                    <Box key={index} sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {skill.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Chip label={`${skill.orders} orders`} size="small" />
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Star sx={{ fontSize: 16, color: 'warning.main' }} />
                            <Typography variant="body2">{skill.rating.toFixed(1)}</Typography>
                          </Box>
                          <Typography variant="h6" color="success.main">
                            ${skill.earnings.toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(skill.earnings / maxEarnings) * 100} 
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  );
                })
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={4}>
          {/* Quick Stats */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Quick Stats
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTime sx={{ fontSize: 20, color: 'primary.main' }} />
                    <Typography variant="body2">Response Time</Typography>
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {providerStats.responseTime}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle sx={{ fontSize: 20, color: 'success.main' }} />
                    <Typography variant="body2">Success Rate</Typography>
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {providerStats.successRate}%
                  </Typography>
                </Box>
                
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ThumbUp sx={{ fontSize: 20, color: 'info.main' }} />
                    <Typography variant="body2">Client Satisfaction</Typography>
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {providerStats.rating > 0 ? `${providerStats.rating.toFixed(1)}/5.0` : 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Recent Notifications
              </Typography>
              
              <List dense>
                {notifications.length === 0 ? (
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary="No notifications"
                      secondary="You're all caught up!"
                      primaryTypographyProps={{
                        variant: 'body2',
                        color: 'text.secondary'
                      }}
                    />
                  </ListItem>
                ) : (
                  notifications.map((notification) => (
                    <ListItem key={notification.id} sx={{ px: 0 }}>
                      <ListItemIcon>
                        {notification.type === 'proposal' && <Work color="primary" />}
                        {notification.type === 'message' && <Message color="info" />}
                        {notification.type === 'review' && <Star color="warning" />}
                        {notification.type === 'payment' && <MonetizationOn color="success" />}
                        {(!notification.type || notification.type === 'system' || notification.type === 'info') && <Notifications color="action" />}
                      </ListItemIcon>
                      <ListItemText
                        primary={notification.message}
                        secondary={notification.time}
                        primaryTypographyProps={{
                          variant: 'body2',
                          sx: { fontWeight: notification.unread ? 600 : 400 }
                        }}
                      />
                      {notification.unread && (
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
                      )}
                    </ListItem>
                  ))
                )}
              </List>
              
              <Button 
                variant="outlined" 
                size="small" 
                fullWidth 
                sx={{ mt: 1 }}
                onClick={() => navigate('/notifications')}
              >
                View All Notifications
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Quick Actions
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button 
                  variant="outlined" 
                  startIcon={<Add />} 
                  fullWidth 
                  href="/skills/create"
                >
                  Add New Skill
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<Edit />} 
                  fullWidth
                  href="/profile/edit"
                >
                  Edit Profile
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<Analytics />} 
                  fullWidth
                >
                  View Analytics
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<Launch />} 
                  fullWidth
                  href="/profile"
                >
                  View Public Profile
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProviderDashboard;



