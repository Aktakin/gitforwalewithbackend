import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  Divider,
  Rating,
  LinearProgress,
  IconButton,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  Edit,
  Email,
  Phone,
  LocationOn,
  Work,
  Star,
  Verified,
  Language,
  BusinessCenter,
  CalendarToday,
  Link as LinkIcon,
  GitHub,
  LinkedIn,
  Public,
  Share as ShareIcon,
  ContentCopy,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { db } from '../../lib/supabase';
import { format } from 'date-fns';

const ProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [userSkills, setUserSkills] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const isOwnProfile = !userId || userId === user?.id;

  // Load user profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        
        if (isOwnProfile) {
          // For own profile, use current user data
          setUserData(user);
          
          // Load skills if user is a provider
          if (user?.id && (user?.user_type === 'provider' || user?.user_type === 'both')) {
            const skills = await db.skills.getUserSkills(user.id);
            setUserSkills(skills || []);
          }
        } else {
          // For other users, fetch their public profile
          const profileData = await db.users.getPublicProfile(userId);
          
          // Transform snake_case to camelCase for consistency with UI
          const transformedData = {
            ...profileData,
            firstName: profileData.first_name,
            lastName: profileData.last_name,
            userType: profileData.user_type,
            profilePicture: profileData.profile_picture,
            isVerified: profileData.is_verified,
            linkedIn: profileData.linkedin_url,
            github: profileData.github_url,
            joinedAt: profileData.created_at,
          };
          
          setUserData(transformedData);
          
          // Load skills if user is a provider
          if (profileData.user_type === 'provider' || profileData.user_type === 'both') {
            const skills = await db.skills.getUserSkills(userId);
            setUserSkills(skills || []);
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };
    
    if (user || userId) {
      loadProfile();
    }
  }, [userId, user, isOwnProfile]);

  const handleEditProfile = () => {
    navigate('/profile/edit');
  };

  const handleCopyProfileLink = () => {
    const profileUrl = `${window.location.origin}/profile/${userId || user?.id}`;
    navigator.clipboard.writeText(profileUrl);
    setSnackbarMessage('Profile link copied to clipboard!');
    setSnackbarOpen(true);
  };

  const handleShareProfile = async () => {
    const profileUrl = `${window.location.origin}/profile/${userId || user?.id}`;
    const displayName = getDisplayName();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${displayName} - SkillBridge Profile`,
          text: `Check out ${displayName}'s profile on SkillBridge!`,
          url: profileUrl,
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          handleCopyProfileLink();
        }
      }
    } else {
      handleCopyProfileLink();
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!userData) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">User not found</Alert>
      </Container>
    );
  }

  const getDisplayLocation = () => {
    if (typeof userData.location === 'string') {
      return userData.location || 'Location not specified';
    }
    const { city, state, country } = userData.location || {};
    const parts = [city, state, country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Location not specified';
  };

  const getDisplayName = () => {
    return `${userData.firstName || userData.first_name || 'First'} ${userData.lastName || userData.last_name || 'Last'}`.trim();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header Section */}
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar
                  src={userData.profilePicture}
                  sx={{ width: 150, height: 150, mx: 'auto', mb: 2 }}
                >
                  {userData.firstName?.[0]}{userData.lastName?.[0]}
                </Avatar>
                {userData.isVerified && (
                  <Chip
                    icon={<Verified />}
                    label="Verified"
                    color="primary"
                    size="small"
                  />
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h4" gutterBottom>
                {getDisplayName()}
                {userData.isAdmin && (
                  <Chip
                    label="Admin"
                    color="secondary"
                    size="small"
                    sx={{ ml: 2 }}
                  />
                )}
              </Typography>
              
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {userData.userType === 'provider' ? 'Service Provider' :
                 userData.userType === 'customer' ? 'Customer' :
                 userData.userType === 'both' ? 'Customer & Provider' : 'User'}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LocationOn fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {getDisplayLocation()}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CalendarToday fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  Joined {userData.joinedAt ? format(new Date(userData.joinedAt), 'MMMM yyyy') : 'Recently'}
                </Typography>
              </Box>

              {userData.email && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Email fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {userData.preferences?.privacy?.showEmail ? userData.email : 'Email hidden'}
                  </Typography>
                </Box>
              )}

              {userData.phone && userData.preferences?.privacy?.showPhone && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Phone fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {userData.phone}
                  </Typography>
                </Box>
              )}

              {userData.rating && userData.rating.count > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Rating value={userData.rating.average} readOnly size="small" />
                  <Typography variant="body2" color="text.secondary">
                    {userData.rating.average} ({userData.rating.count} reviews)
                  </Typography>
                </Box>
              )}
            </Grid>

            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                {isOwnProfile ? (
                  <>
                    <Button
                      variant="contained"
                      startIcon={<Edit />}
                      onClick={handleEditProfile}
                      fullWidth
                      sx={{ mb: 2 }}
                    >
                      Edit Profile
                    </Button>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Button
                        variant="outlined"
                        startIcon={<ContentCopy />}
                        onClick={handleCopyProfileLink}
                        fullWidth
                        size="small"
                      >
                        Copy Link
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<ShareIcon />}
                        onClick={handleShareProfile}
                        fullWidth
                        size="small"
                      >
                        Share
                      </Button>
                    </Box>
                  </>
                ) : (
                  <Button
                    variant="outlined"
                    startIcon={<ShareIcon />}
                    onClick={handleShareProfile}
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    Share Profile
                  </Button>
                )}
                
                {/* Social Links */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                  {userData.website && (
                    <IconButton href={userData.website} target="_blank" rel="noopener noreferrer">
                      <Public />
                    </IconButton>
                  )}
                  {userData.linkedIn && (
                    <IconButton href={userData.linkedIn} target="_blank" rel="noopener noreferrer">
                      <LinkedIn />
                    </IconButton>
                  )}
                  {userData.github && (
                    <IconButton href={userData.github} target="_blank" rel="noopener noreferrer">
                      <GitHub />
                    </IconButton>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Bio Section */}
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h6" gutterBottom>About</Typography>
          {userData.bio ? (
            <Typography variant="body1" paragraph>
              {userData.bio}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              {isOwnProfile ? 'Add a bio to tell others about yourself...' : 'No bio available'}
            </Typography>
          )}
        </Paper>

        {/* Skills Section */}
        {(userData.userType === 'provider' || userData.userType === 'both' || userData.user_type === 'provider' || userData.user_type === 'both') && (
          <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Work color="primary" />
              Skills & Services
            </Typography>
            
            {userSkills && userSkills.length > 0 ? (
              <Grid container spacing={2}>
                {userSkills.map((skill) => (
                  <Grid item xs={12} sm={6} md={4} key={skill.id || skill._id || skill.title}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" component="div" gutterBottom>
                          {skill.title}
                        </Typography>
                        <Typography color="text.secondary" gutterBottom>
                          {skill.category}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          {skill.description}
                        </Typography>
                        {(skill.hourlyRate || skill.hourly_rate) && (
                          <Typography variant="h6" color="primary" gutterBottom>
                            ${skill.hourlyRate || skill.hourly_rate}/hour
                          </Typography>
                        )}
                        {skill.tags && skill.tags.length > 0 && (
                          <Box>
                            {skill.tags.map((tag, idx) => (
                              <Chip key={`${tag}-${idx}`} label={tag} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                            ))}
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                {isOwnProfile ? 'Add your skills to showcase your expertise...' : 'No skills listed'}
              </Typography>
            )}
          </Paper>
        )}

        {/* Empty State Message for New Users */}
        {isOwnProfile && (!userData.bio && (!userSkills || userSkills.length === 0)) && (
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Welcome to SkillBridge!
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Your profile is looking a bit empty. Complete your profile to attract more opportunities and connect with the right people.
            </Typography>
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={handleEditProfile}
              size="large"
            >
              Complete Your Profile
            </Button>
          </Paper>
        )}

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </motion.div>
    </Container>
  );
};

export default ProfilePage;
