/**
 * ClientDashboardScreen
 *
 * Shows the client's active and completed orders.  For orders in progress, it
 * surfaces the payment authorization status and a "Confirm Job Complete" action
 * that captures the Stripe payment, marks the request as completed, and pays
 * the provider — all in one tap.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  ActivityIndicator,
  Avatar,
  Button,
  Chip,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { db, supabase } from '../lib/supabase';
import { transformRequest, transformProposal, formatTimeAgo } from '../utils/dataTransform';
import {
  capturePaymentOnJobCompletion,
  markPaymentCaptured,
  formatAmount,
  PAYMENT_STATUS,
} from '../lib/paymentService';
import { colors } from '../theme/colors';

// ---------------------------------------------------------------------------
// Types (JSDoc)
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} Order
 * @property {string}      id
 * @property {string}      requestId
 * @property {string}      proposalId
 * @property {string}      service
 * @property {string}      provider
 * @property {string|null} providerAvatar
 * @property {'In Progress'|'Completed'|'Canceled'} status
 * @property {number}      amount
 * @property {string|null} deadline
 * @property {string}      category
 * @property {string}      createdAt
 * @property {number}      progress  0-100
 * @property {Object|null} payment   Associated payment row (may be null)
 */

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ClientDashboardScreen = ({
  onNavigateToRequestDetail,
  onNavigateToCreateRequest,
  onNavigateToPayment,
  onClose,
}) => {
  const { user } = useAuth();

  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [orders, setOrders]           = useState(/** @type {Order[]} */ ([]));
  const [processingId, setProcessingId] = useState(null); // requestId being processed

  const [orderStats, setOrderStats] = useState({
    activeOrders:    0,
    completedOrders: 0,
    totalSpent:      0,
  });

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------

  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const userRequests    = await db.requests.getAll({ userId: user.id });
      const transformedReqs = userRequests.map(transformRequest).filter(Boolean);

      const ordersWithPayments = await Promise.all(
        transformedReqs.map(async (request) => {
          try {
            const proposals        = await db.proposals.getByRequestId(request.id);
            const acceptedProposal = proposals?.find(
              (p) => p.status === 'accepted' || p.status === 'completed'
            );

            if (!acceptedProposal) return null;

            const proposal = transformProposal(acceptedProposal);

            // Fetch the payment associated with this proposal (may be null).
            let payment = null;
            try {
              payment = await db.payments.getByProposal(acceptedProposal.id);
            } catch {
              // Non-critical – order still shows without payment info.
            }

            return {
              id:            request.id,
              requestId:     request.id,
              proposalId:    proposal?.id,
              service:       request.title,
              provider:      proposal?.provider?.name || 'Provider',
              providerAvatar: proposal?.provider?.avatar ?? null,
              status:
                request.status === 'completed'
                  ? 'Completed'
                  : request.status === 'canceled'
                  ? 'Canceled'
                  : 'In Progress',
              amount:    proposal?.proposedPrice || 0,
              deadline:  request.deadline ?? null,
              category:  request.category,
              createdAt: request.createdAt,
              progress:
                request.status === 'completed'
                  ? 100
                  : request.status === 'in_review'
                  ? 75
                  : 50,
              payment,
            };
          } catch {
            return null;
          }
        })
      );

      const validOrders = ordersWithPayments.filter(Boolean);
      setOrders(validOrders);

      setOrderStats({
        activeOrders:    validOrders.filter((o) => o.status === 'In Progress').length,
        completedOrders: validOrders.filter((o) => o.status === 'Completed').length,
        totalSpent:      validOrders
          .filter((o) => o.status === 'Completed')
          .reduce((sum, o) => sum + (o.amount || 0), 0),
      });
    } catch (err) {
      console.error('[ClientDashboard] Error fetching data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ---------------------------------------------------------------------------
  // Job completion & payment capture
  // ---------------------------------------------------------------------------

  /**
   * Confirm job completion for the given order.
   *
   * 1. Verifies the associated payment is in 'held' status (card authorized).
   * 2. Calls Stripe to capture the payment (charge the card).
   * 3. Marks the payment, request, and proposal as completed in the DB.
   * 4. Refreshes the dashboard.
   *
   * @param {Order} order
   */
  const handleConfirmJobComplete = useCallback(
    (order) => {
      if (!order.payment) {
        // No payment record – navigate to PaymentScreen so the client can authorize first.
        Alert.alert(
          'Payment Required',
          'Please authorize payment before confirming job completion.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Go to Payment',
              onPress: () => onNavigateToPayment?.(order.payment?.id),
            },
          ]
        );
        return;
      }

      if (order.payment.status !== PAYMENT_STATUS.HELD) {
        Alert.alert(
          'Cannot Confirm',
          order.payment.status === PAYMENT_STATUS.PENDING
            ? 'Please authorize your card first by opening the payment screen.'
            : `Payment is already ${order.payment.status}.`
        );
        return;
      }

      Alert.alert(
        'Confirm Job Completion',
        `This will charge ${formatAmount(order.payment.amount, order.payment.currency)} to your card and pay the provider.\n\nOnly confirm if you are satisfied with the completed work.`,
        [
          { text: 'Not Yet', style: 'cancel' },
          {
            text: 'Confirm & Pay',
            onPress: () => executeCapture(order),
          },
        ]
      );
    },
    [onNavigateToPayment]
  );

  const executeCapture = async (order) => {
    const { payment } = order;

    try {
      setProcessingId(order.requestId);

      const stripeIntentId = payment.stripe_payment_intent_id;
      if (!stripeIntentId) {
        throw new Error(
          'Stripe payment intent not found. Please open the payment screen and try again.'
        );
      }

      // Optionally transfer net proceeds to provider's connected account.
      const providerStripeId = payment.payee?.stripe_account_id ?? null;
      const transferData = providerStripeId
        ? {
            destination: providerStripeId,
            amount:      Math.round((payment.net_amount ?? payment.amount) * 100),
            currency:    (payment.currency || 'USD').toLowerCase(),
          }
        : null;

      // Capture on Stripe – card is charged here.
      await capturePaymentOnJobCompletion(stripeIntentId, transferData);

      // Update payment record in DB.
      await markPaymentCaptured(payment.id, stripeIntentId, user.id);

      // Mark the request and proposal as completed.
      await Promise.allSettled([
        supabase
          .from('requests')
          .update({ status: 'completed' })
          .eq('id', order.requestId),
        order.proposalId
          ? db.proposals.update(order.proposalId, { status: 'completed' })
          : Promise.resolve(),
      ]);

      await fetchDashboardData();

      Alert.alert(
        'Job Complete!',
        `${formatAmount(payment.amount, payment.currency)} has been paid to ${order.provider}. Thank you!`
      );
    } catch (err) {
      console.error('[ClientDashboard] Capture error:', err);
      Alert.alert(
        'Payment Failed',
        err.message || 'Failed to process payment. Please try again or contact support.'
      );
    } finally {
      setProcessingId(null);
    }
  };

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  /**
   * Return a label and color for an order's payment state badge.
   * @param {Order} order
   */
  const getPaymentBadge = (order) => {
    if (!order.payment) return null;

    const { status } = order.payment;

    const map = {
      [PAYMENT_STATUS.PENDING]:   { label: 'Payment Pending',    color: '#FF9800' },
      [PAYMENT_STATUS.HELD]:      { label: 'Card Authorized',     color: '#9C27B0' },
      [PAYMENT_STATUS.RELEASED]:  { label: 'Paid',               color: '#4CAF50' },
      [PAYMENT_STATUS.CANCELLED]: { label: 'Payment Cancelled',  color: '#F44336' },
      [PAYMENT_STATUS.REFUNDED]:  { label: 'Refunded',           color: '#757575' },
    };

    return map[status] ?? null;
  };

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Loading dashboard…</Text>
      </View>
    );
  }

  // ---------------------------------------------------------------------------
  // Main render
  // ---------------------------------------------------------------------------

  return (
    <View style={styles.container}>
      {/* Header */}
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
        <Text style={styles.headerTitle}>My Orders</Text>
        <Text style={styles.headerSubtitle}>Track your projects and manage payments</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary.main}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard
            icon="briefcase-check"
            iconColor={colors.primary.main}
            value={orderStats.activeOrders}
            label="Active"
          />
          <StatCard
            icon="check-circle"
            iconColor="#4CAF50"
            value={orderStats.completedOrders}
            label="Completed"
          />
          <StatCard
            icon="cash"
            iconColor="#FF9800"
            value={`$${orderStats.totalSpent.toFixed(0)}`}
            label="Spent"
          />
        </View>

        {/* Create request CTA */}
        <Button
          mode="contained"
          icon="plus"
          onPress={() => onNavigateToCreateRequest?.()}
          style={styles.createButton}
          buttonColor={colors.primary.main}
          contentStyle={styles.createButtonContent}
          labelStyle={styles.createButtonLabel}
        >
          Create Service Request
        </Button>

        {/* Orders list */}
        <Text style={styles.sectionTitle}>My Orders</Text>

        {orders.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <MaterialCommunityIcons name="inbox-outline" size={56} color={colors.text.secondary} />
              <Text style={styles.emptyTitle}>No orders yet</Text>
              <Text style={styles.emptySubtitle}>Create a service request to get started</Text>
            </Card.Content>
          </Card>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              isProcessing={processingId === order.requestId}
              paymentBadge={getPaymentBadge(order)}
              onViewDetails={() => onNavigateToRequestDetail?.(order.requestId)}
              onViewPayment={() => onNavigateToPayment?.(order.payment?.id)}
              onConfirmComplete={() => handleConfirmJobComplete(order)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

// ---------------------------------------------------------------------------
// StatCard sub-component
// ---------------------------------------------------------------------------

const StatCard = ({ icon, iconColor, value, label }) => (
  <Card style={styles.statCard}>
    <Card.Content style={styles.statContent}>
      <MaterialCommunityIcons name={icon} size={28} color={iconColor} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card.Content>
  </Card>
);

// ---------------------------------------------------------------------------
// OrderCard sub-component
// ---------------------------------------------------------------------------

const OrderCard = ({
  order,
  isProcessing,
  paymentBadge,
  onViewDetails,
  onViewPayment,
  onConfirmComplete,
}) => {
  const isInProgress = order.status === 'In Progress';
  const canConfirm   = isInProgress && order.payment?.status === PAYMENT_STATUS.HELD;

  return (
    <Card style={styles.orderCard}>
      <Card.Content>
        {/* Order header row */}
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderService} numberOfLines={1}>
              {order.service}
            </Text>
            <Text style={styles.orderCategory}>{order.category}</Text>
          </View>
          <Chip
            style={[
              styles.statusChip,
              order.status === 'Completed' && styles.statusChipDone,
              order.status === 'Canceled'  && styles.statusChipCanceled,
            ]}
            textStyle={styles.statusChipText}
          >
            {order.status}
          </Chip>
        </View>

        {/* Provider row */}
        {order.provider && (
          <View style={styles.providerRow}>
            <Avatar.Text
              size={28}
              label={(order.provider[0] || 'P').toUpperCase()}
              style={styles.avatar}
            />
            <Text style={styles.providerName}>{order.provider}</Text>
          </View>
        )}

        {/* Amount + deadline */}
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="cash" size={15} color={colors.text.secondary} />
            <Text style={styles.detailText}>${order.amount}</Text>
          </View>
          {order.deadline && (
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="calendar" size={15} color={colors.text.secondary} />
              <Text style={styles.detailText}>{formatTimeAgo(order.deadline)}</Text>
            </View>
          )}
        </View>

        {/* Payment status badge */}
        {paymentBadge && (
          <View style={[styles.paymentBadge, { backgroundColor: paymentBadge.color + '18' }]}>
            <View style={[styles.paymentBadgeDot, { backgroundColor: paymentBadge.color }]} />
            <Text style={[styles.paymentBadgeText, { color: paymentBadge.color }]}>
              {paymentBadge.label}
            </Text>
          </View>
        )}

        {/* Progress bar */}
        {isInProgress && (
          <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${order.progress}%` }]} />
            </View>
            <Text style={styles.progressLabel}>{order.progress}%</Text>
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.textButton} onPress={onViewDetails}>
            <Text style={styles.textButtonLabel}>View Details</Text>
            <MaterialCommunityIcons name="arrow-right" size={14} color={colors.primary.main} />
          </TouchableOpacity>

          {order.payment && (
            <TouchableOpacity style={styles.textButton} onPress={onViewPayment}>
              <Text style={styles.textButtonLabel}>Payment</Text>
              <MaterialCommunityIcons name="credit-card-outline" size={14} color={colors.primary.main} />
            </TouchableOpacity>
          )}
        </View>

        {/* Confirm Job Complete – only when card is authorized and job is in progress */}
        {canConfirm && (
          <Button
            mode="contained"
            onPress={onConfirmComplete}
            loading={isProcessing}
            disabled={isProcessing}
            buttonColor="#4CAF50"
            style={styles.confirmButton}
            contentStyle={styles.confirmButtonContent}
            labelStyle={styles.confirmButtonLabel}
            icon="check-circle"
          >
            {isProcessing ? 'Processing…' : 'Confirm Job Complete & Pay'}
          </Button>
        )}

        {/* Prompt to authorize payment if pending */}
        {isInProgress && order.payment?.status === PAYMENT_STATUS.PENDING && (
          <Button
            mode="outlined"
            onPress={onViewPayment}
            style={styles.authorizePromptButton}
            textColor={colors.primary.main}
            icon="credit-card-outline"
          >
            Authorize Payment
          </Button>
        )}
      </Card.Content>
    </Card>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

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

  // Header
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
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
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
  },

  // Scroll
  scrollView: { flex: 1 },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.07)',
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text.primary,
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2,
  },

  // Create button
  createButton: {
    borderRadius: 10,
    marginBottom: 24,
  },
  createButtonContent: {
    paddingVertical: 6,
  },
  createButtonLabel: {
    fontSize: 15,
    fontWeight: '600',
  },

  // Section
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 14,
  },

  // Empty state
  emptyCard: {
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 44,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 14,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 6,
    textAlign: 'center',
  },

  // Order card
  orderCard: {
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  orderInfo: {
    flex: 1,
    marginRight: 10,
  },
  orderService: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  orderCategory: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  statusChip: {
    backgroundColor: colors.primary.main + '15',
    height: 26,
  },
  statusChipDone: {
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

  // Provider row
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  avatar: {
    backgroundColor: colors.primary.main + '30',
  },
  providerName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
  },

  // Details
  detailRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  detailText: {
    fontSize: 13,
    color: colors.text.secondary,
  },

  // Payment badge
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 10,
    gap: 6,
  },
  paymentBadgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  paymentBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Progress
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.main,
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.primary,
  },

  // Actions row (text buttons)
  actionsRow: {
    flexDirection: 'row',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 10,
    marginTop: 4,
    marginBottom: 4,
  },
  textButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  textButtonLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary.main,
  },

  // Confirm complete button
  confirmButton: {
    borderRadius: 10,
    marginTop: 10,
  },
  confirmButtonContent: {
    paddingVertical: 4,
  },
  confirmButtonLabel: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Authorize prompt button
  authorizePromptButton: {
    borderRadius: 10,
    marginTop: 10,
    borderColor: colors.primary.main,
  },
});

export default ClientDashboardScreen;