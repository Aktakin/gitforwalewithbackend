/**
 * StripePaymentService tests
 *
 * Critical assertion: paymentService.js converts dollar amounts to cents
 * (× 100) before calling the stripe layer. The stripe layer must forward
 * that value to the API server as-is — it must NOT multiply by 100 again.
 *
 * Bug that was fixed: createRefund and createPayout were both doing ×100,
 * making a $100 refund/payout send $10,000 to Stripe.
 */

import stripeService from '../stripeService';

// ---------------------------------------------------------------------------
// Fetch mock helpers
// ---------------------------------------------------------------------------
function mockFetchOk(payload) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    text: async () => JSON.stringify(payload),
  });
}

function fetchBody() {
  return JSON.parse(global.fetch.mock.calls[0][1].body);
}

afterEach(() => {
  jest.restoreAllMocks();
  delete global.fetch;
});

// ---------------------------------------------------------------------------
// createRefund
// ---------------------------------------------------------------------------
describe('createRefund – amount forwarded without re-multiplying by 100', () => {
  it('sends the exact cent value it receives', async () => {
    mockFetchOk({ id: 're_test', status: 'succeeded' });

    // paymentService passes 5000 (= $50.00 already in cents)
    await stripeService.createRefund({
      paymentIntentId: 'pi_test',
      amount: 5000,
      reason: 'requested_by_customer',
    });

    expect(fetchBody().amount).toBe(5000); // NOT 500 000
  });

  it('rounds a fractional cent value', async () => {
    mockFetchOk({ id: 're_test2', status: 'succeeded' });

    await stripeService.createRefund({ paymentIntentId: 'pi_x', amount: 4999.7 });

    expect(fetchBody().amount).toBe(5000);
  });
});

// ---------------------------------------------------------------------------
// createPayout
// ---------------------------------------------------------------------------
describe('createPayout – amount forwarded without re-multiplying by 100', () => {
  it('sends the exact cent value it receives', async () => {
    mockFetchOk({ id: 'po_test', status: 'paid' });

    // paymentService passes 10000 (= $100.00 already in cents)
    await stripeService.createPayout({
      amount: 10000,
      currency: 'usd',
      destination: 'ba_test',
      description: 'Test payout',
    });

    expect(fetchBody().amount).toBe(10000); // NOT 1 000 000
  });
});

// ---------------------------------------------------------------------------
// createTransfer (escrow release)
// ---------------------------------------------------------------------------
describe('createTransfer – converts dollars to cents (net_amount is stored in dollars)', () => {
  it('multiplies dollar net_amount by 100 before sending', async () => {
    mockFetchOk({ id: 'tr_test', status: 'paid', amount: 8930 });

    // releaseEscrow passes payment.net_amount in dollars (e.g. $89.30)
    await stripeService.createTransfer({
      amount: 89.30,
      currency: 'usd',
      destination: 'acct_test',
      description: 'Escrow release',
    });

    expect(fetchBody().amount).toBe(8930); // correctly converted to cents
  });
});