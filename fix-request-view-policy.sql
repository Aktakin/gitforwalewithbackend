-- Fix Request View Policy for Proposals
-- This ensures users can view requests they want to submit proposals for

-- First, check current policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'requests'
ORDER BY policyname;

-- Drop existing SELECT policy if it exists
DROP POLICY IF EXISTS "Allow users to view public requests" ON requests;
DROP POLICY IF EXISTS "Allow users to view requests" ON requests;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON requests;

-- Create comprehensive SELECT policy for requests
-- This allows users to:
-- 1. View their own requests
-- 2. View public/open requests (so they can submit proposals)
-- 3. View requests they have submitted proposals for
CREATE POLICY "Allow users to view accessible requests"
ON requests FOR SELECT TO authenticated
USING (
  -- User is the request owner
  auth.uid() = user_id
  OR
  -- Request is public and open (anyone can view to submit proposals)
  (status = 'open' AND (is_public = true OR is_public IS NULL))
  OR
  -- User has submitted a proposal for this request
  auth.uid() IN (
    SELECT user_id 
    FROM proposals 
    WHERE proposals.request_id = requests.id
  )
);

-- Verify the new policy
SELECT 
  policyname,
  permissive,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'requests' AND cmd = 'SELECT';

-- Test query (replace with actual user ID and request ID to test)
-- SET ROLE authenticated;
-- SELECT id, title, status, is_public FROM requests WHERE id = 'a77bff9a-4033-42f1-b011-514b4b2c8ac9';

COMMENT ON POLICY "Allow users to view accessible requests" ON requests 
IS 'Allows users to view their own requests, public/open requests, and requests they have submitted proposals for';


