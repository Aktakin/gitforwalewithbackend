-- =====================================================
-- COMPLETE RLS POLICY FIX FOR SKILLBRIDGE
-- Run this entire script in your Supabase SQL Editor
-- =====================================================

-- 1. Fix REQUESTS table policies
-- =====================================================

-- Drop all existing SELECT policies for requests
DROP POLICY IF EXISTS "Allow users to view public requests" ON requests;
DROP POLICY IF EXISTS "Allow users to view requests" ON requests;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON requests;
DROP POLICY IF EXISTS "Allow users to view accessible requests" ON requests;
DROP POLICY IF EXISTS "Users can view their own requests" ON requests;

-- Create a comprehensive SELECT policy that allows:
-- 1. Users to view their own requests
-- 2. Anyone to view public/open requests (needed for proposal submission)
-- 3. Users to view requests they've submitted proposals for
CREATE POLICY "requests_select_policy"
ON requests FOR SELECT TO authenticated
USING (
  -- User owns this request
  auth.uid() = user_id
  OR
  -- Request is open/public (anyone can view to submit proposals)
  status = 'open'
  OR
  -- User has submitted a proposal for this request
  EXISTS (
    SELECT 1 FROM proposals 
    WHERE proposals.request_id = requests.id 
    AND proposals.user_id = auth.uid()
  )
);

-- 2. Fix PROPOSALS table policies
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Allow proposal updates by owner or request owner" ON proposals;
DROP POLICY IF EXISTS "Allow users to view relevant proposals" ON proposals;
DROP POLICY IF EXISTS "Users can view their own proposals" ON proposals;
DROP POLICY IF EXISTS "Request owners can view proposals" ON proposals;

-- SELECT policy: View own proposals OR proposals for own requests
CREATE POLICY "proposals_select_policy"
ON proposals FOR SELECT TO authenticated
USING (
  -- User is the proposal submitter
  auth.uid() = user_id
  OR
  -- User is the request owner
  auth.uid() IN (
    SELECT user_id FROM requests WHERE requests.id = proposals.request_id
  )
);

-- INSERT policy: Users can create proposals
CREATE POLICY "proposals_insert_policy"
ON proposals FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
);

-- UPDATE policy: Submitter can edit their proposal, request owner can accept/reject
CREATE POLICY "proposals_update_policy"
ON proposals FOR UPDATE TO authenticated
USING (
  -- User is the proposal submitter
  auth.uid() = user_id
  OR
  -- User is the request owner (can accept/reject)
  auth.uid() IN (
    SELECT user_id FROM requests WHERE requests.id = proposals.request_id
  )
)
WITH CHECK (
  -- Same conditions for updated data
  auth.uid() = user_id
  OR
  auth.uid() IN (
    SELECT user_id FROM requests WHERE requests.id = proposals.request_id
  )
);

-- DELETE policy: Only proposal submitter can delete
CREATE POLICY "proposals_delete_policy"
ON proposals FOR DELETE TO authenticated
USING (
  auth.uid() = user_id
);

-- 3. Fix SKILLS table policies (if needed)
-- =====================================================

DROP POLICY IF EXISTS "Users can view public skills" ON skills;
DROP POLICY IF EXISTS "Users can view their own skills" ON skills;

CREATE POLICY "skills_select_policy"
ON skills FOR SELECT TO authenticated
USING (
  -- User owns the skill
  auth.uid() = user_id
  OR
  -- Skill is public and active
  (is_public = true AND is_active = true)
);

-- 4. Fix NOTIFICATIONS table policies
-- =====================================================

DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;

CREATE POLICY "notifications_select_policy"
ON notifications FOR SELECT TO authenticated
USING (
  auth.uid() = user_id
);

CREATE POLICY "notifications_update_policy"
ON notifications FOR UPDATE TO authenticated
USING (
  auth.uid() = user_id
)
WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "notifications_delete_policy"
ON notifications FOR DELETE TO authenticated
USING (
  auth.uid() = user_id
);

-- 5. Verify all policies are correctly applied
-- =====================================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  CASE 
    WHEN cmd = 'SELECT' THEN 'Read'
    WHEN cmd = 'INSERT' THEN 'Create'
    WHEN cmd = 'UPDATE' THEN 'Update'
    WHEN cmd = 'DELETE' THEN 'Delete'
    ELSE cmd
  END as operation
FROM pg_policies
WHERE tablename IN ('requests', 'proposals', 'skills', 'notifications')
ORDER BY tablename, cmd;

-- 6. Check if the specific request exists and its status
-- =====================================================

-- Replace with the actual request ID you're trying to access
SELECT 
  id,
  title,
  status,
  is_public,
  user_id,
  created_at,
  CASE 
    WHEN status = 'open' THEN '✅ Open - Should be viewable'
    WHEN status = 'closed' THEN '⚠️ Closed - May not be viewable'
    WHEN status = 'completed' THEN '⚠️ Completed - May not be viewable'
    ELSE '❓ Unknown status'
  END as accessibility
FROM requests
WHERE id = 'a77bff9a-4033-42f1-b011-514b4b2c8ac9';

-- If the above query returns nothing, the request doesn't exist
-- If it returns a row, check the status and is_public columns

COMMENT ON POLICY "requests_select_policy" ON requests 
IS 'Allows users to view their own requests, open requests, and requests they have submitted proposals for';

COMMENT ON POLICY "proposals_select_policy" ON proposals 
IS 'Allows users to view proposals they submitted or proposals for their requests';

COMMENT ON POLICY "proposals_update_policy" ON proposals 
IS 'Allows proposal submitters to edit and request owners to accept/reject';


