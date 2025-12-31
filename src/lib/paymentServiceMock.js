/**
 * Mock Payment Service for Testing Payment Flow
 * 
 * This simulates payment processing without requiring Stripe setup.
 * Use this to test the payment UI/UX before integrating real Stripe.
 */

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
    pending: 'warning',
    paid: 'info',
    held: 'primary',
    released: 'success',
    refunded: 'default',
    cancelled: 'error',
  };
  return colors[status] || 'default';
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

/**
 * Mock payment processing - simulates Stripe payment
 */
export const processMockPayment = async (paymentId, amount) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simulate 95% success rate (for testing)
  const success = Math.random() > 0.05;
  
  if (success) {
    return {
      success: true,
      paymentIntentId: `pi_mock_${Date.now()}`,
      chargeId: `ch_mock_${Date.now()}`,
      message: 'Payment processed successfully!'
    };
  } else {
    throw new Error('Payment failed. Please try again.');
  }
};

/**
 * Mock payment intent creation
 */
export const createMockPaymentIntent = async (amount, currency = 'usd', metadata = {}) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    id: `pi_mock_${Date.now()}`,
    clientSecret: `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
    amount: Math.round(amount * 100), // Convert to cents
    currency,
    metadata
  };
};




