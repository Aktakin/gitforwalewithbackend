import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Linking, Alert, Share, Dimensions } from 'react-native';
import { Text, Card, Button, Avatar, Chip, Divider, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/supabase';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

const PublicProfileScreen = ({ route, navigation }) => {
  const { userId } = route?.params || {};
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isOwnProfile = userId === currentUser?.id;

  useEffect(() => {
    if (userId) {
      loadPublicProfile();
    }
  }, [userId]);

  const loadPublicProfile = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile
      const profileData = await db.users.getPublicProfile(userId);
      
      if (profileData) {
        setProfile({
          ...profileData,
          firstName: profileData.first_name || '',
          lastName: profileData.last_name || '',
          email: profileData.email || '',
          phone: profileData.phone_number || '',
          bio: profileData.bio || profileData.description || '',
          location: profileData.location || profileData.city || '',
          userType: profileData.user_type || 'customer',
          isVerified: profileData.is_verified || false,
          profilePicture: profileData.profile_picture || profileData.avatar_url || null,
          website: profileData.website || '',
          linkedIn: profileData.linkedin_url || '',
          github: profileData.github_url || '',
          joinedAt: profileData.created_at || new Date(),
          rating: profileData.rating || null,
        });

        // Fetch user's public skills if they're a provider
        if (profileData.user_type === 'provider' || profileData.user_type === 'both') {
          const userSkills = await db.skills.getUserSkills(userId);
          setSkills(userSkills || []);
        }
      }
    } catch (error) {
      console.error('Error loading public profile:', error);
      Alert.alert('Error', 'Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPublicProfile();
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

  const handleContactUser = () => {
    // Navigate to message screen with this user
    if (navigation?.navigate) {
      navigation.navigate('NewMessage', { recipientId: userId, recipientName: getDisplayName() });
    }
  };

  const handleShareProfile = async () => {
    try {
      const shareUrl = `skillbridge://profile/${userId}`;
      const message = `Check out ${getDisplayName()}'s profile on SkillBridge!\n${shareUrl}`;
      
      await Share.share({
        message,
        title: `${getDisplayName()} - SkillBridge Profile`,
      });
    } catch (error) {
      console.error('Error sharing profile:', error);
    }
  };

  const handleOpenLink = (url) => {
    if (url) {
      Linking.openURL(url).catch((err) => 
        Alert.alert('Error', 'Unable to open link')
      );
    }
  };

  const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoRowLeft}>
        <MaterialCommunityIcons name={icon} size={20} color={colors.text.secondary} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue} numberOfLines={1}>{value || 'Not specified'}</Text>
    </View>
  );

  const SkillCard = ({ skill }) => (
    <Card style={styles.skillCard}>
      <Card.Content>
        <View style={styles.skillHeader}>
          <Text style={styles.skillTitle}>{skill.title}</Text>
          {skill.hourly_rate && (
            <Chip
              mode="flat"
              style={styles.priceChip}
              textStyle={styles.priceText}
            >
              ${skill.hourly_rate}/hr
            </Chip>
          )}
        </View>
        <Text style={styles.skillCategory}>{skill.category}</Text>
        {skill.description && (
          <Text style={styles.skillDescription} numberOfLines={3}>
            {skill.description}
          </Text>
        )}
        {skill.tags && skill.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {skill.tags.slice(0, 3).map((tag, index) => (
              <Chip key={index} style={styles.tag} textStyle={styles.tagText}>
                {tag}
              </Chip>
            ))}
          </View>
        )}
      </Card.Content>
    </Card>
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
        <MaterialCommunityIcons name="account-off-outline" size={64} color={colors.text.secondary} />
        <Text style={styles.loadingText}>Profile not found</Text>
        <Button
          mode="contained"
          onPress={() => navigation?.goBack()}
          style={styles.backButton}
        >
          Go Back
        </Button>
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
        {/* Action Buttons (if not own profile) */}
        {!isOwnProfile && (
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              icon="message-text-outline"
              onPress={handleContactUser}
              style={styles.contactButton}
              buttonColor={colors.primary.main}
              contentStyle={styles.buttonContent}
            >
              Message
            </Button>
            <Button
              mode="outlined"
              icon="share-variant"
              onPress={handleShareProfile}
              style={styles.shareButton}
              textColor={colors.primary.main}
              contentStyle={styles.buttonContent}
            >
              Share
            </Button>
          </View>
        )}

        {/* Edit Profile Button (if own profile) */}
        {isOwnProfile && (
          <Button
            mode="contained"
            icon="account-edit"
            onPress={() => navigation?.navigate('EditProfile')}
            style={styles.editButton}
            buttonColor={colors.primary.main}
            contentStyle={styles.buttonContent}
          >
            Edit Profile
          </Button>
        )}

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
              <Text style={styles.emptyText}>No bio available</Text>
            )}
          </Card.Content>
        </Card>

        {/* Contact Information */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="card-account-details-outline" size={20} color={colors.primary.main} />
              <Text style={styles.sectionTitle}>Information</Text>
            </View>
            <Divider style={styles.divider} />
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
                  <TouchableOpacity 
                    style={styles.socialLink}
                    onPress={() => handleOpenLink(profile.website)}
                  >
                    <MaterialCommunityIcons name="web" size={24} color={colors.primary.main} />
                    <Text style={styles.socialLinkText}>Website</Text>
                  </TouchableOpacity>
                )}
                {profile.linkedIn && (
                  <TouchableOpacity 
                    style={styles.socialLink}
                    onPress={() => handleOpenLink(profile.linkedIn)}
                  >
                    <MaterialCommunityIcons name="linkedin" size={24} color={colors.info.main} />
                    <Text style={styles.socialLinkText}>LinkedIn</Text>
                  </TouchableOpacity>
                )}
                {profile.github && (
                  <TouchableOpacity 
                    style={styles.socialLink}
                    onPress={() => handleOpenLink(profile.github)}
                  >
                    <MaterialCommunityIcons name="github" size={24} color={colors.text.primary} />
                    <Text style={styles.socialLinkText}>GitHub</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Skills Section */}
        {(profile.userType === 'provider' || profile.userType === 'both') && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="tools" size={20} color={colors.primary.main} />
                <Text style={styles.sectionTitle}>Skills & Services</Text>
              </View>
              <Divider style={styles.divider} />
              {skills.length > 0 ? (
                <View style={styles.skillsContainer}>
                  {skills.map((skill, index) => (
                    <SkillCard key={skill.id || index} skill={skill} />
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyText}>No skills listed</Text>
              )}
            </Card.Content>
          </Card>
        )}
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
  backButton: {
    marginTop: 16,
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
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  contactButton: {
    flex: 1,
    borderRadius: 12,
    elevation: 2,
  },
  shareButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primary.main,
  },
  editButton: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  buttonContent: {
    paddingVertical: 8,
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
  skillsContainer: {
    gap: 12,
  },
  skillCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    elevation: 1,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  skillTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    flex: 1,
  },
  priceChip: {
    backgroundColor: colors.success.light,
    marginLeft: 8,
  },
  priceText: {
    color: colors.success.dark,
    fontWeight: '700',
    fontSize: 12,
  },
  skillCategory: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  skillDescription: {
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 20,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  tag: {
    backgroundColor: colors.primary.light,
    height: 24,
  },
  tagText: {
    fontSize: 11,
    color: colors.primary.dark,
  },
});

export default PublicProfileScreen;


