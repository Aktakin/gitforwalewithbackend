/**
 * Stripe Payment API Server
 * 
 * This is a simple Express server to handle Stripe operations securely.
 * The secret key must NEVER be exposed to the frontend.
 * 
 * To run:
 * 1. Install dependencies: npm install express stripe cors dotenv
 * 2. Create .env file with STRIPE_SECRET_KEY=sk_test_...
 * 3. Run: node server/payment-api.js
 * 
 * Or use: npm run payment-api (if added to package.json scripts)
 */

// Load environment variables from .env file
const path = require('path');
const dotenv = require('dotenv');

// Try to load .env from server directory first, then root directory
const envPath = path.join(__dirname, '.env');
const rootEnvPath = path.join(__dirname, '..', '.env');

if (require('fs').existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log('📁 Loaded .env from server directory');
} else if (require('fs').existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
  console.log('📁 Loaded .env from root directory');
} else {
  console.warn('⚠️  No .env file found. Make sure STRIPE_SECRET_KEY is set.');
}

const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');

const app = express();

// CRA may use 3002, 3003, … if 3000 is taken — CORS must allow that origin (see console: blocked from :3002).
const defaultDevOrigins = [];
for (let port = 3000; port <= 3020; port++) {
  defaultDevOrigins.push(`http://localhost:${port}`, `http://127.0.0.1:${port}`);
}
defaultDevOrigins.push('http://localhost:5173', 'http://127.0.0.1:5173'); // Vite default

const extraOrigins =
  process.env.ALLOWED_ORIGINS?.split(',').map((s) => s.trim()).filter(Boolean) || [];
const corsOrigins = [...new Set([...defaultDevOrigins, ...extraOrigins])];

const strictCors = process.env.STRIPE_CORS_STRICT === '1';

app.use(
  cors({
    origin(origin, callback) {
      if (!strictCors) return callback(null, true);
      if (!origin) return callback(null, true);
      if (corsOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', provider: 'stripe' });
});

/**
 * Create Payment Intent
 * POST /api/payments/create-intent
 */
app.post('/api/payments/create-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd', metadata = {} } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount in cents
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Confirm Payment Intent
 * POST /api/payments/confirm-intent
 */
app.post('/api/payments/confirm-intent', async (req, res) => {
  try {
    const { paymentIntentId, paymentMethodId } = req.body;

    if (!paymentIntentId || !paymentMethodId) {
      return res.status(400).json({ error: 'paymentIntentId and paymentMethodId are required' });
    }

    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });

    res.json(paymentIntent);
  } catch (error) {
    console.error('Error confirming payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get Payment Intent Status
 * GET /api/payments/status/:paymentIntentId
 */
app.get('/api/payments/status/:paymentIntentId', async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.json(paymentIntent);
  } catch (error) {
    console.error('Error getting payment status:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Create Refund
 * POST /api/payments/refund
 */
app.post('/api/payments/refund', async (req, res) => {
  try {
    const { paymentIntentId, amount, reason } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'paymentIntentId is required' });
    }

    // Get the payment intent to find the charge
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (!paymentIntent.latest_charge) {
      return res.status(400).json({ error: 'No charge found for this payment intent' });
    }

    const refund = await stripe.refunds.create({
      charge: paymentIntent.latest_charge,
      amount: amount ? Math.round(amount) : undefined, // If no amount, full refund
      reason: reason || 'requested_by_customer',
    });

    res.json(refund);
  } catch (error) {
    console.error('Error creating refund:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Create Payout (for providers)
 * POST /api/payments/payout
 */
app.post('/api/payments/payout', async (req, res) => {
  try {
    const { amount, currency = 'usd', destination, description } = req.body;

    if (!amount || !destination) {
      return res.status(400).json({ error: 'amount and destination are required' });
    }

    const transfer = await stripe.transfers.create({
      amount: Math.round(amount),
      currency,
      destination,
      description: description || 'Payout to provider',
    });

    res.json(transfer);
  } catch (error) {
    console.error('Error creating payout:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Create Transfer (for escrow release to provider)
 * POST /api/payments/transfer
 */
app.post('/api/payments/transfer', async (req, res) => {
  try {
    const { amount, currency = 'usd', destination, description, metadata = {} } = req.body;

    if (!amount || !destination) {
      return res.status(400).json({ error: 'amount and destination are required' });
    }

    // Create transfer to provider's connected account
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount), // Amount in cents
      currency,
      destination, // Provider's Stripe connected account ID
      description: description || 'Escrow release to provider',
      metadata: metadata || {},
    });

    res.json({
      id: transfer.id,
      amount: transfer.amount,
      currency: transfer.currency,
      destination: transfer.destination,
      status: transfer.reversed ? 'reversed' : 'paid',
      created: transfer.created,
    });
  } catch (error) {
    console.error('Error creating transfer:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Detach Payment Method
 * POST /api/payments/detach-payment-method
 */
app.post('/api/payments/detach-payment-method', async (req, res) => {
  try {
    const { paymentMethodId } = req.body;

    if (!paymentMethodId) {
      return res.status(400).json({ error: 'paymentMethodId is required' });
    }

    const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId);

    res.json(paymentMethod);
  } catch (error) {
    console.error('Error detaching payment method:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server — listen on all interfaces so localhost / 127.0.0.1 / LAN IP all work
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`✅ Stripe Payment API server running on http://localhost:${PORT} (bound ${HOST})`);
  console.log(`📝 Make sure STRIPE_SECRET_KEY is set in .env`);
  console.log(`🔗 API endpoint: http://localhost:${PORT}/api/payments`);
});

