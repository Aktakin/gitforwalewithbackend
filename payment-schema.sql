-- ============================================
-- Payment & Escrow Schema for SkillBridge
-- ============================================
-- Run this file in Supabase SQL Editor after running supabase-schema.sql
-- ============================================

-- ============================================
-- 1. PAYMENTS TABLE (Escrow & Payment Tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID REFERENCES public.proposals(id) ON DELETE CASCADE NOT NULL,
  request_id UUID REFERENCES public.requests(id) ON DELETE CASCADE NOT NULL,
  payer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL, -- Customer who pays
  payee_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL, -- Provider who receives
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'USD',
  status TEXT CHECK (status IN ('pending', 'paid', 'held', 'released', 'refunded', 'cancelled')) DEFAULT 'pending',
  stripe_payment_intent_id TEXT, -- Stripe Payment Intent ID
  stripe_charge_id TEXT, -- Stripe Charge ID
  escrow_release_date TIMESTAMP WITH TIME ZONE, -- When funds can be released
  released_at TIMESTAMP WITH TIME ZONE, -- When funds were actually released
  refunded_at TIMESTAMP WITH TIME ZONE, -- When refund was issued
  metadata JSONB DEFAULT '{}', -- Additional payment metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(proposal_id) -- One payment per proposal
);

-- Enable Row Level Security
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can create payments" ON public.payments;
DROP POLICY IF EXISTS "Users can update their own payments" ON public.payments;

-- Policy: Users can read payments they're involved in
CREATE POLICY "Users can read their own payments" ON public.payments
  FOR SELECT USING (auth.uid() = payer_id OR auth.uid() = payee_id);

-- Policy: Users can create payments (for their own proposals/requests)
CREATE POLICY "Users can create payments" ON public.payments
  FOR INSERT WITH CHECK (
    auth.uid() = payer_id OR 
    auth.uid() IN (
      SELECT user_id FROM public.requests WHERE id = request_id
    )
  );

-- Policy: Users can update payments (approve release, etc.)
CREATE POLICY "Users can update their own payments" ON public.payments
  FOR UPDATE USING (auth.uid() = payer_id OR auth.uid() = payee_id);

-- ============================================
-- 2. TRANSACTIONS TABLE (Payment History)
-- ============================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_id UUID REFERENCES public.payments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('payment', 'escrow_hold', 'escrow_release', 'refund', 'fee')) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
  stripe_transaction_id TEXT, -- Stripe transaction reference
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "System can create transactions" ON public.transactions;

-- Policy: Users can read their own transactions
CREATE POLICY "Users can read their own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: System can create transactions (for payment processing)
CREATE POLICY "System can create transactions" ON public.transactions
  FOR INSERT WITH CHECK (true);

-- ============================================
-- 3. UPDATE PROPOSALS TABLE
-- ============================================
-- Add payment_id reference to proposals (optional, for easier lookup)
ALTER TABLE public.proposals 
ADD COLUMN IF NOT EXISTS payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL;

-- ============================================
-- 4. INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_payments_proposal_id ON public.payments(proposal_id);
CREATE INDEX IF NOT EXISTS idx_payments_request_id ON public.payments(request_id);
CREATE INDEX IF NOT EXISTS idx_payments_payer_id ON public.payments(payer_id);
CREATE INDEX IF NOT EXISTS idx_payments_payee_id ON public.payments(payee_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent_id ON public.payments(stripe_payment_intent_id);

CREATE INDEX IF NOT EXISTS idx_transactions_payment_id ON public.transactions(payment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at);

-- ============================================
-- 5. TRIGGERS
-- ============================================
-- Update updated_at for payments
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. FUNCTIONS
-- ============================================

-- Function to create payment and transaction records
CREATE OR REPLACE FUNCTION create_payment_with_transaction(
  p_proposal_id UUID,
  p_request_id UUID,
  p_payer_id UUID,
  p_payee_id UUID,
  p_amount DECIMAL,
  p_stripe_payment_intent_id TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_payment_id UUID;
BEGIN
  -- Create payment record
  INSERT INTO public.payments (
    proposal_id,
    request_id,
    payer_id,
    payee_id,
    amount,
    status,
    stripe_payment_intent_id
  ) VALUES (
    p_proposal_id,
    p_request_id,
    p_payer_id,
    p_payee_id,
    p_amount,
    'pending',
    p_stripe_payment_intent_id
  ) RETURNING id INTO v_payment_id;

  -- Create initial transaction record
  INSERT INTO public.transactions (
    payment_id,
    user_id,
    type,
    amount,
    status,
    description
  ) VALUES (
    v_payment_id,
    p_payer_id,
    'payment',
    p_amount,
    'pending',
    'Payment initiated for proposal'
  );

  -- Update proposal with payment_id
  UPDATE public.proposals
  SET payment_id = v_payment_id
  WHERE id = p_proposal_id;

  RETURN v_payment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to release escrow funds
CREATE OR REPLACE FUNCTION release_escrow_funds(
  p_payment_id UUID,
  p_released_by UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_payment RECORD;
BEGIN
  -- Get payment details
  SELECT * INTO v_payment
  FROM public.payments
  WHERE id = p_payment_id;

  -- Check if payment exists and is in held status
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment not found';
  END IF;

  IF v_payment.status != 'held' THEN
    RAISE EXCEPTION 'Payment is not in held status. Current status: %', v_payment.status;
  END IF;

  -- Check if user has permission (must be payer)
  IF v_payment.payer_id != p_released_by THEN
    RAISE EXCEPTION 'Only the payer can release escrow funds';
  END IF;

  -- Update payment status
  UPDATE public.payments
  SET 
    status = 'released',
    released_at = NOW()
  WHERE id = p_payment_id;

  -- Create release transaction
  INSERT INTO public.transactions (
    payment_id,
    user_id,
    type,
    amount,
    status,
    description
  ) VALUES (
    p_payment_id,
    v_payment.payee_id,
    'escrow_release',
    v_payment.amount,
    'completed',
    'Escrow funds released to provider'
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- DONE!
-- ============================================
-- Payment schema is now set up!
-- Next steps:
-- 1. Set up Stripe account and get API keys
-- 2. Add Stripe SDK to your application
-- 3. Implement payment processing logic
-- ============================================




