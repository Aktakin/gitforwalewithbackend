import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  RefreshControl, 
  TouchableOpacity, 
  Animated, 
  Dimensions, 
  Image,
  Platform,
} from 'react-native';
import { Text, Card, Button, ActivityIndicator, Chip, Avatar, Badge } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/supabase';
import { transformRequest, formatTimeAgo } from '../utils/dataTransform';
import { colors } from '../theme/colors';

const { width, height } = Dimensions.get('window');

// Color palette matching web app theme - strictly blue tones
const palette = {
  primary: '#1E90FF',
  primaryLight: '#5BB3FF',
  primaryDark: '#0066CC',
  secondary: '#64B5F6',
  secondaryLight: '#90CAF9',
  info: '#0288d1',
  infoLight: '#4FC3F7',
  dark: '#1a1a2e',
  darkMuted: '#16213e',
  card: 'rgba(255, 255, 255, 0.98)',
  cardGlass: 'rgba(255, 255, 255, 0.92)',
  text: 'rgba(0, 0, 0, 0.87)',
  textMuted: 'rgba(0, 0, 0, 0.6)',
  textLight: 'rgba(0, 0, 0, 0.38)',
  border: 'rgba(0, 0, 0, 0.08)',
  background: '#f8fafc',
  backgroundDark: '#f1f5f9',
};


// Get artisan-related image based on category
const getArtisanImage = (category, index) => {
  const categoryMap = {
    'Woodworking & Carpentry': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop',
    'Pottery & Ceramics': 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=250&fit=crop',
    'Painting & Fine Arts': 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=250&fit=crop',
    'Jewelry Making': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=250&fit=crop',
    'Textile & Fiber Arts': 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&h=250&fit=crop',
    'Metalworking & Blacksmithing': 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=250&fit=crop',
    'Glassblowing & Glasswork': 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=400&h=250&fit=crop',
    'Leatherworking': 'https://images.unsplash.com/photo-1473188588951-666fce8e7c68?w=400&h=250&fit=crop',
  };
  
  return categoryMap[category] || `https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400&h=250&fit=crop&sig=${index}`;
};

