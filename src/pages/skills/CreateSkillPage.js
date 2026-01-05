import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  CircularProgress,
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
  School,
  Language,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/supabase';

const CreateSkillPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [formData, setFormData] = useState({
    // Basic Info
    title: '',
    category: '',
    description: '',
    tags: [],
    
    // Pricing & Packages
    packages: [
      { name: 'Basic', price: '', description: '', deliveryTime: '', revisions: 1 },
      { name: 'Standard', price: '', description: '', deliveryTime: '', revisions: 2 },
      { name: 'Premium', price: '', description: '', deliveryTime: '', revisions: 3 }
    ],
    
    // Experience & Portfolio
    experience: '',
    education: '',
    languages: [],
    
    // Availability
    availability: {
      workingHours: { start: '09:00', end: '17:00' },
      responseTime: '1-2 hours'
    },
    
    // Settings
    instantBooking: false,
    location: '',
    workType: 'remote', // remote, onsite, both
  });

  const [currentTag, setCurrentTag] = useState('');

  const steps = [
    'Basic Information',
    'Pricing & Packages', 
    'Experience & Portfolio',
    'Availability & Settings'
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

  const languages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Arabic', 'Portuguese'];

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

  const handlePackageChange = (index, field, value) => {
    const newPackages = [...formData.packages];
    newPackages[index][field] = value;
    setFormData(prev => ({ ...prev, packages: newPackages }));
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

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please log in to create a skill listing');
      navigate('/login');
      return;
    }

    // Validate required fields
    if (!formData.title || !formData.category || !formData.description) {
      setSubmitError('Please fill in all required fields (Title, Category, Description)');
      setActiveStep(0);
      return;
    }

    setLoading(true);
    setSubmitError(null);

    try {
      // Calculate hourly rate from packages (use average or minimum)
      const prices = formData.packages
        .map(pkg => parseFloat(pkg.price))
        .filter(price => !isNaN(price) && price > 0);
      
      const hourlyRate = prices.length > 0 
        ? Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 100) / 100 
        : null;

      // Prepare skill data for database
      const skillData = {
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags: formData.tags || [],
        hourly_rate: hourlyRate,
        is_active: true,  // Make it active immediately
        is_public: true,  // Make it public immediately
      };

      // Save to database
      const result = await db.skills.create(skillData);

      if (result) {
        // Success - redirect to skills page
        alert('🎉 Skill posted successfully! Your listing is now live and available for clients to book.');
        navigate('/skills');
      }
    } catch (error) {
      console.error('Error creating skill:', error);
      setSubmitError(error.message || 'Failed to create skill listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Basic Information
  const renderBasicInfo = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          📝 Tell us about your skill
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Skill Title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="e.g., I will create a professional website for your business"
          required
          helperText="Write a clear, specific title that describes what you offer"
        />
      </Grid>

      <Grid item xs={12}>
        <FormControl fullWidth required>
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
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          multiline
          rows={6}
          placeholder="Describe your service in detail. What will you deliver? What makes you different? Include your process, timeline, and what clients can expect."
          required
          helperText="A detailed description helps clients understand exactly what you offer"
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
      </Grid>
    </Grid>
  );

  // Step 2: Pricing & Packages
  const renderPricing = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          💰 Set your pricing packages
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Offer different tiers to attract more clients. Each package should provide clear value.
        </Typography>
      </Grid>

      {formData.packages.map((pkg, index) => (
        <Grid item xs={12} md={4} key={index}>
          <Card 
            variant="outlined" 
            sx={{ 
              height: '100%',
              ...(index === 1 && {
                border: 2,
                borderColor: 'primary.main',
                boxShadow: 3
              })
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom color={index === 1 ? 'primary' : 'default'}>
                {pkg.name} Package
                {index === 1 && <Chip label="Most Popular" size="small" color="primary" sx={{ ml: 1 }} />}
              </Typography>
              
              <TextField
                fullWidth
                label="Price ($)"
                type="number"
                value={pkg.price}
                onChange={(e) => handlePackageChange(index, 'price', e.target.value)}
                sx={{ mb: 2 }}
                required
                InputProps={{
                  startAdornment: <AttachMoney sx={{ color: 'action.active' }} />
                }}
              />
              
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={pkg.description}
                onChange={(e) => handlePackageChange(index, 'description', e.target.value)}
                placeholder="What's included in this package?"
                sx={{ mb: 2 }}
                required
              />
              
              <TextField
                fullWidth
                label="Delivery Time"
                value={pkg.deliveryTime}
                onChange={(e) => handlePackageChange(index, 'deliveryTime', e.target.value)}
                placeholder="e.g., 3 days, 1 week"
                sx={{ mb: 2 }}
                required
                InputProps={{
                  startAdornment: <Schedule sx={{ color: 'action.active' }} />
                }}
              />
              
              <TextField
                fullWidth
                label="Revisions Included"
                type="number"
                value={pkg.revisions}
                onChange={(e) => handlePackageChange(index, 'revisions', parseInt(e.target.value))}
                inputProps={{ min: 0, max: 10 }}
              />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  // Step 3: Experience & Portfolio
  const renderExperience = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          🎯 Showcase your expertise
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Years of Experience"
          name="experience"
          value={formData.experience}
          onChange={handleInputChange}
          placeholder="e.g., 5+ years"
          InputProps={{
            startAdornment: <Work sx={{ mr: 1, color: 'action.active' }} />
          }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Education/Background"
          name="education"
          value={formData.education}
          onChange={handleInputChange}
          placeholder="e.g., Computer Science Degree"
          InputProps={{
            startAdornment: <School sx={{ mr: 1, color: 'action.active' }} />
          }}
        />
      </Grid>

      <Grid item xs={12}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              📸 Portfolio Images
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Show examples of your work to build trust with potential clients
            </Typography>
            <Button
              variant="outlined"
              startIcon={<CloudUpload />}
              fullWidth
              sx={{ 
                height: 120, 
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
                  Upload Work Samples
                </Typography>
                <Typography variant="caption" display="block">
                  Images, PDFs • Max 10 files, 5MB each
                </Typography>
              </Box>
            </Button>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Language /> Languages Spoken
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {languages.map((lang) => (
            <Chip
              key={lang}
              label={lang}
              clickable
              color={formData.languages.includes(lang) ? 'primary' : 'default'}
              onClick={() => {
                const newLangs = formData.languages.includes(lang)
                  ? formData.languages.filter(l => l !== lang)
                  : [...formData.languages, lang];
                setFormData(prev => ({ ...prev, languages: newLangs }));
              }}
            />
          ))}
        </Box>
      </Grid>

      <Grid item xs={12} md={6}>
        <Typography variant="subtitle1" gutterBottom>
          Work Type Preference
        </Typography>
        <FormControl fullWidth>
          <Select
            name="workType"
            value={formData.workType}
            onChange={handleInputChange}
          >
            <MenuItem value="remote">🏠 Remote Only</MenuItem>
            <MenuItem value="onsite">🏢 On-site Only</MenuItem>
            <MenuItem value="both">🌐 Both Remote & On-site</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );

  // Step 4: Availability & Settings
  const renderAvailability = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          ⏰ Set your availability
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Location (if on-site work)"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          placeholder="City, State or Remote"
          InputProps={{
            startAdornment: <LocationOn sx={{ mr: 1, color: 'action.active' }} />
          }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Typical Response Time"
          value={formData.availability.responseTime}
          onChange={(e) => handleNestedChange('availability', 'responseTime', e.target.value)}
          placeholder="e.g., Within 1 hour, Same day"
          InputProps={{
            startAdornment: <Schedule sx={{ mr: 1, color: 'action.active' }} />
          }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Working Hours (Start)"
          type="time"
          value={formData.availability.workingHours.start}
          onChange={(e) => handleNestedChange('availability', 'workingHours', {
            ...formData.availability.workingHours,
            start: e.target.value
          })}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Working Hours (End)"
          type="time"
          value={formData.availability.workingHours.end}
          onChange={(e) => handleNestedChange('availability', 'workingHours', {
            ...formData.availability.workingHours,
            end: e.target.value
          })}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      <Grid item xs={12}>
        <Card variant="outlined" sx={{ p: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.instantBooking}
                onChange={(e) => setFormData(prev => ({ ...prev, instantBooking: e.target.checked }))}
                color="primary"
              />
            }
            label="Enable instant booking (clients can book immediately without approval)"
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            When enabled, clients can book your services without waiting for approval
          </Typography>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Alert severity="success" sx={{ borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            🎉 Your skill listing is live!
          </Typography>
          <Typography variant="body2">
            Your skill listing has been published instantly and is now available for clients to find and book your services.
          </Typography>
        </Alert>
      </Grid>
    </Grid>
  );

  const getStepContent = (step) => {
    switch (step) {
      case 0: return renderBasicInfo();
      case 1: return renderPricing();
      case 2: return renderExperience();
      case 3: return renderAvailability();
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
            Create Your Skill Listing
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Turn your expertise into income • Connect with clients worldwide • Build your reputation
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

          {submitError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {submitError}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            {getStepContent(activeStep)}

            <Divider sx={{ my: 4 }} />

            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
              <Button
                color="inherit"
                disabled={activeStep === 0 || loading}
                onClick={handleBack}
                size="large"
              >
                Back
              </Button>
              <Box sx={{ flex: '1 1 auto' }} />
              <Button variant="outlined" size="large" disabled={loading}>
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
                  {loading ? 'Publishing...' : 'Launch My Skill'}
                </Button>
              ) : (
                <Button variant="contained" onClick={handleNext} size="large" disabled={loading}>
                  Next Step
                </Button>
              )}
            </Box>
          </form>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default CreateSkillPage;
