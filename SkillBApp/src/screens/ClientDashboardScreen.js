import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Platform } from 'react-native';
import { Text, Card, ActivityIndicator, Avatar, Button, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/supabase';
import { transformRequest, transformProposal, formatTimeAgo } from '../utils/dataTransform';
import { colors } from '../theme/colors';

const ClientDashboardScreen = ({ onNavigateToRequestDetail, onNavigateToCreateRequest, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [orderStats, setOrderStats] = useState({
    activeOrders: 0,
    completedOrders: 0,
    totalSpent: 0,
    averageRating: 0
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        setLoading(false);
        return;
      }

      // Fetch user's requests
      const userRequests = await db.requests.getAll({ userId: user.id });
      const transformedRequests = userRequests.map(transformRequest).filter(r => r !== null);

      // Get proposals for these requests
      const ordersWithProposals = [];
      for (const request of transformedRequests) {
        try {
          const proposals = await db.proposals.getByRequestId(request.id);
          const acceptedProposal = proposals?.find(p => p.status === 'accepted' || p.status === 'completed');
          
          if (acceptedProposal) {
            const transformedProposal = transformProposal(acceptedProposal);
            ordersWithProposals.push({
              id: request.id,
              requestId: request.id,
              proposalId: transformedProposal?.id,
              service: request.title,
              provider: transformedProposal?.provider?.name || 'Provider',
              providerAvatar: transformedProposal?.provider?.avatar,
              status: request.status === 'completed' ? 'Completed' : 
                     request.status === 'canceled' ? 'Canceled' : 'In Progress',
              amount: transformedProposal?.proposedPrice || 0,
              deadline: request.deadline,
              category: request.category,
              createdAt: request.createdAt,
              progress: request.status === 'completed' ? 100 : 
                       request.status === 'in_review' ? 75 : 50
            });
          }
        } catch (err) {
          console.warn('Error fetching proposals for request:', err);
        }
      }

      setOrders(ordersWithProposals);

      // Calculate stats
      const activeOrders = ordersWithProposals.filter(o => o.status === 'In Progress').length;
      const completedOrders = ordersWithProposals.filter(o => o.status === 'Completed').length;
      const totalSpent = ordersWithProposals
        .filter(o => o.status === 'Completed')
        .reduce((sum, o) => sum + (o.amount || 0), 0);

      setOrderStats({
        activeOrders,
        completedOrders,
        totalSpent,
        averageRating: 0
      });
    } catch (error) {
      console.error('Error fetching client dashboard data:', error);
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1565C0', '#0D47A1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>My Orders Dashboard</Text>
        <Text style={styles.headerSubtitle}>Track your projects and manage your orders</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary.main} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <MaterialCommunityIcons name="briefcase-check" size={32} color={colors.primary.main} />
              <Text style={styles.statValue}>{orderStats.activeOrders}</Text>
              <Text style={styles.statLabel}>Active Orders</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <MaterialCommunityIcons name="check-circle" size={32} color="#4CAF50" />
              <Text style={styles.statValue}>{orderStats.completedOrders}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <MaterialCommunityIcons name="cash" size={32} color="#FF9800" />
              <Text style={styles.statValue}>${orderStats.totalSpent.toFixed(0)}</Text>
              <Text style={styles.statLabel}>Total Spent</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Button
            mode="contained"
            icon="plus"
            onPress={() => onNavigateToCreateRequest?.()}
            style={styles.actionButton}
            buttonColor={colors.primary.main}
            contentStyle={styles.actionButtonContent}
            labelStyle={styles.actionButtonLabel}
          >
            Create Service Request
          </Button>
        </View>

        {/* Orders List */}
        <View style={styles.ordersSection}>
          <Text style={styles.sectionTitle}>My Orders</Text>
          {orders.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyCardContent}>
                <MaterialCommunityIcons name="inbox-outline" size={64} color={colors.text.secondary} />
                <Text style={styles.emptyText}>No orders yet</Text>
                <Text style={styles.emptySubtext}>Create a service request to get started</Text>
              </Card.Content>
            </Card>
          ) : (
            orders.map((order) => (
              <Card key={order.id} style={styles.orderCard}>
                <Card.Content>
                  <View style={styles.orderHeader}>
                    <View style={styles.orderInfo}>
                      <Text style={styles.orderService}>{order.service}</Text>
                      <Text style={styles.orderCategory}>{order.category}</Text>
                    </View>
                    <Chip
                      style={[
                        styles.statusChip,
                        order.status === 'Completed' && styles.statusChipCompleted,
                        order.status === 'Canceled' && styles.statusChipCanceled
                      ]}
                      textStyle={styles.statusChipText}
                    >
                      {order.status}
                    </Chip>
                  </View>

                  {order.provider && (
                    <View style={styles.providerRow}>
                      <Avatar.Text size={32} label={order.provider[0]?.toUpperCase() || 'P'} />
                      <Text style={styles.providerName}>{order.provider}</Text>
                    </View>
                  )}

                  <View style={styles.orderDetails}>
                    <View style={styles.orderDetailItem}>
                      <MaterialCommunityIcons name="cash" size={16} color={colors.text.secondary} />
                      <Text style={styles.orderDetailText}>${order.amount}</Text>
                    </View>
                    {order.deadline && (
                      <View style={styles.orderDetailItem}>
                        <MaterialCommunityIcons name="calendar" size={16} color={colors.text.secondary} />
                        <Text style={styles.orderDetailText}>{formatTimeAgo(order.deadline)}</Text>
                      </View>
                    )}
                  </View>

                  {order.status === 'In Progress' && (
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${order.progress}%` }]} />
                      </View>
                      <Text style={styles.progressText}>{order.progress}%</Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => onNavigateToRequestDetail?.(order.requestId)}
                  >
                    <Text style={styles.viewButtonText}>View Details</Text>
                    <MaterialCommunityIcons name="arrow-right" size={16} color={colors.primary.main} />
                  </TouchableOpacity>
                </Card.Content>
              </Card>
            ))
          )}
        </View>
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
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text.primary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
  },
  actionsContainer: {
    marginBottom: 24,
  },
  actionButton: {
    borderRadius: 12,
  },
  actionButtonContent: {
    paddingVertical: 8,
  },
  actionButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  ordersSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 16,
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
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 8,
    textAlign: 'center',
  },
  orderCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.12)',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
    marginRight: 12,
  },
  orderService: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  orderCategory: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  statusChip: {
    backgroundColor: colors.primary.main + '15',
    height: 28,
  },
  statusChipCompleted: {
    backgroundColor: '#4CAF50' + '15',
  },
  statusChipCanceled: {
    backgroundColor: '#F44336' + '15',
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary.main,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  providerName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  orderDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  orderDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orderDetailText: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.main,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.primary,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: 8,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary.main,
  },
});

export default ClientDashboardScreen;

