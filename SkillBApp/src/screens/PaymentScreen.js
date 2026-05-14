/**
 * PaymentScreen
 *
 * Guides the client through the authorize-now / capture-on-completion payment
 * flow powered by Stripe React Native.
 *
 * States & transitions:
 *
 *   pending   → Client provides card details via Stripe Payment Sheet.
 *               The card is authorized (funds reserved) but NOT charged yet.
 *               DB status moves to 'held'.
 *
 *   held      → Job is in progress.  Funds are reserved on the client's card.
 *               Client can release payment once the job is done, OR cancel if
 *               the job falls through.
 *
 *   released  → Client confirmed job completion.  The card was captured
 *               (charged) and funds transferred to the provider.
 *
 *   cancelled → Client voided the authorization.  No charge was made.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Card, Button, Chip, Divider } from 'react-native-paper';
import { useStripe } from '@stripe/stripe-react-native';
import { useAuth } from '../contexts/AuthContext';
import { db, supabase } from '../lib/supabase';
import {
  authorizePaymentIntent,
  capturePaymentOnJobCompletion,
  cancelPaymentAuthorization,
  markPaymentCaptured,
  markPaymentCancelled,
  formatAmount,
  getStatusLabel,
  getStatusColor,
  PAYMENT_STATUS,
} from '../lib/paymentService';
import { colors } from '../theme/colors';

// ---------------------------------------------------------------------------
// Timeline step definitions
// ---------------------------------------------------------------------------

/**
 * Build the ordered list of timeline steps for a given payment status.
 *
 * @param {string} status - Current payment status
 * @returns {{ label: string, sublabel: string, completed: boolean }[]}
 */
