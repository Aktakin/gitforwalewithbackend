/**
 * Payment Service
 * 
 * Complete payment processing system with database integration.
 * Currently uses mock payment provider, ready for Stripe integration.
 */

import { db } from './supabase';
import mockPaymentService from './mockPaymentService';

class PaymentService {
  constructor() {
    // Use mock service for now - replace with Stripe later
    this.paymentProvider = mockPaymentService;
    this.provider = 'mock';
  }

  /**
   * Initialize payment for a proposal acceptance
   */
  async createProposalPayment(proposalId, userId) {
    try {
      // Get proposal details
      const { data: proposal, error: proposalError } = await db.supabase
        .from('proposals')
        .select('*, requests(*)')
        .eq('id', proposalId)
        .single();

      if (proposalError) throw proposalError;

      const amount = proposal.proposed_price || proposal.budget;

      // Calculate fees
      const fees = this.paymentProvider.calculateFees(amount);

      // Create payment intent
      const paymentIntent = await this.paymentProvider.createPaymentIntent({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'USD',
        metadata: {
          proposalId,
          requestId: proposal.request_id,
          userId,
          type: 'proposal_acceptance',
        },
      });

      // Create payment record in database
      const { data: payment, error: paymentError } = await db.supabase
        .from('payments')
        .insert({
          user_id: userId,
          request_id: proposal.request_id,
          proposal_id: proposalId,
          amount,
          currency: 'USD',
          status: 'pending',
          payment_type: 'proposal_acceptance',
          provider: this.provider,
          payment_intent_id: paymentIntent.id,
          transaction_id: paymentIntent.id,
          platform_fee: fees.platformFee,
          processing_fee: fees.processingFee,
          net_amount: fees.netAmount,
          metadata: {
            clientSecret: paymentIntent.clientSecret,
          },
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      return {
        success: true,
        payment,
        paymentIntent,
        fees,
      };
    } catch (error) {
      console.error('Error creating proposal payment:', error);
      throw error;
    }
  }

  /**
   * Process a payment
   */
  async processPayment({ paymentId, paymentMethodId }) {
    try {
      // Get payment record
      const { data: payment, error: paymentError } = await db.supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single();

      if (paymentError) throw paymentError;

      // Update payment status to processing
      await db.supabase
        .from('payments')
        .update({ status: 'processing' })
        .eq('id', paymentId);

      // Confirm payment with provider
      const result = await this.paymentProvider.confirmPayment(
        payment.payment_intent_id,
        paymentMethodId
      );

      // Update payment record
      const { data: updatedPayment, error: updateError } = await db.supabase
        .from('payments')
        .update({
          status: 'succeeded',
          paid_at: new Date().toISOString(),
          provider_transaction_id: result.charges?.data[0]?.id,
          provider_payment_method_id: paymentMethodId,
          metadata: {
            ...payment.metadata,
            receipt_url: result.charges?.data[0]?.receipt_url,
          },
        })
        .eq('id', paymentId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Create transaction record
      await db.supabase
        .from('transactions')
        .insert({
          payment_id: paymentId,
          user_id: payment.user_id,
          type: 'payment',
          amount: payment.amount,
          currency: payment.currency,
          status: 'completed',
          description: `Payment for ${payment.payment_type}`,
          provider_transaction_id: result.charges?.data[0]?.id,
        });

      // If escrow enabled, hold funds
      if (payment.is_escrow) {
        await this._holdInEscrow(paymentId, payment.amount);
      }

      return {
        success: true,
        payment: updatedPayment,
        transactionId: result.charges?.data[0]?.id,
      };
    } catch (error) {
      // Update payment status to failed
      await db.supabase
        .from('payments')
        .update({ status: 'failed' })
        .eq('id', paymentId);

      console.error('Error processing payment:', error);
      throw error;
    }
  }

  /**
   * Create a refund
   */
  async createRefund({ paymentId, amount, reason }) {
    try {
      // Get payment record
      const { data: payment, error: paymentError } = await db.supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single();

      if (paymentError) throw paymentError;

      if (payment.status !== 'succeeded') {
        throw new Error('Cannot refund a payment that has not succeeded');
      }

      // Create refund with provider
      const refund = await this.paymentProvider.createRefund({
        paymentIntentId: payment.payment_intent_id,
        amount: Math.round((amount || payment.amount) * 100),
        reason,
      });

      // Update payment record
      const refundAmount = amount || payment.amount;
      const newRefundTotal = (payment.refund_amount || 0) + refundAmount;
      const isFullRefund = newRefundTotal >= payment.amount;

      await db.supabase
        .from('payments')
        .update({
          refund_amount: newRefundTotal,
          refund_status: 'succeeded',
          refunded_at: new Date().toISOString(),
          refund_reason: reason,
          status: isFullRefund ? 'refunded' : 'partially_refunded',
        })
        .eq('id', paymentId);

      // Create transaction record
      await db.supabase
        .from('transactions')
        .insert({
          payment_id: paymentId,
          user_id: payment.user_id,
          type: 'refund',
          amount: refundAmount,
          currency: payment.currency,
          status: 'completed',
          description: `Refund: ${reason}`,
          provider_transaction_id: refund.id,
        });

      return {
        success: true,
        refund,
        refundAmount,
      };
    } catch (error) {
      console.error('Error creating refund:', error);
      throw error;
    }
  }

  /**
   * Release funds from escrow
   */
  async releaseEscrow(paymentId, recipientUserId) {
    try {
      const { data: payment, error } = await db.supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single();

      if (error) throw error;

      if (!payment.is_escrow) {
        throw new Error('Payment is not held in escrow');
      }

      // Update payment
      await db.supabase
        .from('payments')
        .update({
          escrow_released_at: new Date().toISOString(),
          escrow_released_to: recipientUserId,
        })
        .eq('id', paymentId);

      // Credit recipient's wallet
      await this._creditWallet(recipientUserId, payment.net_amount);

      // Create transaction
      await db.supabase
        .from('transactions')
        .insert({
          payment_id: paymentId,
          user_id: recipientUserId,
          type: 'payout',
          amount: payment.net_amount,
          currency: payment.currency,
          status: 'completed',
          description: 'Escrow release',
        });

      return { success: true };
    } catch (error) {
      console.error('Error releasing escrow:', error);
      throw error;
    }
  }

  /**
   * Create a payout
   */
  async createPayout({ userId, amount, destinationType, destinationId, description }) {
    try {
      // Check wallet balance
      const { data: wallet, error: walletError } = await db.supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (walletError) throw walletError;

      if (wallet.available_balance < amount) {
        throw new Error('Insufficient balance');
      }

      // Create payout with provider
      const payout = await this.paymentProvider.createPayout({
        amount: Math.round(amount * 100),
        currency: 'USD',
        destination: destinationId,
        description,
      });

      // Calculate fees (if any)
      const feeAmount = amount * 0.01; // 1% payout fee
      const netAmount = amount - feeAmount;

      // Create payout record
      const { data: payoutRecord, error: payoutError } = await db.supabase
        .from('payouts')
        .insert({
          user_id: userId,
          amount,
          currency: 'USD',
          status: 'processing',
          provider: this.provider,
          provider_payout_id: payout.id,
          destination_type: destinationType,
          destination_id: destinationId,
          fee_amount: feeAmount,
          net_amount: netAmount,
          description,
          initiated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (payoutError) throw payoutError;

      // Debit wallet
      await db.supabase
        .from('wallets')
        .update({
          balance: wallet.balance - amount,
          total_withdrawn: wallet.total_withdrawn + amount,
        })
        .eq('user_id', userId);

      // Create transaction
      await db.supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'payout',
          amount: -amount,
          currency: 'USD',
          status: 'completed',
          description: description || 'Payout',
          balance_before: wallet.balance,
          balance_after: wallet.balance - amount,
        });

      // Simulate async completion (in real Stripe, this would be via webhook)
      setTimeout(async () => {
        await db.supabase
          .from('payouts')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
          })
          .eq('id', payoutRecord.id);
      }, 3000);

      return {
        success: true,
        payout: payoutRecord,
      };
    } catch (error) {
      console.error('Error creating payout:', error);
      throw error;
    }
  }

  /**
   * Add payment method
   */
  async addPaymentMethod({ userId, cardDetails, billingAddress }) {
    try {
      // Create payment method with provider
      const paymentMethod = await this.paymentProvider.createPaymentMethod({
        type: 'card',
        card: cardDetails,
        billing_details: billingAddress,
      });

      // Check if this should be default (first payment method)
      const { data: existing } = await db.supabase
        .from('payment_methods')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      const isDefault = !existing || existing.length === 0;

      // If setting as default, unset other defaults
      if (isDefault) {
        await db.supabase
          .from('payment_methods')
          .update({ is_default: false })
          .eq('user_id', userId);
      }

      // Save to database
      const { data: savedMethod, error } = await db.supabase
        .from('payment_methods')
        .insert({
          user_id: userId,
          type: 'card',
          provider: this.provider,
          provider_payment_method_id: paymentMethod.id,
          card_brand: paymentMethod.card.brand,
          card_last4: paymentMethod.card.last4,
          card_exp_month: paymentMethod.card.exp_month,
          card_exp_year: paymentMethod.card.exp_year,
          card_fingerprint: paymentMethod.card.fingerprint,
          billing_address: billingAddress,
          is_default: isDefault,
          is_verified: true,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        paymentMethod: savedMethod,
      };
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  }

  /**
   * Remove payment method
   */
  async removePaymentMethod(paymentMethodId, userId) {
    try {
      // Get payment method
      const { data: method, error } = await db.supabase
        .from('payment_methods')
        .select('*')
        .eq('id', paymentMethodId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      // Detach from provider
      await this.paymentProvider.detachPaymentMethod(method.provider_payment_method_id);

      // Delete from database
      await db.supabase
        .from('payment_methods')
        .delete()
        .eq('id', paymentMethodId);

      // If was default, set another as default
      if (method.is_default) {
        const { data: other } = await db.supabase
          .from('payment_methods')
          .select('id')
          .eq('user_id', userId)
          .limit(1)
          .single();

        if (other) {
          await db.supabase
            .from('payment_methods')
            .update({ is_default: true })
            .eq('id', other.id);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error removing payment method:', error);
      throw error;
    }
  }

  /**
   * Get user's payment methods
   */
  async getPaymentMethods(userId) {
    try {
      const { data, error } = await db.supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('is_default', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting payment methods:', error);
      throw error;
    }
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(userId, { limit = 20, offset = 0 } = {}) {
    try {
      const { data, error } = await db.supabase
        .from('payments')
        .select('*, requests(title), proposals(proposed_price)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting payment history:', error);
      throw error;
    }
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(userId) {
    try {
      const { data, error } = await db.supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      throw error;
    }
  }

  /**
   * Private helper: Hold funds in escrow
   */
  async _holdInEscrow(paymentId, amount) {
    const { data: payment } = await db.supabase
      .from('payments')
      .select('proposal_id, proposals(user_id)')
        .eq('id', paymentId)
      .single();

    if (payment?.proposals?.user_id) {
      await db.supabase
        .from('wallets')
        .update({
          reserved_balance: db.supabase.raw('reserved_balance + ?', [amount]),
        })
        .eq('user_id', payment.proposals.user_id);
    }
  }

  /**
   * Private helper: Credit wallet
   */
  async _creditWallet(userId, amount) {
    await db.supabase
      .from('wallets')
      .update({
        balance: db.supabase.raw('balance + ?', [amount]),
        reserved_balance: db.supabase.raw('GREATEST(reserved_balance - ?, 0)', [amount]),
        total_earned: db.supabase.raw('total_earned + ?', [amount]),
      })
      .eq('user_id', userId);
  }

  /**
   * Format currency
   */
  formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
export default paymentService;
