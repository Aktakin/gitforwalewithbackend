import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Text, ActivityIndicator, Chip, Searchbar, Avatar, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/supabase';
import { transformRequest, formatTimeAgo } from '../utils/dataTransform';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

const RequestsScreen = ({ onNavigateToCreateRequest, onNavigateToRequestDetail, refreshKey }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requests, setRequests] = useState([]);
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

  useEffect(() => {
    fetchRequests();
  }, [searchQuery, selectedCategory, selectedUrgency, refreshKey]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
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

  // Get unique categories from requests
  const requestCategories = requests.map(r => r.category).filter(Boolean);
  const categories = ['All', ...new Set(requestCategories)];

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

      {/* Create Button */}
      <View style={styles.createRequestHeader}>
          <Button
            mode="contained"
            icon="plus"
            onPress={() => onNavigateToCreateRequest?.()}
            style={styles.createRequestButton}
            contentStyle={styles.createRequestButtonContent}
            labelStyle={styles.createRequestButtonLabel}
            buttonColor={colors.primary.main}
          >
            Create Request
          </Button>
      </View>

      {/* Filter Section */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
        keyboardShouldPersistTaps="handled"
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
        keyboardShouldPersistTaps="handled"
      >
        {/* Results Count */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsText}>
            {filteredRequests.length} {filteredRequests.length === 1 ? 'Request' : 'Requests'} Found
          </Text>
          {selectedUrgency !== 'All' && (
            <Chip
              style={styles.activeFilterChip}
              textStyle={styles.activeFilterChipText}
              onClose={() => setSelectedUrgency('All')}
            >
              {selectedUrgency}
            </Chip>
          )}
        </View>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyCardContent}>
              <MaterialCommunityIcons
                name="file-document-outline"
                size={64}
                color={colors.text.secondary}
              />
              <Text style={styles.emptyText}>No requests found</Text>
              <Text style={styles.emptySubtext}>
                Try adjusting your filters or search terms
              </Text>
            </View>
          </View>
        ) : (
          filteredRequests.map((request, index) => {
            // Get category profession
            const getCategoryProfession = (category) => {
              const categoryMap = {
                'Woodworking & Carpentry': 'Woodworker',
                'Pottery & Ceramics': 'Potter',
                'Painting & Fine Arts': 'Artist',
                'Jewelry Making': 'Jeweler',
                'Textile & Fiber Arts': 'Textile Artist',
                'Metalworking & Blacksmithing': 'Metalworker',
                'Glassblowing & Glasswork': 'Glassblower',
                'Leatherworking': 'Leatherworker',
                'Stone Carving & Sculpture': 'Sculptor',
                'Bookbinding & Paper Arts': 'Bookbinder',
                'Tailoring & Sewing': 'Tailor',
                'Furniture Making': 'Furniture Maker',
                'Restoration & Conservation': 'Restorer',
              };
              return categoryMap[category] || 'Artisan';
            };

            const getUrgencyStyle = (urgency) => {
              switch (urgency) {
                case 'urgent':
                  return { bg: colors.primary.main + '15', color: colors.primary.main, label: 'Urgent' };
                case 'high':
                  return { bg: colors.primary.main + '15', color: colors.primary.main, label: 'High Priority' };
                case 'medium':
                  return { bg: colors.primary.main + '10', color: colors.primary.main, label: 'Medium' };
                default:
                  return { bg: colors.primary.main + '08', color: colors.primary.main, label: 'Low' };
              }
            };

            const urgencyStyle = getUrgencyStyle(request.urgency);
            
            return (
              <TouchableOpacity
                key={request.id}
                style={styles.requestCard}
                activeOpacity={0.9}
                onPress={() => onNavigateToRequestDetail?.(request.id)}
              >
                <View style={styles.cardContent}>
                  {/* Header */}
                  <View style={styles.requestHeader}>
                    <View style={styles.requestTitleContainer}>
                      <Text style={styles.professionHeading}>
                        {getCategoryProfession(request.category)} Needed!
                      </Text>
                      <Text style={styles.requestTitle} numberOfLines={2}>
                        {request.title}
                      </Text>
                    </View>
                    <TouchableOpacity style={styles.bookmarkBtn}>
                      <MaterialCommunityIcons name="bookmark-outline" size={22} color={colors.text.secondary} />
                    </TouchableOpacity>
                  </View>

                  {/* Tags */}
                  <View style={styles.tagsRow}>
                    <View style={[styles.tagChip, { backgroundColor: colors.primary.main + '15' }]}>
                      <MaterialCommunityIcons name="tag" size={12} color={colors.primary.main} />
                      <Text style={[styles.tagChipText, { color: colors.primary.main }]}>{request.category}</Text>
                    </View>
                    <View style={[styles.tagChip, { backgroundColor: urgencyStyle.bg }]}>
                      <MaterialCommunityIcons name="clock-outline" size={12} color={urgencyStyle.color} />
                      <Text style={[styles.tagChipText, { color: urgencyStyle.color }]}>{urgencyStyle.label}</Text>
                    </View>
                  </View>

                  {/* Description */}
                  {request.description && (
                    <Text style={styles.requestDescription} numberOfLines={2}>
                      {request.description}
                    </Text>
                  )}

                  {/* Info Grid */}
                  <View style={styles.infoGrid}>
                    <View style={styles.infoItem}>
                      <MaterialCommunityIcons name="cash" size={18} color={colors.primary.main} />
                      <View>
                        <Text style={styles.infoLabel}>Budget</Text>
                        <Text style={styles.infoValue}>
                          {request.budget?.min > 0 ? `$${request.budget.min} - $${request.budget.max}` : 'Flexible'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.infoItem}>
                      <MaterialCommunityIcons name="file-document-multiple" size={18} color={colors.primary.main} />
                      <View>
                        <Text style={styles.infoLabel}>Proposals</Text>
                        <Text style={styles.infoValue}>{request.proposals || 0} received</Text>
                      </View>
                    </View>
                    <View style={styles.infoItem}>
                      <MaterialCommunityIcons name="calendar-clock" size={18} color={colors.primary.main} />
                      <View>
                        <Text style={styles.infoLabel}>Posted</Text>
                        <Text style={styles.infoValue}>{formatTimeAgo(request.createdAt)}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Divider */}
                  <View style={styles.divider} />

                  {/* Footer */}
                  <View style={styles.requestFooter}>
                    {request.user && (
                      <View style={styles.requestUser}>
                        {request.user.avatar || request.user.profilePicture ? (
                          <Avatar.Image
                            size={36}
                            source={{ uri: request.user.avatar || request.user.profilePicture }}
                          />
                        ) : (
                          <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>
                              {request.user.firstName?.[0]?.toUpperCase() || 'U'}
                            </Text>
                          </View>
                        )}
                        <View style={styles.userInfo}>
                          <Text style={styles.userName}>
                            {request.user.firstName} {request.user.lastName}
                          </Text>
                          <View style={styles.verifiedRow}>
                            <MaterialCommunityIcons name="star" size={12} color={colors.primary.main} />
                            <Text style={styles.verifiedText}>Verified Client</Text>
                          </View>
                        </View>
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.viewDetailsBtn}
                      onPress={() => onNavigateToRequestDetail?.(request.id)}
                    >
                      <Text style={styles.viewDetailsBtnText}>View Details</Text>
                      <MaterialCommunityIcons name="arrow-right" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
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
  createRequestHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
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
  // Sophisticated Request Card
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.12)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  cardContent: {
    padding: 18,
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
  professionHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary.main,
    marginBottom: 4,
  },
  requestTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.primary,
    lineHeight: 22,
  },
  bookmarkBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  requestDescription: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 14,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 14,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: '45%',
  },
  infoLabel: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E8E8',
    marginBottom: 14,
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  verifiedText: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.main,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  viewDetailsBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default RequestsScreen;
