-- Fix Proposal Update Issue
-- This SQL will update the RLS policies to allow proposal updates

-- First, let's see what policies exist
-- Run this in Supabase SQL Editor to check current policies:
-- SELECT * FROM pg_policies WHERE tablename = 'proposals';

-- Drop existing restrictive update policy if it exists
DROP POLICY IF EXISTS "Users can update their own proposals" ON proposals;
DROP POLICY IF EXISTS "Allow proposal updates" ON proposals;
DROP POLICY IF EXISTS "Request owners can update proposals" ON proposals;

-- Create a comprehensive update policy
-- This allows:
-- 1. Proposal creators to update their own proposals (edit content)
-- 2. Request owners to update proposals for their requests (accept/reject)
CREATE POLICY "Allow proposal updates by owner or request owner"
ON proposals
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id  -- Proposal creator can update their own proposal
  OR 
  auth.uid() IN (       -- OR Request owner can update (for accept/reject)
    SELECT user_id FROM requests WHERE requests.id = proposals.request_id
  )
)
WITH CHECK (
  auth.uid() = user_id  -- Proposal creator can update their own proposal
  OR 
  auth.uid() IN (       -- OR Request owner can update (for accept/reject)
    SELECT user_id FROM requests WHERE requests.id = proposals.request_id
  )
);

-- Also ensure SELECT policy allows viewing proposals
DROP POLICY IF EXISTS "Users can view proposals for their requests" ON proposals;
DROP POLICY IF EXISTS "Users can view their own proposals" ON proposals;
DROP POLICY IF EXISTS "Allow viewing proposals" ON proposals;

CREATE POLICY "Allow viewing proposals"
ON proposals
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id  -- Can see your own proposals
  OR 
  auth.uid() IN (       -- OR can see proposals for your requests
    SELECT user_id FROM requests WHERE requests.id = proposals.request_id
  )
);

-- Verify the policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'proposals';


