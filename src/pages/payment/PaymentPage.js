import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Grid,
  Chip,
  TextField,
} from '@mui/material';
import {
  Lock,
  CheckCircle,
  AccountBalance,
  CreditCard,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { db } from '../../lib/supabase';
import { formatAmount, getStatusLabel, getStatusColor, processMockPayment } from '../../lib/paymentServiceMock';

const PaymentPage = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  useEffect(() => {
    loadPayment();
  }, [paymentId]);

  const loadPayment = async () => {
    try {
      setLoading(true);
      const paymentData = await db.payments.getById(paymentId);
      setPayment(paymentData);
    } catch (err) {
      console.error('Error loading payment:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMockPayment = async () => {
    if (!payment) return;

    // Validate card details (basic validation)
    if (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv || !cardDetails.cardholderName) {
      alert('Please fill in all card details');
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      // Process mock payment
      const result = await processMockPayment(payment.id, payment.amount);

      if (result.success) {
        // Update payment status in database
        await db.payments.markAsPaid(payment.id, result.chargeId);
        await loadPayment();
        alert('✅ Payment successful! Funds are now held in escrow.');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReleaseEscrow = async () => {
    if (!window.confirm('Are you sure you want to release the escrow funds to the provider? This action cannot be undone.')) {
      return;
    }

    try {
      setProcessing(true);
      await db.payments.releaseEscrow(paymentId, user.id);
      await loadPayment();
      alert('Funds released successfully!');
    } catch (err) {
      console.error('Error releasing escrow:', err);
      alert(`Failed to release funds: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading payment details...
        </Typography>
      </Container>
    );
  }

  if (error || !payment) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          {error || 'Payment not found'}
        </Alert>
      </Container>
    );
  }

  // Check if user has permission to view this payment
  if (payment.payer_id !== user.id && payment.payee_id !== user.id) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          You don't have permission to view this payment.
        </Alert>
      </Container>
    );
  }

  const isPayer = payment.payer_id === user.id;
  const isPayee = payment.payee_id === user.id;
  const canPay = isPayer && payment.status === 'pending';
  const canRelease = isPayer && payment.status === 'held';

  const steps = [
    { label: 'Payment Initiated', completed: payment.status !== 'pending' },
    { label: 'Funds in Escrow', completed: payment.status === 'held' || payment.status === 'released' },
    { label: 'Job Completed', completed: payment.status === 'held' || payment.status === 'released' },
    { label: 'Funds Released', completed: payment.status === 'released' },
  ];

  const activeStep = payment.status === 'pending' ? 0 : 
                     payment.status === 'held' ? 2 : 
                     payment.status === 'released' ? 3 : 0;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
        Payment Details
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {formatAmount(payment.amount, payment.currency)}
            </Typography>
            <Chip
              label={getStatusLabel(payment.status)}
              color={getStatusColor(payment.status)}
              sx={{ fontWeight: 600 }}
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Request
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {payment.proposals?.requests?.title || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                {isPayer ? 'Provider' : 'Client'}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {isPayer 
                  ? `${payment.payee?.first_name || ''} ${payment.payee?.last_name || ''}`.trim() || payment.payee?.email
                  : `${payment.payer?.first_name || ''} ${payment.payer?.last_name || ''}`.trim() || payment.payer?.email
                }
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Created
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {new Date(payment.created_at).toLocaleDateString()}
              </Typography>
            </Grid>
            {payment.released_at && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Released
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {new Date(payment.released_at).toLocaleDateString()}
                </Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Payment Status Stepper */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Payment Status
          </Typography>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((step, index) => (
              <Step key={index} completed={step.completed}>
                <StepLabel>{step.label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Mock Payment Form (if pending) */}
      {canPay && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <CreditCard sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Test Payment (Mock Mode)
              </Typography>
            </Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              <strong>Demo Mode:</strong> This is a test payment. No real money will be charged.
              Your payment will be held in escrow until you approve the completed work.
            </Alert>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Cardholder Name"
                  value={cardDetails.cardholderName}
                  onChange={(e) => setCardDetails({...cardDetails, cardholderName: e.target.value})}
                  placeholder="John Doe"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Card Number"
                  value={cardDetails.cardNumber}
                  onChange={(e) => setCardDetails({...cardDetails, cardNumber: e.target.value})}
                  placeholder="4242 4242 4242 4242"
                  inputProps={{ maxLength: 19 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Expiry Date"
                  value={cardDetails.expiryDate}
                  onChange={(e) => setCardDetails({...cardDetails, expiryDate: e.target.value})}
                  placeholder="MM/YY"
                  inputProps={{ maxLength: 5 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="CVV"
                  value={cardDetails.cvv}
                  onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                  placeholder="123"
                  inputProps={{ maxLength: 4 }}
                />
              </Grid>
            </Grid>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              onClick={handleMockPayment}
              disabled={processing}
              startIcon={processing ? <CircularProgress size={20} /> : <Lock />}
            >
              {processing ? 'Processing Payment...' : `Pay ${formatAmount(payment.amount, payment.currency)}`}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Escrow Release (if held) */}
      {canRelease && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AccountBalance sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Release Escrow Funds
              </Typography>
            </Box>
            <Alert severity="success" sx={{ mb: 3 }}>
              Funds are currently held in escrow. Once you approve the completed work, 
              you can release the funds to the provider.
            </Alert>
            <Button
              variant="contained"
              color="success"
              size="large"
              fullWidth
              onClick={handleReleaseEscrow}
              disabled={processing}
              startIcon={<CheckCircle />}
            >
              {processing ? 'Processing...' : 'Release Funds to Provider'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Status Messages */}
      {payment.status === 'held' && isPayee && (
        <Alert severity="info">
          Your payment is being held in escrow. The client will release it once they approve the completed work.
        </Alert>
      )}

      {payment.status === 'released' && (
        <Alert severity="success">
          Funds have been released successfully!
        </Alert>
      )}

      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        {payment.proposals?.request_id && (
          <Button
            variant="outlined"
            onClick={() => navigate(`/requests/${payment.proposals.request_id}`)}
          >
            View Request
          </Button>
        )}
      </Box>
    </Container>
  );
};

export default PaymentPage;
