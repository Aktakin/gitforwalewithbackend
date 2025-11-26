import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions, Share, Alert } from 'react-native';
import { Text, Card, Button, Avatar, Chip, Divider, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/supabase';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

const ProfileScreen = ({ navigation, onNavigateToEditProfile, onNavigateToSettings, onNavigateToNotifications }) => {
  const { user, profile: contextProfile, logout, updateProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, [user, contextProfile]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      // Use context profile if available, otherwise use user data
      const profileData = contextProfile || user;
      
      if (profileData) {
        setProfile({
          ...profileData,
          firstName: profileData.firstName || profileData.first_name || '',
          lastName: profileData.lastName || profileData.last_name || '',
          email: profileData.email || '',
          phone: profileData.phone || profileData.phone_number || '',
          bio: profileData.bio || profileData.description || '',
          location: profileData.location || profileData.city || '',
          userType: profileData.userType || profileData.user_type || 'customer',
          isVerified: profileData.isVerified || profileData.is_verified || false,
          profilePicture: profileData.profilePicture || profileData.profile_picture || profileData.avatar_url || null,
          website: profileData.website || '',
          linkedIn: profileData.linkedIn || profileData.linkedin_url || '',
          github: profileData.github || profileData.github_url || '',
          joinedAt: profileData.createdAt || profileData.created_at || profileData.joinedAt || new Date(),
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProfileData();
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleViewPublicProfile = () => {
    // Navigate to public profile view
    if (navigation?.navigate) {
      navigation.navigate('PublicProfile', { userId: user?.id });
    }
  };

  const handleShareProfile = async () => {
    try {
      const shareUrl = `skillbridge://profile/${user?.id}`;
      const displayName = getDisplayName();
      const message = `Check out my profile on SkillBridge!\n\n${displayName}\n${shareUrl}`;
      
      await Share.share({
        message,
        title: `${displayName} - SkillBridge Profile`,
      });
    } catch (error) {
      console.error('Error sharing profile:', error);
      Alert.alert('Error', 'Unable to share profile');
    }
  };

  const getDisplayName = () => {
    if (profile?.firstName || profile?.lastName) {
      return `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
    }
    return profile?.email?.split('@')[0] || 'User';
  };

  const getInitials = () => {
    const first = profile?.firstName?.[0] || '';
    const last = profile?.lastName?.[0] || '';
    if (first || last) return `${first}${last}`.toUpperCase();
    return profile?.email?.[0]?.toUpperCase() || 'U';
  };

  const getUserTypeLabel = () => {
    const type = profile?.userType || 'customer';
    if (type === 'provider') return 'Service Provider';
    if (type === 'both') return 'Customer & Provider';
    return 'Customer';
  };

  const getLocationDisplay = () => {
    if (typeof profile?.location === 'object' && profile.location) {
      const { city, state, country } = profile.location;
      return [city, state, country].filter(Boolean).join(', ') || 'Location not specified';
    }
    return profile?.location || 'Location not specified';
  };

  const InfoRow = ({ icon, label, value, onPress }) => (
    <TouchableOpacity 
      style={styles.infoRow} 
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.infoRowLeft}>
        <MaterialCommunityIcons name={icon} size={20} color={colors.text.secondary} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue} numberOfLines={1}>{value || 'Not set'}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialCommunityIcons name="account-circle-outline" size={64} color={colors.text.secondary} />
        <Text style={styles.loadingText}>No profile data available</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary.main} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section with Gradient */}
      <LinearGradient
        colors={[colors.primary.main, colors.primary.dark, colors.primary.main]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {profile.profilePicture ? (
              <Avatar.Image
                size={100}
                source={{ uri: profile.profilePicture }}
                style={styles.avatar}
              />
            ) : (
              <Avatar.Text
                size={100}
                label={getInitials()}
                style={styles.avatar}
                labelStyle={styles.avatarLabel}
              />
            )}
            {profile.isVerified && (
              <View style={styles.verifiedBadge}>
                <MaterialCommunityIcons name="check-circle" size={24} color="#4CAF50" />
              </View>
            )}
          </View>

          {/* Name and User Type */}
          <Text style={styles.name}>{getDisplayName()}</Text>
          <Text style={styles.userType}>{getUserTypeLabel()}</Text>

          {/* Rating */}
          {profile.rating && profile.rating > 0 && (
            <View style={styles.ratingContainer}>
              <MaterialCommunityIcons name="star" size={20} color="#FFD700" />
              <Text style={styles.ratingText}>
                {typeof profile.rating === 'number' ? profile.rating.toFixed(1) : profile.rating?.average?.toFixed(1) || '0.0'} ({profile.rating?.count || profile.review_count || 0} reviews)
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* About Section */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="information-outline" size={20} color={colors.primary.main} />
              <Text style={styles.sectionTitle}>About</Text>
            </View>
            <Divider style={styles.divider} />
            {profile.bio ? (
              <Text style={styles.bioText}>{profile.bio}</Text>
            ) : (
              <Text style={styles.emptyText}>Add a bio to tell others about yourself...</Text>
            )}
          </Card.Content>
        </Card>

        {/* Contact Information */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="card-account-details-outline" size={20} color={colors.primary.main} />
              <Text style={styles.sectionTitle}>Contact Information</Text>
            </View>
            <Divider style={styles.divider} />
            <InfoRow
              icon="email-outline"
              label="Email"
              value={profile.email}
            />
            {profile.phone && (
              <InfoRow
                icon="phone-outline"
                label="Phone"
                value={profile.phone}
              />
            )}
            <InfoRow
              icon="map-marker-outline"
              label="Location"
              value={getLocationDisplay()}
            />
            <InfoRow
              icon="calendar-outline"
              label="Member Since"
              value={profile.joinedAt ? new Date(profile.joinedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'Recently'}
            />
          </Card.Content>
        </Card>

        {/* Social Links */}
        {(profile.website || profile.linkedIn || profile.github) && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="link-variant" size={20} color={colors.primary.main} />
                <Text style={styles.sectionTitle}>Social Links</Text>
              </View>
              <Divider style={styles.divider} />
              <View style={styles.socialLinks}>
                {profile.website && (
                  <TouchableOpacity style={styles.socialLink}>
                    <MaterialCommunityIcons name="web" size={24} color={colors.primary.main} />
                    <Text style={styles.socialLinkText}>Website</Text>
                  </TouchableOpacity>
                )}
                {profile.linkedIn && (
                  <TouchableOpacity style={styles.socialLink}>
                    <MaterialCommunityIcons name="linkedin" size={24} color={colors.info.main} />
                    <Text style={styles.socialLinkText}>LinkedIn</Text>
                  </TouchableOpacity>
                )}
                {profile.github && (
                  <TouchableOpacity style={styles.socialLink}>
                    <MaterialCommunityIcons name="github" size={24} color={colors.text.primary} />
                    <Text style={styles.socialLinkText}>GitHub</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Account Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="cog-outline" size={20} color={colors.primary.main} />
              <Text style={styles.sectionTitle}>Account Settings</Text>
            </View>
            <Divider style={styles.divider} />
            <TouchableOpacity 
              style={styles.settingsRow}
              onPress={() => {
                if (onNavigateToNotifications) {
                  onNavigateToNotifications();
                } else if (navigation?.navigate) {
                  navigation.navigate('Notifications');
                }
              }}
            >
              <View style={styles.settingsRowLeft}>
                <MaterialCommunityIcons name="bell-outline" size={20} color={colors.text.secondary} />
                <Text style={styles.settingsLabel}>Notifications</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.settingsRow}
              onPress={() => {
                if (onNavigateToSettings) {
                  onNavigateToSettings();
                } else if (navigation?.navigate) {
                  navigation.navigate('Settings');
                }
              }}
            >
              <View style={styles.settingsRowLeft}>
                <MaterialCommunityIcons name="cog-outline" size={20} color={colors.text.secondary} />
                <Text style={styles.settingsLabel}>Settings</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.settingsRow}
              onPress={() => {
                if (navigation?.navigate) {
                  navigation.navigate('Support');
                }
              }}
            >
              <View style={styles.settingsRowLeft}>
                <MaterialCommunityIcons name="help-circle-outline" size={20} color={colors.text.secondary} />
                <Text style={styles.settingsLabel}>Help & Support</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <Button
          mode="contained"
          icon="account-edit"
          onPress={() => {
            if (onNavigateToEditProfile) {
              onNavigateToEditProfile();
            } else if (navigation?.navigate) {
              navigation.navigate('EditProfile');
            }
          }}
          style={styles.editButton}
          buttonColor={colors.primary.main}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          Edit Profile
        </Button>

        <View style={styles.actionButtonsRow}>
          <Button
            mode="outlined"
            icon="eye-outline"
            onPress={handleViewPublicProfile}
            style={styles.viewPublicButton}
            textColor={colors.primary.main}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            View Public Profile
          </Button>

          <Button
            mode="outlined"
            icon="share-variant"
            onPress={handleShareProfile}
            style={styles.shareProfileButton}
            textColor={colors.info.main}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            Share Profile
          </Button>
        </View>

        <Button
          mode="outlined"
          icon="logout"
          onPress={handleLogout}
          style={styles.logoutButton}
          textColor={colors.error.main}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          Logout
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 16,
    color: colors.text.secondary,
    fontSize: 16,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  avatarLabel: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.primary.main,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 2,
    elevation: 2,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  userType: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 6,
  },
  content: {
    padding: 16,
    marginTop: -8,
  },
  card: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  divider: {
    marginBottom: 16,
    marginTop: 4,
  },
  bioText: {
    fontSize: 15,
    color: colors.text.primary,
    lineHeight: 22,
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    marginLeft: 12,
  },
  socialLinks: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  socialLink: {
    alignItems: 'center',
    gap: 8,
    padding: 12,
  },
  socialLinkText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingsRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsLabel: {
    fontSize: 15,
    color: colors.text.primary,
    fontWeight: '500',
  },
  editButton: {
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  viewPublicButton: {
    flex: 1,
    borderRadius: 12,
    borderColor: colors.primary.main,
    borderWidth: 1.5,
  },
  shareProfileButton: {
    flex: 1,
    borderRadius: 12,
    borderColor: colors.info.main,
    borderWidth: 1.5,
  },
  logoutButton: {
    marginBottom: 24,
    borderRadius: 12,
    borderColor: colors.error.main,
    borderWidth: 1.5,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;
