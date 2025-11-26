import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Text, Card, ActivityIndicator, Chip, Searchbar, Avatar, Badge, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/supabase';
import { transformRequest, formatTimeAgo } from '../utils/dataTransform';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

// Get artisan-related image based on category
const getArtisanImage = (category, index) => {
  const categoryMap = {
    'Woodworking & Carpentry': 'https://source.unsplash.com/400x250/?woodworking,carpentry,handmade',
    'Pottery & Ceramics': 'https://source.unsplash.com/400x250/?pottery,ceramics,clay',
    'Painting & Fine Arts': 'https://source.unsplash.com/400x250/?painting,art,canvas',
    'Jewelry Making': 'https://source.unsplash.com/400x250/?jewelry,gemstones,handmade',
    'Textile & Fiber Arts': 'https://source.unsplash.com/400x250/?textile,weaving,fabric',
    'Metalworking & Blacksmithing': 'https://source.unsplash.com/400x250/?metalworking,blacksmith,forge',
    'Glassblowing & Glasswork': 'https://source.unsplash.com/400x250/?glassblowing,glass,artisan',
    'Leatherworking': 'https://source.unsplash.com/400x250/?leather,craft,handmade',
    'Stone Carving & Sculpture': 'https://source.unsplash.com/400x250/?sculpture,stone,carving',
    'Furniture Making': 'https://source.unsplash.com/400x250/?furniture,woodworking,craft',
    'Tailoring & Sewing': 'https://source.unsplash.com/400x250/?tailoring,sewing,fabric',
    'Restoration & Conservation': 'https://source.unsplash.com/400x250/?restoration,antique,craft',
  };
  
  return categoryMap[category] || `https://source.unsplash.com/400x250/?artisan,handmade,craft?${index}`;
};


