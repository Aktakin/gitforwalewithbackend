import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Card,
  CardContent,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Switch,
  FormControlLabel,
  Divider,
  Slider,
  InputAdornment,
  RadioGroup,
  Radio,
  FormLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import { 
  Add, 
  CloudUpload, 
  Delete,
  Schedule,
  LocationOn,
  AttachMoney,
  CheckCircle,
  Work,
  Description,
  PriorityHigh,
  Settings,
  DateRange,
  Public,
  VisibilityOff,
  Remove,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { db } from '../../lib/supabase';

const CreateRequestPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    // Basic Info
    title: '',
    description: '',
    category: '',
    tags: [],
    
    // Budget & Timeline
    budget: {
      min: 100,
      max: 500,
      type: 'fixed',
      currency: 'USD'
    },
    deadline: null,
    urgency: 'medium',
    
    // Location & Service Type
    serviceType: 'both',
    location: {
      address: '',
      city: '',
      state: '',
      country: '',
      radius: 50
    },
    
    // Requirements & Details
    requirements: [],
    preferredQualifications: [],
    additionalInfo: '',
    
    // Settings
    isPublic: true,
    allowMessages: true,
    maxProposals: 50,
    attachments: []
  });

  const [currentTag, setCurrentTag] = useState('');
  const [currentRequirement, setCurrentRequirement] = useState('');
  const [currentQualification, setCurrentQualification] = useState('');

  const steps = [
    'Basic Information',
    'Budget & Timeline', 
    'Location & Service Type',
    'Requirements & Settings'
  ];

  const categories = [
    'Woodworking & Carpentry',
    'Pottery & Ceramics',
    'Painting & Fine Arts',
    'Jewelry Making',
    'Textile & Fiber Arts',
    'Metalworking & Blacksmithing',
    'Glassblowing & Glasswork',
    'Leatherworking',
    'Stone Carving & Sculpture',
    'Bookbinding & Paper Arts',
    'Tailoring & Sewing',
    'Basketry & Wickerwork',
    'Weaving & Textiles',
    'Calligraphy & Hand Lettering',
    'Mosaics & Tile Work',
    'Printmaking',
    'Paper Crafts',
    'Quilting',
    'Embroidery & Needlework',
    'Knitting & Crochet',
    'Lace Making',
    'Rug Making',
    'Toy Making',
    'Musical Instrument Making',
    'Furniture Making',
    'Restoration & Conservation'
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Low Priority', description: 'No rush, flexible timeline', color: 'success' },
    { value: 'medium', label: 'Medium Priority', description: 'Standard timeline expected', color: 'info' },
    { value: 'high', label: 'High Priority', description: 'Need this completed soon', color: 'warning' },
    { value: 'urgent', label: 'Urgent', description: 'Critical timeline, ASAP', color: 'error' }
  ];

  // Validation functions
  const validateStep = (stepIndex) => {
    const newErrors = {};
    
    switch (stepIndex) {
      case 0: // Basic Information
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        else if (formData.title.length < 3) newErrors.title = 'Title must be at least 3 characters';
        else if (formData.title.length > 100) newErrors.title = 'Title must be less than 100 characters';
        
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        else if (formData.description.length < 10) newErrors.description = 'Description must be at least 10 characters';
        else if (formData.description.length > 2000) newErrors.description = 'Description must be less than 2000 characters';
        
        if (!formData.category) newErrors.category = 'Category is required';
        break;
        
      case 1: // Budget & Timeline
        if (!formData.budget.min || formData.budget.min < 0) newErrors.budgetMin = 'Minimum budget is required and must be positive';
        if (!formData.budget.max || formData.budget.max < 0) newErrors.budgetMax = 'Maximum budget is required and must be positive';
        if (formData.budget.min >= formData.budget.max) newErrors.budgetRange = 'Maximum budget must be greater than minimum budget';
        if (!formData.deadline) newErrors.deadline = 'Deadline is required';
        else if (new Date(formData.deadline) <= new Date()) newErrors.deadline = 'Deadline must be in the future';
        break;
        
      case 2: // Location & Service Type
        if (formData.serviceType !== 'remote' && !formData.location.city) {
          newErrors.locationCity = 'City is required for in-person services';
        }
        break;
        
      case 3: // Requirements & Settings
        if (formData.maxProposals < 1 || formData.maxProposals > 100) {
          newErrors.maxProposals = 'Max proposals must be between 1 and 100';
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const closeNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNestedChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleBudgetChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      budget: {
        ...prev.budget,
        [field]: value
      }
    }));
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddRequirement = () => {
    if (currentRequirement.trim() && !formData.requirements.includes(currentRequirement.trim())) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, currentRequirement.trim()]
      }));
      setCurrentRequirement('');
    }
  };

  const handleRemoveRequirement = (index) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const handleAddQualification = () => {
    if (currentQualification.trim() && !formData.preferredQualifications.includes(currentQualification.trim())) {
      setFormData(prev => ({
        ...prev,
        preferredQualifications: [...prev.preferredQualifications, currentQualification.trim()]
      }));
      setCurrentQualification('');
    }
  };

  const handleRemoveQualification = (index) => {
    setFormData(prev => ({
      ...prev,
      preferredQualifications: prev.preferredQualifications.filter((_, i) => i !== index)
    }));
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    } else {
      showNotification('Please fix the errors before proceeding', 'error');
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setErrors({}); // Clear errors when going back
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all steps
    let allValid = true;
    for (let i = 0; i < steps.length; i++) {
      if (!validateStep(i)) {
        allValid = false;
        break;
      }
    }
    
    if (!allValid) {
      showNotification('Please fix all errors before submitting', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare the data to match the backend API format
      const requestData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags: formData.tags,
        budget: {
          min: formData.budget.min,
          max: formData.budget.max,
          type: formData.budget.type,
          currency: formData.budget.currency
        },
        deadline: formData.deadline,
        urgency: formData.urgency,
        serviceType: formData.serviceType,
        location: formData.serviceType !== 'remote' ? {
          city: formData.location.city,
          state: formData.location.state,
          country: formData.location.country,
          radius: formData.location.radius
        } : undefined,
        requirements: formData.requirements,
        preferredQualifications: formData.preferredQualifications,
        additionalInfo: formData.additionalInfo,
        isPublic: formData.isPublic,
        allowMessages: formData.allowMessages,
        maxProposals: formData.maxProposals
      };

      if (!user) {
        throw new Error('You must be logged in to create a request');
      }

      console.log('Submitting request data:', requestData);
      
      // Save to Supabase
      const supabaseRequestData = {
        user_id: user.id,
        title: requestData.title,
        description: requestData.description,
        category: requestData.category,
        tags: requestData.tags || [],
        budget: requestData.budget,
        deadline: requestData.deadline ? new Date(requestData.deadline).toISOString() : null,
        urgency: requestData.urgency,
        service_type: requestData.serviceType,
        location: requestData.location || null,
        requirements: requestData.requirements || [],
        is_public: requestData.isPublic,
        status: 'open',
      };

      console.log('[CreateRequest] Calling db.requests.create with:', supabaseRequestData);
      
      const result = await db.requests.create(supabaseRequestData);
      
      console.log('[CreateRequest] Request created successfully:', result);
      
      showNotification('🎉 Request posted successfully! Service providers can now submit proposals.', 'success');
      
      // Redirect to the new request detail page
      setTimeout(() => {
        navigate(`/requests/${result.id}`);
      }, 1500);
      
    } catch (error) {
      console.error('[CreateRequest] Full error object:', error);
      console.error('[CreateRequest] Error message:', error.message);
      console.error('[CreateRequest] Error code:', error.code);
      console.error('[CreateRequest] Error details:', error.details);
      console.error('[CreateRequest] Error hint:', error.hint);
      
      showNotification(`Failed to create request: ${error.message || 'Unknown error'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Basic Information
  const renderBasicInfo = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          📝 Describe what you need
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Be clear and specific about your requirements to attract the right service providers
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Request Title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="e.g., Need a professional website for my business"
          required
          error={!!errors.title}
          helperText={errors.title || "Write a clear, specific title that describes what you need"}
          InputProps={{
            startAdornment: <Description sx={{ mr: 1, color: 'action.active' }} />
          }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth required error={!!errors.category}>
          <InputLabel>Category</InputLabel>
          <Select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            label="Category"
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
          {errors.category && (
            <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
              {errors.category}
            </Typography>
          )}
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Estimated Project Size"
          select
          name="projectSize"
          value={formData.projectSize || 'medium'}
          onChange={handleInputChange}
        >
          <MenuItem value="small">Small (1-3 days)</MenuItem>
          <MenuItem value="medium">Medium (1-2 weeks)</MenuItem>
          <MenuItem value="large">Large (1+ months)</MenuItem>
        </TextField>
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Detailed Description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          multiline
          rows={6}
          placeholder="Describe exactly what you need done. Include specific requirements, deliverables, and any important details that will help service providers understand your project."
          required
          error={!!errors.description}
          helperText={errors.description || "The more detail you provide, the better proposals you'll receive"}
        />
      </Grid>

      <Grid item xs={12}>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            label="Add Skills/Tags"
            value={currentTag}
            onChange={(e) => setCurrentTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            size="small"
            placeholder="e.g., React, WordPress, Logo Design"
          />
          <Button variant="outlined" onClick={handleAddTag} startIcon={<Add />}>
            Add
          </Button>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {formData.tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              onDelete={() => handleRemoveTag(tag)}
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          Add relevant skills and technologies to help the right providers find your request
        </Typography>
      </Grid>
    </Grid>
  );

  // Step 2: Budget & Timeline
  const renderBudgetTimeline = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          💰 Set your budget and timeline
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Define your budget range and timeline to attract providers within your parameters
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Card variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AttachMoney /> Budget Range
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Budget Type</InputLabel>
                <Select
                  value={formData.budget.type}
                  onChange={(e) => handleBudgetChange('type', e.target.value)}
                  label="Budget Type"
                >
                  <MenuItem value="fixed">Fixed Price</MenuItem>
                  <MenuItem value="hourly">Hourly Rate</MenuItem>
                  <MenuItem value="negotiable">Negotiable</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Minimum Budget"
                type="number"
                value={formData.budget.min}
                onChange={(e) => handleBudgetChange('min', parseFloat(e.target.value))}
                error={!!errors.budgetMin}
                helperText={errors.budgetMin}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Maximum Budget"
                type="number"
                value={formData.budget.max}
                onChange={(e) => handleBudgetChange('max', parseFloat(e.target.value))}
                error={!!errors.budgetMax}
                helperText={errors.budgetMax}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Typography gutterBottom>Budget Range: ${formData.budget.min} - ${formData.budget.max}</Typography>
            <Slider
              value={[formData.budget.min, formData.budget.max]}
              onChange={(e, newValue) => {
                handleBudgetChange('min', newValue[0]);
                handleBudgetChange('max', newValue[1]);
              }}
              valueLabelDisplay="auto"
              min={0}
              max={10000}
              step={50}
              sx={{ mt: 2 }}
            />
            {errors.budgetRange && (
              <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                {errors.budgetRange}
              </Typography>
            )}
          </Box>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Project Deadline"
            value={formData.deadline}
            onChange={(date) => setFormData(prev => ({ ...prev, deadline: date }))}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                required
                helperText="When do you need this completed?"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: <DateRange sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            )}
            minDate={new Date()}
          />
        </LocalizationProvider>
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <FormLabel component="legend" sx={{ mb: 1 }}>
            <PriorityHigh sx={{ mr: 1, verticalAlign: 'middle' }} />
            Priority Level
          </FormLabel>
          <RadioGroup
            value={formData.urgency}
            onChange={(e) => setFormData(prev => ({ ...prev, urgency: e.target.value }))}
          >
            {urgencyLevels.map((level) => (
              <FormControlLabel
                key={level.value}
                value={level.value}
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body1" color={`${level.color}.main`}>
                      {level.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {level.description}
                    </Typography>
                  </Box>
                }
              />
            ))}
          </RadioGroup>
        </FormControl>
      </Grid>
    </Grid>
  );

  // Step 3: Location & Service Type
  const renderLocationService = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          📍 Location and service preferences
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Card variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Service Type
          </Typography>
          <FormControl component="fieldset">
            <RadioGroup
              value={formData.serviceType}
              onChange={(e) => setFormData(prev => ({ ...prev, serviceType: e.target.value }))}
            >
              <FormControlLabel
                value="remote"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body1">🏠 Remote Only</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Work can be done completely online
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="in-person"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body1">🏢 In-Person Only</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Physical presence required at location
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="both"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body1">🌐 Both Remote & In-Person</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Open to either arrangement
                    </Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>
        </Card>
      </Grid>

      {formData.serviceType !== 'remote' && (
        <>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="City"
              value={formData.location.city}
              onChange={(e) => handleNestedChange('location', 'city', e.target.value)}
              placeholder="e.g., New York"
              error={!!errors.locationCity}
              helperText={errors.locationCity}
              InputProps={{
                startAdornment: <LocationOn sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="State/Province"
              value={formData.location.state}
              onChange={(e) => handleNestedChange('location', 'state', e.target.value)}
              placeholder="e.g., NY"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Country"
              value={formData.location.country}
              onChange={(e) => handleNestedChange('location', 'country', e.target.value)}
              placeholder="e.g., United States"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Box>
              <Typography gutterBottom>
                Service Radius: {formData.location.radius} km
              </Typography>
              <Slider
                value={formData.location.radius}
                onChange={(e, value) => handleNestedChange('location', 'radius', value)}
                min={5}
                max={200}
                step={5}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value} km`}
              />
              <Typography variant="caption" color="text.secondary">
                How far are you willing to have service providers travel?
              </Typography>
            </Box>
          </Grid>
        </>
      )}
    </Grid>
  );

  // Step 4: Requirements & Settings
  const renderRequirementsSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          ⚙️ Requirements and settings
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card variant="outlined" sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Required Skills/Experience
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              label="Add Requirement"
              value={currentRequirement}
              onChange={(e) => setCurrentRequirement(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRequirement())}
              size="small"
              placeholder="e.g., 3+ years experience"
            />
            <Button variant="outlined" onClick={handleAddRequirement} startIcon={<Add />}>
              Add
            </Button>
          </Box>
          <List dense>
            {formData.requirements.map((req, index) => (
              <ListItem key={index}>
                <ListItemText primary={req} />
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => handleRemoveRequirement(index)}>
                    <Remove />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card variant="outlined" sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Preferred Qualifications
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              label="Add Qualification"
              value={currentQualification}
              onChange={(e) => setCurrentQualification(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddQualification())}
              size="small"
              placeholder="e.g., Portfolio required"
            />
            <Button variant="outlined" onClick={handleAddQualification} startIcon={<Add />}>
              Add
            </Button>
          </Box>
          <List dense>
            {formData.preferredQualifications.map((qual, index) => (
              <ListItem key={index}>
                <ListItemText primary={qual} />
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => handleRemoveQualification(index)}>
                    <Remove />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Additional Information"
          name="additionalInfo"
          value={formData.additionalInfo}
          onChange={handleInputChange}
          multiline
          rows={4}
          placeholder="Any additional details, special requirements, or preferences you'd like providers to know about..."
        />
      </Grid>

      <Grid item xs={12}>
        <Card variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Settings /> Request Settings
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isPublic}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {formData.isPublic ? <Public /> : <VisibilityOff />}
                    Public Request
                  </Box>
                }
              />
              <Typography variant="caption" color="text.secondary" display="block">
                {formData.isPublic ? 'Visible to all providers' : 'Only invited providers can see'}
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.allowMessages}
                    onChange={(e) => setFormData(prev => ({ ...prev, allowMessages: e.target.checked }))}
                    color="primary"
                  />
                }
                label="Allow Messages"
              />
              <Typography variant="caption" color="text.secondary" display="block">
                Let providers ask questions before submitting proposals
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Max Proposals"
                type="number"
                value={formData.maxProposals}
                onChange={(e) => setFormData(prev => ({ ...prev, maxProposals: parseInt(e.target.value) }))}
                inputProps={{ min: 1, max: 100 }}
                error={!!errors.maxProposals}
                helperText={errors.maxProposals || "Maximum number of proposals to accept"}
              />
            </Grid>
          </Grid>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              📎 Attachments (Optional)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Upload any relevant files, documents, or reference materials
            </Typography>
            <input
              accept="image/*,.pdf,.doc,.docx"
              style={{ display: 'none' }}
              id="file-upload-input"
              type="file"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length > 5) {
                  setNotification({ open: true, message: 'Maximum 5 files allowed', severity: 'error' });
                  return;
                }
                const validFiles = files.filter(file => {
                  if (file.size > 10 * 1024 * 1024) {
                    setNotification({ open: true, message: `${file.name} exceeds 10MB limit`, severity: 'error' });
                    return false;
                  }
                  return true;
                });
                setFormData(prev => ({ ...prev, attachments: [...prev.attachments, ...validFiles] }));
              }}
            />
            <label htmlFor="file-upload-input">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUpload />}
                fullWidth
                sx={{ 
                  height: 100, 
                  borderStyle: 'dashed',
                  borderColor: 'primary.main',
                  '&:hover': {
                    borderColor: 'primary.dark',
                    backgroundColor: 'primary.light',
                    color: 'primary.dark'
                  }
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle1">
                    Upload Reference Files
                  </Typography>
                  <Typography variant="caption" display="block">
                    Documents, Images, Mockups • Max 5 files, 10MB each
                  </Typography>
                </Box>
              </Button>
            </label>
            {formData.attachments.length > 0 && (
              <Box sx={{ mt: 2 }}>
                {formData.attachments.map((file, index) => (
                  <Chip
                    key={index}
                    label={file.name || file}
                    onDelete={() => {
                      setFormData(prev => ({
                        ...prev,
                        attachments: prev.attachments.filter((_, i) => i !== index)
                      }));
                    }}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            🚀 Ready to post your request!
          </Typography>
          <Typography variant="body2">
            Once posted, qualified service providers will be able to submit proposals. You'll receive notifications and can review all submissions in your dashboard.
          </Typography>
        </Alert>
      </Grid>
    </Grid>
  );

  const getStepContent = (step) => {
    switch (step) {
      case 0: return renderBasicInfo();
      case 1: return renderBudgetTimeline();
      case 2: return renderLocationService();
      case 3: return renderRequirementsSettings();
      default: return 'Unknown step';
    }
  };

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
            gutterBottom
            sx={{
              background: 'linear-gradient(135deg, #1E90FF 0%, #5BB3FF 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700
            }}
          >
            Post Your Request
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Find the perfect service provider • Get quality proposals • Complete your project
          </Typography>
        </Box>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <form onSubmit={handleSubmit}>
            {getStepContent(activeStep)}

            <Divider sx={{ my: 4 }} />

            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
              <Button
                color="inherit"
                disabled={activeStep === 0}
                onClick={handleBack}
                size="large"
              >
                Back
              </Button>
              <Box sx={{ flex: '1 1 auto' }} />
              <Button variant="outlined" size="large">
                Save as Draft
              </Button>
              {activeStep === steps.length - 1 ? (
                <Button 
                  variant="contained" 
                  onClick={handleSubmit}
                  size="large"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
                >
                  {loading ? 'Posting...' : 'Post Request'}
                </Button>
              ) : (
                <Button variant="contained" onClick={handleNext} size="large">
                  Next Step
                </Button>
              )}
            </Box>
          </form>
        </Paper>

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

export default CreateRequestPage;