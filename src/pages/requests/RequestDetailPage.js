import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  LinearProgress,
  IconButton,
  Breadcrumbs,
  Alert,
  Paper,
  Stack,
  Rating,
  useTheme,
  alpha,
} from '@mui/material';
import {
  ArrowBack,
  LocationOn,
  Schedule,
  AttachMoney,
  Person,
  Star,
  Visibility,
  ThumbUp,
  Share,
  Bookmark,
  BookmarkBorder,
  Flag,
  Message,
  Work,
  Category,
  CalendarToday,
  TrendingUp,
  CheckCircle,
  Warning,
  Info,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { db } from '../../lib/supabase';
import { transformRequest, transformUser, transformProposal, formatDeadline, formatTimeAgo } from '../../utils/dataTransform';

const RequestDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequestDetails = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching request details for ID:', id);
        
        // Fetch request from database
        const dbRequest = await db.requests.getById(id);
        
        if (!dbRequest) {
          setError('Request not found');
          setLoading(false);
          return;
        }

        // Transform the request data
        const transformedRequest = transformRequest(dbRequest);
        
        // Get proposal count from dbRequest (it includes proposals array)
        const proposalCount = Array.isArray(dbRequest.proposals) ? dbRequest.proposals.length : (dbRequest.proposal_count || 0);
        
        // Get client/user information
        const client = transformedRequest.user || transformedRequest.customer;
        
        // Format the request data for display
        const formattedRequest = {
          ...transformedRequest,
          // Update proposals count with actual count
          proposals: proposalCount,
          // Client information
          client: client ? {
            id: client.id,
            name: client.name || `${client.firstName || ''} ${client.lastName || ''}`.trim() || client.email,
            avatar: client.avatar || client.profilePicture,
            rating: 0, // TODO: Add rating system
            reviewsCount: 0, // TODO: Add reviews count
            jobsPosted: 0, // TODO: Count user's requests
            hireRate: 100, // TODO: Calculate hire rate
            totalSpent: '$0', // TODO: Calculate total spent
            memberSince: client.joinedAt || client.created_at,
            verified: client.isVerified || false,
            location: client.location?.city && client.location?.state 
              ? `${client.location.city}, ${client.location.state}`
              : client.location?.country || 'Location not specified',
            description: client.bio || 'No description available'
          } : null,
          // Format deadline
          deadline: transformedRequest.deadline 
            ? formatDeadline(transformedRequest.deadline)
            : 'No deadline',
          // Format posted date
          postedDate: transformedRequest.createdAt || new Date(),
          // Skills/tags
          skills: transformedRequest.tags || [],
          // Views (not tracked yet)
          views: 0,
          // Experience level (not in DB yet, default to intermediate)
          experience: 'Intermediate',
          // Duration (estimate from deadline)
          duration: transformedRequest.deadline 
            ? formatDeadline(transformedRequest.deadline)
            : 'Not specified',
          // Budget type
          budget: {
            ...transformedRequest.budget,
            type: transformedRequest.budget?.type || 'fixed'
          },
          // Attachments (not in DB schema yet)
          attachments: [],
          // Similar projects (will fetch later if needed)
          similar: []
        };
        
        console.log('Request loaded:', formattedRequest);
        setRequest(formattedRequest);
      } catch (err) {
        console.error('Error fetching request details:', err);
        setError(err.message || 'Failed to load request details');
      } finally {
        setLoading(false);
      }
    };

    fetchRequestDetails();

    // Auto-refresh request details every 10 seconds to get updated proposal counts
    const interval = setInterval(() => {
      fetchRequestDetails();
    }, 10000);

    return () => clearInterval(interval);
  }, [id]);

  // Fetch proposals if user is the request creator
  useEffect(() => {
    const fetchProposals = async () => {
      console.log('Proposal fetch check:', {
        hasRequest: !!request,
        hasUser: !!user?.id,
        requestUserId: request?.userId,
        currentUserId: user?.id,
        isOwner: request?.userId === user?.id
      });

      if (!request || !user?.id || request.userId !== user.id) {
        console.log('Skipping proposal fetch - user is not the request owner');
        return;
      }

      try {
        setLoadingProposals(true);
        console.log('Fetching proposals for request:', request.id);
        
        const dbProposals = await db.proposals.getByRequest(request.id);
        console.log('Fetched proposals:', dbProposals);

        // Transform proposals
        const transformedProposals = dbProposals
          .map(transformProposal)
          .filter(p => p !== null);

        console.log('Transformed proposals:', transformedProposals);
        setProposals(transformedProposals);
      } catch (err) {
        console.error('Error fetching proposals:', err);
      } finally {
        setLoadingProposals(false);
      }
    };

    fetchProposals();

    // Auto-refresh proposals every 10 seconds
    const interval = setInterval(() => {
      if (request && user?.id && request.userId === user.id) {
        fetchProposals();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [request?.id, request?.userId, user?.id]);

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    // In a real app, show a toast notification
  };

  const handleSubmitProposal = async () => {
    if (!user?.id) {
      alert('Please log in to submit a proposal');
      return;
    }

    // Check if user already has a proposal for this request
    try {
      const existing = await db.proposals.checkExisting(id, user.id);
      if (existing) {
        alert('You have already submitted a proposal for this request. You can only submit one proposal per request.');
        return;
      }
      // Navigate to proposal creation page with request ID
      navigate(`/requests/${id}/proposal`);
    } catch (error) {
      console.error('Error checking existing proposal:', error);
      // Continue to proposal page anyway, validation will happen there
      navigate(`/requests/${id}/proposal`);
    }
  };

  const handleContactClient = () => {
    // Navigate to contact client page with client ID
    if (request.client?.id) {
      navigate(`/contact/${request.client.id}`);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <LinearProgress sx={{ width: '50%' }} />
        </Box>
      </Container>
    );
  }

  if (error || (!loading && !request)) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          {error || 'Request not found'}. <Link to="/requests">Back to Requests</Link>
        </Alert>
      </Container>
    );
  }

  if (!request) {
    return null; // Still loading
  }

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'success';
      case 'in_progress': return 'warning';
      case 'completed': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            Home
          </Link>
          <Link to="/requests" style={{ textDecoration: 'none', color: 'inherit' }}>
            Requests
          </Link>
          <Typography color="text.primary">Request Details</Typography>
        </Breadcrumbs>
      </motion.div>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                      {request.title}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      <Chip 
                        label={request.category} 
                        color="primary" 
                        icon={<Category />}
                      />
                      {request.location && (
                        <Chip 
                          label={
                            typeof request.location === 'string' 
                              ? request.location 
                              : request.location.city && request.location.state
                                ? `${request.location.city}, ${request.location.state}`
                                : request.location.country || 'Location not specified'
                          }
                          variant="outlined"
                          icon={<LocationOn />}
                        />
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton onClick={handleBookmark} color={isBookmarked ? 'primary' : 'default'}>
                      {isBookmarked ? <Bookmark /> : <BookmarkBorder />}
                    </IconButton>
                    <IconButton onClick={handleShare}>
                      <Share />
                    </IconButton>
                    <IconButton>
                      <Flag />
                    </IconButton>
                  </Box>
                </Box>

                {/* Key Stats */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 2 }}>
                      <AttachMoney sx={{ color: 'text.secondary', mb: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {request.budget?.min && request.budget?.max
                          ? `$${request.budget.min.toLocaleString()} - $${request.budget.max.toLocaleString()}`
                          : request.budget?.min 
                            ? `$${request.budget.min.toLocaleString()}`
                            : 'Not specified'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Budget
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 2 }}>
                      <Schedule sx={{ color: 'text.secondary', mb: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {request.deadline}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Deadline
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 2 }}>
                      <Person sx={{ color: 'text.secondary', mb: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {user?.id === request.userId ? proposals.length : request.proposals}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Proposals
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 2 }}>
                      <Visibility sx={{ color: 'text.secondary', mb: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {request.views}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Views
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {/* Show different buttons based on whether user is the creator */}
                  {user?.id === request.userId ? (
                    // Request creator sees "View Proposals" button
                    <>
                      <Button 
                        variant="contained" 
                        size="large" 
                        startIcon={<Person />}
                        sx={{ px: 4 }}
                        onClick={() => navigate(`/proposals?request=${request.id}`)}
                      >
                        View Proposals ({proposals.length})
                      </Button>
                      <Button 
                        variant="outlined" 
                        size="large" 
                        startIcon={<ArrowBack />}
                        onClick={() => navigate(-1)}
                      >
                        Back
                      </Button>
                    </>
                  ) : (
                    // Other users see "Submit Proposal" button
                    <>
                      <Button 
                        variant="contained" 
                        size="large" 
                        startIcon={<Work />}
                        sx={{ px: 4 }}
                        onClick={handleSubmitProposal}
                      >
                        Submit Proposal
                      </Button>
                      {request.client && (
                        <Button 
                          variant="outlined" 
                          size="large" 
                          startIcon={<Message />}
                          onClick={handleContactClient}
                        >
                          Contact Client
                        </Button>
                      )}
                      <Button 
                        variant="outlined" 
                        size="large" 
                        startIcon={<ArrowBack />}
                        onClick={() => navigate(-1)}
                      >
                        Back
                      </Button>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  Project Description
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                  {request.description}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>

          {/* Skills Required */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  Skills Required
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {request.skills && request.skills.length > 0 ? (
                    request.skills.map((skill, index) => (
                      <Chip 
                        key={index}
                        label={skill} 
                        variant="outlined"
                        sx={{ 
                          '&:hover': { 
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            borderColor: 'primary.main'
                          }
                        }}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">No specific skills listed</Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </motion.div>

          {/* Proposals Section - Only show to request creator */}
          {user?.id === request.userId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                        Proposals ({proposals.length})
                      </Typography>
                      {proposals.length > 0 && (
                        <Typography variant="body2" color="text.secondary">
                          {proposals.length} proposal{proposals.length !== 1 ? 's' : ''} from {new Set(proposals.map(p => p.user?.id || p.userId)).size} artisan{new Set(proposals.map(p => p.user?.id || p.userId)).size !== 1 ? 's' : ''}
                        </Typography>
                      )}
                    </Box>
                    {proposals.length > 0 && (
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => navigate(`/proposals?request=${request.id}`)}
                      >
                        View All
                      </Button>
                    )}
                  </Box>
                  
                  {loadingProposals ? (
                    <LinearProgress />
                  ) : proposals.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Person sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="body1" color="text.secondary">
                        No proposals yet. Share this request to get applications!
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      {/* Summary of proposal senders */}
                      <Box sx={{ mb: 3, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                          Artisans who submitted proposals ({new Set(proposals.map(p => p.user?.id || p.userId)).size}):
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {Array.from(new Set(proposals.map(p => p.user?.id || p.userId))).map((userId) => {
                            const proposal = proposals.find(p => (p.user?.id || p.userId) === userId);
                            const userProposals = proposals.filter(p => (p.user?.id || p.userId) === userId);
                            const userName = proposal.user?.name || proposal.user?.firstName || `User ${userId.slice(0, 8)}`;
                            return (
                              <Chip
                                key={userId}
                                avatar={
                                  <Avatar src={proposal.user?.avatar || proposal.user?.profilePicture} sx={{ width: 24, height: 24 }}>
                                    {userName[0]?.toUpperCase() || 'U'}
                                  </Avatar>
                                }
                                label={`${userName} (${userProposals.length})`}
                                variant="outlined"
                                size="small"
                                onClick={() => navigate(`/profile/${userId}`)}
                                sx={{ cursor: 'pointer', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) } }}
                              />
                            );
                          })}
                        </Box>
                      </Box>

                      <List>
                        {proposals.slice(0, 3).map((proposal) => (
                          <ListItem 
                            key={proposal.id} 
                            divider
                            sx={{
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                              }
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar src={proposal.user?.avatar}>
                                {proposal.user?.name?.[0] || 'U'}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {proposal.user?.name || 'Unknown User'}
                                  </Typography>
                                  <Chip 
                                    label={proposal.status} 
                                    size="small"
                                    color={
                                      proposal.status === 'accepted' ? 'success' :
                                      proposal.status === 'rejected' ? 'error' : 'default'
                                    }
                                  />
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                    {proposal.message || 'No message provided'}
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                                    {proposal.proposedPrice > 0 && (
                                      <Typography variant="caption" color="text.secondary">
                                        <AttachMoney sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                                        ${proposal.proposedPrice.toLocaleString()}
                                      </Typography>
                                    )}
                                    {proposal.estimatedDuration && (
                                      <Typography variant="caption" color="text.secondary">
                                        <Schedule sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                                        {proposal.estimatedDuration}
                                      </Typography>
                                    )}
                                    <Typography variant="caption" color="text.secondary">
                                      {formatTimeAgo(proposal.createdAt)}
                                    </Typography>
                                  </Box>
                                </Box>
                              }
                            />
                            <Button 
                              variant="outlined" 
                              size="small"
                              onClick={() => navigate(`/proposals?request=${request.id}&proposal=${proposal.id}`)}
                            >
                              View Details
                            </Button>
                          </ListItem>
                        ))}
                      </List>
                      
                      {proposals.length > 3 && (
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                          <Button 
                            variant="text"
                            onClick={() => navigate(`/proposals?request=${request.id}`)}
                          >
                            View {proposals.length - 3} more proposals
                          </Button>
                        </Box>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Attachments */}
          {request.attachments && request.attachments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    Attachments
                  </Typography>
                  <List>
                    {request.attachments.map((file) => (
                      <ListItem key={file.id} divider>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            📄
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={file.name}
                          secondary={file.size}
                        />
                        <Button variant="outlined" size="small">
                          Download
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Client Information */}
          {request.client && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    About the Client
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      src={request.client.avatar} 
                      sx={{ width: 56, height: 56, mr: 2 }}
                    >
                      {request.client.name?.[0] || 'U'}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {request.client.name}
                        {request.client.verified && (
                          <CheckCircle 
                            sx={{ ml: 1, fontSize: 16, color: 'success.main' }} 
                          />
                        )}
                      </Typography>
                      {request.client.rating > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Rating value={request.client.rating} readOnly size="small" />
                          <Typography variant="body2" color="text.secondary">
                            ({request.client.reviewsCount} reviews)
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                  
                  {request.client.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {request.client.description}
                    </Typography>
                  )}

                  <Divider sx={{ my: 2 }} />

                  <Stack spacing={1}>
                    {request.client.jobsPosted > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Jobs Posted
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {request.client.jobsPosted}
                        </Typography>
                      </Box>
                    )}
                    {request.client.location && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Location
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {request.client.location}
                        </Typography>
                      </Box>
                    )}
                    {request.client.memberSince && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Member Since
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {new Date(request.client.memberSince).getFullYear()}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Project Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Project Details
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Experience Level
                    </Typography>
                    <Chip label={request.experience} color="primary" size="small" />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Project Duration
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {request.duration}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Posted Date
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {request.postedDate 
                        ? new Date(request.postedDate).toLocaleDateString()
                        : 'Not available'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Budget Type
                    </Typography>
                    <Chip 
                      label={request.budget.type === 'fixed' ? 'Fixed Price' : 'Hourly Rate'} 
                      variant="outlined" 
                      size="small" 
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>

          {/* Similar Projects - Only show if we have similar projects */}
          {request.similar && request.similar.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Similar Projects
                  </Typography>
                  <List dense>
                    {request.similar.map((similar) => (
                      <ListItem 
                        key={similar.id} 
                        divider 
                        sx={{ 
                          px: 0,
                          '&:hover': { 
                            backgroundColor: alpha(theme.palette.primary.main, 0.05),
                            cursor: 'pointer'
                          }
                        }}
                        component={Link}
                        to={`/requests/${similar.id}`}
                      >
                        <ListItemText
                          primary={similar.title}
                          secondary={`${similar.budget} • ${similar.proposals} proposals`}
                          primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
                          secondaryTypographyProps={{ fontSize: '0.8rem' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default RequestDetailPage;