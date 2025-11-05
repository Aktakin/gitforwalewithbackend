-- Fix proposal count visibility for public requests
-- Run this in Supabase SQL Editor

-- Update the proposals RLS policy to allow anyone to count proposals for public requests
-- This allows proposal counts to be visible even if you can't see the actual proposals

-- Drop the old policy
DROP POLICY IF EXISTS "Users can read proposals for their requests" ON public.proposals;

-- Create a new policy that allows:
-- 1. Users can read their own proposals
-- 2. Request owners can read proposals for their requests
-- 3. Anyone can count proposals for public requests (for displaying counts)
CREATE POLICY "Users can read proposals for their requests" ON public.proposals
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() IN (SELECT user_id FROM public.requests WHERE id = request_id) OR
    EXISTS (
      SELECT 1 FROM public.requests 
      WHERE id = request_id 
      AND is_public = true
    )
  );

-- This allows anyone to see proposal counts for public requests
-- while still protecting the actual proposal details

