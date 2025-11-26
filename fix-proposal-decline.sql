-- Fix for Declined Proposals Not Updating
-- This ensures request owners can update (accept/decline) proposals

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow proposal updates by owner or request owner" ON proposals;

-- Create comprehensive update policy that allows:
-- 1. Proposal submitter to update their own proposal
-- 2. Request owner to update proposals for their requests (accept/reject)
CREATE POLICY "Allow proposal updates by owner or request owner"
ON proposals FOR UPDATE TO authenticated
USING (
  -- User is the proposal submitter
  auth.uid() = user_id 
  OR 
  -- User is the request owner (can accept/reject)
  auth.uid() IN (
    SELECT user_id 
    FROM requests 
    WHERE requests.id = proposals.request_id
  )
)
WITH CHECK (
  -- Same conditions for the updated data
  auth.uid() = user_id 
  OR 
  auth.uid() IN (
    SELECT user_id 
    FROM requests 
    WHERE requests.id = proposals.request_id
  )
);

-- Also ensure the SELECT policy allows request owners to see proposals
DROP POLICY IF EXISTS "Allow users to view relevant proposals" ON proposals;

CREATE POLICY "Allow users to view relevant proposals"
ON proposals FOR SELECT TO authenticated
USING (
  -- User is the proposal submitter
  auth.uid() = user_id
  OR
  -- User is the request owner
  auth.uid() IN (
    SELECT user_id 
    FROM requests 
    WHERE requests.id = proposals.request_id
  )
);

-- Verify the policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'proposals'
ORDER BY policyname;

-- Test query (replace with actual IDs to test)
-- SELECT id, status, user_id, request_id 
-- FROM proposals 
-- WHERE id = 'your-proposal-id';

COMMENT ON POLICY "Allow proposal updates by owner or request owner" ON proposals 
IS 'Allows proposal submitters to edit their proposals and request owners to accept/reject proposals';