const DashboardScreen = ({ onNavigateToCreateRequest, onNavigateToCreateSkill, onNavigateToRequestDetail, onNavigateToClientDashboard, onNavigateToProviderDashboard, refreshKey }) => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const dotAnim1 = useRef(new Animated.Value(0.3)).current;
  const dotAnim2 = useRef(new Animated.Value(0.3)).current;
  const dotAnim3 = useRef(new Animated.Value(0.3)).current;
  
  // Start animations
  useEffect(() => {
    // Main entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for highlights
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Shimmer animation
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    // Float animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Loading dots animation
    const createDotAnimation = (anim, delay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 600,
            delay: delay,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
    };
    createDotAnimation(dotAnim1, 0).start();
    createDotAnimation(dotAnim2, 200).start();
    createDotAnimation(dotAnim3, 400).start();
  }, [loading]);


  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getGreetingIcon = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'weather-sunny';
    if (hour < 18) return 'weather-partly-cloudy';
    return 'weather-night';
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const dbRequests = await db.requests.getAll({
        status: 'open',
        isPublic: true,
        pageSize: 30,
      });

      const allRequests = (dbRequests || [])
        .map(transformRequest)
        .filter(req => req !== null);

      const sortedRequests = allRequests.sort((a, b) => {
        const urgencyOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        const aUrgency = urgencyOrder[a.urgency] || 0;
        const bUrgency = urgencyOrder[b.urgency] || 0;
        if (bUrgency !== aUrgency) return bUrgency - aUrgency;
        const aDate = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
        const bDate = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
        return bDate - aDate;
      });

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

      const featured = sortedRequests
        .filter(r => r.urgency === 'urgent' || r.urgency === 'high')
        .slice(0, 5);

      let userProposals = 0;
      let totalEarnings = 0;
      let rating = 0;
      let messageCount = 0;
      
      if (user?.id) {
        try {
          const proposals = await db.proposals.getUserProposals(user.id);
          userProposals = proposals?.length || 0;
          
          const acceptedProposals = proposals?.filter(p => p.status === 'accepted') || [];
          totalEarnings = acceptedProposals.reduce((sum, p) => sum + (p.proposed_price || 0), 0);
          
          if (userProposals > 0) {
            const acceptanceRate = acceptedProposals.length / userProposals;
            rating = (acceptanceRate * 5).toFixed(1);
          }
          
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
        featuredRequests: featured.length > 0 ? featured : sortedRequests.slice(0, 5),
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData({
        stats: { activeProjects: 0, completedProjects: 0, totalEarnings: 0, rating: 0, messages: 0, proposals: 0 },
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

  useEffect(() => {
    if (refreshKey !== undefined && refreshKey > 0) {
      fetchDashboardData();
    }
  }, [refreshKey]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const getUserName = () => {
    return profile?.first_name || user?.user_metadata?.firstName || user?.email?.split('@')[0] || 'Artisan';
  };

  // Circular Progress Ring Component
  const ProgressRing = ({ progress, size = 60, strokeWidth = 6, color }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 1500,
        useNativeDriver: false,
      }).start();
    }, [progress]);

    return (
      <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ 
          position: 'absolute', 
          width: size, 
          height: size, 
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: color + '20',
        }} />
        <View style={{ 
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: color,
          borderTopColor: 'transparent',
          borderRightColor: progress > 0.25 ? color : 'transparent',
          borderBottomColor: progress > 0.5 ? color : 'transparent',
          borderLeftColor: progress > 0.75 ? color : 'transparent',
          transform: [{ rotate: '-90deg' }],
        }} />
      </View>
    );
  };

  // Enhanced Quick Action with Ripple Effect
  const QuickActionButton = ({ icon, label, gradient, onPress, badge }) => {
    const pressAnim = useRef(new Animated.Value(1)).current;
    const rippleAnim = useRef(new Animated.Value(0)).current;

    const handlePressIn = () => {
      Animated.parallel([
        Animated.spring(pressAnim, {
          toValue: 0.95,
          useNativeDriver: true,
        }),
        Animated.timing(rippleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    };

    const handlePressOut = () => {
      Animated.parallel([
        Animated.spring(pressAnim, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.timing(rippleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    };

    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Animated.View style={[styles.quickActionBtn, { transform: [{ scale: pressAnim }] }]}>
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.quickActionGradient}
          >
            <View style={styles.quickActionIconWrapper}>
              <MaterialCommunityIcons name={icon} size={28} color="#FFFFFF" />
              {badge > 0 && (
                <View style={styles.quickActionBadge}>
                  <Text style={styles.quickActionBadgeText}>{badge}</Text>
                </View>
              )}
            </View>
            <Text style={styles.quickActionLabel}>{label}</Text>
            <View style={styles.quickActionArrow}>
              <MaterialCommunityIcons name="arrow-right" size={16} color="rgba(255,255,255,0.9)" />
            </View>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  // Get category profession heading (matching web app style)
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

  // Featured Card - Web App Style (Clean white cards)
  const FeaturedCard = ({ request, index }) => {
    const cardScale = useRef(new Animated.Value(0.9)).current;
    const cardOpacity = useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
      Animated.parallel([
        Animated.spring(cardScale, {
          toValue: 1,
          tension: 50,
          friction: 8,
          delay: index * 100,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 500,
          delay: index * 100,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    const getUrgencyStyle = (urgency) => {
      switch (urgency) {
        case 'urgent':
          return { bg: '#e3f2fd', color: '#0066CC', label: 'Urgent' };
        case 'high':
          return { bg: '#e3f2fd', color: '#1E90FF', label: 'High Priority' };
        case 'medium':
          return { bg: '#e8f4fc', color: '#5BB3FF', label: 'Medium' };
        default:
          return { bg: '#f0f7ff', color: '#64B5F6', label: 'Low' };
      }
    };

    const urgencyStyle = getUrgencyStyle(request.urgency);

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onNavigateToRequestDetail?.(request.id)}
      >
        <Animated.View style={[
          styles.featuredCard, 
          { 
            transform: [{ scale: cardScale }],
            opacity: cardOpacity,
          }
        ]}>
          <View style={styles.featuredCardContent}>
            {/* Header Row */}
            <View style={styles.featuredHeaderRow}>
              <View style={styles.featuredHeaderLeft}>
                {/* Category Profession Heading */}
                <Text style={styles.featuredProfession}>
                  {getCategoryProfession(request.category)} Needed!
                </Text>
                {/* Original Title */}
                <Text style={styles.featuredTitle} numberOfLines={2}>
                  {request.title}
                </Text>
              </View>
              <TouchableOpacity style={styles.bookmarkBtn}>
                <MaterialCommunityIcons name="bookmark-outline" size={22} color={palette.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Tags/Chips Row */}
            <View style={styles.featuredChipsRow}>
              <View style={[styles.featuredChip, { backgroundColor: palette.primary + '15' }]}>
                <MaterialCommunityIcons name="tag" size={12} color={palette.primary} />
                <Text style={[styles.featuredChipText, { color: palette.primary }]}>{request.category}</Text>
              </View>
              <View style={[styles.featuredChip, { backgroundColor: urgencyStyle.bg }]}>
                <MaterialCommunityIcons name="clock-outline" size={12} color={urgencyStyle.color} />
                <Text style={[styles.featuredChipText, { color: urgencyStyle.color }]}>{urgencyStyle.label}</Text>
              </View>
            </View>

            {/* Description Preview */}
            {request.description && (
              <Text style={styles.featuredDescription} numberOfLines={2}>
                {request.description}
              </Text>
            )}

            {/* Info Grid */}
            <View style={styles.featuredInfoGrid}>
              <View style={styles.featuredInfoItem}>
                <MaterialCommunityIcons name="cash" size={18} color={palette.primary} />
                <View>
                  <Text style={styles.featuredInfoLabel}>Budget</Text>
                  <Text style={styles.featuredInfoValue}>
                    {request.budget?.min > 0 ? `$${request.budget.min} - $${request.budget.max}` : 'Flexible'}
                  </Text>
                </View>
              </View>
              <View style={styles.featuredInfoItem}>
                <MaterialCommunityIcons name="file-document-multiple" size={18} color={palette.primaryLight} />
                <View>
                  <Text style={styles.featuredInfoLabel}>Proposals</Text>
                  <Text style={styles.featuredInfoValue}>{request.proposals || 0} received</Text>
                </View>
              </View>
              <View style={styles.featuredInfoItem}>
                <MaterialCommunityIcons name="calendar-clock" size={18} color={palette.info} />
                <View>
                  <Text style={styles.featuredInfoLabel}>Posted</Text>
                  <Text style={styles.featuredInfoValue}>{formatTimeAgo(request.createdAt)}</Text>
                </View>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.featuredDivider} />

            {/* Footer Row */}
            <View style={styles.featuredFooterRow}>
              <View style={styles.featuredUserInfo}>
                <View style={styles.featuredUserAvatar}>
                  <Text style={styles.featuredUserAvatarText}>
                    {request.user?.firstName?.[0]?.toUpperCase() || 'U'}
                  </Text>
                </View>
                <View>
                  <Text style={styles.featuredUserName}>{request.user?.firstName || 'Anonymous'}</Text>
                  <View style={styles.featuredUserRating}>
                    <MaterialCommunityIcons name="star" size={12} color="#ff9800" />
                    <Text style={styles.featuredUserRatingText}>Verified Client</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.featuredViewBtn}
                onPress={() => onNavigateToRequestDetail?.(request.id)}
              >
                <Text style={styles.featuredViewBtnText}>View Details</Text>
                <MaterialCommunityIcons name="arrow-right" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  // Compact Trending Card
  const TrendingCard = ({ request, index }) => {
    const imageUrl = getArtisanImage(request.category, index);
    const cardAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 80,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View style={{ opacity: cardAnim, transform: [{ translateX: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }] }}>
        <TouchableOpacity
          style={styles.trendingCard}
          activeOpacity={0.85}
          onPress={() => onNavigateToRequestDetail?.(request.id)}
        >
          <Image source={{ uri: imageUrl }} style={styles.trendingImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.trendingImageOverlay}
          />
          <View style={styles.trendingContent}>
            <View style={styles.trendingTopRow}>
              <View style={styles.trendingCategoryBadge}>
                <Text style={styles.trendingCategoryText} numberOfLines={1}>{request.category?.split(' ')[0]}</Text>
              </View>
              {request.urgency === 'urgent' && (
                <View style={styles.trendingUrgentBadge}>
                  <MaterialCommunityIcons name="lightning-bolt" size={10} color="#FFF" />
                </View>
              )}
            </View>
            <Text style={styles.trendingTitle} numberOfLines={2}>{request.title}</Text>
            <View style={styles.trendingFooter}>
              <Text style={styles.trendingBudget}>
                {request.budget?.min > 0 ? `$${request.budget.min}` : 'Open'}
              </Text>
              <View style={styles.trendingTimeRow}>
                <MaterialCommunityIcons name="clock-outline" size={12} color={palette.textMuted} />
                <Text style={styles.trendingTime}>{formatTimeAgo(request.createdAt)}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Loading State with Skeleton
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#1565C0', '#0D47A1', '#1565C0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.loadingGradient}
        >
          {/* Decorative Background Elements */}
          <View style={styles.loadingDecoration}>
            <Animated.View style={[styles.loadingShape1, { transform: [{ scale: pulseAnim }] }]} />
            <Animated.View style={[styles.loadingShape2, { transform: [{ scale: Animated.multiply(pulseAnim, 0.8) }] }]} />
            <Animated.View style={[styles.loadingShape3, { 
              transform: [{ 
                rotate: pulseAnim.interpolate({
                  inputRange: [0.95, 1.05],
                  outputRange: ['0deg', '360deg']
                })
              }] 
            }]} />
          </View>

          {/* Main Content */}
          <Animated.View style={[styles.loadingContent, { opacity: fadeAnim }]}>
            <Animated.View style={[styles.loadingIconWrapper, { transform: [{ scale: pulseAnim }] }]}>
              <View style={styles.loadingIconContainer}>
                <MaterialCommunityIcons name="hammer-wrench" size={56} color="#FFFFFF" />
              </View>
              <Animated.View style={[styles.loadingIconGlow, { opacity: pulseAnim }]} />
            </Animated.View>
            
            <Text style={styles.loadingTitle}>SkillBridge</Text>
            <Text style={styles.loadingText}>Preparing your dashboard...</Text>
            
            {/* Enhanced Loading Dots */}
            <View style={styles.loadingDots}>
              <Animated.View 
                style={[
                  styles.loadingDot,
                  { 
                    opacity: dotAnim1,
                    transform: [{ scale: dotAnim1 }]
                  }
                ]} 
              />
              <Animated.View 
                style={[
                  styles.loadingDot,
                  { 
                    opacity: dotAnim2,
                    transform: [{ scale: dotAnim2 }]
                  }
                ]} 
              />
              <Animated.View 
                style={[
                  styles.loadingDot,
                  { 
                    opacity: dotAnim3,
                    transform: [{ scale: dotAnim3 }]
                  }
                ]} 
              />
            </View>
          </Animated.View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={palette.primary}
            colors={[palette.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Header */}
        <Animated.View style={[styles.heroContainer, { opacity: fadeAnim }]}>
          <LinearGradient
            colors={['#1565C0', '#0D47A1', '#1565C0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            {/* Animated Background Shapes */}
            <View style={styles.heroDecoration}>
              <Animated.View style={[styles.decorShape1, { transform: [{ translateY: floatAnim }] }]} />
              <Animated.View style={[styles.decorShape2, { transform: [{ translateY: Animated.multiply(floatAnim, -1) }] }]} />
              <Animated.View style={[styles.decorShape3, { transform: [{ scale: pulseAnim }] }]} />
              <View style={styles.decorLine1} />
              <View style={styles.decorLine2} />
            </View>

            {/* Header Content */}
            <View style={styles.heroContent}>
              {/* Top Row */}
              <View style={styles.heroTopRow}>
                <View style={styles.heroGreeting}>
                  <View style={styles.greetingRow}>
                    <MaterialCommunityIcons name={getGreetingIcon()} size={20} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.heroGreetingText}>{getGreeting()}</Text>
                  </View>
                  <Text style={styles.heroName}>{getUserName()}</Text>
                  <Text style={styles.heroSubtitle}>Lets create something amazing today</Text>
                </View>
                
                <TouchableOpacity style={styles.heroAvatarContainer}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                    style={styles.avatarGlow}
                  >
                    {user?.profilePicture || profile?.profile_picture ? (
                      <Image 
                        source={{ uri: user?.profilePicture || profile?.profile_picture }} 
                        style={styles.heroAvatar}
                      />
                    ) : (
                      <View style={styles.heroAvatarPlaceholder}>
                        <Text style={styles.heroAvatarText}>
                          {getUserName()[0]?.toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </LinearGradient>
                  <View style={styles.onlineIndicator} />
                </TouchableOpacity>
              </View>

              {/* Quick Stats Pills */}
              <View style={styles.quickStatsPills}>
                <View style={styles.quickStatPill}>
                  <MaterialCommunityIcons name="briefcase-check" size={16} color="#4caf50" />
                  <Text style={styles.quickStatPillText}>{dashboardData.stats.activeProjects} Active</Text>
                </View>
                <View style={styles.quickStatPill}>
                  <MaterialCommunityIcons name="file-document-edit" size={16} color="#ba68c8" />
                  <Text style={styles.quickStatPillText}>{dashboardData.stats.proposals} Proposals</Text>
                </View>
                <View style={styles.quickStatPill}>
                  <MaterialCommunityIcons name="message-text" size={16} color="#ff9800" />
                  <Text style={styles.quickStatPillText}>{dashboardData.stats.messages} Chats</Text>
                </View>
              </View>

              {/* Rating Display */}
              {dashboardData.stats.rating > 0 && (
                <View style={styles.ratingContainer}>
                  <View style={styles.ratingContent}>
                    <MaterialCommunityIcons name="star" size={20} color="#ffd700" />
                    <Text style={styles.ratingValue}>{dashboardData.stats.rating.toFixed(1)}</Text>
                    <Text style={styles.ratingLabel}>Rating</Text>
                  </View>
                </View>
              )}

              {/* Dashboard Buttons */}
              {(dashboardData.stats.rating > 0) && (
              <View style={styles.dashboardButtonsContainer}>
                <TouchableOpacity 
                  style={styles.dashboardButton}
                  onPress={() => {
                    // Navigate to Client Dashboard - will be handled by parent
                    if (onNavigateToClientDashboard) {
                      onNavigateToClientDashboard();
                    }
                  }}
                >
                  <LinearGradient
                    colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.15)']}
                    style={styles.dashboardButtonGradient}
                  >
                    <MaterialCommunityIcons name="briefcase-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.dashboardButtonText}>Client Dashboard</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.dashboardButton}
                  onPress={() => {
                    // Navigate to Provider Dashboard - will be handled by parent
                    if (onNavigateToProviderDashboard) {
                      onNavigateToProviderDashboard();
                    }
                  }}
                >
                  <LinearGradient
                    colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.15)']}
                    style={styles.dashboardButtonGradient}
                  >
                    <MaterialCommunityIcons name="account-tie-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.dashboardButtonText}>Provider Dashboard</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              )}
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Quick Actions Grid */}
        <Animated.View 
          style={[
            styles.quickActionsContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.quickActionsCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.sectionIconBg}>
                  <MaterialCommunityIcons name="lightning-bolt" size={20} color={palette.primary} />
                </View>
                <View>
                  <Text style={styles.sectionTitle}>Quick Actions</Text>
                  <Text style={styles.sectionSubtitle}>Get started quickly</Text>
                </View>
              </View>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickActionsScroll}
            >
              <QuickActionButton
                icon="plus-circle-outline"
                label="Requests"
                gradient={['#1565C0', '#0D47A1']}
                onPress={() => onNavigateToCreateRequest?.()}
              />
              <QuickActionButton
                icon="hammer-wrench"
                label="Add Skill"
                gradient={['#1565C0', '#0D47A1']}
                onPress={() => onNavigateToCreateSkill?.()}
              />
              <QuickActionButton
                icon="compass-outline"
                label="Explore"
                gradient={['#1565C0', '#0D47A1']}
                onPress={() => {}}
              />
            </ScrollView>
          </View>
        </Animated.View>

        {/* Featured Opportunities */}
        {dashboardData.featuredRequests.length > 0 && (
          <Animated.View 
            style={[
              styles.featuredSection,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={[styles.sectionIconBg, { backgroundColor: '#ff980015' }]}>
                  <MaterialCommunityIcons name="star-shooting" size={18} color="#ff9800" />
                </View>
                <View>
                  <Text style={styles.sectionTitle}>Hot Opportunities</Text>
                  <Text style={styles.sectionSubtitle}>{dashboardData.featuredRequests.length} high-priority requests</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.viewAllSmall}>
                <Text style={styles.viewAllSmallText}>See all</Text>
                <MaterialCommunityIcons name="chevron-right" size={16} color={palette.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.featuredVerticalContainer}>
              {dashboardData.featuredRequests.map((request, index) => (
                <FeaturedCard key={request.id} request={request} index={index} />
              ))}
            </View>

            {/* View All Button */}
            <TouchableOpacity style={styles.viewAllButton}>
              <LinearGradient
                colors={['#1565C0', '#0D47A1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.viewAllGradient}
              >
                <Text style={styles.viewAllText}>View All Opportunities</Text>
                <View style={styles.viewAllArrow}>
                  <MaterialCommunityIcons name="arrow-right" size={18} color="#FFF" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  
  // Loading State
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  loadingDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  loadingShape1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: -100,
    right: -100,
  },
  loadingShape2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.03)',
    bottom: -80,
    left: -80,
  },
  loadingShape3: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.04)',
    top: '30%',
    left: '20%',
  },
  loadingContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  loadingIconWrapper: {
    position: 'relative',
    marginBottom: 32,
  },
  loadingIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
    ...Platform.select({
      ios: {
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  loadingIconGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.15)',
    top: -10,
    left: -10,
    zIndex: -1,
  },
  loadingTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 32,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  loadingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  // Hero Header
  heroContainer: {
    marginBottom: 40,
  },
  heroGradient: {
    paddingTop: 60,
    paddingBottom: 28,
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  heroDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorShape1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -60,
    right: -60,
  },
  decorShape2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -30,
    left: -50,
  },
  decorShape3: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: 120,
    right: 60,
  },
  decorLine1: {
    position: 'absolute',
    width: 1,
    height: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: 40,
    left: '30%',
    transform: [{ rotate: '45deg' }],
  },
  decorLine2: {
    position: 'absolute',
    width: 1,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.08)',
    bottom: 20,
    right: '25%',
    transform: [{ rotate: '-30deg' }],
  },
  heroContent: {
    zIndex: 1,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  heroGreeting: {
    flex: 1,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  heroGreetingText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  heroName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  heroAvatarContainer: {
    position: 'relative',
  },
  avatarGlow: {
    padding: 4,
    borderRadius: 35,
  },
  heroAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  heroAvatarPlaceholder: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  heroAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4caf50',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  quickStatsPills: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  quickStatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  quickStatPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  ratingContainer: {
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  ratingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ratingValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  ratingLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  dashboardButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  dashboardButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  dashboardButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dashboardButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Section Styling
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionIconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: palette.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.text,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: palette.textMuted,
    marginTop: 2,
  },
  viewAllSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllSmallText: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.primary,
  },

  // Quick Actions
  quickActionsContainer: {
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  quickActionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  quickActionsScroll: {
    paddingHorizontal: 4,
    gap: 16,
    paddingTop: 8,
  },
  quickActionBtn: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    ...Platform.select({
      ios: {
        shadowColor: '#1565C0',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  quickActionGradient: {
    paddingVertical: 24,
    paddingHorizontal: 26,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 130,
    gap: 14,
  },
  quickActionIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  quickActionBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#ff4444',
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    paddingHorizontal: 4,
  },
  quickActionBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  quickActionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.4,
  },
  quickActionArrow: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
  },

  // Featured Section
  featuredSection: {
    marginBottom: 40,
  },
  featuredScroll: {
    paddingHorizontal: 20,
  },
  featuredVerticalContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  featuredCard: {
    width: '100%',
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
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
  featuredTopBar: {
    height: 4,
    width: '100%',
  },
  featuredCardContent: {
    padding: 18,
  },
  featuredHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  featuredHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  featuredProfession: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.primary,
    marginBottom: 4,
  },
  featuredTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: palette.text,
    lineHeight: 22,
  },
  bookmarkBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  featuredChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  featuredChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  featuredDescription: {
    fontSize: 13,
    color: palette.textMuted,
    lineHeight: 20,
    marginBottom: 14,
  },
  featuredInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 14,
  },
  featuredInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: '45%',
  },
  featuredInfoLabel: {
    fontSize: 11,
    color: palette.textMuted,
  },
  featuredInfoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.text,
  },
  featuredDivider: {
    height: 1,
    backgroundColor: palette.border,
    marginBottom: 14,
  },
  featuredFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  featuredUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featuredUserAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: palette.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredUserAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  featuredUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.text,
  },
  featuredUserRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featuredUserRatingText: {
    fontSize: 11,
    color: palette.textMuted,
  },
  featuredViewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  featuredViewBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Trending Section
  trendingSection: {
    marginBottom: 24,
  },
  trendingCount: {
    backgroundColor: palette.danger,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  trendingCountText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  trendingGrid: {
    paddingHorizontal: 20,
    gap: 12,
  },
  trendingCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: palette.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  trendingImage: {
    width: 110,
    height: 110,
  },
  trendingImageOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 110,
    height: 110,
  },
  trendingContent: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  trendingTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trendingCategoryBadge: {
    backgroundColor: palette.primary + '12',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trendingCategoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: palette.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  trendingUrgentBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: palette.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.text,
    lineHeight: 20,
  },
  trendingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendingBudget: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.success,
  },
  trendingTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendingTime: {
    fontSize: 11,
    color: palette.textMuted,
  },

  // Empty State
  emptyState: {
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: 'hidden',
  },
  emptyStateGradient: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(30, 144, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: palette.text,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: palette.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  emptyStateBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  emptyStateBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  emptyStateBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // View All Button
  viewAllButton: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 18,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: palette.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  viewAllGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 18,
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  viewAllArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DashboardScreen;
