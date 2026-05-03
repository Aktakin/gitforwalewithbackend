/**
 * Payment Service – Stripe React Native
 *
 * Implements an authorize-now / capture-on-completion pattern so that clients
 * are never charged until they explicitly confirm a job is complete.
 *
 * Flow:
 *   1. Client accepts a proposal → createProposalPayment() creates a DB record.
 *   2. Client opens PaymentScreen → authorizePaymentIntent() creates a Stripe
 *      PaymentIntent with capture_method='manual', then the Stripe Payment Sheet
 *      collects the card and reserves the funds.  The DB record moves to 'held'.
 *   3. Job is completed → client taps "Confirm Job Complete" in their dashboard.
 *      capturePaymentOnJobCompletion() charges the card and (optionally) transfers
 *      net proceeds to the provider's connected Stripe account.
 *   4. If the job is cancelled before capture, cancelPaymentAuthorization() voids
 *      the authorization so the client is never charged.
 */

import { initStripe } from '@stripe/stripe-react-native';
import { db, supabase } from './supabase';

const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const PAYMENT_API_URL =
  process.env.EXPO_PUBLIC_PAYMENT_API_URL || 'http://localhost:3001/api/payments';

// Warn at startup so developers catch misconfiguration before hitting stores.
if (!__DEV__ && PAYMENT_API_URL.includes('localhost')) {
  console.error(
    '[PaymentService] EXPO_PUBLIC_PAYMENT_API_URL points to localhost in a production build. ' +
      'Set it to your deployed HTTPS API URL (e.g. https://api.yourapp.com/api/payments) ' +
      'before building for app stores.'
  );
}

// ---------------------------------------------------------------------------
// Payment status constants  (mirrors the DB enum)
// ---------------------------------------------------------------------------

/** All possible values for a payment's `status` column. */
export const PAYMENT_STATUS = Object.freeze({
  PENDING:   'pending',   // DB record created; card not yet authorized
  HELD:      'held',      // Card authorized – funds reserved, NOT yet charged
  RELEASED:  'released',  // Payment captured – job complete, provider paid
  REFUNDED:  'refunded',  // Full or partial refund issued
  CANCELLED: 'cancelled', // Authorization voided before any capture
});

// ---------------------------------------------------------------------------
// Stripe SDK initialization
// ---------------------------------------------------------------------------

/**
 * Initialize the Stripe React Native SDK.
 * Call once, near app startup (e.g. in App.js or a root provider).
 *
 * @returns {Promise<boolean>} `true` if initialization succeeded.
 */
export const initializeStripe = async () => {
  if (!STRIPE_PUBLISHABLE_KEY) {
    console.warn(
      '[PaymentService] Stripe publishable key is not set. ' +
        'Add EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY to your .env file.'
    );
    return false;
  }

  try {
    await initStripe({
      publishableKey: STRIPE_PUBLISHABLE_KEY,
      merchantIdentifier: 'merchant.com.skillbridge', // Required for Apple Pay (iOS)
    });
    return true;
  } catch (err) {
    console.error('[PaymentService] Stripe initialization failed:', err);
    return false;
  }
};

// ---------------------------------------------------------------------------
// Internal API helper
// ---------------------------------------------------------------------------

/**
 * POST to the payment API and return parsed JSON.
 * Throws a descriptive Error on any non-2xx response.
 *
 * @param {string} path   - Relative path, e.g. '/create-intent'
 * @param {object} body   - Request body (will be JSON-serialized)
 * @returns {Promise<object>}
 */
