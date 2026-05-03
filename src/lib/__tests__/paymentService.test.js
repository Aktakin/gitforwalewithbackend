/**
 * PaymentService tests
 *
 * Covers the end-to-end "payment taken after job completion" flow:
 *
 *  1. processPayment()        – funds held in escrow when job starts
 *  2. createRefund()          – amount converted to cents exactly once
 *  3. createPayout()          – amount converted to cents exactly once
 *  4. releaseEscrow()         – funds released when client marks job complete
 *  5. _getSuccessfulStatus()  – escrow default is 'held', not 'succeeded'
 */

// ---------------------------------------------------------------------------
// Module mocks (hoisted by Jest before imports)
// ---------------------------------------------------------------------------
jest.mock('../supabase', () => ({
  db: {
    supabase: {
      from: jest.fn(),
    },
  },
}));

// Prevent any real network calls from stripeService at module load time.
// __esModule: true is required so Babel's interop correctly unwraps .default.
jest.mock('../stripeService', () => ({
  __esModule: true,
  default: {
    provider: 'stripe',
    calculateFees: jest.fn(),
    createPaymentIntent: jest.fn(),
    confirmPayment: jest.fn(),
    createRefund: jest.fn(),
    createPayout: jest.fn(),
    createTransfer: jest.fn(),
    detachPaymentMethod: jest.fn(),
  },
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------
import paymentService from '../paymentService';
import { db } from '../supabase';

// ---------------------------------------------------------------------------
// Controlled payment provider
//
// Rather than relying on which provider the singleton picked up at startup,
// we inject a fresh mock provider before every test. This makes the tests
// independent of the REACT_APP_STRIPE_PUBLISHABLE_KEY env var.
// ---------------------------------------------------------------------------
let mockProvider;

beforeEach(() => {
  mockProvider = {
    provider: 'mock',
    confirmPayment: jest.fn(),
    createRefund: jest.fn(),
    createPayout: jest.fn(),
    createTransfer: jest.fn(),
    calculateFees: jest.fn().mockImplementation((amount) => ({
      processingFee: parseFloat(((amount * 0.029) + 0.30).toFixed(2)),
      platformFee: parseFloat((amount * 0.10).toFixed(2)),
      netAmount: parseFloat((amount * (1 - 0.029 - 0.10) - 0.30).toFixed(2)),
      total: amount,
    })),
    detachPaymentMethod: jest.fn(),
  };
  // Inject directly so tests don't depend on env-var provider selection
  paymentService.paymentProvider = mockProvider;
  paymentService.provider = 'mock';
});

// ---------------------------------------------------------------------------
// Supabase chain factory
//
// Supabase query builders are thenable (Promise-like) AND support chaining
// like .select().eq().single(). This factory replicates that API.
// ---------------------------------------------------------------------------
function makeChain(defaultSingleData = null) {
  const c = {};

  // Make the chain itself awaitable (covers `await .update(...).eq(...)`)
  c.then = (resolve) => Promise.resolve({ data: null, error: null }).then(resolve);
  c.catch = (reject) => Promise.resolve({ data: null, error: null }).catch(reject);

  c.select = jest.fn(() => c);
  c.update = jest.fn(() => c);
  c.insert = jest.fn(() => c);
  c.eq = jest.fn(() => c);
  c.single = jest.fn().mockResolvedValue({ data: defaultSingleData, error: null });
  c.maybeSingle = jest.fn().mockResolvedValue({ data: null, error: null });
  return c;
}

// ---------------------------------------------------------------------------
// _getSuccessfulStatus  (pure helper – no DB needed)
// ---------------------------------------------------------------------------
describe('_getSuccessfulStatus', () => {
  it('returns "held" when is_escrow is undefined (default to escrow mode)', () => {
    expect(paymentService._getSuccessfulStatus({ is_escrow: undefined })).toBe('held');
  });

  it('returns "held" when is_escrow is null', () => {
    expect(paymentService._getSuccessfulStatus({ is_escrow: null })).toBe('held');
  });

  it('returns "held" when is_escrow is true', () => {
    expect(paymentService._getSuccessfulStatus({ is_escrow: true })).toBe('held');
  });

  it('returns "paid" when is_escrow is false and payer_id is present', () => {
    expect(paymentService._getSuccessfulStatus({ is_escrow: false, payer_id: 'u1' })).toBe('paid');
  });

  it('returns "succeeded" when is_escrow is false and no payer/payee ids', () => {
    expect(paymentService._getSuccessfulStatus({ is_escrow: false })).toBe('succeeded');
  });
});

// ---------------------------------------------------------------------------
// processPayment – escrow status consistency
// ---------------------------------------------------------------------------
describe('processPayment – escrow behavior', () => {
  let paymentsChain, transactionsChain;

  beforeEach(() => {
    paymentsChain = makeChain();
    transactionsChain = makeChain();

    db.supabase.from.mockImplementation((table) => {
      if (table === 'payments') return paymentsChain;
      if (table === 'transactions') return transactionsChain;
      return makeChain();
    });
  });

  afterEach(() => jest.clearAllMocks());

  it('sets status "held" and is_escrow true when is_escrow is undefined', async () => {
    const rawPayment = {
      id: 'pay_1',
      amount: 100,
      currency: 'USD',
      payment_type: 'proposal_acceptance',
      is_escrow: undefined, // not explicitly set — must default to escrow
      payment_intent_id: 'pi_test',
      payer_id: 'client_1',
      metadata: {},
    };
    const updatedPayment = { ...rawPayment, status: 'held', is_escrow: true };

    // call #1: initial fetch, call #2: after update, call #3: inside _holdInEscrow
    paymentsChain.single
      .mockResolvedValueOnce({ data: rawPayment, error: null })
      .mockResolvedValueOnce({ data: updatedPayment, error: null })
      .mockResolvedValueOnce({ data: null, error: null }); // _holdInEscrow skips if no proposals

    mockProvider.confirmPayment.mockResolvedValueOnce({
      id: 'pi_test',
      status: 'succeeded',
      charges: { data: [{ id: 'ch_test', receipt_url: 'https://test.com/r' }] },
    });

    const result = await paymentService.processPayment({
      paymentId: 'pay_1',
      paymentMethodId: 'pm_test',
    });

    expect(result.success).toBe(true);

    // update() is called twice: first with 'processing', then with the final status
    const updateCalls = paymentsChain.update.mock.calls;
    expect(updateCalls.length).toBeGreaterThanOrEqual(2);

    const finalUpdate = updateCalls.find(([args]) => 'is_escrow' in args);
    expect(finalUpdate).toBeDefined();
    expect(finalUpdate[0].status).toBe('held');
    expect(finalUpdate[0].is_escrow).toBe(true);
  });

  it('sets status "succeeded" and is_escrow false when is_escrow is explicitly false', async () => {
    const rawPayment = {
      id: 'pay_2',
      amount: 100,
      currency: 'USD',
      payment_type: 'proposal_acceptance',
      is_escrow: false,
      payment_intent_id: 'pi_test_2',
      payer_id: 'client_2',
      metadata: {},
    };
    const updatedPayment = { ...rawPayment, status: 'succeeded' };

    paymentsChain.single
      .mockResolvedValueOnce({ data: rawPayment, error: null })
      .mockResolvedValueOnce({ data: updatedPayment, error: null });

    mockProvider.confirmPayment.mockResolvedValueOnce({
      id: 'pi_test_2',
      status: 'succeeded',
      charges: { data: [{ id: 'ch_test_2', receipt_url: '' }] },
    });

    const result = await paymentService.processPayment({
      paymentId: 'pay_2',
      paymentMethodId: 'pm_test_2',
    });

    expect(result.success).toBe(true);

    const updateCalls = paymentsChain.update.mock.calls;
    const finalUpdate = updateCalls.find(([args]) => 'is_escrow' in args);
    expect(finalUpdate).toBeDefined();
    expect(finalUpdate[0].status).toBe('succeeded');
    expect(finalUpdate[0].is_escrow).toBe(false);
  });

  it('marks payment failed in DB if provider confirmPayment throws', async () => {
    const rawPayment = {
      id: 'pay_3',
      amount: 100,
      currency: 'USD',
      payment_type: 'proposal_acceptance',
      payment_intent_id: 'pi_test_3',
      metadata: {},
    };

    paymentsChain.single.mockResolvedValueOnce({ data: rawPayment, error: null });

    mockProvider.confirmPayment.mockRejectedValueOnce(new Error('Card declined'));

    await expect(
      paymentService.processPayment({ paymentId: 'pay_3', paymentMethodId: 'pm_test_3' })
    ).rejects.toThrow('Card declined');

    const updateCalls = paymentsChain.update.mock.calls;
    const failedUpdate = updateCalls.find(([args]) => args.status === 'failed');
    expect(failedUpdate).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// createRefund – amount conversion
// ---------------------------------------------------------------------------
describe('createRefund – amount converted to cents exactly once', () => {
  let paymentsChain, transactionsChain;

  beforeEach(() => {
    paymentsChain = makeChain();
    transactionsChain = makeChain();
    db.supabase.from.mockImplementation((table) => {
      if (table === 'payments') return paymentsChain;
      if (table === 'transactions') return transactionsChain;
      return makeChain();
    });
  });

  afterEach(() => jest.clearAllMocks());

  it('passes amount × 100 (cents) to the provider — not × 10000', async () => {
    const mockPayment = {
      id: 'pay_4',
      amount: 50,   // $50.00
      currency: 'USD',
      status: 'succeeded',
      payment_intent_id: 'pi_refund_test',
      payer_id: 'client_1',
      metadata: {},
    };

    paymentsChain.single.mockResolvedValueOnce({ data: mockPayment, error: null });

    mockProvider.createRefund.mockResolvedValueOnce({ id: 're_test', status: 'succeeded' });

    await paymentService.createRefund({ paymentId: 'pay_4', amount: 50, reason: 'test' });

    expect(mockProvider.createRefund).toHaveBeenCalledWith(expect.objectContaining({
      amount: 5000, // $50 × 100 = 5000 cents, NOT 500 000
    }));
  });
});

// ---------------------------------------------------------------------------
// createPayout – amount conversion
// ---------------------------------------------------------------------------
describe('createPayout – amount converted to cents exactly once', () => {
  let walletsChain, payoutsChain, transactionsChain;

  beforeEach(() => {
    walletsChain = makeChain();
    payoutsChain = makeChain();
    transactionsChain = makeChain();

    db.supabase.from.mockImplementation((table) => {
      if (table === 'wallets') return walletsChain;
      if (table === 'payouts') return payoutsChain;
      if (table === 'transactions') return transactionsChain;
      return makeChain();
    });
  });

  afterEach(() => jest.clearAllMocks());

  it('passes amount × 100 (cents) to the provider — not × 10000', async () => {
    walletsChain.single.mockResolvedValueOnce({
      data: { balance: 500, available_balance: 500, total_withdrawn: 0 },
      error: null,
    });
    payoutsChain.single.mockResolvedValueOnce({ data: { id: 'db_po_1' }, error: null });

    mockProvider.createPayout.mockResolvedValueOnce({ id: 'po_test', status: 'paid' });

    await paymentService.createPayout({
      userId: 'user_1',
      amount: 100,   // $100.00
      destinationType: 'bank_account',
      destinationId: 'ba_test',
      description: 'Payout test',
    });

    expect(mockProvider.createPayout).toHaveBeenCalledWith(expect.objectContaining({
      amount: 10000, // $100 × 100 = 10000 cents, NOT 1 000 000
    }));
  });
});

// ---------------------------------------------------------------------------
// releaseEscrow – job completion triggers escrow release
// ---------------------------------------------------------------------------
describe('releaseEscrow – payment released on job completion', () => {
  let paymentsChain, transactionsChain, walletsChain;

  beforeEach(() => {
    paymentsChain = makeChain();
    transactionsChain = makeChain();
    walletsChain = makeChain();

    db.supabase.from.mockImplementation((table) => {
      if (table === 'payments') return paymentsChain;
      if (table === 'transactions') return transactionsChain;
      if (table === 'wallets') return walletsChain;
      return makeChain();
    });
  });

  afterEach(() => jest.clearAllMocks());

  it('throws if payment status is not "held"', async () => {
    paymentsChain.single.mockResolvedValueOnce({
      data: {
        id: 'pay_5',
        status: 'succeeded', // already succeeded, not held
        is_escrow: true,
        proposals: { user_id: 'provider_1', users: {} },
      },
      error: null,
    });

    await expect(paymentService.releaseEscrow('pay_5', 'client_1'))
      .rejects.toThrow(/not held in escrow/i);
  });

  it('throws if is_escrow is explicitly false', async () => {
    paymentsChain.single.mockResolvedValueOnce({
      data: {
        id: 'pay_6',
        status: 'held',
        is_escrow: false,
        proposals: { user_id: 'provider_1', users: {} },
      },
      error: null,
    });

    await expect(paymentService.releaseEscrow('pay_6', 'client_1'))
      .rejects.toThrow(/not held in escrow/i);
  });

  it('updates payment to "released" and credits provider wallet on job completion', async () => {
    const heldPayment = {
      id: 'pay_7',
      status: 'held',
      is_escrow: true,
      net_amount: 85,
      currency: 'USD',
      proposal_id: 'prop_1',
      request_id: 'req_1',
      metadata: { providerUserId: 'provider_1' },
      proposals: {
        user_id: 'provider_1',
        users: { stripe_account_id: null }, // no connected account
      },
    };

    paymentsChain.single.mockResolvedValueOnce({ data: heldPayment, error: null });

    walletsChain.single.mockResolvedValueOnce({
      data: { balance: 0, reserved_balance: 85, total_earned: 0 },
      error: null,
    });

    const result = await paymentService.releaseEscrow('pay_7', 'client_1');

    expect(result.success).toBe(true);
    expect(result.providerUserId).toBe('provider_1');

    // DB must be updated to 'released'
    const updateCalls = paymentsChain.update.mock.calls;
    const releaseUpdate = updateCalls.find(([args]) => args.status === 'released');
    expect(releaseUpdate).toBeDefined();
    expect(releaseUpdate[0].escrow_released_to).toBe('provider_1');

    // Wallet must be credited for the provider
    const walletUpdateCalls = walletsChain.update.mock.calls;
    expect(walletUpdateCalls.length).toBeGreaterThan(0);
    const walletUpdate = walletUpdateCalls[0][0];
    expect(walletUpdate.balance).toBe(85);       // 0 + 85
    expect(walletUpdate.total_earned).toBe(85);  // 0 + 85
    expect(walletUpdate.reserved_balance).toBe(0); // 85 - 85 = 0

    // Transaction record must be created
    expect(transactionsChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'escrow_release',
        user_id: 'provider_1',
        amount: 85,
        status: 'completed',
      })
    );
  });

  it('throws if providerUserId cannot be determined', async () => {
    const heldPayment = {
      id: 'pay_8',
      status: 'held',
      is_escrow: true,
      net_amount: 50,
      currency: 'USD',
      metadata: {}, // no providerUserId
      proposals: null, // no proposals relation
    };

    paymentsChain.single.mockResolvedValueOnce({ data: heldPayment, error: null });

    await expect(paymentService.releaseEscrow('pay_8', 'client_1'))
      .rejects.toThrow(/Provider user ID not found/i);
  });
});