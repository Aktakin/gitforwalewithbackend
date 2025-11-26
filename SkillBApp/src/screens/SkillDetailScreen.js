import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Alert } from 'react-native';
import { Text, Card, ActivityIndicator, Chip, Avatar, Button, Divider, List } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/supabase';
import { transformUser } from '../utils/dataTransform';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

const SkillDetailScreen = ({ route, navigation, onClose }) => {
  const { skillId } = route?.params || {};
  const { user } = useAuth();
  const [skill, setSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchSkillDetails = async () => {
      if (!skillId) {
        setError('Skill ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);


        const dbSkill = await db.skills.getById?.(skillId) || await db.skills.getPublicSkills({}).then(skills => skills.find(s => s.id === skillId));
        
        if (!dbSkill) {
          setError('Skill not found');
          setLoading(false);
          return;
        }

        const provider = dbSkill.users ? transformUser(dbSkill.users) : null;

        const formattedSkill = {
          id: dbSkill.id,
          title: dbSkill.title,
          description: dbSkill.description || 'No description provided',
          category: dbSkill.category,
          tags: dbSkill.tags || [],
          price: dbSkill.hourly_rate ? {
            min: parseFloat(dbSkill.hourly_rate),
            max: parseFloat(dbSkill.hourly_rate) * 1.5
          } : null,
          provider: provider ? {
            id: provider.id,
            name: provider.name || `${provider.firstName || ''} ${provider.lastName || ''}`.trim() || provider.email,
            avatar: provider.avatar || provider.profilePicture,
            rating: 4.5, // TODO: Add rating system
            reviews: 0,
            isVerified: provider.isVerified || false,
            location: provider.location?.city && provider.location?.state
              ? `${provider.location.city}, ${provider.location.state}`
              : provider.location?.country || 'Location not specified',
            bio: provider.bio || 'No bio available'
          } : null,
          createdAt: dbSkill.created_at,
        };

        setSkill(formattedSkill);
      } catch (err) {
        console.error('Error fetching skill details:', err);
        setError(err.message || 'Failed to load skill details');
      } finally {
        setLoading(false);
      }
    };

    fetchSkillDetails();
  }, [skillId]);

  const handleContact = () => {
    if (skill?.provider?.id) {
      if (navigation?.navigate) {
        navigation.navigate('NewMessage', { recipientId: skill.provider.id });
      } else {
        Alert.alert('Contact Artisan', 'Messaging feature will be implemented soon.');
      }
    }
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Implement bookmark functionality
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Loading skill details...</Text>
      </View>
    );
  }

  if (error || !skill) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle" size={64} color={colors.error?.main || '#f44336'} />
        <Text style={styles.errorText}>{error || 'Skill not found'}</Text>
        <Button mode="contained" onPress={() => navigation?.goBack() || onClose?.()}>
          Go Back
        </Button>
      </View>
    );
  }

  const imageUrl = `https://source.unsplash.com/600x400/?${skill.category.toLowerCase().replace(/\s+/g, ',')},handmade,craft`;

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.primary.main, colors.primary.dark]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation?.goBack() || onClose?.()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Skill Details</Text>
          <TouchableOpacity onPress={handleFavorite}>
            <MaterialCommunityIcons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Image source={{ uri: imageUrl }} style={styles.skillImage} resizeMode="cover" />

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>{skill.title}</Text>
            {skill.category && (
              <Chip
                icon="tag"
                style={styles.categoryChip}
                textStyle={styles.categoryChipText}
              >
                {skill.category}
              </Chip>
            )}
          </Card.Content>
        </Card>

        {skill.provider && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>About the Artisan</Text>
              <View style={styles.providerInfo}>
                <Avatar.Image
                  size={60}
                  source={{ uri: skill.provider.avatar }}
                  style={styles.providerAvatar}
                />
                <View style={styles.providerDetails}>
                  <View style={styles.providerNameRow}>
                    <Text style={styles.providerName}>{skill.provider.name}</Text>
                    {skill.provider.isVerified && (
                      <MaterialCommunityIcons name="check-circle" size={18} color={colors.primary.main} />
                    )}
                  </View>
                  {skill.provider.location && (
                    <Text style={styles.providerLocation}>{skill.provider.location}</Text>
                  )}
                  {skill.provider.rating > 0 && (
                    <View style={styles.ratingRow}>
                      <MaterialCommunityIcons name="star" size={16} color="#FFB300" />
                      <Text style={styles.ratingText}>
                        {skill.provider.rating} ({skill.provider.reviews} reviews)
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              {skill.provider.bio && (
                <Text style={styles.bio}>{skill.provider.bio}</Text>
              )}
            </Card.Content>
          </Card>
        )}

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{skill.description}</Text>
          </Card.Content>
        </Card>

        {skill.tags && skill.tags.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.tagsContainer}>
                {skill.tags.map((tag, index) => (
                  <Chip key={index} style={styles.tagChip} textStyle={styles.tagChipText}>
                    {tag}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}

        {skill.price && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.priceRow}>
                <MaterialCommunityIcons name="currency-usd" size={24} color={colors.primary.main} />
                <View style={styles.priceDetails}>
                  <Text style={styles.priceLabel}>Starting at</Text>
                  <Text style={styles.priceValue}>
                    ${skill.price.min.toLocaleString()}
                    {skill.price.max ? ` - $${skill.price.max.toLocaleString()}` : ''}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleContact}
          style={styles.contactButton}
          buttonColor={colors.primary.main}
          icon="message-text"
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          Contact Artisan
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 12,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F5F7FA',
  },
  errorText: {
    fontSize: 16,
    color: colors.error?.main || '#f44336',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  skillImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#E0E0E0',
  },
  card: {
    margin: 16,
    marginBottom: 0,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 12,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary.main + '15',
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  categoryChipText: {
    color: colors.primary.main,
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 12,
  },
  providerInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  providerAvatar: {
    marginRight: 12,
  },
  providerDetails: {
    flex: 1,
  },
  providerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  providerName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  providerLocation: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  bio: {
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 20,
    marginTop: 8,
  },
  description: {
    fontSize: 15,
    color: colors.text.primary,
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    marginRight: 8,
    marginBottom: 8,
    borderColor: colors.divider,
  },
  tagChipText: {
    fontSize: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceDetails: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary.main,
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  contactButton: {
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SkillDetailScreen;

