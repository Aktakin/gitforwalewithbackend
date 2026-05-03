/**
 * @jest-environment node
 */

/**
 * Payment API – Endpoint Integration Tests
 *
 * Tests the Express payment server (server/payment-api.js) end-to-end using
 * supertest. Stripe is mocked so no real network calls are made.
 *
 * Covered scenarios (all part of the pay-on-completion flow):
 *
 *  POST /api/payments/create-intent
 *    ✓ creates a manual-capture PaymentIntent (capture_method='manual')
 *    ✓ creates an automatic-capture PaymentIntent (default)
 *    ✓ rejects invalid capture_method values
 *    ✓ rejects zero / missing amount
 *
 *  POST /api/payments/capture-intent
 *    ✓ captures an authorized PaymentIntent (charges the card)
 *    ✓ creates a Transfer to the provider when transferData is provided
 *    ✓ skips the Transfer when no transferData is provided
 *    ✓ rejects missing paymentIntentId
 *    ✓ surfaces Stripe errors as HTTP 500
 *
 *  POST /api/payments/cancel-intent
 *    ✓ cancels an authorized PaymentIntent (voids without charging)
 *    ✓ uses 'requested_by_customer' when no reason is given
 *    ✓ rejects missing paymentIntentId
 *    ✓ surfaces Stripe errors as HTTP 500
 *
 *  GET  /health
 *    ✓ returns { status: 'ok' }
 */

// ---------------------------------------------------------------------------
// Module mocks
// Must be defined before any require() or import of the server module so that
// Jest hoists them and the mocked versions are used at module load time.
// ---------------------------------------------------------------------------

// Prevent dotenv from trying to read .env files that don't exist in the test env.
jest.mock('dotenv', () => ({ config: jest.fn() }));

// Prevent fs.existsSync from hitting the real filesystem for .env discovery.
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn().mockReturnValue(false),
}));

/**
 * The Stripe constructor is called immediately when the server module loads:
 *   const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
 *
 * The factory below returns the mock SDK object every time the constructor is
 * invoked, regardless of the key value passed.
 */
let mockStripe;
jest.mock('stripe', () =>
  jest.fn().mockImplementation(() => {
    mockStripe = {
      paymentIntents: {
        create:   jest.fn(),
        capture:  jest.fn(),
        cancel:   jest.fn(),
        confirm:  jest.fn(),
        retrieve: jest.fn(),
      },
      refunds: {
        create: jest.fn(),
      },
      transfers: {
        create: jest.fn(),
      },
      paymentMethods: {
        detach: jest.fn(),
      },
    };
    return mockStripe;
  })
);

// ---------------------------------------------------------------------------
// Require after mocks are in place
// ---------------------------------------------------------------------------
const request = require('supertest');
const app = require('../../../server/payment-api');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal successful PaymentIntent-like object. */
const makeIntent = (overrides = {}) => ({
  id:               'pi_test_123',
  client_secret:    'pi_test_123_secret_abc',
  status:           'requires_capture',
  amount:           5000,
  currency:         'usd',
  capture_method:   'manual',
  latest_charge:    'ch_test_abc',
  cancellation_reason: null,
  ...overrides,
});

// ---------------------------------------------------------------------------
// Reset mocks between every test
// ---------------------------------------------------------------------------
beforeEach(() => {
  jest.clearAllMocks();
});

