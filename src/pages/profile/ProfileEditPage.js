import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  Add,
  Delete,
  PhotoCamera,
  LocationOn,
  Email,
  Phone,
  Work,
  School,
  Language,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';

const ProfileEditPage = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    profilePicture: '',
    location: {
      city: '',
      state: '',
      country: ''
    },
    userType: 'customer',
    website: '',
    linkedIn: '',
    github: '',
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      marketingEmails: false,
      privacy: {
        showEmail: false,
        showPhone: false
      }
    }
  });

  const [skills, setSkills] = useState([]);
  const [skillDialogOpen, setSkillDialogOpen] = useState(false);
  const [newSkill, setNewSkill] = useState({
    title: '',
    category: 'Technology',
    description: '',
    hourlyRate: '',
    tags: []
  });
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Load user data on mount
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        profilePicture: user.profilePicture || '',
        location: {
          city: user.location?.city || '',
          state: user.location?.state || '',
          country: user.location?.country || ''
        },
        userType: user.userType || 'customer',
        website: user.website || '',
        linkedIn: user.linkedIn || '',
        github: user.github || '',
        preferences: {
          emailNotifications: user.preferences?.emailNotifications ?? true,
          smsNotifications: user.preferences?.smsNotifications ?? false,
          marketingEmails: user.preferences?.marketingEmails ?? false,
          privacy: {
            showEmail: user.preferences?.privacy?.showEmail ?? false,
            showPhone: user.preferences?.privacy?.showPhone ?? false
          }
        }
      });
      setSkills(user.skills || []);
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleAddSkill = () => {
    if (newSkill.title && newSkill.category) {
      const skillToAdd = {
        ...newSkill,
        _id: 'skill_' + Date.now(),
        hourlyRate: parseFloat(newSkill.hourlyRate) || 0,
        isActive: true,
        tags: newSkill.tags.filter(tag => tag.trim())
      };
      setSkills(prev => [...prev, skillToAdd]);
      setNewSkill({
        title: '',
        category: 'Technology',
        description: '',
        hourlyRate: '',
        tags: []
      });
      setSkillDialogOpen(false);
    }
  };

  const handleRemoveSkill = (skillId) => {
    setSkills(prev => prev.filter(skill => skill._id !== skillId));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !newSkill.tags.includes(newTag.trim())) {
      setNewSkill(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setNewSkill(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedUserData = {
        ...formData,
        skills: skills
      };
      
      const result = await updateProfile(updatedUserData);
      if (result.success) {
        setSuccessMessage('Profile updated successfully!');
        setTimeout(() => {
          navigate(`/profile/${user._id}`);
        }, 1500);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const skillCategories = [
    'Technology', 'Design', 'Writing', 'Marketing', 'Music', 'Photography',
    'Video', 'Business', 'Education', 'Health', 'Home Services', 'Events',
    'Legal', 'Consulting', 'Crafts', 'Other'
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}

        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Edit color="primary" />
            Edit Profile
          </Typography>

          <Grid container spacing={4}>
            {/* Profile Picture */}
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar
                  src={formData.profilePicture}
                  sx={{ width: 150, height: 150, mx: 'auto', mb: 2 }}
                >
                  {formData.firstName?.[0]}{formData.lastName?.[0]}
                </Avatar>
                <TextField
                  fullWidth
                  size="small"
                  label="Profile Picture URL"
                  value={formData.profilePicture}
                  onChange={(e) => handleInputChange('profilePicture', e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                />
              </Box>
            </Grid>

            {/* Basic Information */}
            <Grid item xs={12} md={9}>
              <Typography variant="h6" gutterBottom>Basic Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>User Type</InputLabel>
                    <Select
                      value={formData.userType}
                      onChange={(e) => handleInputChange('userType', e.target.value)}
                    >
                      <MenuItem value="customer">Customer (Looking for services)</MenuItem>
                      <MenuItem value="provider">Provider (Offering services)</MenuItem>
                      <MenuItem value="both">Both (Customer & Provider)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell us about yourself, your experience, and what you're looking for..."
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>

        {/* Location */}
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOn color="primary" />
            Location
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="City"
                value={formData.location.city}
                onChange={(e) => handleInputChange('location.city', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="State/Province"
                value={formData.location.state}
                onChange={(e) => handleInputChange('location.state', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Country"
                value={formData.location.country}
                onChange={(e) => handleInputChange('location.country', e.target.value)}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Social Links */}
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h6" gutterBottom>Social Links</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Website"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://yourwebsite.com"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="LinkedIn"
                value={formData.linkedIn}
                onChange={(e) => handleInputChange('linkedIn', e.target.value)}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="GitHub"
                value={formData.github}
                onChange={(e) => handleInputChange('github', e.target.value)}
                placeholder="https://github.com/yourusername"
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Skills */}
        {(formData.userType === 'provider' || formData.userType === 'both') && (
          <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Work color="primary" />
                Skills & Services
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setSkillDialogOpen(true)}
              >
                Add Skill
              </Button>
            </Box>

            <Grid container spacing={2}>
              {skills.map((skill) => (
                <Grid item xs={12} sm={6} md={4} key={skill._id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" component="div">
                          {skill.title}
                        </Typography>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveSkill(skill._id)}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                      <Typography color="text.secondary" gutterBottom>
                        {skill.category}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {skill.description}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        ${skill.hourlyRate}/hour
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        {skill.tags?.map((tag) => (
                          <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}

        {/* Privacy Settings */}
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h6" gutterBottom>Privacy & Notifications</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.preferences.emailNotifications}
                    onChange={(e) => handleInputChange('preferences.emailNotifications', e.target.checked)}
                  />
                }
                label="Email Notifications"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.preferences.smsNotifications}
                    onChange={(e) => handleInputChange('preferences.smsNotifications', e.target.checked)}
                  />
                }
                label="SMS Notifications"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.preferences.marketingEmails}
                    onChange={(e) => handleInputChange('preferences.marketingEmails', e.target.checked)}
                  />
                }
                label="Marketing Emails"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.preferences.privacy.showEmail}
                    onChange={(e) => handleInputChange('preferences.privacy.showEmail', e.target.checked)}
                  />
                }
                label="Show Email Publicly"
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Save/Cancel Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            startIcon={<Cancel />}
            onClick={() => navigate(`/profile/${user._id}`)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
            loading={loading}
            disabled={loading}
          >
            Save Changes
          </Button>
        </Box>
      </motion.div>

      {/* Add Skill Dialog */}
      <Dialog open={skillDialogOpen} onClose={() => setSkillDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Skill</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Skill Title"
                value={newSkill.title}
                onChange={(e) => setNewSkill(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Web Development"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={newSkill.category}
                  onChange={(e) => setNewSkill(prev => ({ ...prev, category: e.target.value }))}
                >
                  {skillCategories.map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={newSkill.description}
                onChange={(e) => setNewSkill(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your expertise and what you can offer..."
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Hourly Rate ($)"
                value={newSkill.hourlyRate}
                onChange={(e) => setNewSkill(prev => ({ ...prev, hourlyRate: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  label="Add Tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  placeholder="e.g., React, Node.js"
                />
                <Button onClick={handleAddTag}>Add</Button>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box>
                {newSkill.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    sx={{ mr: 0.5, mb: 0.5 }}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSkillDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddSkill} variant="contained">Add Skill</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProfileEditPage;


