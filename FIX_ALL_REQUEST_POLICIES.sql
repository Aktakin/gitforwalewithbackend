-- =====================================================
-- COMPLETE FIX: All Request Policies (SELECT, INSERT, UPDATE, DELETE)
-- Run this in Supabase SQL Editor
-- =====================================================

-- Drop all existing policies on requests table
DROP POLICY IF EXISTS "requests_select_policy" ON requests;
DROP POLICY IF EXISTS "requests_insert_policy" ON requests;
DROP POLICY IF EXISTS "requests_update_policy" ON requests;
DROP POLICY IF EXISTS "requests_delete_policy" ON requests;
DROP POLICY IF EXISTS "Allow users to view public requests" ON requests;
DROP POLICY IF EXISTS "Allow users to view requests" ON requests;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON requests;
DROP POLICY IF EXISTS "debug_allow_all_requests" ON requests;
DROP POLICY IF EXISTS "Users can create their own requests" ON requests;
DROP POLICY IF EXISTS "Users can update their own requests" ON requests;
DROP POLICY IF EXISTS "Users can delete their own requests" ON requests;

-- 1. SELECT Policy: View own requests, open requests, or requests you've proposed to
CREATE POLICY "requests_select_policy"
ON requests FOR SELECT TO authenticated
USING (
  -- User owns the request
  auth.uid() = user_id
  OR
  -- Request is open (anyone can view to submit proposals)
  status = 'open'
  OR
  -- Request is public
  is_public = true
  OR
  -- User has submitted a proposal
  EXISTS (
    SELECT 1 FROM proposals 
    WHERE proposals.request_id = requests.id 
    AND proposals.user_id = auth.uid()
  )
);

-- 2. INSERT Policy: Any authenticated user can create requests
CREATE POLICY "requests_insert_policy"
ON requests FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
);

-- 3. UPDATE Policy: Users can only update their own requests
CREATE POLICY "requests_update_policy"
ON requests FOR UPDATE TO authenticated
USING (
  auth.uid() = user_id
)
WITH CHECK (
  auth.uid() = user_id
);

-- 4. DELETE Policy: Users can only delete their own requests
CREATE POLICY "requests_delete_policy"
ON requests FOR DELETE TO authenticated
USING (
  auth.uid() = user_id
);

-- Verify all policies are correctly created
SELECT 
  policyname,
  cmd,
  CASE 
    WHEN cmd = 'SELECT' THEN '👁️ Read'
    WHEN cmd = 'INSERT' THEN '➕ Create'
    WHEN cmd = 'UPDATE' THEN '✏️ Update'
    WHEN cmd = 'DELETE' THEN '🗑️ Delete'
  END as operation,
  CASE 
    WHEN policyname LIKE 'requests_%_policy' THEN '✅ Correct'
    ELSE '⚠️ Review'
  END as status
FROM pg_policies 
WHERE tablename = 'requests'
ORDER BY cmd;

-- Test queries
SELECT 'Policy check complete. You should see 4 policies above (SELECT, INSERT, UPDATE, DELETE)' as message;

COMMENT ON POLICY "requests_select_policy" ON requests 
IS 'Allows viewing own requests, open/public requests, and requests user has submitted proposals for';

COMMENT ON POLICY "requests_insert_policy" ON requests 
IS 'Allows any authenticated user to create requests';

COMMENT ON POLICY "requests_update_policy" ON requests 
IS 'Allows users to update only their own requests';

COMMENT ON POLICY "requests_delete_policy" ON requests 
IS 'Allows users to delete only their own requests';


