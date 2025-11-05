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
  Rating,
  Divider,
  Tab,
  Tabs,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Breadcrumbs,
  Link,
  LinearProgress,
} from '@mui/material';
import {
  Star,
  Verified,
  Schedule,
  AttachMoney,
  Message,
  CheckCircle,
  Cancel,
  MoreVert,
  Visibility,
  ThumbUp,
  ThumbDown,
  NavigateNext,
  AccessTime,
  Assignment,
  Person,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { db } from '../../lib/supabase';
import { transformProposal, transformUser, formatTimeAgo } from '../../utils/dataTransform';

const ViewProposalsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState(''); // 'accept' or 'decline'
  const [anchorEl, setAnchorEl] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const requestId = searchParams.get('request');
  const proposalId = searchParams.get('proposal');

  // Fetch proposals from database
  useEffect(() => {
    const fetchProposals = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        let dbProposals = [];

        if (requestId) {
          // Fetch proposals for a specific request
          console.log('Fetching proposals for request:', requestId);
          dbProposals = await db.proposals.getByRequest(requestId);
        } else {
          // Fetch all proposals for user's requests
          // First, get all user's requests
          const userRequests = await db.requests.getAll({ userId: user.id });
          console.log('User requests:', userRequests);
          
          // Then fetch proposals for each request
          const allProposals = [];
          for (const request of userRequests) {
            const requestProposals = await db.proposals.getByRequest(request.id);
            allProposals.push(...requestProposals);
          }
          dbProposals = allProposals;
        }

        console.log('Fetched proposals:', dbProposals);

        // Transform proposals
        const transformedProposals = dbProposals
          .map(transformProposal)
          .filter(p => p !== null)
          .map(proposal => ({
            id: proposal.id,
            artisan: {
              id: proposal.user?.id,
              name: proposal.user?.name || 'Unknown User',
              avatar: proposal.user?.avatar,
              rating: 0, // TODO: Add rating system
              reviews: 0,
              isVerified: proposal.user?.isVerified || false,
              location: proposal.user?.location?.city || 'Location not specified',
            },
            proposal: {
              description: proposal.message || 'No message provided',
              price: proposal.proposedPrice || 0,
              timeline: proposal.estimatedDuration || 'Not specified',
            },
            submittedAt: proposal.createdAt,
            status: proposal.status || 'pending',
            requestId: proposal.requestId,
            request: proposal.request,
          }));

        setProposals(transformedProposals);
      } catch (err) {
        console.error('Error fetching proposals:', err);
        setError(err.message || 'Failed to load proposals');
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();

    // Auto-refresh proposals every 10 seconds
    const interval = setInterval(() => {
      if (user?.id) {
        fetchProposals();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [user?.id, requestId]);

  // Filter proposals by status
  const pendingProposals = proposals.filter(p => p.status === 'pending');
  const acceptedProposals = proposals.filter(p => p.status === 'accepted');
  const declinedProposals = proposals.filter(p => p.status === 'rejected' || p.status === 'declined');

  const handleAcceptProposal = (proposal) => {
    setSelectedProposal(proposal);
    setActionType('accept');
    setActionDialogOpen(true);
  };

  const handleDeclineProposal = (proposal) => {
    setSelectedProposal(proposal);
    setActionType('decline');
    setActionDialogOpen(true);
  };

  const handleContactArtisan = (artisan) => {
    if (artisan.id) {
      navigate(`/contact/${artisan.id}`);
    }
  };

  const confirmAction = async () => {
    if (!selectedProposal) return;

    try {
      const newStatus = actionType === 'accept' ? 'accepted' : 'rejected';
      
      await db.proposals.update(selectedProposal.id, { status: newStatus });
      
      // Update local state immediately
      setProposals(prev => prev.map(p => 
        p.id === selectedProposal.id ? { ...p, status: newStatus } : p
      ));

      console.log(`${actionType} proposal:`, selectedProposal.id);
      setActionDialogOpen(false);
      setSelectedProposal(null);
      
      // Show success message
      alert(`Proposal ${actionType}ed successfully! The artisan has been notified.`);
    } catch (error) {
      console.error('Error updating proposal:', error);
      alert(`Failed to ${actionType} proposal: ${error.message}`);
    }
  };

  const getProposalsToShow = () => {
    switch (tabValue) {
      case 0: return pendingProposals;
      case 1: return acceptedProposals;
      case 2: return declinedProposals;
      default: return proposals;
    }
  };

  const ProposalCard = ({ proposal }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card sx={{ mb: 3, border: proposal.status === 'accepted' ? '2px solid #4caf50' : 'none' }}>
        <CardContent sx={{ p: 3 }}>
          {/* Artisan Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar src={proposal.artisan.avatar} sx={{ width: 56, height: 56 }} />
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {proposal.artisan.name}
                  </Typography>
                  {proposal.artisan.isVerified && (
                    <Verified sx={{ fontSize: 18, color: 'primary.main' }} />
                  )}
                </Box>
                {proposal.artisan.rating > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Rating value={proposal.artisan.rating} precision={0.1} size="small" readOnly />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {proposal.artisan.rating}
                    </Typography>
                    {proposal.artisan.reviews > 0 && (
                      <Typography variant="body2" color="text.secondary">
                        ({proposal.artisan.reviews} reviews)
                      </Typography>
                    )}
                  </Box>
                )}
                <Typography variant="caption" color="text.secondary">
                    {proposal.artisan.location}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip 
                label={proposal.status.toUpperCase()} 
                color={proposal.status === 'accepted' ? 'success' : proposal.status === 'declined' ? 'error' : 'default'}
                size="small"
              />
              <IconButton size="small">
                <MoreVert />
              </IconButton>
            </Box>
          </Box>

          {/* Proposal Details */}
          {proposal.request && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                For: {proposal.request.title}
              </Typography>
            </Box>
          )}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ lineHeight: 1.6, mb: 2 }}>
              {proposal.proposal.description}
            </Typography>
          </Box>

          {/* Key Details */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.50', borderRadius: 2 }}>
                <AttachMoney sx={{ color: 'success.main', mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                  ${proposal.proposal.price > 0 ? proposal.proposal.price.toLocaleString() : 'Not specified'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Price
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.50', borderRadius: 2 }}>
                <Schedule sx={{ color: 'info.main', mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'info.main' }}>
                  {proposal.proposal.timeline}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Timeline
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
                <Assignment sx={{ color: 'primary.main', mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  {proposal.proposal.timeline || 'Not specified'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Estimated Duration
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Action Buttons */}
          {proposal.status === 'pending' && (
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="success"
                startIcon={<ThumbUp />}
                onClick={() => handleAcceptProposal(proposal)}
                sx={{ px: 3 }}
              >
                Accept Proposal
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<ThumbDown />}
                onClick={() => handleDeclineProposal(proposal)}
              >
                Decline
              </Button>
              <Button
                variant="outlined"
                startIcon={<Message />}
                onClick={() => handleContactArtisan(proposal.artisan)}
              >
                Message Artisan
              </Button>
              <Button
                variant="outlined"
                startIcon={<Visibility />}
                onClick={() => navigate(`/profile/${proposal.artisan.id}`)}
              >
                View Profile
              </Button>
            </Box>
          )}

          {proposal.status === 'accepted' && (
            <Alert severity="success" sx={{ mt: 2 }}>
              ✅ Proposal accepted! The artisan will contact you soon to begin the project.
            </Alert>
          )}

          {proposal.status === 'declined' && (
            <Alert severity="info" sx={{ mt: 2 }}>
              This proposal was declined.
            </Alert>
          )}

          {/* Submission Time */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <AccessTime sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              Submitted {formatTimeAgo(proposal.submittedAt)}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
        <Link color="inherit" href="/" sx={{ textDecoration: 'none' }}>
          Home
        </Link>
        <Link color="inherit" href="/client/dashboard" sx={{ textDecoration: 'none' }}>
          Dashboard
        </Link>
        <Typography color="text.primary">Proposals</Typography>
      </Breadcrumbs>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
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
            Artisan Proposals
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Review and manage proposals from talented artisans
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {proposals.length} total proposals • {pendingProposals.length} awaiting your review
          </Typography>
        </Box>
      </motion.div>

      {/* Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ px: 2 }}
        >
          <Tab 
            label={`Pending (${pendingProposals.length})`} 
            icon={<AccessTime />} 
            iconPosition="start"
          />
          <Tab 
            label={`Accepted (${acceptedProposals.length})`} 
            icon={<CheckCircle />} 
            iconPosition="start"
          />
          <Tab 
            label={`Declined (${declinedProposals.length})`} 
            icon={<Cancel />} 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Proposals List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {loading ? (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <LinearProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Loading proposals...
            </Typography>
          </Paper>
        ) : error ? (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          </Paper>
        ) : getProposalsToShow().length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <Assignment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No {tabValue === 0 ? 'pending' : tabValue === 1 ? 'accepted' : 'declined'} proposals
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {tabValue === 0 
                ? 'New proposals will appear here when artisans submit them.'
                : tabValue === 1 
                ? 'Accepted proposals will be shown here.'
                : 'Declined proposals will be listed here.'
              }
            </Typography>
          </Paper>
        ) : (
          getProposalsToShow().map((proposal) => (
            <ProposalCard key={proposal.id} proposal={proposal} />
          ))
        )}
      </motion.div>

      {/* Action Confirmation Dialog */}
      <Dialog
        open={actionDialogOpen}
        onClose={() => setActionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {actionType === 'accept' ? 'Accept Proposal' : 'Decline Proposal'}
        </DialogTitle>
        <DialogContent>
          {actionType === 'accept' ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              You're about to accept this proposal from {selectedProposal?.artisan.name} for ${selectedProposal?.proposal.price.toLocaleString()}.
            </Alert>
          ) : (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Are you sure you want to decline this proposal from {selectedProposal?.artisan.name}?
            </Alert>
          )}
          
          <TextField
            fullWidth
            label={actionType === 'accept' ? 'Message to Artisan (Optional)' : 'Reason for Declining (Optional)'}
            multiline
            rows={3}
            placeholder={
              actionType === 'accept' 
                ? 'Let the artisan know you\'re excited to work with them...'
                : 'Provide feedback to help the artisan improve...'
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color={actionType === 'accept' ? 'success' : 'error'}
            onClick={confirmAction}
          >
            {actionType === 'accept' ? 'Accept Proposal' : 'Decline Proposal'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ViewProposalsPage;
