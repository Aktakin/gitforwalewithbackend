-- ============================================
-- COMPREHENSIVE FIX: Debug & Fix ALL Recursion Issues
-- Run this in Supabase SQL Editor
-- ============================================

-- STEP 1: See ALL current policies on requests table
SELECT 
  policyname,
  cmd as operation,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies 
WHERE tablename = 'requests'
ORDER BY cmd;

-- STEP 2: Drop ALL policies on requests (fresh start)
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

-- STEP 3: Create SIMPLE policies (NO subqueries, NO recursion)
CREATE POLICY "requests_select_policy" ON public.requests
  FOR SELECT TO authenticated 
  USING (
    auth.uid() = user_id OR 
    status = 'open' OR 
    is_public = true
  );

CREATE POLICY "requests_insert_policy" ON public.requests
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "requests_update_policy" ON public.requests
  FOR UPDATE TO authenticated 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "requests_delete_policy" ON public.requests
  FOR DELETE TO authenticated 
  USING (auth.uid() = user_id);

-- STEP 4: Verify policies were created
SELECT 
  policyname,
  cmd as operation,
  CASE 
    WHEN qual LIKE '%EXISTS%' OR with_check LIKE '%EXISTS%' THEN '❌ HAS SUBQUERY (MAY CAUSE RECURSION)'
    ELSE '✅ OK'
  END as recursion_check
FROM pg_policies 
WHERE tablename = 'requests'
ORDER BY cmd;

-- STEP 5: Test insert (replace with your actual user_id)
-- If this works, your app will work too!
INSERT INTO public.requests (
  user_id,
  title,
  description,
  category,
  status
) VALUES (
  auth.uid(),  -- Uses current logged-in user
  'Test Request - Delete Me',
  'Testing if recursion is fixed',
  'test',
  'open'
) RETURNING id, title, status;

-- ✅ If you see a request ID above, it's FIXED!
-- ❌ If you still see recursion error, copy the ENTIRE error message and send it to me

