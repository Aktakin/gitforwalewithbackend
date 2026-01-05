import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  CreditCard,
  Lock,
  CheckCircle,
} from '@mui/icons-material';
import {
  PaymentElement,
  useStripe,
  useElements,
  Elements,
} from '@stripe/react-stripe-js';
import paymentService from '../../lib/paymentService';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { loadStripe } from '@stripe/stripe-js';

// Load Stripe instance for nested Elements
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '');

/**
 * Wrapper component for PaymentElement that receives clientSecret
 * This component has access to stripe and elements from the nested Elements context
 */
const PaymentElementWrapper = ({ onPaymentReady }) => {
  const stripe = useStripe();
  const elements = useElements();
  
  // Notify parent when stripe and elements are ready
  useEffect(() => {
    if (stripe && elements && onPaymentReady) {
      onPaymentReady({ stripe, elements });
    }
  }, [stripe, elements, onPaymentReady]);
  
  return (
    <PaymentElement 
      options={{
        layout: 'tabs',
      }}
    />
  );
};

/**
 * Payment Modal Component
 * 
 * Handles payment processing for proposals, bookings, etc.
 * Uses Stripe Elements when Stripe is configured, otherwise uses mock payment
 */
const PaymentModal = ({
  open,
  onClose,
  amount,
  proposalId,
  requestId,
  description,
  onSuccess,
  onError,
}) => {
  const { user } = useAuth();
  const outerStripe = useStripe();
  const outerElements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [fees, setFees] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [success, setSuccess] = useState(false);
  const [nestedStripe, setNestedStripe] = useState(null);
  const [nestedElements, setNestedElements] = useState(null);

  const isStripeEnabled = paymentService.provider === 'stripe' && outerStripe;

  // Initialize payment when modal opens
  useEffect(() => {
    if (open && proposalId && user?.id && !paymentId && !clientSecret) {
      initializePayment();
    }
  }, [open, proposalId, user?.id]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setPaymentId(null);
      setClientSecret(null);
      setFees(null);
      setError(null);
      setSuccess(false);
      setProcessing(false);
      setNestedStripe(null);
      setNestedElements(null);
    }
  }, [open]);

  const initializePayment = async () => {
    try {
      setError(null);
      const result = await paymentService.createProposalPayment(
        proposalId,
        user.id
      );
      setPaymentId(result.payment.id);
      setFees(result.fees);
      
      // If using Stripe, set client secret from paymentIntent or payment metadata
      if (result.paymentIntent?.clientSecret) {
        setClientSecret(result.paymentIntent.clientSecret);
      } else if (result.payment?.metadata?.clientSecret) {
        setClientSecret(result.payment.metadata.clientSecret);
      }
    } catch (err) {
      console.error('Error initializing payment:', err);
      setError(err.message || 'Failed to initialize payment');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent double submission
    if (processing) {
      return;
    }
    
    if (!user?.id) {
      setError('Please log in to complete payment');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      if (isStripeEnabled) {
        // Stripe payment flow
        await handleStripePayment();
      } else {
        // Mock payment flow (fallback)
        await handleMockPayment();
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
      onError && onError(err);
    } finally {
      setProcessing(false);
    }
  };

  const handleStripePayment = async () => {
    // Use nested stripe and elements (from the Elements wrapper with clientSecret)
    const stripe = nestedStripe;
    const elements = nestedElements;
    
    if (!stripe || !elements || !clientSecret) {
      throw new Error('Stripe not initialized. Please wait for payment form to load.');
    }

    // Submit payment element
    const { error: submitError } = await elements.submit();
    if (submitError) {
      throw submitError;
    }

    // Confirm payment (this automatically confirms the PaymentIntent)
    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success`,
      },
      redirect: 'if_required',
    });

    if (confirmError) {
      // Check if error is because payment already succeeded
      if (confirmError.message && confirmError.message.includes('already succeeded')) {
        // Payment already succeeded, just update database
        console.log('Payment already succeeded, updating database...');
        try {
          await paymentService.updatePaymentStatus({
            paymentId,
            status: 'succeeded',
            paymentIntentId: paymentIntent?.id,
          });
          setSuccess(true);
          onSuccess && onSuccess({ paymentIntent, paymentId });
          setTimeout(() => {
            onClose();
          }, 2000);
          return;
        } catch (updateError) {
          console.error('Error updating payment status:', updateError);
          // Continue with normal error handling
        }
      }
      throw confirmError;
    }

    if (paymentIntent.status === 'succeeded') {
      // Payment succeeded - update database without trying to confirm again
      try {
        await paymentService.updatePaymentStatus({
          paymentId,
          status: 'succeeded',
          paymentIntentId: paymentIntent.id,
          paymentMethodId: paymentIntent.payment_method,
          chargeId: paymentIntent.latest_charge,
        });
      } catch (updateError) {
        console.error('Error updating payment in database:', updateError);
        // Don't fail the payment if database update fails
      }

      setSuccess(true);
      onSuccess && onSuccess({ paymentIntent, paymentId });
      
      setTimeout(() => {
        onClose();
      }, 2000);
    } else {
      throw new Error(`Payment status: ${paymentIntent.status}`);
    }
  };

  const handleMockPayment = async () => {
    // Mock payment flow (for testing without Stripe)
    const result = await paymentService.processPayment({
      paymentId,
      paymentMethodId: 'pm_mock_' + Date.now(),
    });

    if (result.success) {
      setSuccess(true);
      onSuccess && onSuccess(result);
      setTimeout(() => {
        onClose();
      }, 2000);
    } else {
      throw new Error('Payment failed');
    }
  };

  const calculateFees = () => {
    if (fees) return fees;
    
    const processingFee = (amount * 0.029) + 0.30;
    const platformFee = amount * 0.10;
    const netAmount = amount - processingFee - platformFee;

    return {
      processingFee: parseFloat(processingFee.toFixed(2)),
      platformFee: parseFloat(platformFee.toFixed(2)),
      netAmount: parseFloat(netAmount.toFixed(2)),
      total: amount,
    };
  };

  const feeBreakdown = calculateFees();

  return (
    <Dialog 
      open={open} 
      onClose={!processing ? onClose : undefined}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Lock color="primary" />
          <Typography variant="h6">Secure Payment</Typography>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          {/* Payment Summary */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Payment Summary
            </Typography>
            <Typography variant="body2" gutterBottom>
              {description || 'Payment for proposal acceptance'}
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemText primary="Subtotal" />
                <Typography variant="body2">${amount.toFixed(2)}</Typography>
              </ListItem>
              <ListItem>
                <ListItemText primary="Processing Fee (2.9% + $0.30)" />
                <Typography variant="body2">${feeBreakdown.processingFee.toFixed(2)}</Typography>
              </ListItem>
              <ListItem>
                <ListItemText primary="Platform Fee (10%)" />
                <Typography variant="body2">${feeBreakdown.platformFee.toFixed(2)}</Typography>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary={<Typography variant="subtitle1" fontWeight={700}>Total</Typography>} 
                />
                <Typography variant="h6" fontWeight={700} color="primary">
                  ${amount.toFixed(2)}
                </Typography>
              </ListItem>
            </List>

            <Alert severity="info" sx={{ mt: 2 }}>
              Provider receives: ${feeBreakdown.netAmount.toFixed(2)}
            </Alert>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Payment Method */}
          <Box>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CreditCard fontSize="small" />
              Payment Method
            </Typography>
            
            {isStripeEnabled ? (
              <>
                {clientSecret ? (
                  <Elements 
                    stripe={stripePromise} 
                    options={{
                      clientSecret: clientSecret,
                      appearance: {
                        theme: 'stripe',
                      },
                    }}
                  >
                    <PaymentElementWrapper 
                      onPaymentReady={({ stripe, elements }) => {
                        setNestedStripe(stripe);
                        setNestedElements(elements);
                      }}
                    />
                  </Elements>
                ) : (
                  <Alert severity="info">
                    Initializing payment...
                  </Alert>
                )}
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Lock fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    Your payment information is secure and encrypted by Stripe
                  </Typography>
                </Box>
              </>
            ) : (
              <Alert severity="warning" sx={{ mb: 2 }}>
                🧪 Mock Payment Mode - Stripe not configured. No real charges will be made.
                <br />
                <Typography variant="caption">
                  To enable real payments, set REACT_APP_STRIPE_PUBLISHABLE_KEY in your .env file
                </Typography>
              </Alert>
            )}
          </Box>

          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {/* Success Message */}
          {success && (
            <Alert 
              severity="success" 
              icon={<CheckCircle />}
              sx={{ mt: 2 }}
            >
              Payment successful! Redirecting...
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={onClose} 
            disabled={processing}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={processing || !isStripeEnabled || !clientSecret || !nestedStripe || !nestedElements}
            startIcon={processing ? <CircularProgress size={20} /> : <Lock />}
            sx={{ minWidth: 120 }}
          >
            {processing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PaymentModal;
