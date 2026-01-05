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
import PaymentModal from '../../components/payment/PaymentModal';

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
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [proposalForPayment, setProposalForPayment] = useState(null);
  const [budgetAdjustmentDialogOpen, setBudgetAdjustmentDialogOpen] = useState(false);
  const [adjustedBudget, setAdjustedBudget] = useState(0);
  const [budgetAdjustmentMessage, setBudgetAdjustmentMessage] = useState('');

  const requestId = searchParams.get('request');
  const proposalId = searchParams.get('proposal');
  const [pendingBudgetChange, setPendingBudgetChange] = useState(null);

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
          try {
            dbProposals = await db.proposals.getByRequest(requestId);
            // If no proposals found, it might be an RLS issue - fall back to all proposals
            if (!dbProposals || dbProposals.length === 0) {
              console.warn('No proposals found for request, fetching all user proposals instead');
              const userRequests = await db.requests.getAll({ userId: user.id });
              const allProposals = [];
              for (const request of userRequests) {
                try {
                  const requestProposals = await db.proposals.getByRequest(request.id);
                  allProposals.push(...requestProposals);
                } catch (reqErr) {
                  console.warn('Error fetching proposals for request:', request.id, reqErr);
                }
              }
              dbProposals = allProposals;
            }
          } catch (err) {
            console.error('Error fetching proposals for request:', err);
            // If we can't fetch by request, try fetching all user proposals
            console.log('Falling back to fetching all user proposals');
            const userRequests = await db.requests.getAll({ userId: user.id });
            const allProposals = [];
            for (const request of userRequests) {
              try {
                const requestProposals = await db.proposals.getByRequest(request.id);
                allProposals.push(...requestProposals);
              } catch (reqErr) {
                console.warn('Error fetching proposals for request:', request.id, reqErr);
              }
            }
            dbProposals = allProposals;
            // Don't show error - just show all proposals instead
            console.log('Showing all proposals instead of request-specific proposals');
          }
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
              price: (() => {
                // Check for approved budget change
                const metadata = proposal.metadata || {};
                const budgetChange = metadata.budget_change_request;
                return budgetChange && budgetChange.status === 'approved' 
                  ? budgetChange.new_amount 
                  : proposal.proposedPrice || 0;
              })(),
              originalPrice: proposal.proposedPrice || 0,
              timeline: proposal.estimatedDuration || 'Not specified',
              budgetChangeApproved: (() => {
                const metadata = proposal.metadata || {};
                const budgetChange = metadata.budget_change_request;
                return budgetChange && budgetChange.status === 'approved';
              })(),
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

    // Auto-refresh proposals every 60 seconds
    const interval = setInterval(() => {
      if (user?.id) {
        fetchProposals();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [user?.id, requestId]);

  // Filter proposals by status
  const pendingProposals = proposals.filter(p => p.status === 'pending');
  const acceptedProposals = proposals.filter(p => p.status === 'accepted');
  const declinedProposals = proposals.filter(p => p.status === 'rejected' || p.status === 'declined');

  const handleAcceptProposal = (proposal) => {
    setSelectedProposal(proposal);
    // Use originalPrice if available, otherwise use current price
    setAdjustedBudget(proposal.proposal.originalPrice || proposal.proposal.price);
    setBudgetAdjustmentMessage('');
    setBudgetAdjustmentDialogOpen(true);
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
      // For decline, update status immediately
      if (actionType === 'decline') {
        const newStatus = 'rejected';
        console.log(`Updating proposal ${selectedProposal.id} to status: ${newStatus}`);
        await db.proposals.update(selectedProposal.id, { status: newStatus });
        
        // Refetch proposals
        let dbProposals = [];
        if (requestId) {
          dbProposals = await db.proposals.getByRequest(requestId);
        } else {
          const userRequests = await db.requests.getAll({ userId: user.id });
          const allProposals = [];
          for (const request of userRequests) {
            const requestProposals = await db.proposals.getByRequest(request.id);
            allProposals.push(...requestProposals);
          }
          dbProposals = allProposals;
        }

        const transformedProposals = dbProposals
          .map(transformProposal)
          .filter(p => p !== null)
          .map(proposal => ({
            id: proposal.id,
            artisan: {
              id: proposal.user?.id,
              name: proposal.user?.name || 'Unknown User',
              avatar: proposal.user?.avatar,
              rating: 0,
              reviews: 0,
              isVerified: proposal.user?.isVerified || false,
              location: proposal.user?.location?.city || 'Location not specified',
            },
            proposal: {
              description: proposal.message || 'No message provided',
              price: proposal.proposedPrice || 0,
              originalPrice: proposal.proposedPrice || 0,
              timeline: proposal.estimatedDuration || 'Not specified',
            },
            submittedAt: proposal.createdAt,
            status: proposal.status || 'pending',
            requestId: proposal.requestId,
            request: proposal.request,
          }));

        setProposals(transformedProposals);
        alert(`Proposal declined. The artisan has been notified.`);
        setActionDialogOpen(false);
        setSelectedProposal(null);
        return;
      }
      
      // For accept, DON'T update status yet - wait for payment
      // Just proceed to payment flow
      console.log(`Preparing to accept proposal ${selectedProposal.id} - waiting for payment`);
      
      // Refetch proposals to get the latest data from database
      let dbProposals = [];
      if (requestId) {
        dbProposals = await db.proposals.getByRequest(requestId);
      } else {
        // Fetch all proposals for user's requests
        const userRequests = await db.requests.getAll({ userId: user.id });
        const allProposals = [];
        for (const request of userRequests) {
          const requestProposals = await db.proposals.getByRequest(request.id);
          allProposals.push(...requestProposals);
        }
        dbProposals = allProposals;
      }

      // Transform and update state with fresh data from database
      const transformedProposals = dbProposals
        .map(transformProposal)
        .filter(p => p !== null)
        .map(proposal => ({
          id: proposal.id,
          artisan: {
            id: proposal.user?.id,
            name: proposal.user?.name || 'Unknown User',
            avatar: proposal.user?.avatar,
            rating: 0,
            reviews: 0,
            isVerified: proposal.user?.isVerified || false,
            location: proposal.user?.location?.city || 'Location not specified',
          },
          proposal: {
            description: proposal.message || 'No message provided',
            price: proposal.proposedPrice || 0,
            originalPrice: proposal.proposedPrice || 0, // Store original price for budget change comparison
            timeline: proposal.estimatedDuration || 'Not specified',
          },
          submittedAt: proposal.createdAt,
          status: proposal.status || 'pending',
          requestId: proposal.requestId,
          request: proposal.request,
        }));

      setProposals(transformedProposals);

      console.log(`Successfully ${actionType}ed proposal:`, selectedProposal.id);
      setActionDialogOpen(false);
      setBudgetAdjustmentDialogOpen(false);
      
      // If accepting proposal, check if budget adjustment needs approval
      if (actionType === 'accept') {
        // Check if there's an approved budget change
        const hasApprovedBudgetChange = selectedProposal.proposal.budgetChangeApproved;
        
        // Get the original price for comparison
        const originalPrice = selectedProposal.proposal.originalPrice || selectedProposal.proposal.price;
        
        // If budget was adjusted and not yet approved, request approval from artisan
        if (adjustedBudget !== originalPrice && !hasApprovedBudgetChange) {
          console.log('Requesting budget change:', {
            proposalId: selectedProposal.id,
            newAmount: adjustedBudget,
            originalAmount: originalPrice,
            artisanId: selectedProposal.artisan.id,
            requestId: selectedProposal.requestId
          });
          
          try {
            // Request budget change approval
            const budgetChangeResult = await db.proposals.requestBudgetChange({
              proposalId: selectedProposal.id,
              newAmount: adjustedBudget,
              originalAmount: originalPrice,
              message: budgetAdjustmentMessage,
              requestId: selectedProposal.requestId,
              artisanId: selectedProposal.artisan.id,
              clientId: user.id
            });
            
            console.log('Budget change request result:', budgetChangeResult);
            
            // Show message to client
            alert('Budget change request sent! Once the artisan approves the change, you will receive a notification and can proceed with payment. Check your notifications for updates.');
            
            // Don't open payment modal yet - wait for approval
            setSelectedProposal(null);
            setAdjustedBudget(0);
            setBudgetAdjustmentMessage('');
            return;
          } catch (error) {
            console.error('Error requesting budget change:', error);
            alert(`Failed to send budget change request: ${error.message}`);
            return;
          }
        }
        
        // If no budget change or budget change is approved, proceed to payment
        const finalPrice = hasApprovedBudgetChange 
          ? selectedProposal.proposal.price 
          : adjustedBudget;
        
        setProposalForPayment({
          ...selectedProposal,
          proposal: {
            ...selectedProposal.proposal,
            price: finalPrice
          }
        });
        setPaymentModalOpen(true);
      } else {
        // For decline, just show success message
        alert(`Proposal declined. The artisan has been notified.`);
      }
      
      setSelectedProposal(null);
      setAdjustedBudget(0);
      setBudgetAdjustmentMessage('');
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
              background: 'linear-gradient(135deg, #1E90FF 0%, #5BB3FF 100%)',
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

      {/* Budget Adjustment Dialog */}
      <Dialog
        open={budgetAdjustmentDialogOpen}
        onClose={() => {
          setBudgetAdjustmentDialogOpen(false);
          setSelectedProposal(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Adjust Budget Before Accepting
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Original proposal amount: <strong>${selectedProposal?.proposal.price.toLocaleString()}</strong>
            <br />
            You can adjust the budget below. The service provider will need to approve the change before payment can be made.
            <br />
            <strong>Once payment change is confirmed by artisan, payment can be made. Look at your notification for update.</strong>
          </Alert>
          
          <TextField
            fullWidth
            label="Adjusted Budget Amount"
            type="number"
            value={adjustedBudget}
            onChange={(e) => setAdjustedBudget(parseFloat(e.target.value) || 0)}
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
            }}
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Reason for Budget Adjustment (Optional)"
            multiline
            rows={3}
            value={budgetAdjustmentMessage}
            onChange={(e) => setBudgetAdjustmentMessage(e.target.value)}
            placeholder="Explain why you're adjusting the budget..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setBudgetAdjustmentDialogOpen(false);
            setSelectedProposal(null);
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              setBudgetAdjustmentDialogOpen(false);
              setActionType('accept');
              setActionDialogOpen(true);
            }}
          >
            Continue to Accept
          </Button>
        </DialogActions>
      </Dialog>

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
              You're about to accept this proposal from {selectedProposal?.artisan.name} for ${adjustedBudget.toLocaleString()}.
              {adjustedBudget !== selectedProposal?.proposal.price && (
                <><br /><strong>Note:</strong> Budget adjusted from ${selectedProposal?.proposal.price.toLocaleString()}</>
              )}
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

      {/* Payment Modal */}
      {proposalForPayment && (
        <PaymentModal
          open={paymentModalOpen}
          onClose={() => {
            setPaymentModalOpen(false);
            setProposalForPayment(null);
          }}
          amount={proposalForPayment.proposal.price}
          proposalId={proposalForPayment.id}
          requestId={proposalForPayment.requestId}
          description={`Payment for "${proposalForPayment.request?.title || 'Service'}" - ${proposalForPayment.artisan.name}`}
          onSuccess={async (result) => {
            console.log('Payment successful:', result);
            
            try {
              // Update proposal status to accepted ONLY after payment succeeds
              await db.proposals.update(proposalForPayment.id, { status: 'accepted' });
              
              // Reject all other proposals for this request
              const requestId = proposalForPayment.requestId;
              if (requestId) {
                const { data: otherProposals } = await db.supabase
                  .from('proposals')
                  .select('id')
                  .eq('request_id', requestId)
                  .neq('id', proposalForPayment.id)
                  .neq('status', 'rejected');
                
                if (otherProposals && otherProposals.length > 0) {
                  await db.supabase
                    .from('proposals')
                    .update({ status: 'rejected' })
                    .in('id', otherProposals.map(p => p.id));
                }
                
                // Update request status to accepted
                await db.supabase
                  .from('requests')
                  .update({ status: 'accepted' })
                  .eq('id', requestId);
              }
              
              // Refresh proposals list
              let dbProposals = [];
              if (requestId) {
                dbProposals = await db.proposals.getByRequest(requestId);
              } else {
                const userRequests = await db.requests.getAll({ userId: user.id });
                const allProposals = [];
                for (const request of userRequests) {
                  const requestProposals = await db.proposals.getByRequest(request.id);
                  allProposals.push(...requestProposals);
                }
                dbProposals = allProposals;
              }

              const transformedProposals = dbProposals
                .map(transformProposal)
                .filter(p => p !== null)
                .map(proposal => ({
                  id: proposal.id,
                  artisan: {
                    id: proposal.user?.id,
                    name: proposal.user?.name || 'Unknown User',
                    avatar: proposal.user?.avatar,
                    rating: 0,
                    reviews: 0,
                    isVerified: proposal.user?.isVerified || false,
                    location: proposal.user?.location?.city || 'Location not specified',
                  },
                  proposal: {
                    description: proposal.message || 'No message provided',
                    price: (() => {
                      const metadata = proposal.metadata || {};
                      const budgetChange = metadata.budget_change_request;
                      return budgetChange && budgetChange.status === 'approved' 
                        ? budgetChange.new_amount 
                        : proposal.proposedPrice || 0;
                    })(),
                    originalPrice: proposal.proposedPrice || 0,
                    timeline: proposal.estimatedDuration || 'Not specified',
                    budgetChangeApproved: (() => {
                      const metadata = proposal.metadata || {};
                      const budgetChange = metadata.budget_change_request;
                      return budgetChange && budgetChange.status === 'approved';
                    })(),
                  },
                  submittedAt: proposal.createdAt,
                  status: proposal.status || 'pending',
                  requestId: proposal.requestId,
                  request: proposal.request,
                }));

              setProposals(transformedProposals);
              
              alert(`Payment successful! $${proposalForPayment.proposal.price} has been placed in escrow. The proposal is now accepted and the artisan can start working on your request.`);
            } catch (error) {
              console.error('Error updating proposal status after payment:', error);
              alert(`Payment successful, but there was an error updating the proposal status. Please refresh the page.`);
            }
            
            setPaymentModalOpen(false);
            setProposalForPayment(null);
          }}
          onError={(error) => {
            console.error('Payment failed:', error);
            alert(`Payment failed: ${error.message}. You can try again from your dashboard.`);
          }}
        />
      )}
    </Container>
  );
};

export default ViewProposalsPage;
