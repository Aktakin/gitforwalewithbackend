/**
 * Payment Service for Stripe Integration (Mobile)
 * 
 * This service handles payment processing using Stripe React Native SDK.
 * For production, you'll need to set up a backend API endpoint
 * to securely handle Stripe operations.
 */

import { initStripe, useStripe } from '@stripe/stripe-react-native';

// Stripe publishable key from environment variables
const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;

// Backend API endpoint for payment operations
const PAYMENT_API_URL = process.env.EXPO_PUBLIC_PAYMENT_API_URL || 'http://localhost:3001/api/payments';

/**
 * Initialize Stripe for React Native
 */
export const initializeStripeMobile = async () => {
  if (!STRIPE_PUBLISHABLE_KEY) {
    console.warn('Stripe publishable key not configured. Set EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY in .env');
    return false;
  }

  try {
    await initStripe({
      publishableKey: STRIPE_PUBLISHABLE_KEY,
      merchantIdentifier: 'merchant.com.skillbridge', // iOS only
    });
    return true;
  } catch (error) {
    console.error('Failed to initialize Stripe:', error);
    return false;
  }
};

/**
 * Create a payment intent on the backend
 */
export const createPaymentIntent = async (amount, currency = 'usd', metadata = {}) => {
  try {
    const response = await fetch(`${PAYMENT_API_URL}/create-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create payment intent');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

/**
 * Process payment using Stripe React Native
 */
export const processPaymentMobile = async (paymentIntentClientSecret, billingDetails = {}) => {
  const stripe = useStripe();
  
  if (!stripe) {
    throw new Error('Stripe not initialized');
  }

  try {
    const { error, paymentIntent } = await stripe.confirmPayment(
      paymentIntentClientSecret,
      {
        paymentMethodType: 'Card',
        billingDetails,
      }
    );

    if (error) {
      throw new Error(error.message);
    }

    return paymentIntent;
  } catch (error) {
    console.error('Payment processing error:', error);
    throw error;
  }
};

/**
 * Get payment status
 */
export const getPaymentStatus = async (paymentIntentId) => {
  try {
    const response = await fetch(`${PAYMENT_API_URL}/status/${paymentIntentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get payment status');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting payment status:', error);
    throw error;
  }
};

/**
 * Format amount for display
 */
export const formatAmount = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Payment status helpers
 */
export const paymentStatus = {
  PENDING: 'pending',
  PAID: 'paid',
  HELD: 'held',
  RELEASED: 'released',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled',
};

export const getStatusColor = (status) => {
  const colors = {
    pending: '#ff9800',
    paid: '#2196f3',
    held: '#9c27b0',
    released: '#4caf50',
    refunded: '#757575',
    cancelled: '#f44336',
  };
  return colors[status] || '#757575';
};

export const getStatusLabel = (status) => {
  const labels = {
    pending: 'Payment Pending',
    paid: 'Payment Received',
    held: 'Funds in Escrow',
    released: 'Funds Released',
    refunded: 'Refunded',
    cancelled: 'Cancelled',
  };
  return labels[status] || status;
};



