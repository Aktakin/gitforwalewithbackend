import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Slider,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Star,
  Verified,
  Schedule,
  AttachMoney,
  CheckCircle,
  Send,
  NavigateNext,
  AccessTime,
  Assignment,
  Description,
  Payment,
  Timeline,
  Warning,
  Info,
  CloudUpload,
  Delete,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../lib/supabase';
import { transformRequest, transformUser, formatTimeAgo, formatDeadline } from '../../utils/dataTransform';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { CircularProgress, Alert as MuiAlert, AlertTitle } from '@mui/material';

// Proposal Step Component - Defined outside and NOT memoized to test
const ProposalStepContent = ({ 
  coverLetter, 
  experience, 
  portfolio, 
  questions,
  onCoverLetterChange,
  onExperienceChange,
  onPortfolioChange,
  onQuestionsChange
}) => {
  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
        Craft Your Proposal
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Cover Letter *
          </Typography>
          <TextField
            id="cover-letter-input"
            fullWidth
            multiline
            rows={8}
            placeholder="Introduce yourself and explain why you're the perfect fit for this project. Highlight your relevant experience, approach, and what makes you unique..."
            value={coverLetter}
            onChange={onCoverLetterChange}
            sx={{ mb: 3 }}
          />

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Relevant Experience
          </Typography>
          <TextField
            id="experience-input"
            fullWidth
            multiline
            rows={4}
            placeholder="Describe your relevant experience with similar projects. Include specific examples and achievements..."
            value={experience}
            onChange={onExperienceChange}
            sx={{ mb: 3 }}
          />

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Portfolio Links (Optional)
          </Typography>
          <TextField
            id="portfolio-input"
            fullWidth
            placeholder="Share links to your relevant work, GitHub repos, or live demos..."
            value={portfolio}
            onChange={onPortfolioChange}
            sx={{ mb: 3 }}
          />

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Questions for the Client
          </Typography>
          <TextField
            id="questions-input"
            fullWidth
            multiline
            rows={3}
            placeholder="Ask any clarifying questions about the project requirements, scope, or expectations..."
            value={questions}
            onChange={onQuestionsChange}
          />
        </CardContent>
      </Card>

      <Alert severity="warning" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Tip:</strong> Personalize your proposal by addressing the client's specific needs. 
          Avoid generic templates and show that you've read the project carefully.
        </Typography>
      </Alert>
    </Box>
  );
};

