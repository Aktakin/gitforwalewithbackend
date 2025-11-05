-- Update proposal RLS policy to allow request owners to accept/reject proposals
-- Run this in Supabase SQL Editor

-- Drop the old policy
DROP POLICY IF EXISTS "Users can update their own proposals" ON public.proposals;

-- Create new policy that allows:
-- 1. Proposal owners to update their own proposals
-- 2. Request owners to update proposals for their requests
CREATE POLICY "Users can update proposals" ON public.proposals
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    auth.uid() IN (SELECT user_id FROM public.requests WHERE id = request_id)
  );

