import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, ActivityIndicator, Avatar, Button, Chip, List, Divider, Menu } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/supabase';
import { transformProposal, formatTimeAgo } from '../utils/dataTransform';
import { colors } from '../theme/colors';

const ViewProposalsScreen = ({ route, navigation, onClose }) => {
  const { requestId } = route?.params || {};
  const { user } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    fetchProposals();
  }, [requestId, user?.id]);

  const fetchProposals = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let dbProposals = [];

      if (requestId) {
        dbProposals = await db.proposals.getByRequest(requestId);
      } else {
        const userRequests = await db.requests.getByUser(user.id);
        const allProposals = [];
        for (const request of userRequests) {
          const requestProposals = await db.proposals.getByRequest(request.id);
          allProposals.push(...requestProposals);
        }
        dbProposals = allProposals;
      }

      const transformedProposals = dbProposals
        .map(transformProposal)
        .filter(p => p !== null)
        .map(proposal => ({
          id: proposal.id,
          artisan: {
            id: proposal.user?.id,
            name: proposal.user?.name || 'Unknown User',
            avatar: proposal.user?.avatar,
            isVerified: proposal.user?.isVerified || false,
            location: proposal.user?.location?.city || 'Location not specified',
          },
          proposal: {
            description: proposal.message || 'No message provided',
            price: proposal.proposedPrice || 0,
            timeline: proposal.estimatedDuration || 'Not specified',
          },
          submittedAt: proposal.createdAt,
          status: proposal.status || 'pending',
          requestId: proposal.requestId,
          request: proposal.request,
        }));

      setProposals(transformedProposals);
    } catch (err) {
      console.error('Error fetching proposals:', err);
      setError(err.message || 'Failed to load proposals');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProposals();
  };

  const handleAccept = async (proposal) => {
    Alert.alert(
      'Accept Proposal',
      `Are you sure you want to accept ${proposal.artisan.name}'s proposal?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          style: 'destructive',
          onPress: async () => {
            try {
              await db.proposals.accept(proposal.id, proposal.requestId);
              Alert.alert('Success', 'Proposal accepted successfully!');
              fetchProposals();
            } catch (error) {
              Alert.alert('Error', `Failed to accept proposal: ${error.message}`);
            }
          }
        }
      ]
    );
  };

  const handleReject = async (proposal) => {
    Alert.alert(
      'Reject Proposal',
      `Are you sure you want to reject ${proposal.artisan.name}'s proposal?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await db.proposals.reject(proposal.id);
              Alert.alert('Success', 'Proposal rejected');
              fetchProposals();
            } catch (error) {
              Alert.alert('Error', `Failed to reject proposal: ${error.message}`);
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return '#4CAF50';
      case 'rejected': return '#f44336';
      default: return colors.primary.main;
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Loading proposals...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.primary.main, colors.primary.dark]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation?.goBack() || onClose?.()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Proposals</Text>
          <View style={{ width: 24 }} />
        </View>
        {proposals.length > 0 && (
          <Text style={styles.headerSubtitle}>
            {proposals.length} proposal{proposals.length !== 1 ? 's' : ''}
          </Text>
        )}
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {error ? (
          <Card style={styles.errorCard}>
            <Card.Content>
              <Text style={styles.errorText}>{error}</Text>
              <Button mode="contained" onPress={fetchProposals} style={styles.retryButton}>
                Retry
              </Button>
            </Card.Content>
          </Card>
        ) : proposals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="account-search-outline" size={64} color={colors.text.secondary} />
            <Text style={styles.emptyText}>No proposals yet</Text>
            <Text style={styles.emptySubtext}>
              {requestId ? 'Share this request to get applications' : 'You have no proposals for your requests'}
            </Text>
          </View>
        ) : (
          proposals.map((proposal) => (
            <Card key={proposal.id} style={styles.proposalCard}>
              <Card.Content>
                <View style={styles.proposalHeader}>
                  <View style={styles.artisanInfo}>
                    <Avatar.Image
                      size={50}
                      source={{ uri: proposal.artisan.avatar }}
                      style={styles.avatar}
                    />
                    <View style={styles.artisanDetails}>
                      <View style={styles.artisanNameRow}>
                        <Text style={styles.artisanName}>{proposal.artisan.name}</Text>
                        {proposal.artisan.isVerified && (
                          <MaterialCommunityIcons name="check-circle" size={18} color={colors.primary.main} />
                        )}
                      </View>
                      <Text style={styles.artisanLocation}>{proposal.artisan.location}</Text>
                    </View>
                  </View>
                  <Chip
                    style={[styles.statusChip, { backgroundColor: getStatusColor(proposal.status) }]}
                    textStyle={styles.statusChipText}
                  >
                    {proposal.status}
                  </Chip>
                </View>

                <Divider style={styles.divider} />

                <Text style={styles.proposalDescription} numberOfLines={3}>
                  {proposal.proposal.description}
                </Text>

                <View style={styles.proposalMeta}>
                  {proposal.proposal.price > 0 && (
                    <View style={styles.metaItem}>
                      <MaterialCommunityIcons name="currency-usd" size={18} color={colors.primary.main} />
                      <Text style={styles.metaText}>${proposal.proposal.price.toLocaleString()}</Text>
                    </View>
                  )}
                  <View style={styles.metaItem}>
                    <MaterialCommunityIcons name="clock-outline" size={18} color={colors.text.secondary} />
                    <Text style={styles.metaText}>{proposal.proposal.timeline}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <MaterialCommunityIcons name="calendar-clock" size={18} color={colors.text.secondary} />
                    <Text style={styles.metaText}>{formatTimeAgo(proposal.submittedAt)}</Text>
                  </View>
                </View>

                {proposal.request && (
                  <View style={styles.requestInfo}>
                    <Text style={styles.requestLabel}>For Request:</Text>
                    <Text style={styles.requestTitle}>{proposal.request.title}</Text>
                  </View>
                )}

                {proposal.status === 'pending' && (
                  <View style={styles.actionButtons}>
                    <Button
                      mode="contained"
                      onPress={() => handleAccept(proposal)}
                      style={styles.acceptButton}
                      buttonColor="#4CAF50"
                      icon="check-circle"
                    >
                      Accept
                    </Button>
                    <Button
                      mode="outlined"
                      onPress={() => handleReject(proposal)}
                      style={styles.rejectButton}
                      textColor="#f44336"
                      icon="close-circle"
                    >
                      Reject
                    </Button>
                  </View>
                )}
              </Card.Content>
            </Card>
          ))
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
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  errorCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    fontSize: 14,
    color: colors.error?.main || '#f44336',
    marginBottom: 16,
  },
  retryButton: {
    borderRadius: 12,
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
  proposalCard: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  proposalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  artisanInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    marginRight: 12,
  },
  artisanDetails: {
    flex: 1,
  },
  artisanNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  artisanName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  artisanLocation: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
  },
  statusChip: {
    height: 28,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  divider: {
    marginVertical: 12,
  },
  proposalDescription: {
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 20,
    marginBottom: 12,
  },
  proposalMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  requestInfo: {
    backgroundColor: '#F5F7FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  requestLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  requestTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  acceptButton: {
    flex: 1,
    borderRadius: 12,
  },
  rejectButton: {
    flex: 1,
    borderRadius: 12,
    borderColor: '#f44336',
  },
});

export default ViewProposalsScreen;


