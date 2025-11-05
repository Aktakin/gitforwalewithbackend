import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  Divider,
  Badge,
  useTheme,
  alpha,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp,
  Assignment,
  Work,
  Message,
  Star,
  Notifications,
  Add,
  ArrowForward,
  Person,
  AttachMoney,
  Schedule,
  CheckCircle,
  Warning,
  Analytics,
  Lightbulb,
  EmojiEvents,
  Group,
  Visibility,
  ThumbUp,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useSocket } from '../contexts/SimpleSocketContext';
import { Link } from 'react-router-dom';
import { db } from '../lib/supabase';
import { transformRequest, formatTimeAgo } from '../utils/dataTransform';

const DashboardPage = () => {
  console.log('DashboardPage: Component rendering');
  const theme = useTheme();
  const { user, loading: authLoading } = useAuth();
  console.log('DashboardPage: Auth state', { user: user?.id, authLoading });
  const { notifications, unreadMessages } = useSocket();
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalEarnings: 0,
      activeProjects: 0,
      completedProjects: 0,
      rating: 0,
      profileViews: 0,
      skillsOffered: 0,
    },
    recentActivities: [],
    trendingRequests: [],
    upcomingDeadlines: [],
    recommendations: [
      { id: 1, type: 'skill', title: 'Add more skills', description: 'Expand your offerings' },
      { id: 2, type: 'project', title: 'Browse available projects', description: 'Find work that matches your expertise' },
      { id: 3, type: 'profile', title: 'Complete your profile', description: 'Add more details to attract clients' },
    ],
  });
  const [displayedRequests, setDisplayedRequests] = useState(4);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('DashboardPage: useEffect running', { user: user?.id, authLoading });
    let isMounted = true;
    
    const fetchDashboardData = async () => {
      console.log('DashboardPage: fetchDashboardData called', { authLoading, user: user?.id });
      // Wait for auth to finish loading
      if (authLoading) {
        console.log('DashboardPage: Auth still loading, waiting...');
        return;
      }

      // If no user after auth finishes, user is not logged in
      if (!user) {
        console.log('No user found - user is not logged in');
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      const userId = user.id || user._id;
      if (!userId) {
        console.log('No user ID found');
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      try {
        if (isMounted) {
          setLoading(true);
        }
        
        console.log('Fetching dashboard data - all requests');

        // Fetch all requests from everyone (public requests only)
        const allRequests = await db.requests.getAll({
          status: 'open', // Show only open requests
          isPublic: true, // Only show public requests
          pageSize: 50, // Fetch more requests for the dashboard
          // Don't filter by userId - show all requests
        });

        console.log('Fetched requests:', allRequests);

        // Transform requests for display (filter out nulls)
        const transformedRequests = allRequests
          .map(transformRequest)
          .filter(req => req !== null)
          // Sort by urgency and creation date (most recent/urgent first)
          .sort((a, b) => {
            const urgencyOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
            const aUrgency = urgencyOrder[a.urgency] || 0;
            const bUrgency = urgencyOrder[b.urgency] || 0;
            if (bUrgency !== aUrgency) return bUrgency - aUrgency;
            return new Date(b.createdAt) - new Date(a.createdAt);
          });

        // Calculate stats for the logged-in user
        const userRequests = transformedRequests.filter(r => r.user?.id === userId || r.customer?.id === userId);
        const stats = {
          totalEarnings: 0, // TODO: Calculate from completed projects
          activeProjects: userRequests.filter(r => r.status === 'open').length,
          completedProjects: 0, // TODO: Fetch completed requests
          rating: 0, // TODO: Calculate from reviews
          profileViews: 0, // TODO: Track views
          skillsOffered: 0, // TODO: Fetch user skills count
        };

        // Transform requests for trending section (all requests, sorted by urgency)
        const trendingRequests = transformedRequests
          .slice(0, 10)
          .map(req => ({
            id: req.id,
            _id: req.id,
            title: req.title,
            category: req.category,
            budget: req.budget ? `$${req.budget.min}-${req.budget.max}` : 'Not specified',
            deadline: req.deadline ? formatTimeAgo(req.deadline) : 'No deadline',
            skills: req.tags || [],
            proposals: req.proposals || 0,
            trending: req.urgency === 'high' || req.urgency === 'urgent',
            createdAt: req.createdAt,
          }));

        // Get upcoming deadlines
        const upcomingDeadlines = transformedRequests
          .filter(req => req.deadline && new Date(req.deadline) > new Date())
          .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
          .slice(0, 5)
          .map(req => ({
            id: req.id,
            project: req.title,
            deadline: req.deadline,
            priority: req.urgency,
          }));

        if (isMounted) {
          setDashboardData({
            stats,
            recentActivities: [], // TODO: Fetch from notifications
            trendingRequests,
            upcomingDeadlines,
            recommendations: [
              { id: 1, type: 'skill', title: 'Add more skills', description: 'Expand your offerings' },
              { id: 2, type: 'project', title: 'Browse available projects', description: 'Find work that matches your expertise' },
              { id: 3, type: 'profile', title: 'Complete your profile', description: 'Add more details to attract clients' },
            ],
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          user: user?.id,
        });
        
        // Set empty data on error so page still renders
        if (isMounted) {
          setDashboardData({
            stats: {
              totalEarnings: 0,
              activeProjects: 0,
              completedProjects: 0,
              rating: 0,
              profileViews: 0,
              skillsOffered: 0,
            },
            recentActivities: [],
            trendingRequests: [],
            upcomingDeadlines: [],
            recommendations: [
              { id: 1, type: 'skill', title: 'Add more skills', description: 'Expand your offerings' },
              { id: 2, type: 'project', title: 'Browse available projects', description: 'Find work that matches your expertise' },
              { id: 3, type: 'profile', title: 'Complete your profile', description: 'Add more details to attract clients' },
            ],
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log('Dashboard loading complete');
        }
      }
    };

    // Add a small delay to ensure user object is loaded
    setTimeout(() => {
      fetchDashboardData();
    }, 100);

    // Auto-refresh dashboard data every 15 seconds to get updated proposal counts
    const interval = setInterval(() => {
      if (user?.id && !authLoading) {
        fetchDashboardData();
      }
    }, 15000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user?.id, authLoading]); // Depend on both user.id and auth loading state

  const handleLoadMore = () => {
    setLoadingMore(true);
    // Simulate API call delay
    setTimeout(() => {
      setDisplayedRequests(prev => Math.min(prev + 4, dashboardData?.trendingRequests?.length || 0));
      setLoadingMore(false);
    }, 800);
  };

  const StatCard = ({ icon, title, value, change, color = 'primary' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card sx={{ 
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.1)} 0%, ${alpha(theme.palette[color].main, 0.05)} 100%)`,
        border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`,
        '&:hover': {
          transform: 'translateY(-4px)',
          transition: 'transform 0.3s ease',
          boxShadow: theme.shadows[8],
        }
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography color="text.secondary" gutterBottom variant="body2">
                {title}
              </Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                {value}
              </Typography>
              {change && (
                <Chip 
                  label={change} 
                  size="small" 
                  color={change.startsWith('+') ? 'success' : 'error'}
                  sx={{ mt: 1, fontSize: '0.75rem' }}
                />
              )}
            </Box>
            <Avatar sx={{ 
              bgcolor: theme.palette[color].main, 
              width: 56, 
              height: 56,
              boxShadow: theme.shadows[4]
            }}>
              {icon}
            </Avatar>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  const ActivityItem = ({ activity }) => {
    const getActivityIcon = (type) => {
      switch (type) {
        case 'project_completed': return <CheckCircle color="success" />;
        case 'new_message': return <Message color="primary" />;
        case 'skill_requested': return <Work color="info" />;
        case 'payment_received': return <AttachMoney color="success" />;
        default: return <Notifications />;
      }
    };

    return (
      <ListItem divider>
        <ListItemAvatar>
          <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
            {getActivityIcon(activity.type)}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={activity.title}
          secondary={activity.time}
          primaryTypographyProps={{ fontWeight: 500 }}
        />
        <ListItemSecondaryAction>
          {activity.amount && (
            <Chip 
              label={`$${activity.amount}`} 
              color="success" 
              variant="outlined" 
              size="small" 
            />
          )}
        </ListItemSecondaryAction>
      </ListItem>
    );
  };

  const TrendingRequestCard = ({ request }) => (
    <Card sx={{ 
      mb: 2, 
      '&:hover': { 
        boxShadow: theme.shadows[4],
        transform: 'translateY(-2px)',
        transition: 'all 0.3s ease'
      },
      border: 'none'
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {request.title}
              </Typography>

            </Box>
            <Typography color="text.secondary" variant="body2" sx={{ mb: 1 }}>
              {request.category}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
              {request.skills.slice(0, 3).map((skill, index) => (
                <Chip 
                  key={index}
                  label={skill} 
                  size="small" 
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 24 }}
                />
              ))}
              {request.skills.length > 3 && (
                <Chip 
                  label={`+${request.skills.length - 3}`} 
                  size="small" 
                  variant="outlined"
                  color="primary"
                  sx={{ fontSize: '0.7rem', height: 24 }}
                />
              )}
            </Box>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Budget: <strong>{request.budget}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Deadline: <strong>{request.deadline}</strong>
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {request.proposals} proposals
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
              <Button 
                size="small" 
                variant="contained" 
                component={Link}
                to={`/requests/${request.id}/proposal`}
                fullWidth
              >
                Apply Now
              </Button>
              <Button 
                size="small" 
                variant="outlined" 
                component={Link}
                to={`/requests/${request.id}`}
                fullWidth
              >
                View Details
              </Button>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Ensure dashboardData is always set
  if (!dashboardData) {
    setDashboardData({
      stats: {
        totalEarnings: 0,
        activeProjects: 0,
        completedProjects: 0,
        rating: 0,
        profileViews: 0,
        skillsOffered: 0,
      },
      recentActivities: [],
      trendingRequests: [],
      upcomingDeadlines: [],
      recommendations: [],
    });
    return null;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ 
            fontWeight: 700,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Welcome back, {user?.firstName || 'User'}! 🎉
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Here's what's happening with your SkillBridge activity
          </Typography>
        </Box>
      </motion.div>



      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Trending Requests */}
        <Grid item xs={12} lg={8}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      📋 All Requests
                    </Typography>
                    <Chip 
                      label={`${dashboardData.trendingRequests.length} Active`} 
                      color="primary" 
                      size="small"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  </Box>
                  <Button 
                    variant="outlined" 
                    startIcon={<TrendingUp />}
                    component={Link}
                    to="/requests"
                  >
                    View All Requests
                  </Button>
                </Box>
                {dashboardData.trendingRequests.slice(0, displayedRequests).map((request) => (
                  <TrendingRequestCard key={request.id} request={request} />
                ))}
                
                {/* Load More Button */}
                {displayedRequests < dashboardData.trendingRequests.length && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Button
                      variant="outlined"
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      startIcon={loadingMore ? <CircularProgress size={20} /> : <Add />}
                      sx={{ 
                        px: 4, 
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 600,
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          transition: 'transform 0.3s ease'
                        }
                      }}
                    >
                      {loadingMore ? 'Loading...' : `Load More (${dashboardData.trendingRequests.length - displayedRequests} remaining)`}
                    </Button>
                  </Box>
                )}
                
                {/* End of Results Message */}
                {displayedRequests >= dashboardData.trendingRequests.length && dashboardData.trendingRequests.length > 4 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ 
                      fontStyle: 'italic',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <CheckCircle fontSize="small" color="success" />
                      You've reached the end of your requests
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Recent Activity
                  </Typography>
                  <Button 
                    size="small"
                    endIcon={<ArrowForward />} 
                    component={Link}
                    to="/notifications"
                  >
                    View All
                  </Button>
                </Box>
                <List dense>
                  {dashboardData.recentActivities.slice(0, 4).map((activity) => (
                    <ListItem key={activity.id} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ 
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          width: 32,
                          height: 32
                        }}>
                          {(() => {
                            switch (activity.type) {
                              case 'project_completed': return <CheckCircle color="success" fontSize="small" />;
                              case 'new_message': return <Message color="primary" fontSize="small" />;
                              case 'skill_requested': return <Work color="info" fontSize="small" />;
                              case 'payment_received': return <AttachMoney color="success" fontSize="small" />;
                              default: return <Notifications fontSize="small" />;
                            }
                          })()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={activity.title}
                        secondary={activity.time}
                        primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500 }}
                        secondaryTypographyProps={{ fontSize: '0.75rem' }}
                      />
                      {activity.amount && (
                        <Chip 
                          label={`$${activity.amount}`} 
                          color="success" 
                          variant="outlined" 
                          size="small" 
                          sx={{ fontSize: '0.7rem', height: 20 }}
                        />
                      )}
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Quick Actions
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Add />}
                      component={Link}
                      to="/requests/create"
                      sx={{ py: 1.5 }}
                    >
                      Create Request
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Work />}
                      component={Link}
                      to="/browse"
                      sx={{ py: 1.5 }}
                    >
                      Browse Skills
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Message />}
                      component={Link}
                      to="/messages"
                      sx={{ py: 1.5 }}
                    >
                      Messages
                      {unreadMessages > 0 && (
                        <Badge badgeContent={unreadMessages} color="error" sx={{ ml: 1 }} />
                      )}
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Person />}
                      component={Link}
                      to={`/profile/${user?._id}`}
                      sx={{ py: 1.5 }}
                    >
                      Profile
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </motion.div>

          {/* Upcoming Deadlines */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Upcoming Deadlines
                </Typography>
                <List dense>
                  {dashboardData.upcomingDeadlines.map((deadline) => (
                    <ListItem key={deadline.id}>
                      <ListItemAvatar>
                        <Avatar sx={{ 
                          bgcolor: deadline.priority === 'high' ? 'error.main' : 
                                   deadline.priority === 'medium' ? 'warning.main' : 'success.main',
                          width: 32, 
                          height: 32 
                        }}>
                          <Schedule fontSize="small" />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={deadline.project}
                        secondary={`Due in ${deadline.deadline}`}
                        primaryTypographyProps={{ fontSize: '0.9rem' }}
                        secondaryTypographyProps={{ fontSize: '0.8rem' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recommendations */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                  <Lightbulb sx={{ mr: 1 }} />
                  Recommendations
                </Typography>
                <List dense>
                  {dashboardData.recommendations.map((rec) => (
                    <ListItem key={rec.id} sx={{ px: 0 }}>
                      <ListItemText
                        primary={rec.title}
                        secondary={rec.description}
                        primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
                        secondaryTypographyProps={{ fontSize: '0.8rem' }}
                      />
                      <ListItemSecondaryAction>
                        <IconButton size="small">
                          <ArrowForward fontSize="small" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPage;

