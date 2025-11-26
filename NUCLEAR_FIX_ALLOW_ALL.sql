-- =====================================================
-- NUCLEAR OPTION: Allow All Authenticated Users to View All Requests
-- Use this temporarily to test if RLS is the issue
-- =====================================================

-- WARNING: This is for DEBUGGING ONLY
-- It allows all authenticated users to see ALL requests (including private ones)
-- You should replace this with proper policies later

-- Drop ALL existing SELECT policies on requests
DROP POLICY IF EXISTS "requests_select_policy" ON requests;
DROP POLICY IF EXISTS "Allow users to view public requests" ON requests;
DROP POLICY IF EXISTS "Allow users to view requests" ON requests;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON requests;
DROP POLICY IF EXISTS "Allow users to view accessible requests" ON requests;
DROP POLICY IF EXISTS "Users can view their own requests" ON requests;

-- Create a simple policy that allows ALL authenticated users to view ALL requests
CREATE POLICY "debug_allow_all_requests"
ON requests FOR SELECT TO authenticated
USING (true);  -- This means: always allow

-- Verify the policy was created
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'requests' AND cmd = 'SELECT';

-- Now try to fetch the specific request
SELECT 
  id,
  title,
  status,
  is_public,
  user_id
FROM requests
WHERE id = 'a77bff9a-4033-42f1-b011-514b4b2c8ac9';

-- Count total requests
SELECT count(*) as total_requests FROM requests;