const apiPost = async (path, body) => {
  let response;
  try {
    response = await fetch(`${PAYMENT_API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (networkErr) {
    throw new Error(
      `[PaymentService] Network request to ${path} failed. ` +
        'Check that the payment server is running and reachable.'
    );
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error(
      `[PaymentService] Payment API at ${path} returned a non-JSON response ` +
        `(HTTP ${response.status}). Make sure the correct URL is configured.`
    );
  }

  if (!response.ok) {
    throw new Error(
      payload?.error ||
        `[PaymentService] Request to ${path} failed with HTTP ${response.status}.`
    );
  }

  return payload;
};

// ---------------------------------------------------------------------------
// Core Stripe operations
// ---------------------------------------------------------------------------

/**
 * Create a Stripe PaymentIntent with `capture_method: 'manual'`.
 *
 * The client's card is authorized (funds reserved) but NOT charged.
 * The charge only occurs when `capturePaymentOnJobCompletion` is called.
 *
 * @param {number}  amount          - Amount in major currency units (e.g. 50.00 for $50.00)
 * @param {string}  [currency='usd'] - ISO 4217 currency code
 * @param {object}  [metadata={}]   - Arbitrary key-value pairs stored on the intent
 * @returns {Promise<{ id: string, clientSecret: string }>}
 */
export const authorizePaymentIntent = async (amount, currency = 'usd', metadata = {}) => {
  if (!amount || amount <= 0) {
    throw new Error('Payment amount must be greater than zero.');
  }

  return apiPost('/create-intent', {
    amount: Math.round(amount * 100), // Convert to whole cents
    currency,
    capture_method: 'manual',
    metadata,
  });
};

/**
 * Capture an authorized PaymentIntent, charging the client's card.
 *
 * Call this only after the client has confirmed the job is complete.
 * Optionally transfers the net amount to the provider's connected Stripe account
 * (required if providers have onboarded via Stripe Connect).
 *
 * @param {string}  paymentIntentId  - Stripe PaymentIntent ID (pi_...)
 * @param {{ destination: string, amount: number, currency?: string } | null} [transferData]
 *   - Pass this to send funds to the provider's connected account immediately
 *     after capture.  `destination` must be a Stripe connected account ID (acct_...).
 * @returns {Promise<{ paymentIntent: object, transfer: object | null }>}
 */
export const capturePaymentOnJobCompletion = async (paymentIntentId, transferData = null) => {
  if (!paymentIntentId) {
    throw new Error('paymentIntentId is required to capture a payment.');
  }

  return apiPost('/capture-intent', {
    paymentIntentId,
    transferData,
  });
};

/**
 * Void an authorized PaymentIntent before it is captured.
 *
 * Use this when a job is cancelled before the client confirms completion.
 * No charge is ever made; the reserved funds are released back to the client.
 *
 * @param {string} paymentIntentId       - Stripe PaymentIntent ID (pi_...)
 * @param {string} [reason='requested_by_customer']
 *   - One of: 'duplicate' | 'fraudulent' | 'requested_by_customer' | 'abandoned'
 * @returns {Promise<{ id: string, status: string, cancellation_reason: string }>}
 */
export const cancelPaymentAuthorization = async (
  paymentIntentId,
  reason = 'requested_by_customer'
) => {
  if (!paymentIntentId) {
    throw new Error('paymentIntentId is required to cancel an authorization.');
  }

  return apiPost('/cancel-intent', {
    paymentIntentId,
    cancellation_reason: reason,
  });
};

// ---------------------------------------------------------------------------
// Proposal payment lifecycle
// ---------------------------------------------------------------------------

/**
 * Create a payment record in the database when a client accepts a proposal.
 *
 * This creates a `pending` payment row linked to the proposal.  The client
 * must then visit PaymentScreen to authorize their card via the Stripe Payment
 * Sheet.  No money moves at this stage.
 *
 * Returns the existing payment if one already exists for this proposal so that
 * this function is safely idempotent.
 *
 * @param {string} proposalId   - UUID of the accepted proposal
 * @param {string} clientUserId - UUID of the client (payer)
 * @returns {Promise<{ success: boolean, payment: object }>}
 */
export const createProposalPayment = async (proposalId, clientUserId) => {
  const proposal = await db.proposals.getById(proposalId);
  if (!proposal) {
    throw new Error('Proposal not found.');
  }

  // Idempotency: return the existing record if one already exists.
  const existing = await db.payments.getByProposal(proposalId);
  if (existing) {
    return { success: true, payment: existing };
  }

  // Resolve the agreed amount: approved budget change → proposed price → 0.
  const amount =
    proposal.metadata?.budget_change_request?.approved_price ??
    proposal.proposed_price ??
    0;

  const payment = await db.payments.create({
    proposal_id:  proposalId,
    request_id:   proposal.request_id,
    payer_id:     clientUserId,
    payee_id:     proposal.user_id,
    amount,
    currency:     'USD',
    status:       'pending',
    payment_type: 'proposal_acceptance',
    is_escrow:    true, // Funds will be held until job completion
    metadata: {
      provider_user_id: proposal.user_id,
    },
  });

  return { success: true, payment };
};

// ---------------------------------------------------------------------------
// Database helpers for job-completion capture flow
// ---------------------------------------------------------------------------

/**
 * Mark a payment as captured in the database after a successful Stripe capture.
 *
 * Updates the payment status to 'released', records the captured timestamp,
 * and inserts a completion transaction record.
 *
 * @param {string} paymentId           - UUID of the payment row
 * @param {string} stripePaymentIntentId - Stripe PaymentIntent ID used to confirm
 * @param {string} releasedByUserId    - UUID of the user who triggered completion (client)
 * @returns {Promise<object>} Updated payment row
 */
export const markPaymentCaptured = async (paymentId, stripePaymentIntentId, releasedByUserId) => {
  const now = new Date().toISOString();

  const updated = await db.payments.update(paymentId, {
    status:               'released',
    escrow_released_at:   now,
    provider_transaction_id: stripePaymentIntentId,
  });

  // Record a completion transaction (non-critical – log but don't throw).
  try {
    await supabase.from('transactions').insert({
      payment_id:  paymentId,
      user_id:     releasedByUserId,
      type:        'escrow_release',
      amount:      updated.amount,
      currency:    updated.currency || 'USD',
      status:      'completed',
      description: 'Payment captured on job completion',
      provider_transaction_id: stripePaymentIntentId,
    });
  } catch (txErr) {
    console.warn('[PaymentService] Transaction record creation failed (non-critical):', txErr);
  }

  return updated;
};

/**
 * Mark a payment as cancelled in the database after a Stripe authorization void.
 *
 * @param {string} paymentId - UUID of the payment row
 * @returns {Promise<object>} Updated payment row
 */
export const markPaymentCancelled = async (paymentId) =>
  db.payments.update(paymentId, {
    status:     'cancelled',
    updated_at: new Date().toISOString(),
  });

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

/**
 * Format a numeric amount as a localized currency string.
 *
 * @param {number} amount
 * @param {string} [currency='USD']
 * @returns {string}  e.g. "$50.00"
 */
export const formatAmount = (amount, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

/**
 * Map a payment status to a brand color hex string.
 *
 * @param {string} status
 * @returns {string}
 */
export const getStatusColor = (status) =>
  ({
    [PAYMENT_STATUS.PENDING]:   '#FF9800',
    [PAYMENT_STATUS.HELD]:      '#9C27B0',
    [PAYMENT_STATUS.RELEASED]:  '#4CAF50',
    [PAYMENT_STATUS.REFUNDED]:  '#757575',
    [PAYMENT_STATUS.CANCELLED]: '#F44336',
  }[status] ?? '#757575');

/**
 * Map a payment status to a human-readable label.
 *
 * @param {string} status
 * @returns {string}
 */
export const getStatusLabel = (status) =>
  ({
    [PAYMENT_STATUS.PENDING]:   'Awaiting Authorization',
    [PAYMENT_STATUS.HELD]:      'Authorized – Pending Completion',
    [PAYMENT_STATUS.RELEASED]:  'Payment Complete',
    [PAYMENT_STATUS.REFUNDED]:  'Refunded',
    [PAYMENT_STATUS.CANCELLED]: 'Cancelled',
  }[status] ?? status);