// ===========================================================================
// GET /health
// ===========================================================================
describe('GET /health', () => {
  it('returns HTTP 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

// ===========================================================================
// POST /api/payments/create-intent
// ===========================================================================
describe('POST /api/payments/create-intent', () => {
  // -------------------------------------------------------------------------
  // Manual capture (pay-on-completion flow)
  // -------------------------------------------------------------------------
  describe('manual capture (capture_method="manual")', () => {
    it('creates a PaymentIntent with capture_method="manual" and returns id + clientSecret', async () => {
      const intent = makeIntent();
      mockStripe.paymentIntents.create.mockResolvedValueOnce(intent);

      const res = await request(app)
        .post('/api/payments/create-intent')
        .send({ amount: 5000, currency: 'usd', capture_method: 'manual' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ id: intent.id, clientSecret: intent.client_secret });

      // Verify Stripe was called with the correct parameters.
      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount:         5000,
          currency:       'usd',
          capture_method: 'manual',
        })
      );
    });

    it('includes metadata when provided', async () => {
      mockStripe.paymentIntents.create.mockResolvedValueOnce(makeIntent());

      await request(app)
        .post('/api/payments/create-intent')
        .send({
          amount:         5000,
          capture_method: 'manual',
          metadata:       { payment_id: 'pay_abc', proposal_id: 'prop_xyz' },
        });

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: { payment_id: 'pay_abc', proposal_id: 'prop_xyz' },
        })
      );
    });
  });

  // -------------------------------------------------------------------------
  // Automatic capture (default)
  // -------------------------------------------------------------------------
  describe('automatic capture (default)', () => {
    it('defaults to capture_method="automatic" when the field is omitted', async () => {
      mockStripe.paymentIntents.create.mockResolvedValueOnce(
        makeIntent({ capture_method: 'automatic', status: 'requires_payment_method' })
      );

      const res = await request(app)
        .post('/api/payments/create-intent')
        .send({ amount: 5000 });

      expect(res.status).toBe(200);
      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({ capture_method: 'automatic' })
      );
    });
  });

  // -------------------------------------------------------------------------
  // Input validation
  // -------------------------------------------------------------------------
  describe('input validation', () => {
    it('returns HTTP 400 when amount is zero', async () => {
      const res = await request(app)
        .post('/api/payments/create-intent')
        .send({ amount: 0 });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/amount/i);
      expect(mockStripe.paymentIntents.create).not.toHaveBeenCalled();
    });

    it('returns HTTP 400 when amount is missing', async () => {
      const res = await request(app)
        .post('/api/payments/create-intent')
        .send({ currency: 'usd' });

      expect(res.status).toBe(400);
      expect(mockStripe.paymentIntents.create).not.toHaveBeenCalled();
    });

    it('returns HTTP 400 when capture_method is an unrecognized value', async () => {
      const res = await request(app)
        .post('/api/payments/create-intent')
        .send({ amount: 5000, capture_method: 'delayed' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/capture_method/i);
      expect(mockStripe.paymentIntents.create).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Stripe error propagation
  // -------------------------------------------------------------------------
  it('returns HTTP 500 when Stripe throws', async () => {
    mockStripe.paymentIntents.create.mockRejectedValueOnce(
      new Error('Your card was declined.')
    );

    const res = await request(app)
      .post('/api/payments/create-intent')
      .send({ amount: 5000, capture_method: 'manual' });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Your card was declined.');
  });
});

// ===========================================================================
// POST /api/payments/capture-intent
// ===========================================================================
describe('POST /api/payments/capture-intent', () => {
  // -------------------------------------------------------------------------
  // Successful capture (job completion scenario)
  // -------------------------------------------------------------------------
  describe('successful capture', () => {
    it('captures the PaymentIntent and returns status=succeeded', async () => {
      const captured = makeIntent({ status: 'succeeded' });
      mockStripe.paymentIntents.capture.mockResolvedValueOnce(captured);

      const res = await request(app)
        .post('/api/payments/capture-intent')
        .send({ paymentIntentId: 'pi_test_123' });

      expect(res.status).toBe(200);
      expect(res.body.paymentIntent.id).toBe('pi_test_123');
      expect(res.body.paymentIntent.status).toBe('succeeded');
      expect(res.body.transfer).toBeNull();

      expect(mockStripe.paymentIntents.capture).toHaveBeenCalledWith('pi_test_123');
    });

    it('creates a Transfer to the provider when transferData is supplied', async () => {
      const captured = makeIntent({ status: 'succeeded', latest_charge: 'ch_live_abc' });
      mockStripe.paymentIntents.capture.mockResolvedValueOnce(captured);

      const transfer = { id: 'tr_test_456', amount: 4250, destination: 'acct_provider_01' };
      mockStripe.transfers.create.mockResolvedValueOnce(transfer);

      const res = await request(app)
        .post('/api/payments/capture-intent')
        .send({
          paymentIntentId: 'pi_test_123',
          transferData: {
            destination: 'acct_provider_01',
            amount:      4250, // net amount in cents (after platform fee)
            currency:    'usd',
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.transfer).toEqual({
        id:          'tr_test_456',
        amount:      4250,
        destination: 'acct_provider_01',
      });

      // Transfer must reference the underlying charge for Stripe reconciliation.
      expect(mockStripe.transfers.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount:            4250,
          currency:          'usd',
          destination:       'acct_provider_01',
          source_transaction: 'ch_live_abc',
        })
      );
    });

    it('skips Transfer creation when transferData is null', async () => {
      mockStripe.paymentIntents.capture.mockResolvedValueOnce(makeIntent({ status: 'succeeded' }));

      const res = await request(app)
        .post('/api/payments/capture-intent')
        .send({ paymentIntentId: 'pi_test_123', transferData: null });

      expect(res.status).toBe(200);
      expect(res.body.transfer).toBeNull();
      expect(mockStripe.transfers.create).not.toHaveBeenCalled();
    });

    it('skips Transfer when transferData.amount is zero', async () => {
      mockStripe.paymentIntents.capture.mockResolvedValueOnce(makeIntent({ status: 'succeeded' }));

      const res = await request(app)
        .post('/api/payments/capture-intent')
        .send({
          paymentIntentId: 'pi_test_123',
          transferData: { destination: 'acct_123', amount: 0, currency: 'usd' },
        });

      expect(res.status).toBe(200);
      expect(mockStripe.transfers.create).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Input validation
  // -------------------------------------------------------------------------
  describe('input validation', () => {
    it('returns HTTP 400 when paymentIntentId is missing', async () => {
      const res = await request(app)
        .post('/api/payments/capture-intent')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/paymentIntentId/i);
      expect(mockStripe.paymentIntents.capture).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Stripe error propagation
  // -------------------------------------------------------------------------
  it('returns HTTP 500 when Stripe capture throws', async () => {
    mockStripe.paymentIntents.capture.mockRejectedValueOnce(
      new Error('PaymentIntent was already captured.')
    );

    const res = await request(app)
      .post('/api/payments/capture-intent')
      .send({ paymentIntentId: 'pi_test_123' });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('PaymentIntent was already captured.');
  });

  it('returns HTTP 500 when Transfer creation fails after a successful capture', async () => {
    mockStripe.paymentIntents.capture.mockResolvedValueOnce(
      makeIntent({ status: 'succeeded', latest_charge: 'ch_abc' })
    );
    mockStripe.transfers.create.mockRejectedValueOnce(
      new Error('No such account: acct_bad')
    );

    const res = await request(app)
      .post('/api/payments/capture-intent')
      .send({
        paymentIntentId: 'pi_test_123',
        transferData: { destination: 'acct_bad', amount: 5000, currency: 'usd' },
      });

    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/No such account/);
  });
});

// ===========================================================================
// POST /api/payments/cancel-intent
// ===========================================================================
describe('POST /api/payments/cancel-intent', () => {
  // -------------------------------------------------------------------------
  // Successful cancellation (no charge made)
  // -------------------------------------------------------------------------
  describe('successful cancellation', () => {
    it('cancels the authorization and returns the canceled intent', async () => {
      const canceled = makeIntent({
        status:               'canceled',
        cancellation_reason:  'requested_by_customer',
      });
      mockStripe.paymentIntents.cancel.mockResolvedValueOnce(canceled);

      const res = await request(app)
        .post('/api/payments/cancel-intent')
        .send({ paymentIntentId: 'pi_test_123' });

      expect(res.status).toBe(200);
      expect(res.body.id).toBe('pi_test_123');
      expect(res.body.status).toBe('canceled');
      expect(res.body.cancellation_reason).toBe('requested_by_customer');

      expect(mockStripe.paymentIntents.cancel).toHaveBeenCalledWith(
        'pi_test_123',
        { cancellation_reason: 'requested_by_customer' }
      );
    });

    it('uses the provided cancellation_reason', async () => {
      mockStripe.paymentIntents.cancel.mockResolvedValueOnce(
        makeIntent({ status: 'canceled', cancellation_reason: 'duplicate' })
      );

      await request(app)
        .post('/api/payments/cancel-intent')
        .send({ paymentIntentId: 'pi_test_123', cancellation_reason: 'duplicate' });

      expect(mockStripe.paymentIntents.cancel).toHaveBeenCalledWith(
        'pi_test_123',
        { cancellation_reason: 'duplicate' }
      );
    });

    it('falls back to "requested_by_customer" for unrecognized reason values', async () => {
      mockStripe.paymentIntents.cancel.mockResolvedValueOnce(
        makeIntent({ status: 'canceled', cancellation_reason: 'requested_by_customer' })
      );

      await request(app)
        .post('/api/payments/cancel-intent')
        .send({ paymentIntentId: 'pi_test_123', cancellation_reason: 'job_not_done' });

      expect(mockStripe.paymentIntents.cancel).toHaveBeenCalledWith(
        'pi_test_123',
        { cancellation_reason: 'requested_by_customer' } // sanitized
      );
    });
  });

  // -------------------------------------------------------------------------
  // Input validation
  // -------------------------------------------------------------------------
  describe('input validation', () => {
    it('returns HTTP 400 when paymentIntentId is missing', async () => {
      const res = await request(app)
        .post('/api/payments/cancel-intent')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/paymentIntentId/i);
      expect(mockStripe.paymentIntents.cancel).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Stripe error propagation
  // -------------------------------------------------------------------------
  it('returns HTTP 500 when Stripe cancel throws', async () => {
    mockStripe.paymentIntents.cancel.mockRejectedValueOnce(
      new Error('You cannot cancel this PaymentIntent.')
    );

    const res = await request(app)
      .post('/api/payments/cancel-intent')
      .send({ paymentIntentId: 'pi_test_123' });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('You cannot cancel this PaymentIntent.');
  });
});

// ===========================================================================
// End-to-end scenario: full pay-on-completion flow
// ===========================================================================
describe('Full pay-on-completion scenario', () => {
  /**
   * This test simulates the complete lifecycle:
   *   1. Client authorizes payment (card reserved, not charged)
   *   2. Job is completed → payment is captured (card is charged)
   */
  it('authorize → capture flow completes without error', async () => {
    // Step 1: Authorize
    const intent = makeIntent();
    mockStripe.paymentIntents.create.mockResolvedValueOnce(intent);

    const createRes = await request(app)
      .post('/api/payments/create-intent')
      .send({ amount: 10000, currency: 'usd', capture_method: 'manual' });

    expect(createRes.status).toBe(200);
    expect(createRes.body.id).toBe('pi_test_123');
    const { id: intentId } = createRes.body;

    // Step 2: Capture on job completion
    mockStripe.paymentIntents.capture.mockResolvedValueOnce(
      makeIntent({ status: 'succeeded', id: intentId })
    );

    const captureRes = await request(app)
      .post('/api/payments/capture-intent')
      .send({ paymentIntentId: intentId });

    expect(captureRes.status).toBe(200);
    expect(captureRes.body.paymentIntent.status).toBe('succeeded');
    expect(captureRes.body.transfer).toBeNull();

    // Verify no unauthorized charges: create was called with manual capture,
    // and capture was only called once (at job completion), not at creation.
    expect(mockStripe.paymentIntents.create).toHaveBeenCalledTimes(1);
    expect(mockStripe.paymentIntents.capture).toHaveBeenCalledTimes(1);
  });

  /**
   * Simulates a cancelled job:
   *   1. Client authorizes payment
   *   2. Job falls through → authorization voided (no charge ever made)
   */
  it('authorize → cancel flow completes without charging the client', async () => {
    // Step 1: Authorize
    mockStripe.paymentIntents.create.mockResolvedValueOnce(makeIntent());

    const createRes = await request(app)
      .post('/api/payments/create-intent')
      .send({ amount: 10000, currency: 'usd', capture_method: 'manual' });

    expect(createRes.status).toBe(200);
    const { id: intentId } = createRes.body;

    // Step 2: Cancel (job not completed)
    mockStripe.paymentIntents.cancel.mockResolvedValueOnce(
      makeIntent({ id: intentId, status: 'canceled', cancellation_reason: 'requested_by_customer' })
    );

    const cancelRes = await request(app)
      .post('/api/payments/cancel-intent')
      .send({ paymentIntentId: intentId, cancellation_reason: 'requested_by_customer' });

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.status).toBe('canceled');

    // The critical assertion: capture was NEVER called, so the client was never charged.
    expect(mockStripe.paymentIntents.capture).not.toHaveBeenCalled();
  });

  /**
   * Simulates a full flow with provider payout:
   *   1. Authorize with manual capture
   *   2. Capture + immediately transfer net to provider's connected account
   */
  it('authorize → capture with provider transfer completes the full job-completion payout', async () => {
    // Step 1: Authorize
    mockStripe.paymentIntents.create.mockResolvedValueOnce(makeIntent());

    await request(app)
      .post('/api/payments/create-intent')
      .send({ amount: 10000, currency: 'usd', capture_method: 'manual' });

    // Step 2: Capture + transfer to provider
    const captured = makeIntent({ status: 'succeeded', latest_charge: 'ch_live_xyz' });
    mockStripe.paymentIntents.capture.mockResolvedValueOnce(captured);

    const transfer = { id: 'tr_payout_789', amount: 8700, destination: 'acct_provider_99' };
    mockStripe.transfers.create.mockResolvedValueOnce(transfer);

    const captureRes = await request(app)
      .post('/api/payments/capture-intent')
      .send({
        paymentIntentId: 'pi_test_123',
        transferData: {
          destination: 'acct_provider_99',
          amount:      8700, // $87.00 after platform fee
          currency:    'usd',
        },
      });

    expect(captureRes.status).toBe(200);
    expect(captureRes.body.paymentIntent.status).toBe('succeeded');
    expect(captureRes.body.transfer.id).toBe('tr_payout_789');
    expect(captureRes.body.transfer.amount).toBe(8700);
    expect(captureRes.body.transfer.destination).toBe('acct_provider_99');

    // Transfer tied to the charge for correct Stripe reconciliation
    expect(mockStripe.transfers.create).toHaveBeenCalledWith(
      expect.objectContaining({ source_transaction: 'ch_live_xyz' })
    );
  });
});