import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { db } from '../../lib/supabase';
import { formatAmount } from '../../lib/paymentService';

const PaymentForm = ({ paymentId, amount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw submitError;
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/${paymentId}/success`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        throw confirmError;
      }

      if (paymentIntent.status === 'succeeded') {
        // Update payment status in database
        await db.payments.markAsPaid(paymentId, paymentIntent.id);
        setSuccess(true);
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'An error occurred processing your payment');
    } finally {
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <Alert severity="success" sx={{ mb: 2 }}>
        Payment successful! Your funds are now held in escrow.
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Payment Amount: {formatAmount(amount)}
        </Typography>
        <PaymentElement />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        type="submit"
        variant="contained"
        color="primary"
        size="large"
        fullWidth
        disabled={!stripe || processing}
        sx={{ mt: 2 }}
      >
        {processing ? (
          <>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            Processing...
          </>
        ) : (
          `Pay ${formatAmount(amount)}`
        )}
      </Button>
    </form>
  );
};

export default PaymentForm;



