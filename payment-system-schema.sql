-- =====================================================
-- Complete Payment System Database Schema
-- =====================================================
-- Run this in your Supabase SQL Editor

-- 1. PAYMENTS TABLE
-- Stores all payment transactions
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_id UUID REFERENCES requests(id) ON DELETE SET NULL,
  proposal_id UUID REFERENCES proposals(id) ON DELETE SET NULL,
  
  -- Payment Details
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  payment_method VARCHAR(50),
  
  -- Transaction Info
  transaction_id VARCHAR(255) UNIQUE,
  payment_intent_id VARCHAR(255),
  
  -- Provider Details (for future Stripe integration)
  provider VARCHAR(50) DEFAULT 'mock',
  provider_transaction_id VARCHAR(255),
  provider_customer_id VARCHAR(255),
  provider_payment_method_id VARCHAR(255),
  
  -- Metadata
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Fee Breakdown
  platform_fee DECIMAL(10, 2) DEFAULT 0,
  processing_fee DECIMAL(10, 2) DEFAULT 0,
  net_amount DECIMAL(10, 2),
  
  -- Payment Flow
  payment_type VARCHAR(50) NOT NULL, -- 'booking', 'proposal_acceptance', 'milestone', 'tip'
  payment_for VARCHAR(100), -- Description of what payment is for
  
  -- Escrow (for holding payments)
  is_escrow BOOLEAN DEFAULT false,
  escrow_released_at TIMESTAMP WITH TIME ZONE,
  escrow_released_to UUID REFERENCES users(id),
  
  -- Refund Info
  refund_amount DECIMAL(10, 2) DEFAULT 0,
  refund_status VARCHAR(20),
  refunded_at TIMESTAMP WITH TIME ZONE,
  refund_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded', 'partially_refunded')),
  CONSTRAINT valid_payment_type CHECK (payment_type IN ('booking', 'proposal_acceptance', 'milestone', 'tip', 'subscription', 'other')),
  CONSTRAINT valid_refund_status CHECK (refund_status IS NULL OR refund_status IN ('pending', 'succeeded', 'failed'))
);

-- 2. TRANSACTIONS TABLE
-- Detailed transaction history
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Foreign Keys
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Transaction Details
  type VARCHAR(50) NOT NULL, -- 'payment', 'refund', 'payout', 'fee'
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) NOT NULL,
  
  -- Description
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Balance Impact
  balance_before DECIMAL(10, 2),
  balance_after DECIMAL(10, 2),
  
  -- Provider Info
  provider_transaction_id VARCHAR(255),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_transaction_type CHECK (type IN ('payment', 'refund', 'payout', 'fee', 'adjustment')),
  CONSTRAINT valid_transaction_status CHECK (status IN ('pending', 'completed', 'failed', 'cancelled'))
);

-- 3. PAYMENT_METHODS TABLE
-- Stored payment methods (cards, bank accounts)
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Method Details
  type VARCHAR(50) NOT NULL, -- 'card', 'bank_account', 'paypal', 'wallet'
  provider VARCHAR(50) DEFAULT 'mock',
  provider_payment_method_id VARCHAR(255),
  
  -- Card Info (encrypted/tokenized in production)
  card_brand VARCHAR(50),
  card_last4 VARCHAR(4),
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  card_fingerprint VARCHAR(255),
  
  -- Bank Account Info
  bank_name VARCHAR(100),
  bank_account_last4 VARCHAR(4),
  bank_account_type VARCHAR(20), -- 'checking', 'savings'
  
  -- Status
  is_default BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'active',
  
  -- Billing Address
  billing_address JSONB,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_payment_method_type CHECK (type IN ('card', 'bank_account', 'paypal', 'wallet')),
  CONSTRAINT valid_payment_method_status CHECK (status IN ('active', 'inactive', 'expired'))
);

-- 4. INVOICES TABLE
-- Generated invoices for payments
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Invoice Number
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Foreign Keys
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Invoice Details
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  
  -- Line Items
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Totals
  subtotal DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  amount_paid DECIMAL(10, 2) DEFAULT 0,
  amount_due DECIMAL(10, 2) NOT NULL,
  
  -- Dates
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Notes
  notes TEXT,
  terms TEXT,
  
  -- PDF
  pdf_url TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_invoice_status CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled', 'refunded'))
);

