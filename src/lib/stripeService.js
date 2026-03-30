/**
 * Stripe Payment Service
 * 
 * Handles all Stripe payment operations.
 * Requires a backend API for secure operations (payment intent creation).
 */

/**
 * Use a full URL to the payment server (not CRA's /api proxy). Calling `/api/...` on :3000 can
 * return index.html if the dev proxy misbehaves — that caused "Unexpected token '<'" / HTML errors.
 * CORS on server/payment-api.js allows http://localhost:3000 and http://127.0.0.1:3000.
 */
function getPaymentApiBase() {
  const raw = (process.env.REACT_APP_PAYMENT_API_URL || '').replace(/\/$/, '');
  if (raw && !/localhost:3001|127\.0\.0\.1:3001/.test(raw)) {
    return raw;
  }
  if (process.env.NODE_ENV === 'production') {
    // eslint-disable-next-line no-console
    console.error(
      'Set REACT_APP_PAYMENT_API_URL in your host (e.g. Vercel) to your deployed payment API, e.g. https://your-service.railway.app/api/payments — not localhost.'
    );
  }
  return 'http://localhost:3001/api/payments';
}

const STRIPE_API_URL = getPaymentApiBase();

/** Avoid "Unexpected token '<'" when the dev server returns index.html instead of JSON. */
async function parsePaymentApiJson(response) {
  const text = await response.text();
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error(`Empty response from payment API (HTTP ${response.status}).`);
  }
  if (trimmed.startsWith('<!DOCTYPE') || trimmed.toLowerCase().startsWith('<html')) {
    throw new Error(
      'Payment server returned a web page instead of JSON — usually the React dev server, not payment-api. Run `npm run payment-api` (keep it open), open http://127.0.0.1:3001/health and confirm you see JSON, then try again.'
    );
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `Payment API did not return JSON (HTTP ${response.status}): ${trimmed.slice(0, 160)}`
    );
  }
}

function networkErrorHelp(err, url) {
  const msg = err?.message || '';
  if (msg === 'Failed to fetch' || msg.includes('NetworkError') || msg.includes('Load failed')) {
    return new Error(
      `Cannot reach payment server (${url}). Keep npm run payment-api running; open http://localhost:3001/health (JSON). If that works, this is often a browser/CORS issue — try the same hostname for the app and API (e.g. only use http://localhost:3000 for the app).`
    );
  }
  return err;
}

class StripePaymentService {
  constructor() {
    this.provider = 'stripe';
  }

  /**
   * Create a payment intent via backend API
   */
  async createPaymentIntent({ amount, currency = 'usd', metadata = {} }) {
    try {
      // `amount` is already in cents (see paymentService.createProposalPayment)
      const amountCents = Math.round(amount);
      const response = await fetch(`${STRIPE_API_URL}/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountCents,
          currency,
          metadata,
        }),
      });

      const data = await parsePaymentApiJson(response);
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment intent');
      }

      return {
        id: data.id,
        clientSecret: data.clientSecret,
        amount: amountCents,
        currency,
        metadata,
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw networkErrorHelp(error, `${STRIPE_API_URL}/create-intent`);
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

      const paymentIntent = await parsePaymentApiJson(response);
      if (!response.ok) {
        throw new Error(paymentIntent.error || 'Failed to confirm payment');
      }

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
      throw networkErrorHelp(error, `${STRIPE_API_URL}/confirm-intent`);
    }
  }

  /**
   * Get payment intent status
   */
  async getPaymentIntentStatus(paymentIntentId) {
    try {
      const response = await fetch(`${STRIPE_API_URL}/status/${paymentIntentId}`);

      const data = await parsePaymentApiJson(response);
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get payment status');
      }

      return data;
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw networkErrorHelp(error, `${STRIPE_API_URL}/status/...`);
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

      const data = await parsePaymentApiJson(response);
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create refund');
      }

      return data;
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

      const data = await parsePaymentApiJson(response);
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payout');
      }

      return data;
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

      const data = await parsePaymentApiJson(response);
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create transfer');
      }

      return data;
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

      const data = await parsePaymentApiJson(response);
      if (!response.ok) {
        throw new Error(data.error || 'Failed to detach payment method');
      }

      return data;
    } catch (error) {
      console.error('Error detaching payment method:', error);
      throw error;
    }
  }
}

export default new StripePaymentService();

