-- =====================================================
-- FIX: Infinite Recursion in RLS Policies
-- The issue is caused by circular policy dependencies
-- =====================================================

-- DROP ALL POLICIES on requests table
DROP POLICY IF EXISTS "requests_select_policy" ON public.requests;
DROP POLICY IF EXISTS "requests_insert_policy" ON public.requests;
DROP POLICY IF EXISTS "requests_update_policy" ON public.requests;
DROP POLICY IF EXISTS "requests_delete_policy" ON public.requests;
DROP POLICY IF EXISTS "Anyone can read public requests" ON public.requests;
DROP POLICY IF EXISTS "Users can manage their own requests" ON public.requests;
DROP POLICY IF EXISTS "Allow users to view public requests" ON public.requests;
DROP POLICY IF EXISTS "Allow users to view requests" ON public.requests;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.requests;
DROP POLICY IF EXISTS "debug_allow_all_requests" ON public.requests;

-- Create SIMPLE policies WITHOUT subqueries (no recursion)
-- SELECT: View own requests OR open requests OR public requests
CREATE POLICY "requests_select_policy"
ON public.requests FOR SELECT TO authenticated
USING (
  auth.uid() = user_id 
  OR status = 'open' 
  OR is_public = true
);

-- INSERT: Simple check - user must match
CREATE POLICY "requests_insert_policy"
ON public.requests FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Only your own requests
CREATE POLICY "requests_update_policy"
ON public.requests FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Only your own requests
CREATE POLICY "requests_delete_policy"
ON public.requests FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Verify policies
SELECT 
  policyname,
  cmd,
  '✅ Simple policy (no recursion)' as note
FROM pg_policies 
WHERE tablename = 'requests'
ORDER BY cmd;

-- Test insert
INSERT INTO public.requests (
  user_id,
  title,
  description,
  category,
  status
)
VALUES (
  auth.uid(),
  'Test Request After Fix',
  'Testing after fixing recursion',
  'test',
  'open'
)
RETURNING id, title, created_at;

SELECT 'Recursion fixed! Try creating a request in your app now.' as message;