-- 5. PAYOUTS TABLE
-- Track payouts to providers
CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Payout Details
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  
  -- Provider Info
  provider VARCHAR(50) DEFAULT 'mock',
  provider_payout_id VARCHAR(255),
  
  -- Destination
  destination_type VARCHAR(50), -- 'bank_account', 'paypal', 'wallet'
  destination_id VARCHAR(255),
  
  -- Fees
  fee_amount DECIMAL(10, 2) DEFAULT 0,
  net_amount DECIMAL(10, 2),
  
  -- Related Payments
  payment_ids UUID[],
  
  -- Description
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  initiated_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  
  -- Failure Info
  failure_reason TEXT,
  
  -- Constraints
  CONSTRAINT valid_payout_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  CONSTRAINT valid_destination_type CHECK (destination_type IN ('bank_account', 'paypal', 'wallet', 'card'))
);

-- 6. WALLET TABLE
-- User wallet/balance system
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Foreign Key
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Balance
  balance DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Reserved Funds (in escrow)
  reserved_balance DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (reserved_balance >= 0),
  available_balance DECIMAL(10, 2) GENERATED ALWAYS AS (balance - reserved_balance) STORED,
  
  -- Lifetime Stats
  total_earned DECIMAL(10, 2) DEFAULT 0,
  total_withdrawn DECIMAL(10, 2) DEFAULT 0,
  total_fees_paid DECIMAL(10, 2) DEFAULT 0,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active',
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_wallet_status CHECK (status IN ('active', 'frozen', 'suspended'))
);

-- =====================================================
-- INDEXES for Performance
-- =====================================================

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_request_id ON payments(request_id);
CREATE INDEX IF NOT EXISTS idx_payments_proposal_id ON payments(proposal_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);

-- Transactions indexes
CREATE INDEX IF NOT EXISTS idx_transactions_payment_id ON transactions(payment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- Payment Methods indexes
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_default ON payment_methods(is_default) WHERE is_default = true;

-- Invoices indexes
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);

-- Payouts indexes
CREATE INDEX IF NOT EXISTS idx_payouts_user_id ON payouts(user_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_created_at ON payouts(created_at DESC);

-- Wallets index
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- Payments Policies
CREATE POLICY "Users can view their own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update payments"
  ON payments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Transactions Policies
CREATE POLICY "Users can view their own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Payment Methods Policies
CREATE POLICY "Users can manage their payment methods"
  ON payment_methods FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Invoices Policies
CREATE POLICY "Users can view their invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = client_id);

CREATE POLICY "Users can create invoices"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Payouts Policies
CREATE POLICY "Users can view their payouts"
  ON payouts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Wallets Policies
CREATE POLICY "Users can view their wallet"
  ON wallets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their wallet"
  ON wallets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS for Auto-Updates
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payouts_updated_at BEFORE UPDATE ON payouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTIONS for Payment Processing
-- =====================================================

-- Function to create wallet when user signs up
CREATE OR REPLACE FUNCTION create_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wallets (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_wallet_on_signup
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_wallet();

-- Function to update wallet balance
CREATE OR REPLACE FUNCTION update_wallet_balance(
  p_user_id UUID,
  p_amount DECIMAL,
  p_type VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_balance DECIMAL;
BEGIN
  -- Get current balance
  SELECT balance INTO v_current_balance
  FROM wallets
  WHERE user_id = p_user_id;
  
  -- Update balance based on type
  IF p_type = 'credit' THEN
    UPDATE wallets
    SET balance = balance + p_amount,
        total_earned = total_earned + p_amount
    WHERE user_id = p_user_id;
  ELSIF p_type = 'debit' THEN
    -- Check if sufficient balance
    IF v_current_balance < p_amount THEN
      RAISE EXCEPTION 'Insufficient balance';
    END IF;
    
    UPDATE wallets
    SET balance = balance - p_amount,
        total_withdrawn = total_withdrawn + p_amount
    WHERE user_id = p_user_id;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Generate unique invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  v_count INTEGER;
  v_invoice_number TEXT;
BEGIN
  SELECT COUNT(*) INTO v_count FROM invoices;
  v_invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD((v_count + 1)::TEXT, 5, '0');
  RETURN v_invoice_number;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Sample Data (Optional - for testing)
-- =====================================================

-- This will be auto-created by the trigger when users sign up
-- But you can manually create wallets for existing users:
-- INSERT INTO wallets (user_id) 
-- SELECT id FROM users WHERE NOT EXISTS (SELECT 1 FROM wallets WHERE user_id = users.id);

COMMENT ON TABLE payments IS 'Stores all payment transactions in the system';
COMMENT ON TABLE transactions IS 'Detailed transaction history for audit trail';
COMMENT ON TABLE payment_methods IS 'User saved payment methods';
COMMENT ON TABLE invoices IS 'Generated invoices for payments';
COMMENT ON TABLE payouts IS 'Track payouts to service providers';
COMMENT ON TABLE wallets IS 'User wallet/balance system for managing funds';


