import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  CreditCard,
  Lock,
  CheckCircle,
} from '@mui/icons-material';
import paymentService from '../../lib/paymentService';

/**
 * Payment Modal Component
 * 
 * Handles payment processing for proposals, bookings, etc.
 * Uses mock payment service (ready for Stripe integration)
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
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [fees, setFees] = useState(null);

  // Mock card details (in production, use Stripe Elements)
  const [cardNumber, setCardNumber] = useState('4242424242424242');
  const [expMonth, setExpMonth] = useState('12');
  const [expYear, setExpYear] = useState('2025');
  const [cvc, setCvc] = useState('123');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    try {
      // Step 1: Create payment (or use existing paymentId)
      let payment = null;
      let paymentFees = null;

      if (!paymentId && proposalId) {
        const result = await paymentService.createProposalPayment(
          proposalId,
          'current-user-id' // Replace with actual user ID from auth
        );
        payment = result.payment;
        paymentFees = result.fees;
        setPaymentId(payment.id);
        setFees(paymentFees);
      }

      // Step 2: Add payment method (mock)
      const paymentMethodResult = await paymentService.addPaymentMethod({
        userId: 'current-user-id', // Replace with actual user ID
        cardDetails: {
          number: cardNumber,
          exp_month: parseInt(expMonth),
          exp_year: parseInt(expYear),
          cvc: cvc,
        },
        billingAddress: {
          line1: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          postal_code: '94111',
          country: 'US',
        },
      });

      // Step 3: Process payment
      const result = await paymentService.processPayment({
        paymentId: payment?.id || paymentId,
        paymentMethodId: paymentMethodResult.paymentMethod.provider_payment_method_id,
      });

      if (result.success) {
        onSuccess && onSuccess(result);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        throw new Error('Payment failed');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
      onError && onError(err);
    } finally {
      setProcessing(false);
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

          {/* Mock Card Form */}
          <Box>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CreditCard fontSize="small" />
              Payment Method
            </Typography>
            
            <Alert severity="warning" sx={{ mb: 2 }}>
              🧪 Mock Payment Mode - No real charges will be made
            </Alert>

            <TextField
              fullWidth
              label="Card Number"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="4242 4242 4242 4242"
              margin="normal"
              required
              disabled={processing}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="MM"
                value={expMonth}
                onChange={(e) => setExpMonth(e.target.value)}
                placeholder="12"
                margin="normal"
                required
                disabled={processing}
                sx={{ width: '33%' }}
              />
              <TextField
                label="YYYY"
                value={expYear}
                onChange={(e) => setExpYear(e.target.value)}
                placeholder="2025"
                margin="normal"
                required
                disabled={processing}
                sx={{ width: '33%' }}
              />
              <TextField
                label="CVC"
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                placeholder="123"
                margin="normal"
                required
                disabled={processing}
                sx={{ width: '33%' }}
              />
            </Box>

            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Lock fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                Your payment information is secure and encrypted
              </Typography>
            </Box>
          </Box>

          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {/* Success Message */}
          {processing === false && error === null && paymentId && (
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
            disabled={processing}
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