const CreateProposalPage = () => {
  const navigate = useNavigate();
  const { requestId } = useParams();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [requestData, setRequestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [existingProposal, setExistingProposal] = useState(null);
  const [hasExistingProposal, setHasExistingProposal] = useState(false);

  // Proposal form state
  const [proposalData, setProposalData] = useState({
    coverLetter: '',
    timeline: '',
    budget: 2500,
    budgetType: 'fixed',
    milestones: [
      { name: '', description: '', amount: '', deadline: '' }
    ],
    attachments: [],
    questions: '',
    availability: 'full-time',
    experience: '',
    portfolio: '',
    additionalServices: false,
    agreedToTerms: false
  });

  // Fetch request data from database
  useEffect(() => {
    const fetchRequestData = async () => {
      if (!requestId) {
        setError('Request ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching request data for proposal:', requestId);
        console.log('Current user:', user?.id, user?.email);
        
        // Fetch request from database
        const dbRequest = await db.requests.getById(requestId);
        
        console.log('DB Request result:', dbRequest);
        
        if (!dbRequest) {
          console.error('Request not found. Request ID:', requestId, 'User ID:', user?.id);
          setError('Request not found or you do not have permission to view it. The request may have been removed or marked as private.');
          setLoading(false);
          return;
        }
        
        console.log('Request loaded successfully:', dbRequest.id, dbRequest.title);

        // Transform the request data
        const transformedRequest = transformRequest(dbRequest);
        
        // Get client/user information
        const client = transformedRequest.user || transformedRequest.customer;
        
        // Format the request data for display
        const formattedRequest = {
          id: transformedRequest.id,
          title: transformedRequest.title,
          description: transformedRequest.description || 'No description provided',
          category: transformedRequest.category,
          budget: transformedRequest.budget || { min: 0, max: 0, type: 'fixed' },
          deadline: transformedRequest.deadline 
            ? formatDeadline(transformedRequest.deadline)
            : 'No deadline',
          skills: transformedRequest.tags || [],
          proposals: transformedRequest.proposals || 0,
          urgency: transformedRequest.urgency || 'medium',
          requirements: transformedRequest.requirements || [],
          postedTime: formatTimeAgo(transformedRequest.createdAt),
          client: client ? {
            name: client.name || `${client.firstName || ''} ${client.lastName || ''}`.trim() || client.email,
            avatar: client.avatar || client.profilePicture,
            rating: 0, // TODO: Add rating system
            reviews: 0, // TODO: Add reviews count
            verified: client.isVerified || false,
            memberSince: client.joinedAt ? new Date(client.joinedAt).getFullYear().toString() : 'N/A',
            location: client.location?.city && client.location?.state 
              ? `${client.location.city}, ${client.location.state}`
              : client.location?.country || 'Location not specified'
          } : null
        };
        
        // Set default budget for proposal form
        if (formattedRequest.budget.min && formattedRequest.budget.max) {
          setProposalData(prev => ({
            ...prev,
            budget: Math.floor((formattedRequest.budget.min + formattedRequest.budget.max) / 2)
          }));
        }
        
        console.log('Request data loaded:', formattedRequest);
        setRequestData(formattedRequest);

        // Check if user already has a proposal for this request
        if (user?.id) {
          try {
            const existing = await db.proposals.checkExisting(requestId, user.id);
            if (existing) {
              setExistingProposal(existing);
              setHasExistingProposal(true);
            }
          } catch (err) {
            console.warn('Error checking existing proposal:', err);
            // Continue anyway, validation will happen on submit
          }
        }
      } catch (err) {
        console.error('Error fetching request data:', err);
        setError(err.message || 'Failed to load request details');
      } finally {
        setLoading(false);
      }
    };

    fetchRequestData();
  }, [requestId, user?.id]);

  const steps = ['Project Details', 'Your Proposal', 'Budget & Timeline', 'Review & Submit'];

  // Memoized handlers to ensure stable references
  const handleCoverLetterChange = useCallback((e) => {
    setProposalData(prev => ({ ...prev, coverLetter: e.target.value }));
  }, []);

  const handleExperienceChange = useCallback((e) => {
    setProposalData(prev => ({ ...prev, experience: e.target.value }));
  }, []);

  const handlePortfolioChange = useCallback((e) => {
    setProposalData(prev => ({ ...prev, portfolio: e.target.value }));
  }, []);

  const handleQuestionsChange = useCallback((e) => {
    setProposalData(prev => ({ ...prev, questions: e.target.value }));
  }, []);

  const handleBudgetTypeChange = useCallback((e) => {
    setProposalData(prev => ({ ...prev, budgetType: e.target.value }));
  }, []);

  const handleBudgetChange = useCallback((e) => {
    setProposalData(prev => ({ ...prev, budget: parseInt(e.target.value) || 0 }));
  }, []);

  const handleTimelineChange = useCallback((e) => {
    setProposalData(prev => ({ ...prev, timeline: e.target.value }));
  }, []);

  const handleAvailabilityChange = useCallback((e) => {
    setProposalData(prev => ({ ...prev, availability: e.target.value }));
  }, []);

  const handleAdditionalServicesChange = useCallback((e) => {
    setProposalData(prev => ({ ...prev, additionalServices: e.target.checked }));
  }, []);

  const handleAgreedToTermsChange = useCallback((e) => {
    setProposalData(prev => ({ ...prev, agreedToTerms: e.target.checked }));
  }, []);

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      setConfirmationOpen(true);
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmitProposal = async () => {
    if (!user || !requestId) {
      alert('Please log in to submit a proposal');
      return;
    }

    // Double-check for existing proposal
    if (hasExistingProposal) {
      alert('You have already submitted a proposal for this request. You can only submit one proposal per request.');
      navigate(`/requests/${requestId}`);
      return;
    }

    try {
      setConfirmationOpen(false);
      
      // Prepare proposal data for database
      const proposalToSubmit = {
        request_id: requestId,
        user_id: user.id,
        message: proposalData.coverLetter || proposalData.experience || 'Proposal submitted',
        proposed_price: proposalData.budget && proposalData.budget > 0 ? proposalData.budget : null,
        estimated_duration: proposalData.timeline || null,
        status: 'pending'
      };

      console.log('Submitting proposal:', proposalToSubmit);
      
      // Submit proposal to database (will check for duplicates)
      await db.proposals.create(proposalToSubmit);
      
      alert('🎉 Proposal submitted successfully! The client will review your proposal and get back to you.');
      navigate(`/requests/${requestId}`);
    } catch (error) {
      console.error('Error submitting proposal:', error);
      alert(`Failed to submit proposal: ${error.message}`);
    }
  };

  const addMilestone = useCallback(() => {
    setProposalData(prev => ({
      ...prev,
      milestones: [...prev.milestones, { name: '', description: '', amount: '', deadline: '' }]
    }));
  }, []);

  const removeMilestone = useCallback((index) => {
    setProposalData(prev => {
      const newMilestones = prev.milestones.filter((_, i) => i !== index);
      return { ...prev, milestones: newMilestones };
    });
  }, []);

  const updateMilestone = useCallback((index, field, value) => {
    setProposalData(prev => {
      const newMilestones = [...prev.milestones];
      newMilestones[index][field] = value;
      return { ...prev, milestones: newMilestones };
    });
  }, []);

  const formatBudget = (budget) => {
    if (!budget || !budget.min || !budget.max) return 'Not specified';
    return `$${budget.min.toLocaleString()} - $${budget.max.toLocaleString()}`;
  };

  // Step 3: Budget & Timeline - Regular function component (handlers are already memoized with useCallback)
  const BudgetTimelineStep = () => (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
        Budget & Timeline
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Your Budget *
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Budget Type</InputLabel>
                <Select
                  value={proposalData.budgetType}
                  label="Budget Type"
                  onChange={handleBudgetTypeChange}
                >
                  <MenuItem value="fixed">Fixed Price</MenuItem>
                  <MenuItem value="hourly">Hourly Rate</MenuItem>
                </Select>
              </FormControl>

              <Typography variant="body2" gutterBottom>
                {proposalData.budgetType === 'fixed' ? 'Total Project Cost' : 'Hourly Rate'}
              </Typography>
              <TextField
                id="budget-input"
                fullWidth
                type="number"
                value={proposalData.budget}
                onChange={handleBudgetChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  endAdornment: proposalData.budgetType === 'hourly' && 
                    <InputAdornment position="end">/hour</InputAdornment>
                }}
                sx={{ mb: 2 }}
              />

              <Typography variant="caption" color="text.secondary">
                Client's budget: {requestData ? formatBudget(requestData.budget) : 'Loading...'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Timeline *
              </Typography>
              
              <TextField
                id="timeline-input"
                fullWidth
                placeholder="e.g., 6 weeks, 2 months, etc."
                value={proposalData.timeline}
                onChange={handleTimelineChange}
                sx={{ mb: 2 }}
              />

              <FormControl fullWidth>
                <InputLabel>Availability</InputLabel>
                <Select
                  value={proposalData.availability}
                  label="Availability"
                  onChange={handleAvailabilityChange}
                >
                  <MenuItem value="full-time">Full-time (40+ hours/week)</MenuItem>
                  <MenuItem value="part-time">Part-time (20-40 hours/week)</MenuItem>
                  <MenuItem value="weekends">Evenings/Weekends only</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {proposalData.budgetType === 'fixed' && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Project Milestones (Optional)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Break down your project into milestones to help manage expectations and payments.
            </Typography>

            {proposalData.milestones.map((milestone, index) => (
              <Paper key={index} variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Milestone name"
                      value={milestone.name}
                      onChange={(e) => updateMilestone(index, 'name', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Description"
                      value={milestone.description}
                      onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      placeholder="Amount"
                      value={milestone.amount}
                      onChange={(e) => updateMilestone(index, 'amount', e.target.value)}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField
                      fullWidth
                      size="small"
                      type="date"
                      value={milestone.deadline}
                      onChange={(e) => updateMilestone(index, 'deadline', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={1}>
                    {proposalData.milestones.length > 1 && (
                      <Button
                        size="small"
                        color="error"
                        onClick={() => removeMilestone(index)}
                      >
                        <Delete />
                      </Button>
                    )}
                  </Grid>
                </Grid>
              </Paper>
            ))}

            <Button
              variant="outlined"
              onClick={addMilestone}
              sx={{ mt: 1 }}
            >
              Add Milestone
            </Button>
          </CardContent>
        </Card>
      )}

      <FormControlLabel
        control={
          <Checkbox
            checked={proposalData.additionalServices}
            onChange={handleAdditionalServicesChange}
          />
        }
        label="I'm open to providing additional services beyond the project scope"
        sx={{ mt: 2 }}
      />
    </Box>
  );

  // Show loading state
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress />
          <Typography>Loading request details...</Typography>
        </Box>
      </Container>
    );
  }

  // Show error state
  if (error || !requestData) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <MuiAlert severity="error" sx={{ mb: 2 }}>
          {error || 'Request not found'}
        </MuiAlert>
        <Button variant="contained" onClick={() => navigate('/requests')}>
          Back to Requests
        </Button>
      </Container>
    );
  }

  // Step 1: Project Details (Read-only)
  const ProjectDetailsStep = () => (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
        Project Overview
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            {requestData.title}
          </Typography>
          
          {requestData.client && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar src={requestData.client.avatar} sx={{ width: 48, height: 48 }} />
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {requestData.client.name}
                  </Typography>
                  {requestData.client.verified && (
                    <Verified sx={{ fontSize: 18, color: 'primary.main' }} />
                  )}
                </Box>
                {requestData.client.rating > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Star sx={{ fontSize: 16, color: 'warning.main' }} />
                    <Typography variant="body2">
                      {requestData.client.rating} ({requestData.client.reviews} reviews)
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}

          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
            {requestData.description}
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Budget Range
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachMoney sx={{ fontSize: 20, color: 'success.main' }} />
                <Typography variant="h6" color="success.main">
                  {formatBudget(requestData.budget)}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Timeline
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Schedule sx={{ fontSize: 20, color: 'primary.main' }} />
                <Typography variant="h6">
                  {requestData.deadline}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            Required Skills
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {requestData.skills && requestData.skills.length > 0 ? (
              requestData.skills.map((skill) => (
                <Chip key={skill} label={skill} variant="outlined" color="primary" />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">No specific skills listed</Typography>
            )}
          </Box>

          {requestData.requirements && requestData.requirements.length > 0 && (
            <>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Requirements
              </Typography>
              <List dense>
                {requestData.requirements.map((req, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckCircle sx={{ fontSize: 20, color: 'success.main' }} />
                    </ListItemIcon>
                    <ListItemText primary={req} />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </CardContent>
      </Card>

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          This project has received <strong>{requestData.proposals} proposals</strong> so far. 
          Make your proposal stand out by addressing all requirements and showcasing relevant experience.
        </Typography>
      </Alert>
    </Box>
  );

  // Step 2: Your Proposal - Render content directly (no wrapper function)

  // Step 4: Review & Submit
  const ReviewSubmitStep = () => (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
        Review Your Proposal
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Proposal Summary
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Budget</Typography>
              <Typography variant="h6" color="primary.main">
                ${proposalData.budget.toLocaleString()}
                {proposalData.budgetType === 'hourly' ? '/hour' : ''}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Timeline</Typography>
              <Typography variant="h6">{proposalData.timeline || 'Not specified'}</Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Cover Letter
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, maxHeight: 150, overflow: 'auto' }}>
            {proposalData.coverLetter || 'No cover letter provided'}
          </Typography>

          {proposalData.experience && (
            <>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Experience
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, maxHeight: 100, overflow: 'auto' }}>
                {proposalData.experience}
              </Typography>
            </>
          )}

          {proposalData.questions && (
            <>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Questions for Client
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {proposalData.questions}
              </Typography>
            </>
          )}
        </CardContent>
      </Card>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Once submitted, you won't be able to edit this proposal. Make sure all information is accurate.
        </Typography>
      </Alert>

      <FormControlLabel
        control={
          <Checkbox
            checked={proposalData.agreedToTerms}
            onChange={handleAgreedToTermsChange}
          />
        }
        label="I agree to the terms of service and understand the project requirements"
      />
    </Box>
  );

  // Get step content function
  const getStepContent = () => {
    switch (activeStep) {
      case 0:
        return <ProjectDetailsStep key="step-0" />;
      case 1:
        return (
          <ProposalStepContent
            key="step-1"
            coverLetter={proposalData.coverLetter}
            experience={proposalData.experience}
            portfolio={proposalData.portfolio}
            questions={proposalData.questions}
            onCoverLetterChange={handleCoverLetterChange}
            onExperienceChange={handleExperienceChange}
            onPortfolioChange={handlePortfolioChange}
            onQuestionsChange={handleQuestionsChange}
          />
        );
      case 2:
        return <BudgetTimelineStep key="step-2" />;
      case 3:
        return <ReviewSubmitStep key="step-3" />;
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
        <Link color="inherit" href="/" sx={{ textDecoration: 'none' }}>
          Home
        </Link>
        <Link color="inherit" href="/requests" sx={{ textDecoration: 'none' }}>
          Requests
        </Link>
        <Typography color="text.primary">Send Proposal</Typography>
      </Breadcrumbs>

      {/* Show warning if user already has a proposal */}
      {hasExistingProposal && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>Proposal Already Submitted</AlertTitle>
          You have already submitted a proposal for this request. You can only submit one proposal per request.
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate(`/requests/${requestId}`)}
            >
              View Request Details
            </Button>
          </Box>
        </Alert>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            mb: 1,
            background: 'linear-gradient(135deg, #1E90FF 0%, #5BB3FF 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Send Your Proposal
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Submit a compelling proposal to win this project
        </Typography>
      </motion.div>

      {/* Stepper */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Paper sx={{ p: 3, mb: 4 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {/* Step Content */}
          <Box key={`step-content-${activeStep}`}>
            {getStepContent()}
          </Box>
          
          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={
                hasExistingProposal ||
                (activeStep === 1 && !proposalData.coverLetter) ||
                (activeStep === 2 && (!proposalData.budget || !proposalData.timeline)) ||
                (activeStep === 3 && !proposalData.agreedToTerms)
              }
              startIcon={activeStep === steps.length - 1 ? <Send /> : undefined}
            >
              {activeStep === steps.length - 1 ? 'Submit Proposal' : 'Next'}
            </Button>
          </Box>
        </Paper>
      </motion.div>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Proposal Submission</DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 2 }}>
            You're about to submit your proposal for <strong>{requestData.title}</strong>
          </Alert>
          
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Your Bid:</strong> ${proposalData.budget.toLocaleString()}
            {proposalData.budgetType === 'hourly' ? '/hour' : ''}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Timeline:</strong> {proposalData.timeline}
          </Typography>
          <Typography variant="body2">
            The client will review your proposal and contact you if interested. 
            You'll be notified of any updates via email and in your dashboard.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmationOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmitProposal}
            startIcon={<Send />}
          >
            Submit Proposal
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CreateProposalPage;



