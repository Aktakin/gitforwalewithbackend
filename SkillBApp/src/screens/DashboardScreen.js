import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Animated, Dimensions, Image } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Chip, Avatar, Badge } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
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
  
  // Return category-specific image or default artisan image
  return categoryMap[category] || `https://source.unsplash.com/400x250/?artisan,handmade,craft?${index}`;
};


const DashboardScreen = ({ onNavigateToCreateRequest, onNavigateToCreateSkill, onNavigateToRequestDetail }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showOverview, setShowOverview] = useState(true);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      activeProjects: 0,
      completedProjects: 0,
      totalEarnings: 0,
      rating: 0,
      messages: 0,
      proposals: 0,
    },
    trendingRequests: [],
    featuredRequests: [],
  });

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch requests from database
      const dbRequests = await db.requests.getAll({
        status: 'open',
        isPublic: true,
        pageSize: 30,
      });

      const allRequests = (dbRequests || [])
        .map(transformRequest)
        .filter(req => req !== null);

      // Sort requests by urgency and date
      const sortedRequests = allRequests.sort((a, b) => {
        const urgencyOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        const aUrgency = urgencyOrder[a.urgency] || 0;
        const bUrgency = urgencyOrder[b.urgency] || 0;
        if (bUrgency !== aUrgency) return bUrgency - aUrgency;
        const aDate = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
        const bDate = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
        return bDate - aDate;
      });

      // Get user's requests
      let userRequests = [];
      if (user?.id) {
        try {
          const userDbRequests = await db.requests.getByUser(user.id);
          userRequests = (userDbRequests || [])
            .map(transformRequest)
            .filter(req => req !== null);
        } catch (error) {
          console.error('Error fetching user requests:', error);
        }
      }

      // Featured requests (top 3 most urgent/recent)
      const featured = sortedRequests
        .filter(r => r.urgency === 'urgent' || r.urgency === 'high')
        .slice(0, 3);

      // Get user stats including proposals, earnings, and messages
      let userProposals = 0;
      let totalEarnings = 0;
      let rating = 0;
      let messageCount = 0;
      
      if (user?.id) {
        try {
          // Get user's proposals
          const proposals = await db.proposals.getUserProposals(user.id);
          userProposals = proposals?.length || 0;
          
          // Calculate earnings from accepted proposals
          const acceptedProposals = proposals?.filter(p => p.status === 'accepted') || [];
          totalEarnings = acceptedProposals.reduce((sum, p) => sum + (p.proposed_price || 0), 0);
          
          // Calculate rating based on acceptance rate
          if (userProposals > 0) {
            const acceptanceRate = acceptedProposals.length / userProposals;
            rating = (acceptanceRate * 5).toFixed(1);
          }
          
          // Get message count from conversations
          try {
            const conversations = await db.conversations.getUserConversations(user.id);
            messageCount = conversations?.length || 0;
          } catch (err) {
            console.warn('Could not fetch conversations:', err);
          }
        } catch (error) {
          console.error('Error fetching user stats:', error);
        }
      }

      setDashboardData({
        stats: {
          activeProjects: userRequests.filter(r => r.status === 'open' || r.status === 'in_progress').length,
          completedProjects: userRequests.filter(r => r.status === 'accepted' || r.status === 'completed').length,
          totalEarnings: totalEarnings,
          rating: parseFloat(rating),
          messages: messageCount,
          proposals: userProposals,
        },
        trendingRequests: sortedRequests.slice(0, 8),
        featuredRequests: featured.length > 0 ? featured : sortedRequests.slice(0, 3),
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set empty state on error
      setDashboardData({
        stats: {
          activeProjects: 0,
          completedProjects: 0,
          totalEarnings: 0,
          rating: 0,
          messages: 0,
          proposals: 0,
        },
        trendingRequests: [],
        featuredRequests: [],
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const StatCard = ({ icon, value, label, color, trend }) => {
    return (
      <Card style={styles.statCard} mode="outlined">
        <Card.Content style={styles.statCardContent}>
          <View style={styles.statHeader}>
            <MaterialCommunityIcons 
              name={icon} 
              size={22} 
              color={colors.primary.main} 
              style={styles.statIcon}
            />
            {trend && (
              <View style={styles.trendBadge}>
                <MaterialCommunityIcons name="trending-up" size={10} color={colors.primary.main} />
              </View>
            )}
          </View>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statLabel}>{label}</Text>
        </Card.Content>
      </Card>
    );
  };

  const QuickActionCard = ({ icon, label, subtitle, color, onPress }) => {
    return (
      <TouchableOpacity
        style={styles.quickActionCard}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Card style={styles.quickActionCardInner} mode="outlined">
          <Card.Content style={styles.quickActionContent}>
            <MaterialCommunityIcons 
              name={icon} 
              size={24} 
              color={colors.primary.main} 
            />
            <Text style={styles.quickActionLabel}>{label}</Text>
            {subtitle && (
              <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
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
      {/* Enhanced Header */}
      <LinearGradient
        colors={[colors.primary.main, colors.primary.dark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerGreeting}>
              {getGreeting()}{user?.firstName ? `, ${user.firstName}` : ''}! 👋
            </Text>
            <Text style={styles.headerSubtitle}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
          </View>
          {user?.profilePicture ? (
            <Avatar.Image size={56} source={{ uri: user.profilePicture }} />
          ) : (
            <Avatar.Text
              size={56}
              label={user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              style={styles.headerAvatar}
              labelStyle={styles.headerAvatarLabel}
            />
          )}
        </View>

        {/* Quick Stats in Header */}
        <View style={styles.headerStats}>
          <View style={styles.headerStatItem}>
            <Text style={styles.headerStatValue}>{dashboardData.stats.activeProjects}</Text>
            <Text style={styles.headerStatLabel}>Active</Text>
          </View>
          <View style={styles.headerStatDivider} />
          <View style={styles.headerStatItem}>
            <Text style={styles.headerStatValue}>{dashboardData.stats.proposals}</Text>
            <Text style={styles.headerStatLabel}>Proposals</Text>
          </View>
          <View style={styles.headerStatDivider} />
          <View style={styles.headerStatItem}>
            <Text style={styles.headerStatValue}>{dashboardData.stats.messages}</Text>
            <Text style={styles.headerStatLabel}>Messages</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Trending Requests - First Section */}
        <View style={styles.requestsSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <MaterialCommunityIcons name="fire" size={20} color={colors.primary.main} />
              <Text style={styles.sectionTitle}>Trending Requests</Text>
            </View>
            <Chip
              style={styles.countChip}
              textStyle={styles.countChipText}
            >
              {dashboardData.trendingRequests.length}
            </Chip>
          </View>

          {dashboardData.trendingRequests.length === 0 ? (
            <Card style={styles.emptyCard} mode="outlined">
              <Card.Content style={styles.emptyCardContent}>
                <MaterialCommunityIcons
                  name="file-document-outline"
                  size={56}
                  color={colors.text.secondary}
                />
                <Text style={styles.emptyText}>No requests available</Text>
                <Text style={styles.emptySubtext}>
                  Check back later for new opportunities
                </Text>
              </Card.Content>
            </Card>
          ) : (
            dashboardData.trendingRequests.map((request, index) => {
              // Use artisan-related image based on category
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
                <Card.Content>
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
                    <Text style={styles.requestDescription} numberOfLines={2}>
                      {request.description}
                    </Text>
                  )}

                  <View style={styles.requestFooter}>
                    <View style={styles.requestInfoRow}>
                      <MaterialCommunityIcons
                        name="currency-usd"
                        size={16}
                        color={colors.text.secondary}
                      />
                      <Text style={styles.requestInfo}>
                        {request.budget?.min > 0
                          ? `$${request.budget.min}-${request.budget.max}`
                          : 'Budget flexible'}
                      </Text>
                    </View>
                    <View style={styles.requestInfoRow}>
                      <MaterialCommunityIcons
                        name="file-document-outline"
                        size={16}
                        color={colors.text.secondary}
                      />
                      <Text style={styles.requestInfo}>
                        {request.proposals || 0} proposals
                      </Text>
                    </View>
                    <View style={styles.requestInfoRow}>
                      <MaterialCommunityIcons
                        name="eye"
                        size={16}
                        color={colors.text.secondary}
                      />
                      <Text style={styles.requestInfo}>
                        {request.views || 0} views
                      </Text>
                    </View>
                  </View>

                  <View style={styles.requestMeta}>
                    {request.user && (
                      <View style={styles.requestUser}>
                        {request.user.avatar || request.user.profilePicture ? (
                          <Avatar.Image
                            size={24}
                            source={{ uri: request.user.avatar || request.user.profilePicture }}
                          />
                        ) : (
                          <Avatar.Text
                            size={24}
                            label={request.user.firstName?.[0]?.toUpperCase() || 'U'}
                            style={{ backgroundColor: colors.primary.main }}
                          />
                        )}
                        <Text style={styles.requestUserName}>
                          {request.user.firstName || 'User'}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.requestTime}>
                      {formatTimeAgo(request.createdAt)}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
              );
            })
          )}

          {dashboardData.trendingRequests.length > 0 && (
            <Button
              mode="contained"
              onPress={() => {}}
              style={styles.viewAllButton}
              buttonColor={colors.primary.main}
              contentStyle={styles.viewAllButtonContent}
              labelStyle={styles.viewAllButtonLabel}
              icon="arrow-right"
            >
              View All Requests
            </Button>
          )}
        </View>

        {/* Enhanced Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.sectionHeaderWithToggle}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <TouchableOpacity
              onPress={() => setShowOverview(!showOverview)}
              style={styles.toggleButton}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={showOverview ? 'chevron-up' : 'chevron-down'}
                size={24}
                color={colors.primary.main}
              />
            </TouchableOpacity>
          </View>
          {showOverview && (
            <View style={styles.statsGrid}>
              <StatCard
                icon="briefcase-outline"
                value={dashboardData.stats.activeProjects}
                label="Active Projects"
                color={colors.primary.main}
              />
              <StatCard
                icon="file-document-multiple-outline"
                value={dashboardData.stats.proposals}
                label="Proposals"
                color={colors.primary.main}
              />
              <StatCard
                icon="check-circle-outline"
                value={dashboardData.stats.completedProjects}
                label="Completed"
                color={colors.primary.main}
              />
              <StatCard
                icon="message-text-outline"
                value={dashboardData.stats.messages}
                label="Messages"
                color={colors.primary.main}
              />
            </View>
          )}
        </View>

        {/* Quick Actions - Moved to End */}
        <View style={styles.quickActionsSection}>
          <View style={styles.sectionHeaderWithToggle}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <TouchableOpacity
              onPress={() => setShowQuickActions(!showQuickActions)}
              style={styles.toggleButton}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={showQuickActions ? 'chevron-up' : 'chevron-down'}
                size={24}
                color={colors.primary.main}
              />
            </TouchableOpacity>
          </View>
          {showQuickActions && (
            <View style={styles.quickActionsGrid}>
              <QuickActionCard
                icon="file-document-edit-outline"
                label="Create Request"
                subtitle="Post a new project"
                color={colors.primary.main}
                onPress={() => onNavigateToCreateRequest?.()}
              />
              <QuickActionCard
                icon="hammer-wrench"
                label="Create Skill"
                subtitle="Offer your service"
                color={colors.primary.main}
                onPress={() => onNavigateToCreateSkill?.()}
              />
              <QuickActionCard
                icon="file-document-multiple-outline"
                label="My Proposals"
                subtitle="View submissions"
                color={colors.primary.main}
                onPress={() => {
                  onNavigateToRequestDetail?.(request.id);
                }}
              />
              <QuickActionCard
                icon="account-group-outline"
                label="Find Artisans"
                subtitle="Explore profiles"
                color={colors.primary.main}
                onPress={() => {
                  onNavigateToRequestDetail?.(request.id);
                }}
              />
            </View>
          )}
        </View>

        {/* Featured Requests - Moved to End */}
        {dashboardData.featuredRequests.length > 0 && (
          <View style={styles.featuredSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <MaterialCommunityIcons name="star" size={20} color={colors.primary.main} />
                <Text style={styles.sectionTitle}>Featured Opportunities</Text>
              </View>
              <Chip
                style={styles.featuredChip}
                textStyle={styles.featuredChipText}
              >
                Urgent
              </Chip>
            </View>

            {dashboardData.featuredRequests.map((request, index) => {
              // Use artisan-related image based on category
              const imageUrl = getArtisanImage(request.category, index);
              
              return (
              <Card
                key={request.id}
                style={[styles.featuredCard, { marginTop: index === 0 ? 0 : 12 }]}
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
                <Card.Content>
                  <View style={styles.featuredHeader}>
                    <View style={styles.featuredTitleContainer}>
                      <Badge style={styles.featuredBadge} size={8} />
                      <Text style={styles.featuredTitle} numberOfLines={2}>
                        {request.title}
                      </Text>
                    </View>
                    <Chip
                      style={[
                        styles.urgencyChip,
                        styles.urgencyChipOutlined,
                      ]}
                      textStyle={styles.urgencyChipText}
                      mode="outlined"
                    >
                      {request.urgency || 'medium'}
                    </Chip>
                  </View>

                  <Text style={styles.featuredCategory}>{request.category}</Text>

                  {request.description && (
                    <Text style={styles.featuredDescription} numberOfLines={2}>
                      {request.description}
                    </Text>
                  )}

                  <View style={styles.featuredFooter}>
                    <View style={styles.featuredInfo}>
                      <MaterialCommunityIcons
                        name="currency-usd"
                        size={16}
                        color={colors.primary.main}
                      />
                      <Text style={styles.featuredInfoText}>
                        {request.budget?.min > 0
                          ? `$${request.budget.min}-${request.budget.max}`
                          : 'Budget flexible'}
                      </Text>
                    </View>
                    <View style={styles.featuredInfo}>
                      <MaterialCommunityIcons
                        name="file-document-outline"
                        size={16}
                        color={colors.text.secondary}
                      />
                      <Text style={styles.featuredInfoText}>
                        {request.proposals || 0} proposals
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
              );
            })}
          </View>
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
    marginTop: 12,
    color: colors.text.secondary,
    fontSize: 14,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  headerGreeting: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  headerAvatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  headerAvatarLabel: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  headerStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerStatLabel: {
    fontSize: 11,
    color: '#FFFFFF',
    opacity: 0.8,
    fontWeight: '500',
  },
  headerStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 8,
  },
  content: {
    padding: 16,
    marginTop: -8,
  },
  statsSection: {
    marginBottom: 24,
  },
  sectionHeaderWithToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  toggleButton: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: colors.primary.main + '15',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  statCard: {
    width: (width - 44) / 2,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  statCardContent: {
    padding: 12,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    backgroundColor: colors.primary.main + '15',
    borderRadius: 8,
    padding: 6,
  },
  trendBadge: {
    backgroundColor: colors.primary.main + '15',
    borderRadius: 8,
    padding: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  quickActionsSection: {
    marginBottom: 24,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  quickActionCard: {
    width: (width - 44) / 2,
  },
  quickActionCardInner: {
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  quickActionContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    minHeight: 90,
  },
  quickActionLabel: {
    color: colors.text.primary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    color: colors.text.secondary,
    fontSize: 10,
    marginTop: 3,
    textAlign: 'center',
  },
  featuredSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  featuredChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.primary.main,
    height: 24,
  },
  featuredChipText: {
    color: colors.primary.main,
    fontSize: 11,
    fontWeight: '600',
  },
  featuredCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.primary.main,
    overflow: 'hidden',
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  featuredTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginRight: 8,
    gap: 8,
  },
  featuredBadge: {
    backgroundColor: colors.primary.main,
    marginTop: 4,
  },
  featuredTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  featuredCategory: {
    fontSize: 12,
    color: colors.primary.main,
    fontWeight: '600',
    marginBottom: 8,
  },
  featuredDescription: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  featuredInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featuredInfoText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  requestsSection: {
    marginBottom: 24,
  },
  countChip: {
    backgroundColor: colors.primary.main,
    height: 24,
  },
  countChipText: {
    color: '#FFFFFF',
    fontSize: 12,
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
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  requestCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  requestImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#F0F0F0',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  requestTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  requestCategory: {
    fontSize: 12,
    color: colors.primary.main,
    fontWeight: '500',
  },
  urgencyChip: {
    height: 24,
    paddingHorizontal: 8,
  },
  urgencyChipOutlined: {
    borderWidth: 1,
    borderColor: colors.primary.main,
    backgroundColor: '#FFFFFF',
  },
  urgencyChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary.main,
  },
  requestDescription: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  requestInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  requestInfo: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  requestMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requestUserName: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  requestTime: {
    fontSize: 11,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  viewAllButton: {
    marginTop: 8,
    borderRadius: 12,
    elevation: 0,
  },
  viewAllButtonContent: {
    paddingVertical: 8,
  },
  viewAllButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default DashboardScreen;
