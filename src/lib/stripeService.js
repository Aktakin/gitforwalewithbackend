/**
 * Stripe Payment Service
 * 
 * Handles all Stripe payment operations.
 * Requires a backend API for secure operations (payment intent creation).
 */

const STRIPE_API_URL = process.env.REACT_APP_PAYMENT_API_URL || 'http://localhost:3001/api/payments';

class StripePaymentService {
  constructor() {
    this.provider = 'stripe';
  }

  /**
   * Create a payment intent via backend API
   */
  async createPaymentIntent({ amount, currency = 'usd', metadata = {} }) {
    try {
      const response = await fetch(`${STRIPE_API_URL}/create-intent`, {
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
        throw new Error(error.error || 'Failed to create payment intent');
      }

      const data = await response.json();
      return {
        id: data.id,
        clientSecret: data.clientSecret,
        amount: Math.round(amount * 100),
        currency,
        metadata,
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  /**
   * Confirm a payment intent via backend API
   */
  async confirmPayment(paymentIntentId, paymentMethodId) {
    try {
      const response = await fetch(`${STRIPE_API_URL}/confirm-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId,
          paymentMethodId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to confirm payment');
      }

      const paymentIntent = await response.json();
      
      // Return in format expected by paymentService
      return {
        id: paymentIntent.id,
        status: paymentIntent.status,
        charges: {
          data: paymentIntent.charges?.data || [{
            id: paymentIntent.latest_charge || `ch_${Date.now()}`,
            receipt_url: paymentIntent.charges?.data?.[0]?.receipt_url,
          }],
        },
      };
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }

  /**
   * Get payment intent status
   */
  async getPaymentIntentStatus(paymentIntentId) {
    try {
      const response = await fetch(`${STRIPE_API_URL}/status/${paymentIntentId}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get payment status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw error;
    }
  }

  /**
   * Create a payment method (handled client-side with Stripe Elements)
   * This is a placeholder - actual payment method creation happens via Stripe Elements
   */
  async createPaymentMethod({ type, card, billing_details }) {
    // Payment methods are created via Stripe Elements in the frontend
    // This method is kept for compatibility with paymentService
    throw new Error('Payment methods should be created via Stripe Elements');
  }

  /**
   * Calculate fees (Stripe-like fees: 2.9% + $0.30)
   */
  calculateFees(amount) {
    const processingFee = (amount * 0.029) + 0.30;
    const platformFee = amount * 0.10; // 10% platform fee
    const netAmount = amount - processingFee - platformFee;

    return {
      processingFee: parseFloat(processingFee.toFixed(2)),
      platformFee: parseFloat(platformFee.toFixed(2)),
      netAmount: parseFloat(netAmount.toFixed(2)),
      total: amount,
    };
  }

  /**
   * Create a refund (requires backend)
   */
  async createRefund({ paymentIntentId, amount, reason }) {
    try {
      const response = await fetch(`${STRIPE_API_URL}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId,
          amount: Math.round(amount * 100),
          reason,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create refund');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating refund:', error);
      throw error;
    }
  }

  /**
   * Create a payout (requires backend)
   */
  async createPayout({ amount, currency = 'usd', destination, description }) {
    try {
      const response = await fetch(`${STRIPE_API_URL}/payout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100),
          currency,
          destination,
          description,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create payout');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating payout:', error);
      throw error;
    }
  }

  /**
   * Create a transfer to provider's connected account (for escrow release)
   */
  async createTransfer({ amount, currency = 'usd', destination, description, metadata = {} }) {
    try {
      const response = await fetch(`${STRIPE_API_URL}/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency,
          destination, // Provider's Stripe connected account ID
          description: description || 'Escrow release to provider',
          metadata,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create transfer');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating transfer:', error);
      throw error;
    }
  }

  /**
   * Detach payment method (requires backend)
   */
  async detachPaymentMethod(paymentMethodId) {
    try {
      const response = await fetch(`${STRIPE_API_URL}/detach-payment-method`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentMethodId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to detach payment method');
      }

      return await response.json();
    } catch (error) {
      console.error('Error detaching payment method:', error);
      throw error;
    }
  }
}

export default new StripePaymentService();

