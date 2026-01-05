-- ============================================
-- Create Payments Table for Stripe Integration
-- ============================================
-- Run this in Supabase SQL Editor
-- This creates the payments table that matches the paymentService.js code
-- ============================================

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  request_id UUID REFERENCES public.requests(id) ON DELETE SET NULL,
  proposal_id UUID REFERENCES public.proposals(id) ON DELETE SET NULL,
  
  -- Payment Details
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  payment_method VARCHAR(50),
  
  -- Transaction Info
  transaction_id VARCHAR(255) UNIQUE,
  payment_intent_id VARCHAR(255),
  
  -- Provider Details (for Stripe integration)
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
  escrow_released_to UUID REFERENCES public.users(id),
  
  -- Refund Info
  refund_amount DECIMAL(10, 2) DEFAULT 0,
  refund_status VARCHAR(20),
  refunded_at TIMESTAMP WITH TIME ZONE,
  refund_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_proposal_id ON public.payments(proposal_id);
CREATE INDEX IF NOT EXISTS idx_payments_request_id ON public.payments(request_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_payment_intent_id ON public.payments(payment_intent_id);

-- Enable Row Level Security
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can create payments" ON public.payments;
DROP POLICY IF EXISTS "Users can update their own payments" ON public.payments;

-- Policy: Users can view their own payments
CREATE POLICY "Users can view their own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can create payments
CREATE POLICY "Users can create payments" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own payments
CREATE POLICY "Users can update their own payments" ON public.payments
  FOR UPDATE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Payments table created successfully!';
END $$;

