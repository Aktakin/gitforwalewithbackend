import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Divider,
  ProgressBar,
} from 'react-native-paper';
import { useStripe } from '@stripe/stripe-react-native';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/supabase';
import { createPaymentIntent, formatAmount, getStatusLabel, getStatusColor } from '../lib/paymentService';
import { colors } from '../theme/colors';

const PaymentScreen = ({ route, navigation }) => {
  const { paymentId } = route?.params || {};
  const { user } = useAuth();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPayment();
  }, [paymentId]);

  const loadPayment = async () => {
    try {
      setLoading(true);
      const paymentData = await db.payments.getById(paymentId);
      setPayment(paymentData);
      
      // If payment is pending, create payment intent
      if (paymentData.status === 'pending' && !paymentData.stripe_payment_intent_id) {
        try {
          const intent = await createPaymentIntent(
            paymentData.amount,
            paymentData.currency || 'usd',
            {
              payment_id: paymentData.id,
              proposal_id: paymentData.proposal_id,
              request_id: paymentData.request_id,
            }
          );
          
          // Update payment with intent ID
          await db.payments.update(paymentData.id, {
            stripe_payment_intent_id: intent.id,
          });
        } catch (intentError) {
          console.error('Error creating payment intent:', intentError);
        }
      }
    } catch (err) {
      console.error('Error loading payment:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!payment || payment.status !== 'pending') return;

    try {
      setProcessing(true);
      
      // Create payment intent if needed
      const intent = await createPaymentIntent(
        payment.amount,
        payment.currency || 'usd',
        {
          payment_id: payment.id,
          proposal_id: payment.proposal_id,
          request_id: payment.request_id,
        }
      );

      // Initialize payment sheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'SkillBridge',
        paymentIntentClientSecret: intent.clientSecret,
      });

      if (initError) {
        throw new Error(initError.message);
      }

      // Present payment sheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code !== 'Canceled') {
          throw new Error(presentError.message);
        }
        return;
      }

      // Payment succeeded
      await db.payments.markAsPaid(payment.id, intent.id);
      await loadPayment();
      Alert.alert('Success', 'Payment successful! Funds are now held in escrow.');
    } catch (err) {
      console.error('Payment error:', err);
      Alert.alert('Error', err.message || 'Failed to process payment');
    } finally {
      setProcessing(false);
    }
  };

  const handleReleaseEscrow = async () => {
    Alert.alert(
      'Release Funds',
      'Are you sure you want to release the escrow funds to the provider? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Release',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessing(true);
              await db.payments.releaseEscrow(paymentId, user.id);
              await loadPayment();
              Alert.alert('Success', 'Funds released successfully!');
            } catch (err) {
              console.error('Error releasing escrow:', err);
              Alert.alert('Error', `Failed to release funds: ${err.message}`);
            } finally {
              setProcessing(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Loading payment details...</Text>
      </View>
    );
  }

  if (error || !payment) {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.errorText}>
              {error || 'Payment not found'}
            </Text>
          </Card.Content>
        </Card>
      </View>
    );
  }

  // Check permissions
  if (payment.payer_id !== user.id && payment.payee_id !== user.id) {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.errorText}>
              You don't have permission to view this payment.
            </Text>
          </Card.Content>
        </Card>
      </View>
    );
  }

  const isPayer = payment.payer_id === user.id;
  const isPayee = payment.payee_id === user.id;
  const canPay = isPayer && payment.status === 'pending';
  const canRelease = isPayer && payment.status === 'held';

  const statusSteps = [
    { label: 'Payment Initiated', completed: payment.status !== 'pending' },
    { label: 'Funds in Escrow', completed: payment.status === 'held' || payment.status === 'released' },
    { label: 'Job Completed', completed: payment.status === 'held' || payment.status === 'released' },
    { label: 'Funds Released', completed: payment.status === 'released' },
  ];

  const activeStep = payment.status === 'pending' ? 0 : 
                     payment.status === 'held' ? 2 : 
                     payment.status === 'released' ? 3 : 0;

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text style={styles.amount}>{formatAmount(payment.amount, payment.currency)}</Text>
            <Chip
              label={getStatusLabel(payment.status)}
              style={[styles.statusChip, { backgroundColor: getStatusColor(payment.status) }]}
              textStyle={styles.statusChipText}
            />
          </View>

          <Divider style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.label}>Request</Text>
            <Text style={styles.value}>
              {payment.proposals?.requests?.title || 'N/A'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>{isPayer ? 'Provider' : 'Client'}</Text>
            <Text style={styles.value}>
              {isPayer 
                ? `${payment.payee?.first_name || ''} ${payment.payee?.last_name || ''}`.trim() || payment.payee?.email
                : `${payment.payer?.first_name || ''} ${payment.payer?.last_name || ''}`.trim() || payment.payer?.email
              }
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Created</Text>
            <Text style={styles.value}>
              {new Date(payment.created_at).toLocaleDateString()}
            </Text>
          </View>

          {payment.released_at && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Released</Text>
              <Text style={styles.value}>
                {new Date(payment.released_at).toLocaleDateString()}
              </Text>
            </View>
          )}

          {/* Payment Status Progress */}
          <View style={styles.progressSection}>
            <Text style={styles.sectionTitle}>Payment Status</Text>
            {statusSteps.map((step, index) => (
              <View key={index} style={styles.stepRow}>
                <View style={[
                  styles.stepIndicator,
                  step.completed && styles.stepCompleted
                ]} />
                <Text style={[
                  styles.stepLabel,
                  step.completed && styles.stepLabelCompleted
                ]}>
                  {step.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Payment Button */}
          {canPay && (
            <View style={styles.actionSection}>
              <Text style={styles.infoText}>
                Your payment will be held in escrow until you approve the completed work.
              </Text>
              <Button
                mode="contained"
                onPress={handlePayment}
                disabled={processing}
                loading={processing}
                style={styles.payButton}
                buttonColor={colors.primary.main}
              >
                {processing ? 'Processing...' : `Pay ${formatAmount(payment.amount, payment.currency)}`}
              </Button>
            </View>
          )}

          {/* Release Escrow Button */}
          {canRelease && (
            <View style={styles.actionSection}>
              <Text style={styles.infoText}>
                Funds are currently held in escrow. Once you approve the completed work, 
                you can release the funds to the provider.
              </Text>
              <Button
                mode="contained"
                onPress={handleReleaseEscrow}
                disabled={processing}
                loading={processing}
                style={styles.releaseButton}
                buttonColor="#4CAF50"
              >
                Release Funds to Provider
              </Button>
            </View>
          )}

          {/* Status Messages */}
          {payment.status === 'held' && isPayee && (
            <Text style={styles.statusMessage}>
              Your payment is being held in escrow. The client will release it once they approve the completed work.
            </Text>
          )}

          {payment.status === 'released' && (
            <Text style={[styles.statusMessage, { color: '#4CAF50' }]}>
              Funds have been released successfully!
            </Text>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  card: {
    margin: 16,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary.main,
  },
  statusChip: {
    height: 32,
  },
  statusChipText: {
    color: '#fff',
    fontWeight: '600',
  },
  divider: {
    marginVertical: 16,
  },
  infoRow: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  progressSection: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#000',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 12,
  },
  stepCompleted: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  stepLabel: {
    fontSize: 14,
    color: '#666',
  },
  stepLabelCompleted: {
    color: '#000',
    fontWeight: '500',
  },
  actionSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  payButton: {
    marginTop: 8,
  },
  releaseButton: {
    marginTop: 8,
  },
  statusMessage: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    fontSize: 14,
    color: '#1976d2',
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
  },
});

export default PaymentScreen;



