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
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  CircularProgress,
  Stack,
  Badge,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
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
  CheckCircle,
  AccessTime,
  ThumbUp,
  Launch,
  ShowChart,
  AttachMoney,
  Timeline,
  EmojiEvents,
  LocalOffer,
  Speed,
  Insights,
  AccountBalanceWallet,
  Assessment,
  CalendarToday,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useSocket } from '../../contexts/SimpleSocketContext';
import { db } from '../../lib/supabase';
import { transformProposal, transformRequest, transformUser, formatTimeAgo } from '../../utils/dataTransform';

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user, loading: authLoading } = useAuth();
  const { notifications: socketNotifications } = useSocket();
  const [timeRange, setTimeRange] = useState('month'); // 'week', 'month', 'year'
  const [loading, setLoading] = useState(true);
  const [providerStats, setProviderStats] = useState({
    totalEarnings: 0,
    thisMonthEarnings: 0,
    thisWeekEarnings: 0,
    activeOrders: 0,
    completedOrders: 0,
    pendingProposals: 0,
    rating: 0,
    responseTime: 'N/A',
    successRate: 0,
    profileViews: 0,
    earningsGrowth: 0,
    ordersGrowth: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [skillsPerformance, setSkillsPerformance] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [earningsData, setEarningsData] = useState([]);
  const [activityTimeline, setActivityTimeline] = useState([]);

  // Fetch provider dashboard data
  useEffect(() => {
    if (!user?.id || authLoading) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all proposals submitted by this user (provider)
        const userProposals = await db.proposals.getUserProposals(user.id);
        const transformedProposals = userProposals.map(transformProposal).filter(p => p !== null);

        // Separate proposals by status
        const acceptedProposals = transformedProposals.filter(p => p.status === 'accepted');
        const pendingProposals = transformedProposals.filter(p => p.status === 'pending');
        
        // Map proposals to orders
        const ordersWithRequests = acceptedProposals.map((proposal) => {
          const dbRequest = proposal.request || (userProposals.find(p => p.id === proposal.id)?.requests);
          const transformedRequest = dbRequest ? transformRequest(dbRequest) : null;
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
            createdAt: proposal.createdAt,
            request: transformedRequest
          };
        });

        const validOrders = ordersWithRequests.filter(o => o !== null);
        setRecentOrders(validOrders.slice(0, 10));

        // Calculate time-based stats
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - 7);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        
        const completedOrders = validOrders.filter(o => o.status === 'Completed');
        const activeOrders = validOrders.filter(o => o.status === 'In Progress');
        
        const totalEarnings = completedOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
        const thisMonthEarnings = completedOrders
          .filter(o => o.createdAt && new Date(o.createdAt) >= startOfMonth)
          .reduce((sum, o) => sum + (o.amount || 0), 0);
        const thisWeekEarnings = completedOrders
          .filter(o => o.createdAt && new Date(o.createdAt) >= startOfWeek)
          .reduce((sum, o) => sum + (o.amount || 0), 0);
        const lastMonthEarnings = completedOrders
          .filter(o => {
            const date = o.createdAt ? new Date(o.createdAt) : null;
            return date && date >= startOfLastMonth && date < startOfMonth;
          })
          .reduce((sum, o) => sum + (o.amount || 0), 0);
        
        // Calculate growth percentages
        const earningsGrowth = lastMonthEarnings > 0 
          ? ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings * 100).toFixed(1)
          : thisMonthEarnings > 0 ? 100 : 0;
        
        const ordersGrowth = completedOrders.length > 0 ? 15 : 0; // Placeholder
        
        // Calculate success rate
        const successRate = validOrders.length > 0 
          ? Math.round((completedOrders.length / validOrders.length) * 100)
          : 0;
        
        // Calculate rating
        const rating = validOrders.length > 0
          ? ((completedOrders.length / validOrders.length) * 5).toFixed(1)
          : 0;

        setProviderStats({
          totalEarnings,
          thisMonthEarnings,
          thisWeekEarnings,
          activeOrders: activeOrders.length,
          completedOrders: completedOrders.length,
          pendingProposals: pendingProposals.length,
          rating: parseFloat(rating),
          responseTime: '1.2 hrs',
          successRate,
          profileViews: 847, // TODO: Implement real tracking
          earningsGrowth: parseFloat(earningsGrowth),
          ordersGrowth,
        });

        // Generate earnings data for the chart (last 7 months)
        const earningsChart = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setMonth(date.getMonth() - i);
          const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
          const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
          
          const monthEarnings = completedOrders
            .filter(o => {
              const orderDate = o.createdAt ? new Date(o.createdAt) : null;
              return orderDate && orderDate >= monthStart && orderDate <= monthEnd;
            })
            .reduce((sum, o) => sum + (o.amount || 0), 0);
          
          earningsChart.push({
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            earnings: monthEarnings,
            orders: completedOrders.filter(o => {
              const orderDate = o.createdAt ? new Date(o.createdAt) : null;
              return orderDate && orderDate >= monthStart && orderDate <= monthEnd;
            }).length
          });
        }
        setEarningsData(earningsChart);

        // Calculate skills performance
        const skillsMap = new Map();
        validOrders.forEach(order => {
          const category = order.category || 'Other';
          if (!skillsMap.has(category)) {
            skillsMap.set(category, {
              name: category,
              orders: 0,
              rating: 4.5 + Math.random() * 0.5,
              earnings: 0,
              growth: Math.floor(Math.random() * 30) - 10
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
          .slice(0, 5);
        setSkillsPerformance(skillsArray);

        // Activity timeline
        const timeline = [
          ...validOrders.slice(0, 5).map(order => ({
            id: order.id,
            type: 'order',
            message: `Order "${order.service}" ${order.status.toLowerCase()}`,
            time: formatTimeAgo(order.createdAt),
            icon: 'work'
          })),
          ...transformedProposals.slice(0, 3).map(proposal => ({
            id: proposal.id,
            type: 'proposal',
            message: `Submitted proposal for "${proposal.request?.title || 'request'}"`,
            time: formatTimeAgo(proposal.createdAt),
            icon: 'send'
          }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 6);
        setActivityTimeline(timeline);

        // Real notifications
        const recentNotifications = (socketNotifications || [])
          .slice(0, 5)
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

  // Advanced Stat Card with modern design
  const AdvancedStatCard = ({ title, value, subtitle, icon: Icon, color = 'primary', trend, trendValue, onClick }) => {
    const colorMap = {
      primary: { main: '#1E90FF', light: '#5BB3FF', gradient: 'linear-gradient(135deg, #1E90FF 0%, #5BB3FF 100%)' },
      success: { main: '#2e7d32', light: '#66bb6a', gradient: 'linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)' },
      warning: { main: '#ed6c02', light: '#ff9800', gradient: 'linear-gradient(135deg, #ed6c02 0%, #ff9800 100%)' },
      error: { main: '#d32f2f', light: '#f44336', gradient: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)' },
      info: { main: '#0288d1', light: '#03a9f4', gradient: 'linear-gradient(135deg, #0288d1 0%, #03a9f4 100%)' },
    };
    const colors = colorMap[color];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        whileHover={{ y: -8, transition: { duration: 0.2 } }}
      >
        <Card 
          sx={{ 
            height: '100%',
            background: '#FFFFFF',
            border: `1px solid ${alpha(colors.main, 0.1)}`,
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',
            cursor: onClick ? 'pointer' : 'default',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: `0 12px 40px ${alpha(colors.main, 0.12)}`,
              border: `1px solid ${alpha(colors.main, 0.25)}`,
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: colors.gradient,
            }
          }}
          onClick={onClick}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.75rem' }}>
                  {title}
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5, color: colors.main, letterSpacing: '-0.02em' }}>
                  {value}
                </Typography>
                {subtitle && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    {subtitle}
                  </Typography>
                )}
              </Box>
              <Avatar 
                sx={{ 
                  background: colors.gradient,
                  width: 56, 
                  height: 56,
                  boxShadow: `0 8px 24px ${alpha(colors.main, 0.25)}`,
                }}
              >
                <Icon sx={{ fontSize: 28 }} />
              </Avatar>
            </Box>
            
            {(trend || trendValue !== undefined) && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 2 }}>
                {trendValue !== undefined && (
                  <>
                    {trendValue >= 0 ? (
                      <ArrowUpward sx={{ fontSize: 16, color: 'success.main' }} />
                    ) : (
                      <ArrowDownward sx={{ fontSize: 16, color: 'error.main' }} />
                    )}
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 700,
                        color: trendValue >= 0 ? 'success.main' : 'error.main'
                      }}
                    >
                      {Math.abs(trendValue)}%
                    </Typography>
                  </>
                )}
                {trend && (
                  <Typography variant="caption" color="text.secondary">
                    {trend}
                  </Typography>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // Circular Progress Ring
  const CircularProgressRing = ({ value, size = 120, strokeWidth = 8, color = 'primary' }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    const colorMap = {
      primary: '#1E90FF',
      success: '#2e7d32',
      warning: '#ed6c02',
      error: '#d32f2f',
    };

    return (
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={alpha(colorMap[color], 0.1)}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colorMap[color]}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          />
        </svg>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {value}%
          </Typography>
        </Box>
      </Box>
    );
  };

  // Earnings Chart Component
  const EarningsChart = ({ data }) => {
    const maxEarnings = Math.max(...data.map(d => d.earnings), 1);

    return (
      <Box sx={{ width: '100%', height: 280 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '100%', gap: 1 }}>
          {data.map((item, index) => {
            const barHeight = (item.earnings / maxEarnings) * 100;
            return (
              <Tooltip 
                key={index} 
                title={`${item.month}: $${item.earnings.toLocaleString()} (${item.orders} orders)`}
                arrow
              >
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, cursor: 'pointer' }}>
                  <motion.div
                    style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: '100%' }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                  >
                    <Typography variant="caption" color="success.main" sx={{ fontWeight: 600, mb: 0.5 }}>
                      ${(item.earnings / 1000).toFixed(1)}k
                    </Typography>
                    <Box
                      sx={{
                        width: '100%',
                        height: `${barHeight}%`,
                        minHeight: item.earnings > 0 ? '20px' : '2px',
                        background: 'linear-gradient(180deg, #2e7d32 0%, #66bb6a 100%)',
                        borderRadius: '8px 8px 0 0',
                        position: 'relative',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'linear-gradient(180deg, #1b5e20 0%, #4caf50 100%)',
                          transform: 'scaleY(1.05)',
                        }
                      }}
                    />
                  </motion.div>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {item.month}
                  </Typography>
                </Box>
              </Tooltip>
            );
          })}
        </Box>
      </Box>
    );
  };

  if (loading || authLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
            Loading your dashboard...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header Section with Gradient */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ mb: 5, position: 'relative' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #1E90FF 0%, #5BB3FF 60%, #a78bfa 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5,
                  letterSpacing: '-0.02em',
                }}
              >
                Provider Dashboard
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
                Welcome back! Here's what's happening with your business today.
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              size="large"
              startIcon={<Add />}
              onClick={() => navigate('/skills/create')}
              sx={{
                background: 'linear-gradient(135deg, #1E90FF 0%, #5BB3FF 100%)',
                px: 3,
                py: 1.5,
                borderRadius: 3,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                boxShadow: '0 8px 24px rgba(30, 144, 255, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1570d1 0%, #4a9de6 100%)',
                  boxShadow: '0 12px 32px rgba(30, 144, 255, 0.4)',
                }
              }}
            >
              Add New Skill
            </Button>
          </Box>

          {/* Quick Insight Banner */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Alert 
              severity="info" 
              icon={<Insights />}
              sx={{ 
                borderRadius: 3,
                background: alpha(theme.palette.info.main, 0.08),
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                '& .MuiAlert-icon': {
                  color: 'info.main'
                }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                    📊 Your earnings are up {providerStats.earningsGrowth}% this month!
                  </Typography>
                  <Typography variant="body2">
                    Keep up the great work. You have {providerStats.pendingProposals} proposals waiting for response.
                  </Typography>
                </Box>
                <Button 
                  variant="contained" 
                  size="small"
                  onClick={() => navigate('/proposals')}
                  sx={{ ml: 2 }}
                >
                  View Proposals
                </Button>
              </Box>
            </Alert>
          </motion.div>
        </Box>
      </motion.div>

      {/* Main Stats Grid - 4 Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <AdvancedStatCard
            title="Total Earnings"
            value={`$${providerStats.totalEarnings.toLocaleString()}`}
            subtitle={`$${providerStats.thisMonthEarnings.toLocaleString()} this month`}
            icon={AccountBalanceWallet}
            color="success"
            trendValue={providerStats.earningsGrowth}
            trend="vs last month"
            onClick={() => navigate('/earnings')}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <AdvancedStatCard
            title="Active Orders"
            value={providerStats.activeOrders}
            subtitle={`${providerStats.completedOrders} completed`}
            icon={Work}
            color="primary"
            trendValue={providerStats.ordersGrowth}
            trend="vs last month"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <AdvancedStatCard
            title="Success Rate"
            value={`${providerStats.successRate}%`}
            subtitle="Project completion"
            icon={EmojiEvents}
            color="warning"
            trendValue={5}
            trend="improvement"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <AdvancedStatCard
            title="Profile Views"
            value={providerStats.profileViews}
            subtitle="This month"
            icon={Visibility}
            color="info"
            trendValue={23}
            trend="vs last month"
            onClick={() => navigate('/profile')}
          />
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Left Column - 2/3 width */}
        <Grid item xs={12} lg={8}>
          {/* Earnings Overview Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                      Earnings Overview
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Your income performance over the last 7 months
                    </Typography>
                  </Box>
                  <Chip 
                    icon={<TrendingUp />}
                    label={`+${providerStats.earningsGrowth}%`}
                    color="success"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
                
                <EarningsChart data={earningsData} />
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Orders Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                      Recent Orders
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Track and manage your active projects
                    </Typography>
                  </Box>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    endIcon={<Launch />}
                    onClick={() => navigate('/proposals')}
                    sx={{ borderRadius: 2 }}
                  >
                    View All
                  </Button>
                </Box>
                
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', borderBottom: '2px solid', borderColor: 'divider' }}>Client</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', borderBottom: '2px solid', borderColor: 'divider' }}>Service</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', borderBottom: '2px solid', borderColor: 'divider' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', borderBottom: '2px solid', borderColor: 'divider' }}>Amount</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', borderBottom: '2px solid', borderColor: 'divider' }}>Progress</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', borderBottom: '2px solid', borderColor: 'divider' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentOrders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                            <Work sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                              No orders yet
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              Submit proposals to requests to see them here
                            </Typography>
                            <Button 
                              variant="contained" 
                              startIcon={<Add />}
                              onClick={() => navigate('/requests')}
                            >
                              Browse Requests
                            </Button>
                          </TableCell>
                        </TableRow>
                      ) : (
                        recentOrders.map((order, index) => (
                          <motion.tr
                            key={order.id}
                            component={TableRow}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            hover
                            sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) } }}
                          >
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar 
                                  src={order.clientAvatar}
                                  sx={{ width: 40, height: 40 }}
                                >
                                  {order.client.charAt(0)}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {order.client}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Client
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {order.service}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {order.category}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={order.status} 
                                size="small" 
                                color={getStatusColor(order.status)}
                                sx={{ fontWeight: 600 }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body1" sx={{ fontWeight: 700, color: 'success.main' }}>
                                ${order.amount.toLocaleString()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120 }}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={order.progress} 
                                  sx={{ 
                                    flexGrow: 1, 
                                    height: 8, 
                                    borderRadius: 4,
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    '& .MuiLinearProgress-bar': {
                                      borderRadius: 4
                                    }
                                  }}
                                />
                                <Typography variant="caption" sx={{ fontWeight: 600, minWidth: 35 }}>
                                  {order.progress}%
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={0.5}>
                                {order.clientId && (
                                  <Tooltip title="Message Client">
                                    <IconButton 
                                      size="small" 
                                      color="info"
                                      onClick={() => navigate(`/contact/${order.clientId}`)}
                                      sx={{ 
                                        '&:hover': { 
                                          bgcolor: alpha(theme.palette.info.main, 0.1)
                                        } 
                                      }}
                                    >
                                      <Message fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                {order.requestId && (
                                  <Tooltip title="View Details">
                                    <IconButton 
                                      size="small" 
                                      color="primary"
                                      onClick={() => navigate(`/requests/${order.requestId}`)}
                                      sx={{ 
                                        '&:hover': { 
                                          bgcolor: alpha(theme.palette.primary.main, 0.1)
                                        } 
                                      }}
                                    >
                                      <Visibility fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Stack>
                            </TableCell>
                          </motion.tr>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Right Column - 1/3 width */}
        <Grid item xs={12} lg={4}>
          {/* Performance Metrics */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                  Performance Metrics
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                  <CircularProgressRing value={providerStats.successRate} color="success" />
                </Box>

                <Divider sx={{ my: 2 }} />
                
                <Stack spacing={2.5}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTime sx={{ fontSize: 20, color: 'primary.main' }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>Response Time</Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {providerStats.responseTime}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={85} 
                      sx={{ 
                        height: 6, 
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.primary.main, 0.1)
                      }}
                    />
                  </Box>
                  
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Star sx={{ fontSize: 20, color: 'warning.main' }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>Average Rating</Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'warning.main' }}>
                        {providerStats.rating.toFixed(1)}/5.0
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(providerStats.rating / 5) * 100} 
                      color="warning"
                      sx={{ 
                        height: 6, 
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.warning.main, 0.1)
                      }}
                    />
                  </Box>
                  
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ThumbUp sx={{ fontSize: 20, color: 'success.main' }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>Client Satisfaction</Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                        {providerStats.successRate}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={providerStats.successRate} 
                      color="success"
                      sx={{ 
                        height: 6, 
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.success.main, 0.1)
                      }}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Skills Performance */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Top Skills
                </Typography>
                
                {skillsPerformance.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <LocalOffer sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      No skills data yet
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={2}>
                    {skillsPerformance.map((skill, index) => {
                      const maxEarnings = Math.max(...skillsPerformance.map(s => s.earnings), 1);
                      const percentage = (skill.earnings / maxEarnings) * 100;
                      
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Box sx={{ 
                            p: 2, 
                            border: 1, 
                            borderColor: 'divider', 
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              borderColor: 'primary.main',
                              bgcolor: alpha(theme.palette.primary.main, 0.02),
                              transform: 'translateX(4px)'
                            }
                          }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                                  {skill.name}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  <Chip 
                                    label={`${skill.orders} orders`} 
                                    size="small" 
                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                  />
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                                    <Star sx={{ fontSize: 14, color: 'warning.main' }} />
                                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                      {skill.rating.toFixed(1)}
                                    </Typography>
                                  </Box>
                                  {skill.growth !== 0 && (
                                    <Chip
                                      icon={skill.growth > 0 ? <TrendingUp /> : <TrendingDown />}
                                      label={`${Math.abs(skill.growth)}%`}
                                      size="small"
                                      color={skill.growth > 0 ? 'success' : 'error'}
                                      sx={{ height: 20, fontSize: '0.7rem' }}
                                    />
                                  )}
                                </Box>
                              </Box>
                              <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                                ${skill.earnings.toLocaleString()}
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={percentage} 
                              sx={{ 
                                height: 6, 
                                borderRadius: 3,
                                bgcolor: alpha(theme.palette.success.main, 0.1),
                                '& .MuiLinearProgress-bar': {
                                  background: 'linear-gradient(90deg, #2e7d32 0%, #66bb6a 100%)',
                                  borderRadius: 3
                                }
                              }}
                            />
                          </Box>
                        </motion.div>
                      );
                    })}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Recent Activity
                </Typography>
                
                <List dense sx={{ p: 0 }}>
                  {activityTimeline.length === 0 ? (
                    <ListItem sx={{ px: 0, py: 2 }}>
                      <ListItemText
                        primary="No recent activity"
                        secondary="Your activity will appear here"
                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                      />
                    </ListItem>
                  ) : (
                    activityTimeline.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <ListItem 
                          sx={{ 
                            px: 0, 
                            py: 1.5,
                            borderLeft: '3px solid',
                            borderColor: activity.type === 'order' ? 'primary.main' : 'success.main',
                            pl: 2,
                            mb: 1,
                            borderRadius: 1,
                            bgcolor: alpha(activity.type === 'order' ? theme.palette.primary.main : theme.palette.success.main, 0.03),
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            {activity.icon === 'work' ? (
                              <Work fontSize="small" color="primary" />
                            ) : (
                              <CheckCircle fontSize="small" color="success" />
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={activity.message}
                            secondary={activity.time}
                            primaryTypographyProps={{ 
                              variant: 'body2', 
                              sx: { fontWeight: 500 } 
                            }}
                            secondaryTypographyProps={{
                              variant: 'caption'
                            }}
                          />
                        </ListItem>
                      </motion.div>
                    ))
                  )}
                </List>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Quick Actions
                </Typography>
                
                <Stack spacing={1.5}>
                  <Button 
                    variant="outlined" 
                    startIcon={<Add />} 
                    fullWidth 
                    onClick={() => navigate('/skills/create')}
                    sx={{ 
                      justifyContent: 'flex-start', 
                      borderRadius: 2,
                      py: 1.2,
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                  >
                    Add New Skill
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<Edit />} 
                    fullWidth
                    onClick={() => navigate('/profile/edit')}
                    sx={{ 
                      justifyContent: 'flex-start', 
                      borderRadius: 2,
                      py: 1.2,
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                  >
                    Edit Profile
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<Assessment />} 
                    fullWidth
                    onClick={() => navigate('/analytics')}
                    sx={{ 
                      justifyContent: 'flex-start', 
                      borderRadius: 2,
                      py: 1.2,
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                  >
                    View Analytics
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<Launch />} 
                    fullWidth
                    onClick={() => navigate('/profile')}
                    sx={{ 
                      justifyContent: 'flex-start', 
                      borderRadius: 2,
                      py: 1.2,
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                  >
                    View Public Profile
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProviderDashboard;
