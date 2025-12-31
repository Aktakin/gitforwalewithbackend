import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, RefreshControl } from 'react-native';
import { Text, Card, ActivityIndicator, Chip, Avatar, Searchbar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/supabase';
import { transformUser } from '../utils/dataTransform';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

const BrowseSkillsScreen = ({ navigation, onClose }) => {
  const { user } = useAuth();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  const categories = [
    'All Categories',
    'Woodworking & Carpentry',
    'Pottery & Ceramics',
    'Painting & Fine Arts',
    'Jewelry Making',
    'Textile & Fiber Arts',
    'Metalworking & Blacksmithing',
    'Glassblowing & Glasswork',
    'Leatherworking',
    'Stone Carving & Sculpture',
    'Furniture Making',
    'Restoration & Conservation',
  ];

  useEffect(() => {
    fetchSkills();
  }, [selectedCategory, searchQuery]);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (selectedCategory !== 'All Categories') {
        filters.category = selectedCategory;
      }
      if (searchQuery.trim()) {
        filters.search = searchQuery;
      }
      const dbSkills = await db.skills.getPublicSkills(filters);
      setSkills(dbSkills || []);
    } catch (error) {
      console.error('Error fetching skills:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSkills();
  };

  const getArtisanImage = (category) => {
    const categoryMap = {
      'Woodworking & Carpentry': 'https://source.unsplash.com/400x250/?woodworking,carpentry',
      'Pottery & Ceramics': 'https://source.unsplash.com/400x250/?pottery,ceramics',
      'Painting & Fine Arts': 'https://source.unsplash.com/400x250/?painting,art',
      'Jewelry Making': 'https://source.unsplash.com/400x250/?jewelry,handmade',
      'Textile & Fiber Arts': 'https://source.unsplash.com/400x250/?textile,weaving',
    };
    return categoryMap[category] || 'https://source.unsplash.com/400x250/?artisan,handmade';
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.primary.main, colors.primary.dark]} style={styles.header}>
        <View style={styles.headerContent}>
          <Button
            mode="text"
            onPress={() => navigation?.goBack() || onClose?.()}
            textColor="#FFFFFF"
            icon="arrow-left"
          >
            Back
          </Button>
          <Text style={styles.headerTitle}>Browse Skills</Text>
          <View style={{ width: 80 }} />
        </View>
      </LinearGradient>

      <View style={styles.searchSection}>
        <Searchbar
          placeholder="Search skills..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category && styles.categoryChipTextActive
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary.main} />
          </View>
        ) : skills.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="hammer-wrench" size={64} color={colors.text.secondary} />
            <Text style={styles.emptyText}>No skills found</Text>
            <Text style={styles.emptySubtext}>Try different search terms or categories</Text>
          </View>
        ) : (
          skills.map((skill) => {
            const provider = skill.users ? transformUser(skill.users) : null;
            return (
              <Card
                key={skill.id}
                style={styles.skillCard}
                onPress={() => {
                  if (navigation?.navigate) {
                    navigation.navigate('SkillDetail', { skillId: skill.id });
                  }
                }}
              >
                <Image
                  source={{ uri: getArtisanImage(skill.category) }}
                  style={styles.skillImage}
                  resizeMode="cover"
                />
                <Card.Content>
                  <Text style={styles.skillTitle} numberOfLines={2}>
                    {skill.title}
                  </Text>
                  {provider && (
                    <View style={styles.providerRow}>
                      <Avatar.Image
                        size={32}
                        source={{ uri: provider.avatar || provider.profilePicture }}
                        style={styles.providerAvatar}
                      />
                      <View style={styles.providerInfo}>
                        <Text style={styles.providerName} numberOfLines={1}>
                          {provider.name || `${provider.firstName || ''} ${provider.lastName || ''}`.trim()}
                        </Text>
                        {provider.isVerified && (
                          <MaterialCommunityIcons name="check-circle" size={14} color={colors.primary.main} />
                        )}
                      </View>
                    </View>
                  )}
                  {skill.description && (
                    <Text style={styles.skillDescription} numberOfLines={2}>
                      {skill.description}
                    </Text>
                  )}
                  {skill.tags && skill.tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                      {skill.tags.slice(0, 3).map((tag, index) => (
                        <Chip key={index} style={styles.tagChip} textStyle={styles.tagChipText}>
                          {tag}
                        </Chip>
                      ))}
                    </View>
                  )}
                  {skill.hourly_rate && (
                    <View style={styles.priceRow}>
                      <MaterialCommunityIcons name="currency-usd" size={16} color={colors.primary.main} />
                      <Text style={styles.priceText}>
                        ${parseFloat(skill.hourly_rate).toLocaleString()}/hour
                      </Text>
                    </View>
                  )}
                </Card.Content>
              </Card>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
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
  searchSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchbar: {
    marginBottom: 12,
  },
  categoriesScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F5F7FA',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: colors.primary.main + '20',
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  categoryChipText: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: colors.primary.main,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    paddingVertical: 64,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  skillCard: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  skillImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#E0E0E0',
  },
  skillTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  providerAvatar: {
    marginRight: 4,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  providerName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
  },
  skillDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  tagChip: {
    marginRight: 4,
    marginBottom: 4,
  },
  tagChipText: {
    fontSize: 11,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary.main,
  },
});

export default BrowseSkillsScreen;





