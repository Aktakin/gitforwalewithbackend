import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { AccountBalance, CreditCard, Lock } from '@mui/icons-material';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { db } from '../../lib/supabase';
import paymentService, {
  formatAmount,
  getStatusColor,
  getStatusLabel,
} from '../../lib/paymentService';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '');

const StripeCheckoutForm = ({ amount, clientSecret, paymentId, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setProcessing(true);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw submitError;
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment/${paymentId}`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        throw confirmError;
      }

      if (paymentIntent?.status === 'succeeded') {
        await paymentService.updatePaymentStatus({
          paymentId,
          status: 'succeeded',
          paymentIntentId: paymentIntent.id,
          paymentMethodId: paymentIntent.payment_method,
          chargeId: paymentIntent.latest_charge,
        });
        onSuccess();
        return;
      }

      throw new Error(`Unexpected payment status: ${paymentIntent?.status || 'unknown'}`);
    } catch (error) {
      onError(error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
          Complete Payment
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Total due: {formatAmount(amount)}
        </Typography>
        <PaymentElement options={{ layout: 'tabs' }} />
      </Box>
      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        startIcon={processing ? <CircularProgress size={18} /> : <Lock />}
        disabled={!stripe || !elements || processing}
      >
        {processing ? 'Processing Payment...' : `Pay ${formatAmount(amount)}`}
      </Button>
    </form>
  );
};

const PaymentPage = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncingRedirect, setSyncingRedirect] = useState(false);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const loadPayment = async () => {
    try {
      setLoading(true);
      setError(null);
      const paymentData = await db.payments.getById(paymentId);
      setPayment(paymentData);
    } catch (err) {
      console.error('Error loading payment:', err);
      setError(err.message || 'Failed to load payment.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayment();
  }, [paymentId]);

  useEffect(() => {
    const reconcileRedirect = async () => {
      const search = new URLSearchParams(location.search);
      const redirectedPaymentIntentId = search.get('payment_intent');

      if (!redirectedPaymentIntentId || !payment || payment.status !== 'pending') {
        return;
      }

      if (paymentService.provider !== 'stripe') {
        return;
      }

      try {
        setSyncingRedirect(true);
        const paymentIntent = await paymentService.paymentProvider.getPaymentIntentStatus(
          redirectedPaymentIntentId
        );

        if (paymentIntent.status === 'succeeded') {
          await paymentService.updatePaymentStatus({
            paymentId: payment.id,
            status: 'succeeded',
            paymentIntentId: paymentIntent.id,
            paymentMethodId: paymentIntent.payment_method,
            chargeId: paymentIntent.latest_charge,
          });
          setActionMessage('Payment confirmed. Funds are now held in escrow.');
          await loadPayment();
        }
      } catch (redirectError) {
        console.error('Error reconciling redirected payment:', redirectError);
        setError(redirectError.message || 'Failed to verify redirected payment.');
      } finally {
        navigate(`/payment/${paymentId}`, { replace: true });
        setSyncingRedirect(false);
      }
    };

    reconcileRedirect();
  }, [location.search, navigate, payment, paymentId]);

  if (loading || syncingRedirect) {
    return (
      <Container maxWidth="md" sx={{ py: 6, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          {syncingRedirect ? 'Verifying payment with Stripe...' : 'Loading payment details...'}
        </Typography>
      </Container>
    );
  }

  if (error || !payment) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="error">{error || 'Payment not found.'}</Alert>
      </Container>
    );
  }

  const payerId = payment.payer_id || payment.user_id;
  const payeeId = payment.payee_id || payment.metadata?.providerUserId || payment.proposal?.user_id;
  const isPayer = payerId === user?.id;
  const isPayee = payeeId === user?.id;
  const canView = isPayer || isPayee;
  const status = payment.status || 'pending';
  const clientSecret = payment.metadata?.clientSecret || '';
  const canPay = isPayer && status === 'pending';
  const settled = ['held', 'released', 'paid', 'succeeded'].includes(status);
  const activeStep = status === 'released' ? 3 : settled ? 2 : 0;
  const steps = [
    { label: 'Payment Initiated', completed: status !== 'pending' },
    { label: 'Funds Captured', completed: settled },
    { label: 'Funds in Escrow', completed: ['held', 'released'].includes(status) },
    { label: 'Funds Released', completed: status === 'released' },
  ];

  if (!canView) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="error">You do not have permission to view this payment.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>
        Payment Details
      </Typography>

      {actionMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {actionMessage}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {formatAmount(payment.amount, payment.currency || 'USD')}
            </Typography>
            <Chip label={getStatusLabel(status)} color={getStatusColor(status)} sx={{ fontWeight: 600 }} />
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Request
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {payment.request?.title || payment.proposal?.title || 'Service Request'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Role
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {isPayer ? 'Client / payer' : 'Provider / recipient'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Created
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {payment.created_at ? new Date(payment.created_at).toLocaleString() : 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Payment Reference
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {payment.payment_intent_id || payment.stripe_payment_intent_id || payment.transaction_id || payment.id}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Payment Status
          </Typography>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((step) => (
              <Step key={step.label} completed={step.completed}>
                <StepLabel>{step.label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {canPay && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CreditCard color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Checkout
              </Typography>
            </Box>

            <Alert severity={paymentService.provider === 'stripe' ? 'info' : 'warning'} sx={{ mb: 3 }}>
              {paymentService.provider === 'stripe'
                ? 'Stripe is enabled. Your card details are collected securely by Stripe.'
                : 'Stripe is not configured. This project is currently running in mock payment mode.'}
            </Alert>

            {paymentService.provider === 'stripe' ? (
              clientSecret ? (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: { theme: 'stripe' },
                  }}
                >
                  <StripeCheckoutForm
                    amount={payment.amount}
                    clientSecret={clientSecret}
                    paymentId={payment.id}
                    onSuccess={async () => {
                      setActionMessage('Payment successful. Funds are now held in escrow.');
                      await loadPayment();
                    }}
                    onError={(paymentError) => {
                      console.error('Stripe payment error:', paymentError);
                      setError(paymentError.message || 'Payment failed.');
                    }}
                  />
                </Elements>
              ) : (
                <Alert severity="error">
                  This payment is missing its Stripe client secret. Recreate the payment intent before retrying checkout.
                </Alert>
              )
            ) : (
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={async () => {
                  try {
                    setError(null);
                    await paymentService.processPayment({
                      paymentId: payment.id,
                      paymentMethodId: `pm_mock_${Date.now()}`,
                    });
                    setActionMessage('Mock payment completed. Funds are now held in escrow.');
                    await loadPayment();
                  } catch (mockError) {
                    console.error('Mock payment error:', mockError);
                    setError(mockError.message || 'Mock payment failed.');
                  }
                }}
              >
                Pay {formatAmount(payment.amount)}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {status === 'held' && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <AccountBalance color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Escrow
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Funds are being held securely in escrow until the customer approves the finished work from the dashboard.
            </Typography>
            <Alert severity="info">
              {isPayer
                ? 'Approve the completed job from your client dashboard to release payment to the provider.'
                : 'Payment will be released after the customer approves the completed job.'}
            </Alert>
          </CardContent>
        </Card>
      )}

      <Divider sx={{ my: 3 }} />

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {payment.request_id && (
          <Button variant="outlined" onClick={() => navigate(`/requests/${payment.request_id}`)}>
            View Request
          </Button>
        )}
        <Button variant="text" onClick={() => navigate(-1)}>
          Back
        </Button>
      </Box>
    </Container>
  );
};

export default PaymentPage;
