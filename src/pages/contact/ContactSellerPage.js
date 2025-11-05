import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Alert,
  Snackbar,
  Chip,
  Divider,
  Rating,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Badge,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import {
  Send,
  Email,
  Phone,
  LocationOn,
  Work,
  Verified,
  Schedule,
  TrendingUp,
  Message,
  AttachFile,
  Close,
  CheckCircle,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../lib/supabase';
import { transformUser } from '../../utils/dataTransform';
import { useAuth } from '../../contexts/SupabaseAuthContext';

const ContactSellerPage = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingSeller, setLoadingSeller] = useState(true);
  const [sellerError, setSellerError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [attachments, setAttachments] = useState([]);
  const [sellerData, setSellerData] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    projectType: '',
    budget: '',
    timeline: '',
    urgency: 'medium',
    contactMethod: 'platform',
    includeContact: false,
    email: '',
    phone: ''
  });

  // Form validation errors
  const [errors, setErrors] = useState({});

  // Fetch seller data from database
  useEffect(() => {
    const fetchSellerData = async () => {
      if (!sellerId) {
        setSellerError('Seller ID is required');
        setLoadingSeller(false);
        return;
      }

      try {
        setLoadingSeller(true);
        setSellerError(null);
        
        const dbUser = await db.users.getProfile(sellerId);
        const transformedUser = transformUser(dbUser);
        
        // Fetch seller's skills
        let skills = [];
        try {
          const dbSkills = await db.skills.getUserSkills(sellerId);
          skills = dbSkills.map(skill => skill.title || skill.name || '').filter(Boolean);
        } catch (skillError) {
          console.warn('Could not fetch skills:', skillError);
        }
        
        // Format seller data for display
        setSellerData({
          id: transformedUser.id,
          firstName: transformedUser.firstName || transformedUser.first_name || '',
          lastName: transformedUser.lastName || transformedUser.last_name || '',
          email: transformedUser.email || '',
          bio: transformedUser.bio || '',
          location: transformedUser.location || {},
          profilePicture: transformedUser.profilePicture || transformedUser.profile_picture || '',
          isVerified: transformedUser.isVerified || transformedUser.is_verified || false,
          // Default values for fields not in database
          isOnline: true,
          lastSeen: new Date(),
          rating: {
            average: 4.5,
            count: 0
          },
          completedProjects: 0,
          responseTime: '24 hours',
          successRate: 100,
          languages: [],
          skills: skills,
          hourlyRate: 0,
          availability: 'available',
          timeZone: 'UTC',
          workingHours: '9 AM - 6 PM',
          specializations: []
        });
      } catch (error) {
        console.error('Error fetching seller data:', error);
        setSellerError(error.message || 'Failed to load seller information');
      } finally {
        setLoadingSeller(false);
      }
    };

    fetchSellerData();
  }, [sellerId]);

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const closeNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleFileAttach = (event) => {
    const files = Array.from(event.target.files);
    const newAttachments = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (attachmentId) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.length < 20) {
      newErrors.message = 'Message must be at least 20 characters';
    }

    if (!formData.projectType) {
      newErrors.projectType = 'Please select a project type';
    }

    if (formData.includeContact) {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required when sharing contact info';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm() || !sellerId) {
      showNotification('Please fix the errors in the form', 'error');
      return;
    }

    if (!user?.id) {
      showNotification('Please log in to send a message', 'error');
      return;
    }

    setLoading(true);
    try {
      // Create conversation and send message
      const conversation = await db.conversations.getOrCreate(
        user.id,    // user1_id (current user)
        sellerId    // user2_id (seller)
      );
      
      // Build message content
      const messageContent = [
        `Subject: ${formData.subject}`,
        `Project Type: ${formData.projectType}`,
        formData.budget && `Budget: ${formData.budget}`,
        formData.timeline && `Timeline: ${formData.timeline}`,
        `Urgency: ${formData.urgency}`,
        '',
        formData.message
      ].filter(Boolean).join('\n\n');
      
      // Send message (sender is current user)
      await db.messages.send({
        conversation_id: conversation.id,
        sender_id: user.id,
        content: messageContent
      });
      
      showNotification('Message sent successfully! The seller will respond within their typical response time.');
      
      // Reset form
      setFormData({
        subject: '',
        message: '',
        projectType: '',
        budget: '',
        timeline: '',
        urgency: 'medium',
        contactMethod: 'platform',
        includeContact: false,
        email: '',
        phone: ''
      });
      setAttachments([]);
      
      // Redirect after successful submission
      setTimeout(() => {
        navigate(`/messages`);
      }, 2000);
      
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error.message || 'Failed to send message. Please try again.';
      showNotification(`Error: ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const projectTypes = [
    'Web Development',
    'Mobile App Development',
    'E-commerce Development',
    'API Development',
    'Database Design',
    'UI/UX Design',
    'Custom Software',
    'Consultation',
    'Other'
  ];

  const budgetRanges = [
    'Under $500',
    '$500 - $1,000',
    '$1,000 - $2,500',
    '$2,500 - $5,000',
    '$5,000 - $10,000',
    'Over $10,000',
    'Hourly Rate',
    'To be discussed'
  ];

  const timelineOptions = [
    'ASAP (Rush job)',
    'Within 1 week',
    'Within 2 weeks',
    'Within 1 month',
    '1-3 months',
    '3+ months',
    'Flexible'
  ];

  if (loadingSeller) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (sellerError || !sellerData) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {sellerError || 'Failed to load seller information'}
        </Alert>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
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
            Contact Seller
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Get in touch with {sellerData?.firstName || 'the seller'} for your project
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Seller Information Panel */}
          <Grid item xs={12} md={4}>
            <Card sx={{ position: 'sticky', top: 20 }}>
              <CardContent>
                {/* Seller Profile Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: sellerData.isOnline ? 'success.main' : 'grey.400',
                          border: '2px solid white'
                        }}
                      />
                    }
                  >
                    <Avatar
                      src={sellerData?.profilePicture}
                      sx={{ width: 80, height: 80 }}
                    >
                      {(sellerData?.firstName?.[0] || '') + (sellerData?.lastName?.[0] || '') || 'U'}
                    </Avatar>
                  </Badge>
                  <Box>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {sellerData?.firstName || ''} {sellerData?.lastName || ''}
                      {sellerData?.isVerified && (
                        <Verified sx={{ color: 'success.main', fontSize: 20 }} />
                      )}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Rating value={sellerData?.rating?.average || 0} readOnly size="small" precision={0.1} />
                      <Typography variant="body2" color="text.secondary">
                        {sellerData?.rating?.average || 0} ({sellerData?.rating?.count || 0})
                      </Typography>
                    </Box>
                    <Typography variant="body2" color={sellerData?.isOnline ? 'success.main' : 'text.secondary'}>
                      {sellerData?.isOnline ? 'Online now' : `Last seen ${sellerData?.lastSeen?.toLocaleDateString() || 'recently'}`}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Quick Stats */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>Quick Stats</Typography>
                  <List dense>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Work sx={{ fontSize: 20 }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={`${sellerData?.completedProjects || 0} projects completed`} 
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Schedule sx={{ fontSize: 20 }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={`Responds in ${sellerData?.responseTime || '24 hours'}`} 
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <TrendingUp sx={{ fontSize: 20 }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={`${sellerData?.successRate || 100}% success rate`} 
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    {sellerData?.location?.city && sellerData?.location?.state && (
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <LocationOn sx={{ fontSize: 20 }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={`${sellerData.location.city}, ${sellerData.location.state}`} 
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    )}
                  </List>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Skills */}
                {sellerData?.skills && sellerData.skills.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>Top Skills</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {sellerData.skills.slice(0, 6).map((skill, index) => (
                        <Chip key={skill || index} label={skill} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                )}

                <Divider sx={{ mb: 3 }} />

                {/* Availability */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Availability</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CheckCircle sx={{ color: 'success.main', fontSize: 16 }} />
                    <Typography variant="body2" color="success.main">
                      Available for new projects
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Working hours: {sellerData.workingHours} ({sellerData.timeZone})
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Contact Form */}
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Message /> Send a Message
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Provide details about your project to get an accurate quote and timeline.
              </Typography>

              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  {/* Subject */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      error={!!errors.subject}
                      helperText={errors.subject}
                      placeholder="Brief description of your project needs"
                    />
                  </Grid>

                  {/* Project Type */}
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={!!errors.projectType}>
                      <InputLabel>Project Type</InputLabel>
                      <Select
                        value={formData.projectType}
                        label="Project Type"
                        onChange={(e) => handleInputChange('projectType', e.target.value)}
                      >
                        {projectTypes.map((type) => (
                          <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                      </Select>
                      {errors.projectType && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                          {errors.projectType}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>

                  {/* Urgency */}
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Urgency</InputLabel>
                      <Select
                        value={formData.urgency}
                        label="Urgency"
                        onChange={(e) => handleInputChange('urgency', e.target.value)}
                      >
                        <MenuItem value="low">Low Priority</MenuItem>
                        <MenuItem value="medium">Medium Priority</MenuItem>
                        <MenuItem value="high">High Priority</MenuItem>
                        <MenuItem value="urgent">Urgent</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Budget */}
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Budget Range</InputLabel>
                      <Select
                        value={formData.budget}
                        label="Budget Range"
                        onChange={(e) => handleInputChange('budget', e.target.value)}
                      >
                        {budgetRanges.map((range) => (
                          <MenuItem key={range} value={range}>{range}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Timeline */}
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Timeline</InputLabel>
                      <Select
                        value={formData.timeline}
                        label="Timeline"
                        onChange={(e) => handleInputChange('timeline', e.target.value)}
                      >
                        {timelineOptions.map((option) => (
                          <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Message */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={6}
                      label="Project Description"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      error={!!errors.message}
                      helperText={errors.message || `${formData.message.length}/2000 characters`}
                      placeholder="Describe your project in detail. Include requirements, expectations, and any specific features you need..."
                      inputProps={{ maxLength: 2000 }}
                    />
                  </Grid>

                  {/* File Attachments */}
                  <Grid item xs={12}>
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Attachments (Optional)
                      </Typography>
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<AttachFile />}
                        sx={{ mb: 2 }}
                      >
                        Attach Files
                        <input
                          type="file"
                          multiple
                          hidden
                          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                          onChange={handleFileAttach}
                        />
                      </Button>
                      {attachments.length > 0 && (
                        <Box>
                          {attachments.map((attachment) => (
                            <Box
                              key={attachment.id}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                p: 1,
                                border: 1,
                                borderColor: 'divider',
                                borderRadius: 1,
                                mb: 1
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AttachFile sx={{ fontSize: 16 }} />
                                <Typography variant="body2">{attachment.name}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  ({formatFileSize(attachment.size)})
                                </Typography>
                              </Box>
                              <IconButton
                                size="small"
                                onClick={() => removeAttachment(attachment.id)}
                              >
                                <Close />
                              </IconButton>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  </Grid>

                  {/* Contact Information Sharing */}
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.includeContact}
                          onChange={(e) => handleInputChange('includeContact', e.target.checked)}
                        />
                      }
                      label="Share my contact information for direct communication"
                    />
                  </Grid>

                  {formData.includeContact && (
                    <>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Your Email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          error={!!errors.email}
                          helperText={errors.email}
                          InputProps={{
                            startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Your Phone (Optional)"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          InputProps={{
                            startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />
                          }}
                        />
                      </Grid>
                    </>
                  )}

                  {/* Info Alert */}
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Expected Response Time:</strong> {sellerData?.responseTime || '24 hours'} • 
                      All communication is monitored for quality and safety.
                    </Typography>
                    </Alert>
                  </Grid>

                  {/* Submit Button */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Button
                        variant="outlined"
                        onClick={() => navigate(-1)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={loading}
                        startIcon={loading ? null : <Send />}
                        sx={{ minWidth: 140 }}
                      >
                        {loading ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress sx={{ width: 80, height: 4 }} />
                            Sending...
                          </Box>
                        ) : (
                          'Send Message'
                        )}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>
        </Grid>

        {/* Notification Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={closeNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={closeNotification} 
            severity={notification.severity} 
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </motion.div>
    </Container>
  );
};

export default ContactSellerPage;
