/**
 * Mock Payment Service
 * 
 * This service simulates payment processing without actual Stripe integration.
 * All methods return promises to simulate async API calls.
 * Replace this with real Stripe integration when ready.
 */

// Simulated delay for API calls (makes it feel more realistic)
const delay = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

// Generate unique transaction ID
const generateTransactionId = () => {
  return `mock_txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Generate unique payment intent ID
const generatePaymentIntentId = () => {
  return `pi_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

class MockPaymentService {
  constructor() {
    this.provider = 'mock';
    this.initialized = true;
  }

  /**
   * Create a payment intent
   * In Stripe: stripe.paymentIntents.create()
   */
  async createPaymentIntent({ amount, currency = 'USD', metadata = {} }) {
    await delay(800);

    return {
      id: generatePaymentIntentId(),
      amount,
      currency,
      status: 'requires_confirmation',
      clientSecret: `pi_mock_secret_${Math.random().toString(36).substr(2, 16)}`,
      metadata,
      created: Date.now(),
    };
  }

  /**
   * Confirm a payment
   * In Stripe: stripe.paymentIntents.confirm()
   */
  async confirmPayment(paymentIntentId, paymentMethodId) {
    await delay(1500);

    // Simulate 95% success rate
    const isSuccess = Math.random() < 0.95;

    if (!isSuccess) {
      throw new Error('Payment failed: Card declined');
    }

    return {
      id: paymentIntentId,
      status: 'succeeded',
      amount_received: Math.floor(Math.random() * 10000) + 1000,
      charges: {
        data: [{
          id: `ch_mock_${Date.now()}`,
          amount: Math.floor(Math.random() * 10000) + 1000,
          paid: true,
          receipt_url: `https://mock-receipt.com/${paymentIntentId}`,
        }],
      },
      payment_method: paymentMethodId,
    };
  }

  /**
   * Create a payment method
   * In Stripe: stripe.paymentMethods.create()
   */
  async createPaymentMethod({ type, card, billing_details }) {
    await delay(500);

    const cardBrands = ['visa', 'mastercard', 'amex', 'discover'];
    const randomBrand = cardBrands[Math.floor(Math.random() * cardBrands.length)];

    return {
      id: `pm_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      card: {
        brand: card?.brand || randomBrand,
        last4: card?.last4 || Math.floor(1000 + Math.random() * 9000).toString(),
        exp_month: card?.exp_month || 12,
        exp_year: card?.exp_year || 2025,
        fingerprint: `fp_${Math.random().toString(36).substr(2, 16)}`,
      },
      billing_details: billing_details || {},
      created: Date.now(),
    };
  }

  /**
   * Process a direct payment
   * Simulates immediate payment processing
   */
  async processPayment({ amount, currency = 'USD', paymentMethod, description, metadata = {} }) {
    await delay(2000);

    const transactionId = generateTransactionId();
    const isSuccess = Math.random() < 0.95;

    if (!isSuccess) {
      return {
        success: false,
        error: 'Payment processing failed',
        errorCode: 'card_declined',
        transactionId,
      };
    }

    // Calculate fees (2.9% + $0.30 - typical Stripe fee)
    const processingFee = (amount * 0.029) + 0.30;
    const platformFee = amount * 0.10; // 10% platform fee
    const netAmount = amount - processingFee - platformFee;

    return {
      success: true,
      transactionId,
      paymentIntentId: generatePaymentIntentId(),
      amount,
      currency,
      processingFee: parseFloat(processingFee.toFixed(2)),
      platformFee: parseFloat(platformFee.toFixed(2)),
      netAmount: parseFloat(netAmount.toFixed(2)),
      status: 'succeeded',
      receipt_url: `https://mock-receipt.com/${transactionId}`,
      created_at: new Date().toISOString(),
      metadata,
    };
  }

  /**
   * Create a refund
   * In Stripe: stripe.refunds.create()
   */
  async createRefund({ paymentIntentId, amount, reason }) {
    await delay(1000);

    const isSuccess = Math.random() < 0.98; // 98% success rate

    if (!isSuccess) {
      throw new Error('Refund failed');
    }

    return {
      id: `re_mock_${Date.now()}`,
      amount,
      currency: 'USD',
      status: 'succeeded',
      payment_intent: paymentIntentId,
      reason: reason || 'requested_by_customer',
      created: Date.now(),
    };
  }

  /**
   * Create a payout
   * In Stripe: stripe.payouts.create()
   */
  async createPayout({ amount, currency = 'USD', destination, description }) {
    await delay(1500);

    const isSuccess = Math.random() < 0.95;

    if (!isSuccess) {
      throw new Error('Payout failed: Insufficient funds');
    }

    return {
      id: `po_mock_${Date.now()}`,
      amount,
      currency,
      status: 'paid',
      arrival_date: Math.floor(Date.now() / 1000) + (3 * 24 * 60 * 60), // 3 days from now
      destination,
      description,
      created: Math.floor(Date.now() / 1000),
    };
  }

  /**
   * Retrieve payment details
   * In Stripe: stripe.paymentIntents.retrieve()
   */
  async retrievePayment(paymentIntentId) {
    await delay(300);

    return {
      id: paymentIntentId,
      amount: Math.floor(Math.random() * 10000) + 1000,
      currency: 'USD',
      status: 'succeeded',
      created: Date.now() - Math.floor(Math.random() * 86400000), // Random time in last 24h
    };
  }

  /**
   * List customer payment methods
   * In Stripe: stripe.paymentMethods.list()
   */
  async listPaymentMethods(customerId) {
    await delay(400);

    // Return mock payment methods
    return {
      data: [
        {
          id: 'pm_mock_123',
          type: 'card',
          card: {
            brand: 'visa',
            last4: '4242',
            exp_month: 12,
            exp_year: 2025,
          },
        },
      ],
    };
  }

  /**
   * Attach payment method to customer
   * In Stripe: stripe.paymentMethods.attach()
   */
  async attachPaymentMethod(paymentMethodId, customerId) {
    await delay(300);

    return {
      id: paymentMethodId,
      customer: customerId,
    };
  }

  /**
   * Detach payment method from customer
   * In Stripe: stripe.paymentMethods.detach()
   */
  async detachPaymentMethod(paymentMethodId) {
    await delay(300);

    return {
      id: paymentMethodId,
      customer: null,
    };
  }

  /**
   * Create a customer
   * In Stripe: stripe.customers.create()
   */
  async createCustomer({ email, name, metadata = {} }) {
    await delay(500);

    return {
      id: `cus_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      name,
      metadata,
      created: Math.floor(Date.now() / 1000),
    };
  }

  /**
   * Update customer
   * In Stripe: stripe.customers.update()
   */
  async updateCustomer(customerId, updates) {
    await delay(300);

    return {
      id: customerId,
      ...updates,
    };
  }

  /**
   * Transfer funds (for marketplace/platform)
   * In Stripe: stripe.transfers.create()
   */
  async createTransfer({ amount, currency = 'USD', destination, description }) {
    await delay(1000);

    return {
      id: `tr_mock_${Date.now()}`,
      amount,
      currency,
      destination,
      description,
      status: 'paid',
      created: Math.floor(Date.now() / 1000),
    };
  }

  /**
   * Create invoice
   * In Stripe: stripe.invoices.create()
   */
  async createInvoice({ customer, items, description, metadata = {} }) {
    await delay(800);

    const invoiceNumber = `INV-${Date.now()}`;
    const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);

    return {
      id: `in_mock_${Date.now()}`,
      invoice_number: invoiceNumber,
      customer,
      subtotal,
      total: subtotal,
      items,
      status: 'open',
      description,
      metadata,
      hosted_invoice_url: `https://mock-invoice.com/${invoiceNumber}`,
      created: Math.floor(Date.now() / 1000),
    };
  }

  /**
   * Webhook simulation
   * In production, this would be handled by Stripe webhooks
   */
  simulateWebhook(eventType, data) {
    console.log(`[Mock Webhook] ${eventType}:`, data);
    
    // In real implementation, this would be handled by your webhook endpoint
    return {
      type: eventType,
      data,
      created: Math.floor(Date.now() / 1000),
    };
  }

  /**
   * Validate card number (basic Luhn algorithm)
   */
  validateCardNumber(cardNumber) {
    const cleaned = cardNumber.replace(/\s/g, '');
    
    if (!/^\d{13,19}$/.test(cleaned)) {
      return false;
    }

    // Luhn algorithm
    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  /**
   * Calculate platform fee
   */
  calculateFees(amount) {
    const processingFee = (amount * 0.029) + 0.30; // 2.9% + $0.30
    const platformFee = amount * 0.10; // 10% platform fee
    const netAmount = amount - processingFee - platformFee;

    return {
      processingFee: parseFloat(processingFee.toFixed(2)),
      platformFee: parseFloat(platformFee.toFixed(2)),
      netAmount: parseFloat(netAmount.toFixed(2)),
      totalFees: parseFloat((processingFee + platformFee).toFixed(2)),
    };
  }
}

// Export singleton instance
export const mockPaymentService = new MockPaymentService();
export default mockPaymentService;


