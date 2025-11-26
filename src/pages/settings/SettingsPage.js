import React, { useState } from 'react';
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
  Switch,
  FormControlLabel,
  Divider,
  Avatar,
  IconButton,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Person,
  Security,
  Notifications,
  Palette,
  Language,
  LocationOn,
  Email,
  Phone,
  Lock,
  Visibility,
  VisibilityOff,
  Edit,
  PhotoCamera,
  Save,
  Cancel,
  Delete,
  Warning,
  Check,
  Settings as SettingsIcon,
  PrivacyTip,
  VpnKey,
  Shield,
  NotificationsActive,
  AccountCircle,
  Public,
  Work,
  Star,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [deleteAccountDialog, setDeleteAccountDialog] = useState(false);

  // User data state from context
  const [userData, setUserData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    location: {
      city: user?.location?.city || '',
      state: user?.location?.state || '',
      country: user?.location?.country || ''
    },
    profilePicture: user?.profilePicture || '',
    website: user?.website || '',
    linkedin: user?.linkedIn || '',
    github: user?.github || ''
  });

  // Settings state from user preferences
  const [settings, setSettings] = useState({
    notifications: {
      email: user?.preferences?.emailNotifications ?? true,
      push: false,
      messages: true,
      proposals: true,
      reviews: true,
      marketing: user?.preferences?.marketingEmails ?? false
    },
    privacy: {
      showEmail: user?.preferences?.privacy?.showEmail ?? false,
      showPhone: user?.preferences?.privacy?.showPhone ?? false,
      showOnlineStatus: true,
      allowSearchEngineIndexing: true,
      showInDirectory: true
    },
    preferences: {
      language: 'en',
      timezone: 'America/New_York',
      currency: 'USD',
      theme: 'system',
      emailDigest: 'weekly'
    }
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  // Sync data when user changes
  React.useEffect(() => {
    if (user) {
      setUserData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        location: {
          city: user.location?.city || '',
          state: user.location?.state || '',
          country: user.location?.country || ''
        },
        profilePicture: user.profilePicture || '',
        website: user.website || '',
        linkedin: user.linkedIn || '',
        github: user.github || ''
      });

      setSettings(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          email: user.preferences?.emailNotifications ?? true,
          marketing: user.preferences?.marketingEmails ?? false
        },
        privacy: {
          ...prev.privacy,
          showEmail: user.preferences?.privacy?.showEmail ?? false,
          showPhone: user.preferences?.privacy?.showPhone ?? false
        }
      }));
    }
  }, [user]);

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const closeNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleUserDataChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setUserData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setUserData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSettingsChange = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswords(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      // Save to profile using updateProfile from context
      const result = await updateProfile({
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        bio: userData.bio,
        location: {
          city: userData.location.city,
          state: userData.location.state,
          country: userData.location.country
        },
        website: userData.website,
        linkedIn: userData.linkedin,
        github: userData.github,
        profilePicture: userData.profilePicture,
        preferences: {
          ...user?.preferences,
          privacy: {
            ...user?.preferences?.privacy,
            showEmail: settings.privacy.showEmail,
            showPhone: settings.privacy.showPhone
          }
        }
      });
      
      if (result.success) {
        showNotification('Account information updated successfully!');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      showNotification('Failed to update account information', 'error');
      console.error('Profile update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (category) => {
    setLoading(true);
    try {
      // Save settings to profile preferences
      const updatedPreferences = {
        ...user?.preferences,
        emailNotifications: settings.notifications.email,
        marketingEmails: settings.notifications.marketing,
        privacy: {
          ...user?.preferences?.privacy,
          showEmail: settings.privacy.showEmail,
          showPhone: settings.privacy.showPhone
        }
      };

      const result = await updateProfile({
        preferences: updatedPreferences
      });
      
      if (result.success) {
        showNotification(`${category} settings updated successfully!`);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      showNotification(`Failed to update ${category} settings`, 'error');
      console.error('Settings update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      showNotification('New passwords do not match', 'error');
      return;
    }
    if (passwords.new.length < 6) {
      showNotification('Password must be at least 6 characters', 'error');
      return;
    }

    setLoading(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPasswords({ current: '', new: '', confirm: '' });
      setShowPasswordFields(false);
      showNotification('Password changed successfully!');
    } catch (error) {
      showNotification('Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    setLoading(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      showNotification('Account deleted successfully');
      // Redirect to home page
    } catch (error) {
      showNotification('Failed to delete account', 'error');
    } finally {
      setLoading(false);
      setDeleteAccountDialog(false);
    }
  };

  const tabs = [
    { label: 'Account', icon: <AccountCircle /> },
    { label: 'Privacy & Security', icon: <Security /> },
    { label: 'Notifications', icon: <NotificationsActive /> },
    { label: 'Preferences', icon: <SettingsIcon /> }
  ];

  // Step 1: Account Settings Tab
  const renderAccountSettings = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Grid container spacing={3}>
        {/* Profile Picture */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person /> Profile Picture
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={() => navigate('/profile/edit')}
                  size="small"
                >
                  Edit Full Profile
                </Button>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Avatar
                  src={userData.profilePicture}
                  sx={{ width: 100, height: 100 }}
                >
                  {userData.firstName[0]}{userData.lastName[0]}
                </Avatar>
                <Box>
                  <Button variant="outlined" component="label" startIcon={<PhotoCamera />}>
                    Upload Photo
                    <input type="file" accept="image/*" hidden />
                  </Button>
                  <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                    Recommended: Square image, at least 200x200px
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Basic Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Edit /> Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={userData.firstName}
                    onChange={(e) => handleUserDataChange('firstName', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={userData.lastName}
                    onChange={(e) => handleUserDataChange('lastName', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={userData.email}
                    onChange={(e) => handleUserDataChange('email', e.target.value)}
                    InputProps={{
                      startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={userData.phone}
                    onChange={(e) => handleUserDataChange('phone', e.target.value)}
                    InputProps={{
                      startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bio"
                    multiline
                    rows={4}
                    value={userData.bio}
                    onChange={(e) => handleUserDataChange('bio', e.target.value)}
                    helperText={`${userData.bio.length}/500 characters`}
                    inputProps={{ maxLength: 500 }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Location */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn /> Location
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="City"
                    value={userData.location.city}
                    onChange={(e) => handleUserDataChange('location.city', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="State/Province"
                    value={userData.location.state}
                    onChange={(e) => handleUserDataChange('location.state', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Country"
                    value={userData.location.country}
                    onChange={(e) => handleUserDataChange('location.country', e.target.value)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Social Links */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Public /> Social Links
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Website"
                    value={userData.website}
                    onChange={(e) => handleUserDataChange('website', e.target.value)}
                    placeholder="https://yourwebsite.com"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="LinkedIn"
                    value={userData.linkedin}
                    onChange={(e) => handleUserDataChange('linkedin', e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="GitHub"
                    value={userData.github}
                    onChange={(e) => handleUserDataChange('github', e.target.value)}
                    placeholder="https://github.com/yourusername"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Save Button */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" size="large">
              Cancel
            </Button>
            <Button 
              variant="contained" 
              size="large" 
              onClick={saveProfile}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Save />}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </motion.div>
  );

  // Privacy & Security Tab
  const renderPrivacySecurity = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Grid container spacing={3}>
        {/* Password */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Lock /> Password
              </Typography>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Keep your account secure by regularly updating your password
                </Typography>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/change-password')}
                  startIcon={<VpnKey />}
                >
                  Change Password
                </Button>
              </Box>
              
              {/* Legacy inline password change (kept for backward compatibility) */}
              {false && showPasswordFields && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Current Password"
                      type={showPassword.current ? 'text' : 'password'}
                      value={passwords.current}
                      onChange={(e) => handlePasswordChange('current', e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <IconButton
                            onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                          >
                            {showPassword.current ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="New Password"
                      type={showPassword.new ? 'text' : 'password'}
                      value={passwords.new}
                      onChange={(e) => handlePasswordChange('new', e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <IconButton
                            onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                          >
                            {showPassword.new ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      type={showPassword.confirm ? 'text' : 'password'}
                      value={passwords.confirm}
                      onChange={(e) => handlePasswordChange('confirm', e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <IconButton
                            onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                          >
                            {showPassword.confirm ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button 
                        variant="contained" 
                        onClick={changePassword}
                        disabled={loading}
                      >
                        Update Password
                      </Button>
                      <Button 
                        variant="outlined" 
                        onClick={() => {
                          setShowPasswordFields(false);
                          setPasswords({ current: '', new: '', confirm: '' });
                        }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Privacy Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PrivacyTip /> Privacy Settings
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Email />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Show email address on profile"
                    secondary="Other users will be able to see your email address"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.privacy.showEmail}
                      onChange={(e) => handleSettingsChange('privacy', 'showEmail', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Phone />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Show phone number on profile"
                    secondary="Other users will be able to see your phone number"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.privacy.showPhone}
                      onChange={(e) => handleSettingsChange('privacy', 'showPhone', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Public />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Show online status"
                    secondary="Others can see when you're online"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.privacy.showOnlineStatus}
                      onChange={(e) => handleSettingsChange('privacy', 'showOnlineStatus', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Work />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Show in provider directory"
                    secondary="Appear in public search results for clients"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.privacy.showInDirectory}
                      onChange={(e) => handleSettingsChange('privacy', 'showInDirectory', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  variant="contained" 
                  onClick={() => saveSettings('Privacy')}
                  disabled={loading}
                >
                  Save Privacy Settings
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Account Deletion */}
        <Grid item xs={12}>
          <Card sx={{ border: '1px solid', borderColor: 'error.main' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="error" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Warning /> Danger Zone
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Once you delete your account, there is no going back. Please be certain.
              </Typography>
              <Button 
                variant="outlined" 
                color="error"
                onClick={() => setDeleteAccountDialog(true)}
                startIcon={<Delete />}
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </motion.div>
  );

  // Notifications Tab
  const renderNotifications = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <NotificationsActive /> Email Notifications
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Email />
                  </ListItemIcon>
                  <ListItemText 
                    primary="New messages"
                    secondary="Get notified when you receive new messages"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.notifications.messages}
                      onChange={(e) => handleSettingsChange('notifications', 'messages', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Work />
                  </ListItemIcon>
                  <ListItemText 
                    primary="New proposals"
                    secondary="Get notified when you receive project proposals"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.notifications.proposals}
                      onChange={(e) => handleSettingsChange('notifications', 'proposals', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Star />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Reviews and ratings"
                    secondary="Get notified when you receive new reviews"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.notifications.reviews}
                      onChange={(e) => handleSettingsChange('notifications', 'reviews', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Notifications />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Marketing emails"
                    secondary="Receive updates about new features and promotions"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.notifications.marketing}
                      onChange={(e) => handleSettingsChange('notifications', 'marketing', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
              <Divider sx={{ my: 2 }} />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Email Digest Frequency</InputLabel>
                <Select
                  value={settings.preferences.emailDigest}
                  onChange={(e) => handleSettingsChange('preferences', 'emailDigest', e.target.value)}
                  label="Email Digest Frequency"
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="never">Never</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  variant="contained" 
                  onClick={() => saveSettings('Notification')}
                  disabled={loading}
                >
                  Save Notification Settings
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </motion.div>
  );

  // Preferences Tab
  const renderPreferences = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Language /> Language & Region
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Language</InputLabel>
                    <Select
                      value={settings.preferences.language}
                      onChange={(e) => handleSettingsChange('preferences', 'language', e.target.value)}
                      label="Language"
                    >
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="es">Spanish</MenuItem>
                      <MenuItem value="fr">French</MenuItem>
                      <MenuItem value="de">German</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Timezone</InputLabel>
                    <Select
                      value={settings.preferences.timezone}
                      onChange={(e) => handleSettingsChange('preferences', 'timezone', e.target.value)}
                      label="Timezone"
                    >
                      <MenuItem value="America/New_York">Eastern Time</MenuItem>
                      <MenuItem value="America/Chicago">Central Time</MenuItem>
                      <MenuItem value="America/Denver">Mountain Time</MenuItem>
                      <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
                      <MenuItem value="Europe/London">GMT</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Currency</InputLabel>
                    <Select
                      value={settings.preferences.currency}
                      onChange={(e) => handleSettingsChange('preferences', 'currency', e.target.value)}
                      label="Currency"
                    >
                      <MenuItem value="USD">USD ($)</MenuItem>
                      <MenuItem value="EUR">EUR (€)</MenuItem>
                      <MenuItem value="GBP">GBP (£)</MenuItem>
                      <MenuItem value="CAD">CAD (C$)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Palette /> Appearance
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Theme</InputLabel>
                <Select
                  value={settings.preferences.theme}
                  onChange={(e) => handleSettingsChange('preferences', 'theme', e.target.value)}
                  label="Theme"
                >
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="system">System</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              onClick={() => saveSettings('Preferences')}
              disabled={loading}
            >
              Save Preferences
            </Button>
          </Box>
        </Grid>
      </Grid>
    </motion.div>
  );

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
              background: 'linear-gradient(135deg, #1E90FF 0%, #5BB3FF 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
            }}
          >
            Settings
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Manage your account settings and preferences
          </Typography>
        </Box>

        <Paper elevation={3} sx={{ borderRadius: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                icon={tab.icon}
                label={tab.label}
                iconPosition="start"
                sx={{ minHeight: 72 }}
              />
            ))}
          </Tabs>

          <Box sx={{ p: 3 }}>
            {activeTab === 0 && renderAccountSettings()}
            {activeTab === 1 && renderPrivacySecurity()}
            {activeTab === 2 && renderNotifications()}
            {activeTab === 3 && renderPreferences()}
          </Box>
        </Paper>

        {/* Delete Account Dialog */}
        <Dialog
          open={deleteAccountDialog}
          onClose={() => setDeleteAccountDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ color: 'error.main' }}>
            Delete Account
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you absolutely sure you want to delete your account? This action cannot be undone.
              All your data, including messages, proposals, and transaction history will be permanently deleted.
            </DialogContentText>
            <Alert severity="warning" sx={{ mt: 2 }}>
              Please type <strong>DELETE</strong> to confirm this action.
            </Alert>
            <TextField
              fullWidth
              sx={{ mt: 2 }}
              placeholder="Type DELETE to confirm"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteAccountDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={deleteAccount} 
              color="error" 
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete Account'}
            </Button>
          </DialogActions>
        </Dialog>

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

export default SettingsPage;