const RequestsScreen = ({ onNavigateToCreateRequest, onNavigateToCreateSkill, onNavigateToRequestDetail }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeView, setActiveView] = useState('requests'); // 'requests' or 'skills'
  const [requests, setRequests] = useState([]);
  const [skills, setSkills] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedUrgency, setSelectedUrgency] = useState('All');

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const dbRequests = await db.requests.getAll({
        status: 'open',
        isPublic: true,
        pageSize: 50,
        search: searchQuery || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        urgency: selectedUrgency !== 'All' ? selectedUrgency : undefined,
      });

      const allRequests = (dbRequests || [])
        .map(transformRequest)
        .filter(req => req !== null);

      // Sort requests
      const sortedRequests = allRequests.sort((a, b) => {
        const urgencyOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        const aUrgency = urgencyOrder[a.urgency] || 0;
        const bUrgency = urgencyOrder[b.urgency] || 0;
        if (bUrgency !== aUrgency) return bUrgency - aUrgency;
        const aDate = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
        const bDate = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
        return bDate - aDate;
      });

      setRequests(sortedRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchSkills = async () => {
    try {
      setLoading(true);

      const dbSkills = await db.skills.getPublicSkills({
        search: searchQuery || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
      });

      const allSkills = (dbSkills || []).map(skill => ({
        id: skill.id,
        title: skill.title,
        category: skill.category,
        description: skill.description,
        price: { min: skill.price_min || skill.hourly_rate || 0, max: skill.price_max || skill.hourly_rate || 0 },
        rating: skill.rating || 0,
        reviews: skill.review_count || 0,
        orders: skill.order_count || 0,
        deliveryTime: skill.delivery_time || '14 days',
        user: skill.users ? {
          firstName: skill.users.first_name || '',
          lastName: skill.users.last_name || '',
          avatar: skill.users.profile_picture,
          isVerified: skill.users.is_verified || false,
        } : null,
        location: skill.location || '',
        tags: skill.tags || [],
        createdAt: skill.created_at ? new Date(skill.created_at) : new Date(),
      }));

      setSkills(allSkills);
    } catch (error) {
      console.error('Error fetching skills:', error);
      setSkills([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (activeView === 'requests') {
      fetchRequests();
    } else {
      fetchSkills();
    }
  }, [searchQuery, activeView, selectedCategory, selectedUrgency]);

  const onRefresh = () => {
    setRefreshing(true);
    if (activeView === 'requests') {
      fetchRequests();
    } else {
      fetchSkills();
    }
  };

  // Filter requests
  const filteredRequests = requests.filter(request => {
    if (selectedCategory !== 'All' && request.category !== selectedCategory) {
      return false;
    }
    if (selectedUrgency !== 'All' && request.urgency !== selectedUrgency.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        request.title?.toLowerCase().includes(query) ||
        request.description?.toLowerCase().includes(query) ||
        request.category?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Filter skills
  const filteredSkills = skills.filter(skill => {
    if (selectedCategory !== 'All' && skill.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        skill.title?.toLowerCase().includes(query) ||
        skill.description?.toLowerCase().includes(query) ||
        skill.category?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Get unique categories from both requests and skills
  const requestCategories = requests.map(r => r.category).filter(Boolean);
  const skillCategories = skills.map(s => s.category).filter(Boolean);
  const categories = ['All', ...new Set([...requestCategories, ...skillCategories])];
  const urgencyLevels = ['All', 'Urgent', 'High', 'Medium', 'Low'];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Loading requests...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Enhanced Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search requests, categories..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchbarInput}
          iconColor={colors.primary.main}
        />
      </View>

      {/* View Toggle */}
      <View style={styles.toggleContainer}>
        <View style={styles.toggleWrapper}>
          <TouchableOpacity
            style={[styles.toggleButton, activeView === 'requests' && styles.toggleButtonActive]}
            onPress={() => setActiveView('requests')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={activeView === 'requests' ? 'file-document-multiple' : 'file-document-multiple-outline'}
              size={20}
              color={activeView === 'requests' ? '#FFFFFF' : '#666666'}
              style={styles.toggleIcon}
            />
            <Text style={[styles.toggleText, activeView === 'requests' && styles.toggleTextActive]}>
              Requests
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, activeView === 'skills' && styles.toggleButtonActive]}
            onPress={() => setActiveView('skills')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={activeView === 'skills' ? 'hammer-wrench' : 'hammer-wrench-outline'}
              size={20}
              color={activeView === 'skills' ? '#FFFFFF' : '#666666'}
              style={styles.toggleIcon}
            />
            <Text style={[styles.toggleText, activeView === 'skills' && styles.toggleTextActive]}>
              Skills
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Create Button below Toggle */}
      <View style={styles.createRequestHeader}>
          <Button
            mode="contained"
            icon="plus"
            onPress={() => {
              if (activeView === 'requests') {
                onNavigateToCreateRequest?.();
              } else {
                onNavigateToCreateSkill?.();
              }
            }}
            style={styles.createRequestButton}
            contentStyle={styles.createRequestButtonContent}
            labelStyle={styles.createRequestButtonLabel}
            buttonColor={colors.primary.main}
          >
            {activeView === 'requests' ? 'Create Request' : 'Create Skill'}
          </Button>
      </View>

      {/* Filter Section */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        <Chip
          selected={selectedCategory === 'All'}
          onPress={() => setSelectedCategory('All')}
          style={[styles.filterChip, selectedCategory === 'All' && styles.filterChipActive]}
          textStyle={[styles.filterChipText, selectedCategory === 'All' && styles.filterChipTextActive]}
        >
          All Categories
        </Chip>
        {categories.slice(1, 6).map((category) => (
          <Chip
            key={category}
            selected={selectedCategory === category}
            onPress={() => setSelectedCategory(category)}
            style={[styles.filterChip, selectedCategory === category && styles.filterChipActive]}
            textStyle={[styles.filterChipText, selectedCategory === category && styles.filterChipTextActive]}
          >
            {category.split(' & ')[0]}
          </Chip>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary.main} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Results Count */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsText}>
            {activeView === 'requests' 
              ? `${filteredRequests.length} ${filteredRequests.length === 1 ? 'Request' : 'Requests'} Found`
              : `${filteredSkills.length} ${filteredSkills.length === 1 ? 'Skill' : 'Skills'} Found`
            }
          </Text>
          {activeView === 'requests' && selectedUrgency !== 'All' && (
            <Chip
              style={styles.activeFilterChip}
              textStyle={styles.activeFilterChipText}
              onClose={() => setSelectedUrgency('All')}
            >
              {selectedUrgency}
            </Chip>
          )}
        </View>

        {/* Requests View */}
        {activeView === 'requests' && (
          <>
            {filteredRequests.length === 0 ? (
          <Card style={styles.emptyCard} mode="outlined">
            <Card.Content style={styles.emptyCardContent}>
              <MaterialCommunityIcons
                name="file-document-outline"
                size={64}
                color={colors.text.secondary}
              />
              <Text style={styles.emptyText}>No requests found</Text>
              <Text style={styles.emptySubtext}>
                Try adjusting your filters or search terms
              </Text>
            </Card.Content>
          </Card>
        ) : (
          filteredRequests.map((request, index) => {
            const imageUrl = getArtisanImage(request.category, index);
            
            return (
              <Card
                key={request.id}
                style={styles.requestCard}
                mode="outlined"
                onPress={() => {
                  onNavigateToRequestDetail?.(request.id);
                }}
              >
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.requestImage}
                  resizeMode="cover"
                />
                <Card.Content style={styles.cardContent}>
                  <View style={styles.requestHeader}>
                    <View style={styles.requestTitleContainer}>
                      <Text style={styles.requestTitle} numberOfLines={2}>
                        {request.title}
                      </Text>
                      <Text style={styles.requestCategory}>{request.category}</Text>
                    </View>
                    <Chip
                      style={[
                        styles.urgencyChip,
                        styles.urgencyChipOutlined,
                      ]}
                      textStyle={styles.urgencyChipText}
                      mode="outlined"
                    >
                      {request.urgency || 'low'}
                    </Chip>
                  </View>

                  {request.description && (
                    <Text style={styles.requestDescription} numberOfLines={3}>
                      {request.description}
                    </Text>
                  )}

                  <View style={styles.requestStats}>
                    <View style={styles.statItem}>
                      <MaterialCommunityIcons
                        name="currency-usd"
                        size={18}
                        color={colors.primary.main}
                      />
                      <Text style={styles.statText}>
                        {request.budget?.min > 0
                          ? `$${request.budget.min.toLocaleString()}-${request.budget.max.toLocaleString()}`
                          : 'Budget flexible'}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <MaterialCommunityIcons
                        name="file-document-multiple-outline"
                        size={18}
                        color={colors.text.secondary}
                      />
                      <Text style={styles.statText}>
                        {request.proposals || 0} proposals
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <MaterialCommunityIcons
                        name="eye"
                        size={18}
                        color={colors.text.secondary}
                      />
                      <Text style={styles.statText}>
                        {request.views || 0} views
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <MaterialCommunityIcons
                        name="clock-outline"
                        size={18}
                        color={colors.text.secondary}
                      />
                      <Text style={styles.statText}>
                        {formatTimeAgo(request.createdAt)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.requestFooter}>
                    {request.user && (
                      <View style={styles.requestUser}>
                        {request.user.avatar || request.user.profilePicture ? (
                          <Avatar.Image
                            size={32}
                            source={{ uri: request.user.avatar || request.user.profilePicture }}
                          />
                        ) : (
                          <Avatar.Text
                            size={32}
                            label={`${request.user.firstName?.[0] || ''}${request.user.lastName?.[0] || ''}`.toUpperCase() || 'U'}
                            style={{ backgroundColor: colors.primary.main }}
                          />
                        )}
                        <View style={styles.userInfo}>
                          <Text style={styles.userName}>
                            {request.user.firstName} {request.user.lastName}
                          </Text>
                          <Text style={styles.userType}>Client</Text>
                        </View>
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.applyButton}
                      onPress={() => {
                        onNavigateToRequestDetail?.(request.id);
                      }}
                    >
                      <MaterialCommunityIcons
                        name="send"
                        size={18}
                        color="#FFFFFF"
                      />
                      <Text style={styles.applyButtonText}>Apply</Text>
                    </TouchableOpacity>
                  </View>
                </Card.Content>
              </Card>
            );
          })
        )}
          </>
        )}

        {/* Skills View */}
        {activeView === 'skills' && (
          <>
            {filteredSkills.length === 0 ? (
              <Card style={styles.emptyCard} mode="outlined">
                <Card.Content style={styles.emptyCardContent}>
                  <MaterialCommunityIcons
                    name="hammer-wrench-outline"
                    size={64}
                    color={colors.text.secondary}
                  />
                  <Text style={styles.emptyText}>No skills found</Text>
                  <Text style={styles.emptySubtext}>
                    Try adjusting your filters or search terms
                  </Text>
                </Card.Content>
              </Card>
            ) : (
              filteredSkills.map((skill, index) => {
                const imageUrl = getArtisanImage(skill.category, index);
                
                return (
                  <Card
                    key={skill.id}
                    style={styles.skillCard}
                    mode="outlined"
                    onPress={() => {
                      console.log('View skill:', skill.id);
                    }}
                  >
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.requestImage}
                      resizeMode="cover"
                    />
                    <Card.Content style={styles.cardContent}>
                      <View style={styles.skillHeader}>
                        <View style={styles.skillTitleContainer}>
                          <Text style={styles.requestTitle} numberOfLines={2}>
                            {skill.title}
                          </Text>
                          <Text style={styles.requestCategory}>{skill.category}</Text>
                        </View>
                        {skill.user?.isVerified && (
                          <MaterialCommunityIcons
                            name="check-circle"
                            size={20}
                            color={colors.primary.main}
                          />
                        )}
                      </View>

                      {skill.description && (
                        <Text style={styles.requestDescription} numberOfLines={3}>
                          {skill.description}
                        </Text>
                      )}

                      <View style={styles.skillStats}>
                        <View style={styles.statItem}>
                          <MaterialCommunityIcons
                            name="star"
                            size={18}
                            color="#FFB800"
                          />
                          <Text style={styles.statText}>
                            {skill.rating?.toFixed(1) || '4.5'} ({skill.reviews || 0})
                          </Text>
                        </View>
                        <View style={styles.statItem}>
                          <MaterialCommunityIcons
                            name="currency-usd"
                            size={18}
                            color={colors.primary.main}
                          />
                          <Text style={styles.statText}>
                            ${skill.price?.min?.toLocaleString() || '0'}-${skill.price?.max?.toLocaleString() || '0'}
                          </Text>
                        </View>
                        <View style={styles.statItem}>
                          <MaterialCommunityIcons
                            name="briefcase-outline"
                            size={18}
                            color={colors.text.secondary}
                          />
                          <Text style={styles.statText}>
                            {skill.orders || 0} orders
                          </Text>
                        </View>
                        {skill.deliveryTime && (
                          <View style={styles.statItem}>
                            <MaterialCommunityIcons
                              name="clock-outline"
                              size={18}
                              color={colors.text.secondary}
                            />
                            <Text style={styles.statText}>
                              {skill.deliveryTime}
                            </Text>
                          </View>
                        )}
                      </View>

                      {skill.tags && skill.tags.length > 0 && (
                        <View style={styles.tagsContainer}>
                          {skill.tags.slice(0, 3).map((tag, tagIndex) => (
                            <Chip
                              key={tagIndex}
                              style={styles.tagChip}
                              textStyle={styles.tagChipText}
                              mode="outlined"
                            >
                              {tag}
                            </Chip>
                          ))}
                        </View>
                      )}

                      <View style={styles.requestFooter}>
                        {skill.user && (
                          <View style={styles.requestUser}>
                            {skill.user.avatar || skill.user.profilePicture ? (
                              <Avatar.Image
                                size={32}
                                source={{ uri: skill.user.avatar || skill.user.profilePicture }}
                              />
                            ) : (
                              <Avatar.Text
                                size={32}
                                label={`${skill.user.firstName?.[0] || ''}${skill.user.lastName?.[0] || ''}`.toUpperCase() || 'U'}
                                style={{ backgroundColor: colors.primary.main }}
                              />
                            )}
                            <View style={styles.userInfo}>
                              <View style={styles.userNameContainer}>
                                <Text style={styles.userName}>
                                  {skill.user.firstName} {skill.user.lastName}
                                </Text>
                                {skill.user.isVerified && (
                                  <MaterialCommunityIcons
                                    name="check-circle"
                                    size={14}
                                    color={colors.primary.main}
                                    style={styles.verifiedIcon}
                                  />
                                )}
                              </View>
                              <Text style={styles.userType}>Provider</Text>
                            </View>
                          </View>
                        )}
                        <TouchableOpacity
                          style={styles.contactButton}
                          onPress={() => {
                            console.log('Contact provider:', skill.id);
                          }}
                        >
                          <MaterialCommunityIcons
                            name="message-text"
                            size={18}
                            color="#FFFFFF"
                          />
                          <Text style={styles.contactButtonText}>Contact</Text>
                        </TouchableOpacity>
                      </View>
                    </Card.Content>
                  </Card>
                );
              })
            )}
          </>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 12,
    color: colors.text.secondary,
    fontSize: 14,
  },
  toggleContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  toggleWrapper: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#000000',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  toggleIcon: {
    marginRight: 0,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  createRequestHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  createRequestButton: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  createRequestButtonContent: {
    paddingVertical: 10,
  },
  createRequestButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 80,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchbar: {
    elevation: 0,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchbarInput: {
    fontSize: 14,
  },
  filterScroll: {
    maxHeight: 50,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    height: 32,
  },
  filterChipActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  filterChipText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  resultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  activeFilterChip: {
    backgroundColor: colors.primary.main + '15',
    borderWidth: 1,
    borderColor: colors.primary.main,
    height: 28,
  },
  activeFilterChipText: {
    color: colors.primary.main,
    fontSize: 11,
    fontWeight: '600',
  },
  emptyCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  emptyCardContent: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 16,
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
  requestCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    elevation: 0,
  },
  requestImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#F0F0F0',
  },
  cardContent: {
    padding: 16,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  requestTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  requestTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 6,
    lineHeight: 24,
  },
  requestCategory: {
    fontSize: 13,
    color: colors.primary.main,
    fontWeight: '600',
  },
  urgencyChip: {
    height: 26,
    paddingHorizontal: 10,
  },
  urgencyChipOutlined: {
    borderWidth: 1,
    borderColor: colors.primary.main,
    backgroundColor: '#FFFFFF',
  },
  urgencyChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary.main,
    textTransform: 'capitalize',
  },
  requestDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  requestStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  requestUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  userType: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.main,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  skillCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    elevation: 0,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  skillTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  skillStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tagChip: {
    height: 28,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tagChipText: {
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.main,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RequestsScreen;
