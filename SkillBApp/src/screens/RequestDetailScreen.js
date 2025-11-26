import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Alert, Share } from 'react-native';
import { Text, Card, ActivityIndicator, Chip, Avatar, Button, Divider, List, IconButton, Badge } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/supabase';
import { transformRequest, transformProposal, formatTimeAgo, formatDeadline } from '../utils/dataTransform';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

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


const RequestDetailScreen = ({ route, navigation, onClose }) => {
  const { requestId } = route?.params || {};
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const fetchRequestDetails = async (isRetry = false) => {
    if (!requestId) {
      setError('Request ID is required');
      setLoading(false);
      return;
    }

    try {
      if (!isRetry) {
        setLoading(true);
      }
      setError(null);
      
      // Fetch from database
      console.log('Fetching request details from database for ID:', requestId);
      const dbRequest = await db.requests.getById(requestId);
      
      if (!dbRequest) {
        setError('Request not found');
        setLoading(false);
        return;
      }

      // Increment view count (fire and forget - don't block UI)
      db.requests.incrementViews(requestId).catch(err => {
        console.warn('Failed to increment view count:', err);
      });

      const transformedRequest = transformRequest(dbRequest);
      const proposalCount = Array.isArray(dbRequest.proposals) ? dbRequest.proposals.length : (dbRequest.proposal_count || 0);
      const client = transformedRequest.user || transformedRequest.customer;
      
      const formattedRequest = {
        ...transformedRequest,
        proposals: proposalCount,
        client: client ? {
          id: client.id,
          name: client.name || `${client.firstName || ''} ${client.lastName || ''}`.trim() || client.email,
          avatar: client.avatar || client.profilePicture,
          rating: 0,
          reviewsCount: 0,
          jobsPosted: 0,
          memberSince: client.joinedAt || client.created_at,
          verified: client.isVerified || false,
          location: client.location?.city && client.location?.state 
            ? `${client.location.city}, ${client.location.state}`
            : client.location?.country || 'Location not specified',
          description: client.bio || 'No description available'
        } : null,
        deadline: transformedRequest.deadline 
          ? formatDeadline(transformedRequest.deadline)
          : 'No deadline',
        postedDate: transformedRequest.createdAt || new Date(),
        skills: transformedRequest.tags || [],
        views: 0,
        experience: 'Intermediate',
        duration: transformedRequest.deadline 
          ? formatDeadline(transformedRequest.deadline)
          : 'Not specified',
        budget: {
          ...transformedRequest.budget,
          type: transformedRequest.budget?.type || 'fixed'
        },
        attachments: [],
      };
      
      setRequest(formattedRequest);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      console.error('Error fetching request details:', err);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to load request details';
      if (err.message) {
        if (err.message.includes('Network request failed') || err.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else if (err.message.includes('not found') || err.code === 'PGRST116') {
          errorMessage = 'Request not found. It may have been deleted.';
        } else if (err.message.includes('permission') || err.code === '42501') {
          errorMessage = 'You do not have permission to view this request.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!requestId) {
      console.warn('RequestDetailScreen: No requestId provided');
      setError('Request ID is required');
      setLoading(false);
      return;
    }

    console.log('RequestDetailScreen: Fetching request with ID:', requestId);
    fetchRequestDetails();

    // Don't auto-refresh on error - only refresh if successful
    let interval;
    if (request && !error) {
      interval = setInterval(() => {
        fetchRequestDetails(true);
      }, 30000); // Refresh every 30 seconds if successful
    }

    return () => {
      if (interval) clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  useEffect(() => {
    const fetchProposals = async () => {
      if (!request || !user?.id || request.userId !== user.id) {
        return;
      }

      try {
        setLoadingProposals(true);
        const dbProposals = await db.proposals.getByRequest(request.id);
        const transformedProposals = dbProposals
          .map(transformProposal)
          .filter(p => p !== null);

        setProposals(transformedProposals);
      } catch (err) {
        console.error('Error fetching proposals:', err);
      } finally {
        setLoadingProposals(false);
      }
    };

    fetchProposals();

    const interval = setInterval(() => {
      if (request && user?.id && request.userId === user.id) {
        fetchProposals();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [request?.id, request?.userId, user?.id]);

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this request: ${request.title}`,
        title: request.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleSubmitProposal = async () => {
    if (!user?.id) {
      Alert.alert('Login Required', 'Please log in to submit a proposal');
      return;
    }

    try {
      // Check if user already has a proposal for this request
      const userProposals = await db.proposals.getUserProposals(user.id);
      const existingProposal = userProposals.find(p => p.request_id === requestId || p.requestId === requestId);
      
      if (existingProposal) {
        Alert.alert('Already Submitted', 'You have already submitted a proposal for this request.');
        return;
      }
      
      // Navigate to proposal creation screen
      if (navigation?.navigate) {
        navigation.navigate('CreateProposal', { requestId });
      } else {
        // Fallback: show alert
        Alert.alert('Proposal Creation', 'Proposal creation screen will be implemented soon.');
      }
    } catch (error) {
      console.error('Error checking existing proposal:', error);
      // Still allow navigation even if check fails
      if (navigation?.navigate) {
        navigation.navigate('CreateProposal', { requestId });
      } else {
        Alert.alert('Proposal Creation', 'Proposal creation screen will be implemented soon.');
      }
    }
  };

  const handleContactClient = () => {
    if (request.client?.id) {
      if (navigation?.navigate) {
        navigation.navigate('NewMessage', { recipientId: request.client.id });
      } else {
        Alert.alert('Contact Client', 'Messaging feature will be implemented soon.');
      }
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'urgent': return '#f44336';
      case 'high': return '#ff9800';
      case 'medium': return '#2196f3';
      case 'low': return '#4caf50';
      default: return colors.primary.main;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Loading request details...</Text>
      </View>
    );
  }

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setError(null);
    fetchRequestDetails();
  };

  if (error || (!request && !loading)) {
    return (
      <View style={styles.errorContainer}>
        <LinearGradient colors={[colors.primary.main, colors.primary.dark]} style={styles.errorHeader}>
          <View style={styles.errorHeaderContent}>
            <TouchableOpacity onPress={() => navigation?.goBack() || onClose?.()} style={styles.errorBackButton}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.errorHeaderTitle}>Error</Text>
            <View style={{ width: 24 }} />
          </View>
        </LinearGradient>
        <View style={styles.errorContent}>
          <MaterialCommunityIcons name="alert-circle" size={64} color={colors.error?.main || '#f44336'} />
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={styles.errorText}>{error || 'Request not found'}</Text>
          <View style={styles.errorActions}>
            <Button 
              mode="contained" 
              onPress={handleRetry} 
              style={styles.retryButton}
              buttonColor={colors.primary.main}
              icon="refresh"
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Retrying...' : 'Retry'}
            </Button>
            <Button 
              mode="outlined" 
              onPress={() => navigation?.goBack() || onClose?.()} 
              style={styles.backButton}
              textColor={colors.primary.main}
            >
              Go Back
            </Button>
          </View>
          {retryCount > 0 && (
            <Text style={styles.retryCount}>Retry attempts: {retryCount}</Text>
          )}
        </View>
      </View>
    );
  }

  const imageUrl = getArtisanImage(request.category, 0);
  const isOwner = user?.id === request.userId;

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.primary.main, colors.primary.dark]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation?.goBack() || onClose?.()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Request Details</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleBookmark} style={styles.headerIconButton}>
              <MaterialCommunityIcons
                name={isBookmarked ? "bookmark" : "bookmark-outline"}
                size={24}
                color="#FFFFFF"
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={styles.headerIconButton}>
              <MaterialCommunityIcons name="share-variant" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Image */}
        <Image source={{ uri: imageUrl }} style={styles.headerImage} resizeMode="cover" />

        {/* Title and Category */}
        <Card style={styles.card} mode="outlined">
          <Card.Content>
            <Text style={styles.title}>{request.title}</Text>
            <View style={styles.chipRow}>
              <Chip
                icon={() => <MaterialCommunityIcons name="tag" size={16} color={colors.primary.main} />}
                style={styles.categoryChip}
                textStyle={styles.categoryChipText}
              >
                {request.category}
              </Chip>
              {request.location && (
                <Chip
                  icon={() => <MaterialCommunityIcons name="map-marker" size={16} color={colors.text.secondary} />}
                  style={styles.locationChip}
                  textStyle={styles.locationChipText}
                  mode="outlined"
                >
                  {typeof request.location === 'object' 
                    ? `${request.location.city || ''}, ${request.location.state || ''}`.trim() || 'Location not specified'
                    : request.location}
                </Chip>
              )}
              <Chip
                style={[styles.urgencyChip, { borderColor: getUrgencyColor(request.urgency) }]}
                textStyle={[styles.urgencyChipText, { color: getUrgencyColor(request.urgency) }]}
                mode="outlined"
              >
                {request.urgency || 'medium'}
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Key Stats */}
        <Card style={styles.card} mode="outlined">
          <Card.Content>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <MaterialCommunityIcons name="currency-usd" size={24} color={colors.primary.main} />
                <Text style={styles.statValue}>
                  {request.budget?.min && request.budget?.max
                    ? `$${request.budget.min.toLocaleString()}-${request.budget.max.toLocaleString()}`
                    : request.budget?.min 
                      ? `$${request.budget.min.toLocaleString()}`
                      : 'Not specified'}
                </Text>
                <Text style={styles.statLabel}>Budget</Text>
              </View>
              <View style={styles.statBox}>
                <MaterialCommunityIcons name="calendar-clock" size={24} color={colors.primary.main} />
                <Text style={styles.statValue}>{formatDeadline(request.deadline)}</Text>
                <Text style={styles.statLabel}>Deadline</Text>
              </View>
              <View style={styles.statBox}>
                <MaterialCommunityIcons name="account-group" size={24} color={colors.primary.main} />
                <Text style={styles.statValue}>
                  {isOwner ? proposals.length : request.proposals}
                </Text>
                <Text style={styles.statLabel}>Proposals</Text>
              </View>
              <View style={styles.statBox}>
                <MaterialCommunityIcons name="eye" size={24} color={colors.primary.main} />
                <Text style={styles.statValue}>{request.views}</Text>
                <Text style={styles.statLabel}>Views</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {isOwner ? (
            <>
              <Button
                mode="contained"
                onPress={() => {
                  // Navigate to proposals view
                          if (navigation?.navigate) {
                            navigation.navigate('ViewProposals', { requestId: request.id });
                          }
                }}
                style={styles.primaryButton}
                buttonColor={colors.primary.main}
                icon="account-group"
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
              >
                View Proposals ({proposals.length})
              </Button>
            </>
          ) : (
            <>
              <Button
                mode="contained"
                onPress={handleSubmitProposal}
                style={styles.primaryButton}
                buttonColor={colors.primary.main}
                icon="send"
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
              >
                Submit Proposal
              </Button>
              {request.client && (
                <Button
                  mode="outlined"
                  onPress={handleContactClient}
                  style={styles.secondaryButton}
                  icon="message-text"
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                >
                  Contact Client
                </Button>
              )}
            </>
          )}
        </View>

        {/* Description */}
        <Card style={styles.card} mode="outlined">
          <Card.Content>
            <Text style={styles.sectionTitle}>Project Description</Text>
            <Text style={styles.description}>{request.description}</Text>
          </Card.Content>
        </Card>

        {/* Skills Required */}
        {request.skills && request.skills.length > 0 && (
          <Card style={styles.card} mode="outlined">
            <Card.Content>
              <Text style={styles.sectionTitle}>Skills Required</Text>
              <View style={styles.skillsContainer}>
                {request.skills.map((skill, index) => (
                  <Chip
                    key={index}
                    style={styles.skillChip}
                    textStyle={styles.skillChipText}
                    mode="outlined"
                  >
                    {skill}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Proposals Section - Only for request owner */}
        {isOwner && (
          <Card style={styles.card} mode="outlined">
            <Card.Content>
              <View style={styles.proposalsHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Proposals ({proposals.length})</Text>
                  {proposals.length > 0 && (
                    <Text style={styles.proposalsSubtitle}>
                      {proposals.length} proposal{proposals.length !== 1 ? 's' : ''} from {new Set(proposals.map(p => p.user?.id || p.userId)).size} artisan{new Set(proposals.map(p => p.user?.id || p.userId)).size !== 1 ? 's' : ''}
                    </Text>
                  )}
                </View>
                  {proposals.length > 0 && (
                  <Button
                    mode="outlined"
                    onPress={() => {
                        if (navigation?.navigate) {
                          navigation.navigate('ViewProposals', { requestId: request.id });
                        }
                    }}
                    compact
                  >
                    View All
                  </Button>
                )}
              </View>
              
              {loadingProposals ? (
                <ActivityIndicator style={styles.loader} color={colors.primary.main} />
              ) : proposals.length === 0 ? (
                <View style={styles.emptyProposals}>
                  <MaterialCommunityIcons name="account-outline" size={48} color={colors.text.secondary} />
                  <Text style={styles.emptyText}>No proposals yet</Text>
                  <Text style={styles.emptySubtext}>Share this request to get applications!</Text>
                </View>
              ) : (
                <>
                  <List.Section>
                    {proposals.slice(0, 3).map((proposal) => (
                      <List.Item
                        key={proposal.id}
                        title={proposal.user?.name || 'Unknown User'}
                        description={
                          <View>
                            <Text style={styles.proposalMessage} numberOfLines={2}>
                              {proposal.message || 'No message provided'}
                            </Text>
                            <View style={styles.proposalMeta}>
                              {proposal.proposedPrice > 0 && (
                                <View style={styles.proposalMetaItem}>
                                  <MaterialCommunityIcons name="currency-usd" size={14} color={colors.text.secondary} />
                                  <Text style={styles.proposalMetaText}>
                                    ${proposal.proposedPrice.toLocaleString()}
                                  </Text>
                                </View>
                              )}
                              {proposal.estimatedDuration && (
                                <View style={styles.proposalMetaItem}>
                                  <MaterialCommunityIcons name="clock-outline" size={14} color={colors.text.secondary} />
                                  <Text style={styles.proposalMetaText}>
                                    {proposal.estimatedDuration}
                                  </Text>
                                </View>
                              )}
                              <Text style={styles.proposalMetaText}>
                                {formatTimeAgo(proposal.createdAt)}
                              </Text>
                            </View>
                          </View>
                        }
                        left={() => (
                          <Avatar.Text
                            size={40}
                            label={proposal.user?.name?.[0] || 'U'}
                            style={{ backgroundColor: colors.primary.main }}
                          />
                        )}
                        right={() => (
                          <Chip
                            label={proposal.status}
                            style={[
                              styles.statusChip,
                              proposal.status === 'accepted' && { backgroundColor: '#4caf50' },
                              proposal.status === 'rejected' && { backgroundColor: '#f44336' }
                            ]}
                            textStyle={styles.statusChipText}
                          />
                        )}
                        onPress={() => {
                          console.log('View proposal:', proposal.id);
                          // TODO: Implement proposal detail view
                        }}
                      />
                    ))}
                  </List.Section>
                  
                  {proposals.length > 3 && (
                    <Button
                      mode="text"
                      onPress={() => {
                        if (navigation?.navigate) {
                          navigation.navigate('ViewProposals', { requestId: request.id });
                        }
                      }}
                      style={styles.viewMoreButton}
                    >
                      View {proposals.length - 3} more proposals
                    </Button>
                  )}
                </>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Client Information */}
        {request.client && !isOwner && (
          <Card style={styles.card} mode="outlined">
            <Card.Content>
              <Text style={styles.sectionTitle}>About the Client</Text>
              <View style={styles.clientInfo}>
                <Avatar.Image
                  size={56}
                  source={request.client.avatar ? { uri: request.client.avatar } : null}
                  style={styles.clientAvatar}
                />
                <View style={styles.clientDetails}>
                  <View style={styles.clientNameRow}>
                    <Text style={styles.clientName}>{request.client.name}</Text>
                    {request.client.verified && (
                      <MaterialCommunityIcons name="check-circle" size={20} color={colors.primary.main} />
                    )}
                  </View>
                  {request.client.description && (
                    <Text style={styles.clientDescription} numberOfLines={2}>
                      {request.client.description}
                    </Text>
                  )}
                  <View style={styles.clientStats}>
                    {request.client.location && (
                      <View style={styles.clientStatItem}>
                        <MaterialCommunityIcons name="map-marker" size={14} color={colors.text.secondary} />
                        <Text style={styles.clientStatText}>{request.client.location}</Text>
                      </View>
                    )}
                    {request.client.memberSince && (
                      <View style={styles.clientStatItem}>
                        <MaterialCommunityIcons name="calendar" size={14} color={colors.text.secondary} />
                        <Text style={styles.clientStatText}>
                          Member since {new Date(request.client.memberSince).getFullYear()}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Project Details */}
        <Card style={styles.card} mode="outlined">
          <Card.Content>
            <Text style={styles.sectionTitle}>Project Details</Text>
            <View style={styles.detailsList}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Experience Level</Text>
                <Chip label={request.experience} style={styles.detailChip} />
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Project Duration</Text>
                <Text style={styles.detailValue}>{request.duration}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Posted Date</Text>
                <Text style={styles.detailValue}>
                  {request.postedDate 
                    ? new Date(request.postedDate).toLocaleDateString()
                    : 'Not available'}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Budget Type</Text>
                <Chip
                  label={request.budget.type === 'fixed' ? 'Fixed Price' : 'Hourly Rate'}
                  style={styles.detailChip}
                  mode="outlined"
                />
              </View>
            </View>
          </Card.Content>
        </Card>
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
  errorContainer: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  errorHeader: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  errorHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorBackButton: {
    padding: 4,
  },
  errorHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 8,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorActions: {
    width: '100%',
    gap: 12,
    maxWidth: 300,
  },
  retryButton: {
    borderRadius: 12,
    elevation: 2,
  },
  retryCount: {
    marginTop: 16,
    fontSize: 12,
    color: colors.text.secondary,
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerIconButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  headerImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#F0F0F0',
  },
  card: {
    margin: 16,
    marginBottom: 0,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    elevation: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: colors.primary.main + '15',
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  categoryChipText: {
    color: colors.primary.main,
    fontSize: 12,
    fontWeight: '600',
  },
  locationChip: {
    borderColor: colors.divider,
  },
  locationChipText: {
    color: colors.text.secondary,
    fontSize: 12,
  },
  urgencyChip: {
    borderWidth: 1,
  },
  urgencyChipText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statBox: {
    width: (width - 64) / 2,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  actionButtons: {
    padding: 16,
    gap: 12,
  },
  primaryButton: {
    borderRadius: 12,
    elevation: 2,
  },
  secondaryButton: {
    borderRadius: 12,
    borderColor: colors.primary.main,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: colors.text.primary,
    lineHeight: 24,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    borderColor: colors.divider,
  },
  skillChipText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  proposalsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  proposalsSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
  },
  loader: {
    marginVertical: 24,
  },
  emptyProposals: {
    alignItems: 'center',
    paddingVertical: 32,
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
  proposalMessage: {
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 8,
  },
  proposalMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4,
  },
  proposalMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  proposalMetaText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  statusChip: {
    height: 24,
    backgroundColor: '#E0E0E0',
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  viewMoreButton: {
    marginTop: 8,
  },
  clientInfo: {
    flexDirection: 'row',
    marginTop: 8,
  },
  clientAvatar: {
    marginRight: 12,
  },
  clientDetails: {
    flex: 1,
  },
  clientNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  clientDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  clientStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  clientStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clientStatText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  detailsList: {
    marginTop: 8,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  detailChip: {
    height: 28,
  },
});

export default RequestDetailScreen;