const buildTimeline = (status) => [
  {
    label:     'Card Authorized',
    sublabel:  'Funds reserved – you have not been charged yet',
    completed: status !== PAYMENT_STATUS.PENDING,
  },
  {
    label:     'Job In Progress',
    sublabel:  'Work is underway',
    completed:
      status === PAYMENT_STATUS.HELD ||
      status === PAYMENT_STATUS.RELEASED ||
      status === PAYMENT_STATUS.CANCELLED,
  },
  {
    label:     'Payment Captured',
    sublabel:  'Card charged on job completion',
    completed: status === PAYMENT_STATUS.RELEASED,
  },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Single row in the payment info summary. */
const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

/** Vertical timeline showing the three payment lifecycle steps. */
const PaymentTimeline = ({ status }) => {
  const steps = buildTimeline(status);

  return (
    <View style={styles.timeline}>
      <Text style={styles.sectionTitle}>Payment Timeline</Text>
      {steps.map((step, index) => (
        <View key={index} style={styles.timelineStep}>
          {/* Connector line (hidden for last item) */}
          {index < steps.length - 1 && (
            <View
              style={[
                styles.timelineConnector,
                step.completed && styles.timelineConnectorDone,
              ]}
            />
          )}

          {/* Step circle */}
          <View
            style={[
              styles.timelineCircle,
              step.completed && styles.timelineCircleDone,
            ]}
          >
            {step.completed && <Text style={styles.timelineCheckmark}>✓</Text>}
          </View>

          {/* Step text */}
          <View style={styles.timelineText}>
            <Text
              style={[
                styles.timelineLabel,
                step.completed && styles.timelineLabelDone,
              ]}
            >
              {step.label}
            </Text>
            <Text style={styles.timelineSublabel}>{step.sublabel}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

const PaymentScreen = ({ route, navigation }) => {
  const { paymentId } = route?.params || {};
  const { user } = useAuth();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [payment, setPayment]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError]           = useState(null);

  // ---------------------------------------------------------------------------
  // Data loading
  // ---------------------------------------------------------------------------

  const loadPayment = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await db.payments.getById(paymentId);
      setPayment(data);
    } catch (err) {
      console.error('[PaymentScreen] Failed to load payment:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [paymentId]);

  useEffect(() => {
    if (paymentId) loadPayment();
  }, [paymentId, loadPayment]);

  // ---------------------------------------------------------------------------
  // Step 1 – Authorize card (card reserved, NOT charged)
  // ---------------------------------------------------------------------------

  const handleAuthorizePayment = async () => {
    if (!payment || payment.status !== PAYMENT_STATUS.PENDING) return;

    try {
      setProcessing(true);

      // Create a manual-capture PaymentIntent on the server.
      // The card will be authorized (reserved) but NOT charged until the job completes.
      const intent = await authorizePaymentIntent(
        payment.amount,
        (payment.currency || 'USD').toLowerCase(),
        {
          payment_id:  payment.id,
          proposal_id: payment.proposal_id,
          request_id:  payment.request_id,
        }
      );

      // Initialize the Stripe Payment Sheet with the client secret.
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName:      'SkillBridge',
        paymentIntentClientSecret: intent.clientSecret,
      });

      if (initError) {
        throw new Error(initError.message);
      }

      // Present the Payment Sheet.  The user enters their card details here.
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        // 'Canceled' means the user dismissed the sheet – not an error.
        if (presentError.code !== 'Canceled') {
          throw new Error(presentError.message);
        }
        return;
      }

      // Card successfully authorized.  Move DB status to 'held'.
      await db.payments.update(payment.id, {
        stripe_payment_intent_id: intent.id,
        status: PAYMENT_STATUS.HELD,
        paid_at: new Date().toISOString(),
      });

      // Record the authorization event.
      try {
        await supabase.from('transactions').insert({
          payment_id:  payment.id,
          user_id:     payment.payer_id,
          type:        'payment',
          amount:      payment.amount,
          currency:    payment.currency || 'USD',
          status:      'completed',
          description: 'Card authorized – awaiting job completion',
          provider_transaction_id: intent.id,
        });
      } catch (txErr) {
        console.warn('[PaymentScreen] Transaction record failed (non-critical):', txErr);
      }

      await loadPayment();

      Alert.alert(
        'Card Authorized',
        'Your card has been reserved but you have NOT been charged yet.\n\n' +
          'The payment will only be captured once you confirm the job is complete.'
      );
    } catch (err) {
      console.error('[PaymentScreen] Authorization error:', err);
      Alert.alert('Authorization Failed', err.message || 'Unable to authorize payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Step 2 – Capture payment on job completion
  // ---------------------------------------------------------------------------

  const handleConfirmJobComplete = () => {
    Alert.alert(
      'Confirm Job Completion',
      `This will charge ${formatAmount(payment.amount, payment.currency)} to your card and pay the provider.\n\nOnly confirm if the work has been completed to your satisfaction.`,
      [
        { text: 'Not Yet', style: 'cancel' },
        {
          text: 'Confirm & Pay',
          onPress: capturePayment,
        },
      ]
    );
  };

  const capturePayment = async () => {
    try {
      setProcessing(true);

      const stripeIntentId = payment.stripe_payment_intent_id;
      if (!stripeIntentId) {
        throw new Error('Payment intent ID not found. Please contact support.');
      }

      // Look up whether the provider has a Stripe connected account for direct transfer.
      const payeeProfile = payment.payee;
      const transferData =
        payeeProfile?.stripe_account_id
          ? {
              destination: payeeProfile.stripe_account_id,
              amount:      Math.round(payment.net_amount ?? payment.amount * 100),
              currency:    (payment.currency || 'USD').toLowerCase(),
            }
          : null;

      // Capture on Stripe – this is when the client's card is actually charged.
      await capturePaymentOnJobCompletion(stripeIntentId, transferData);

      // Update the DB record to 'released' and create a transaction log.
      await markPaymentCaptured(payment.id, stripeIntentId, user.id);

      // Mark the underlying request and proposal as completed.
      try {
        if (payment.request_id) {
          await supabase
            .from('requests')
            .update({ status: 'completed' })
            .eq('id', payment.request_id);
        }
        if (payment.proposal_id) {
          await db.proposals.update(payment.proposal_id, { status: 'completed' });
        }
      } catch (statusErr) {
        console.warn('[PaymentScreen] Status update failed (non-critical):', statusErr);
      }

      await loadPayment();

      Alert.alert(
        'Payment Successful',
        `${formatAmount(payment.amount, payment.currency)} has been paid to the provider. Thank you!`
      );
    } catch (err) {
      console.error('[PaymentScreen] Capture error:', err);
      Alert.alert('Payment Failed', err.message || 'Failed to process payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Cancel authorization (no charge made)
  // ---------------------------------------------------------------------------

  const handleCancelAuthorization = () => {
    Alert.alert(
      'Cancel Payment',
      'This will void the card authorization. No charge will be made and the reserved funds will be released.',
      [
        { text: 'Keep Authorization', style: 'cancel' },
        {
          text: 'Cancel Payment',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessing(true);

              const stripeIntentId = payment.stripe_payment_intent_id;
              if (stripeIntentId) {
                await cancelPaymentAuthorization(stripeIntentId, 'requested_by_customer');
              }

              await markPaymentCancelled(payment.id);
              await loadPayment();

              Alert.alert('Authorization Cancelled', 'Your card authorization has been voided. You have not been charged.');
            } catch (err) {
              console.error('[PaymentScreen] Cancel error:', err);
              Alert.alert('Error', err.message || 'Failed to cancel authorization. Please try again.');
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  const renderParticipantName = (profile) => {
    if (!profile) return 'N/A';
    const name = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    return name || profile.email || 'N/A';
  };

  // ---------------------------------------------------------------------------
  // Loading / error states
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Loading payment details…</Text>
      </View>
    );
  }

  if (error || !payment) {
    return (
      <View style={styles.centeredContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.errorText}>{error || 'Payment not found.'}</Text>
          </Card.Content>
        </Card>
      </View>
    );
  }

  if (payment.payer_id !== user.id && payment.payee_id !== user.id) {
    return (
      <View style={styles.centeredContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.errorText}>You do not have permission to view this payment.</Text>
          </Card.Content>
        </Card>
      </View>
    );
  }

  // ---------------------------------------------------------------------------
  // Derived state
  // ---------------------------------------------------------------------------

  const isPayer    = payment.payer_id === user.id;
  const isPayee    = payment.payee_id === user.id;
  const canAuthorize = isPayer && payment.status === PAYMENT_STATUS.PENDING;
  const canCapture   = isPayer && payment.status === PAYMENT_STATUS.HELD;
  const canCancel    = isPayer && payment.status === PAYMENT_STATUS.HELD;

  // ---------------------------------------------------------------------------
  // Main render
  // ---------------------------------------------------------------------------

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header card – amount + status */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text style={styles.amount}>
              {formatAmount(payment.amount, payment.currency)}
            </Text>
            <Chip
              style={[styles.statusChip, { backgroundColor: getStatusColor(payment.status) }]}
              textStyle={styles.statusChipText}
            >
              {getStatusLabel(payment.status)}
            </Chip>
          </View>

          <Divider style={styles.divider} />

          {/* Summary rows */}
          <InfoRow
            label="Request"
            value={payment.proposals?.requests?.title || 'N/A'}
          />
          <InfoRow
            label={isPayer ? 'Provider' : 'Client'}
            value={isPayer ? renderParticipantName(payment.payee) : renderParticipantName(payment.payer)}
          />
          <InfoRow
            label="Created"
            value={new Date(payment.created_at).toLocaleDateString()}
          />
          {payment.escrow_released_at && (
            <InfoRow
              label="Completed"
              value={new Date(payment.escrow_released_at).toLocaleDateString()}
            />
          )}
        </Card.Content>
      </Card>

      {/* Payment timeline */}
      <Card style={styles.card}>
        <Card.Content>
          <PaymentTimeline status={payment.status} />
        </Card.Content>
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* Action cards                                                        */}
      {/* ------------------------------------------------------------------ */}

      {/* Step 1 – Authorize card */}
      {canAuthorize && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.actionTitle}>Authorize Your Card</Text>
            <Text style={styles.actionDescription}>
              Your card will be <Text style={styles.bold}>reserved but NOT charged</Text> right now.
              {'\n\n'}
              The payment of{' '}
              <Text style={styles.bold}>{formatAmount(payment.amount, payment.currency)}</Text>{' '}
              will only be captured once you confirm the job is complete.
            </Text>
            <Button
              mode="contained"
              onPress={handleAuthorizePayment}
              loading={processing}
              disabled={processing}
              style={styles.primaryButton}
              buttonColor={colors.primary.main}
              contentStyle={styles.buttonContent}
            >
              {processing ? 'Authorizing…' : 'Authorize Payment'}
            </Button>
          </Card.Content>
        </Card>
      )}

      {/* Step 2 – Job in progress; client can confirm completion or cancel */}
      {canCapture && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.actionTitle}>Ready to Release Payment?</Text>
            <Text style={styles.actionDescription}>
              Your card has been reserved for{' '}
              <Text style={styles.bold}>{formatAmount(payment.amount, payment.currency)}</Text>.
              {'\n\n'}
              Once you confirm the job is complete, your card will be charged and the provider will be paid.
            </Text>

            <Button
              mode="contained"
              onPress={handleConfirmJobComplete}
              loading={processing}
              disabled={processing}
              style={styles.primaryButton}
              buttonColor="#4CAF50"
              contentStyle={styles.buttonContent}
            >
              {processing ? 'Processing…' : 'Confirm Job Complete & Pay'}
            </Button>

            <Button
              mode="outlined"
              onPress={handleCancelAuthorization}
              disabled={processing}
              style={styles.secondaryButton}
              textColor="#F44336"
            >
              Cancel – Job Not Completed
            </Button>
          </Card.Content>
        </Card>
      )}

      {/* Provider view – job in progress */}
      {isPayee && payment.status === PAYMENT_STATUS.HELD && (
        <Card style={[styles.card, styles.infoCard]}>
          <Card.Content>
            <Text style={styles.infoCardText}>
              The client has authorized{' '}
              <Text style={styles.bold}>{formatAmount(payment.amount, payment.currency)}</Text>.
              {'\n\n'}
              Payment will be released to you once the client confirms the job is complete.
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* Completion confirmation */}
      {payment.status === PAYMENT_STATUS.RELEASED && (
        <Card style={[styles.card, styles.successCard]}>
          <Card.Content>
            <Text style={styles.successText}>
              Payment complete!{' '}
              {isPayer
                ? `${formatAmount(payment.amount, payment.currency)} has been paid to the provider.`
                : `${formatAmount(payment.amount, payment.currency)} has been released to you.`}
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* Cancellation notice */}
      {payment.status === PAYMENT_STATUS.CANCELLED && (
        <Card style={[styles.card, styles.cancelledCard]}>
          <Card.Content>
            <Text style={styles.cancelledText}>
              This payment authorization was cancelled. No charge was made.
            </Text>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
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
  scrollContent: {
    paddingBottom: 40,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    padding: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#666',
  },
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    elevation: 2,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  amount: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primary.main,
  },
  statusChip: {
    height: 32,
  },
  statusChipText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  divider: {
    marginBottom: 16,
  },

  // Info rows
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1A1A1A',
  },

  // Timeline
  timeline: {
    paddingTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  timelineStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    position: 'relative',
  },
  timelineConnector: {
    position: 'absolute',
    left: 15,
    top: 32,
    width: 2,
    height: 28,
    backgroundColor: '#E0E0E0',
  },
  timelineConnectorDone: {
    backgroundColor: '#4CAF50',
  },
  timelineCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    flexShrink: 0,
  },
  timelineCircleDone: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  timelineCheckmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  timelineText: {
    flex: 1,
    paddingTop: 4,
  },
  timelineLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
  },
  timelineLabelDone: {
    color: '#1A1A1A',
  },
  timelineSublabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },

  // Actions
  actionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 10,
  },
  actionDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 21,
    marginBottom: 20,
  },
  bold: {
    fontWeight: '700',
    color: '#1A1A1A',
  },
  primaryButton: {
    borderRadius: 10,
    marginBottom: 10,
  },
  secondaryButton: {
    borderRadius: 10,
    borderColor: '#F44336',
  },
  buttonContent: {
    paddingVertical: 6,
  },

  // Status cards
  infoCard: {
    backgroundColor: '#EDE7F6',
  },
  infoCardText: {
    fontSize: 14,
    color: '#4A148C',
    lineHeight: 21,
  },
  successCard: {
    backgroundColor: '#E8F5E9',
  },
  successText: {
    fontSize: 15,
    color: '#1B5E20',
    fontWeight: '500',
  },
  cancelledCard: {
    backgroundColor: '#FFEBEE',
  },
  cancelledText: {
    fontSize: 14,
    color: '#B71C1C',
  },
  errorText: {
    fontSize: 15,
    color: '#F44336',
    textAlign: 'center',
  },
});

export default PaymentScreen;