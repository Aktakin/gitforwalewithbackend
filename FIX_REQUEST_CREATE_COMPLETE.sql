-- =====================================================
-- COMPLETE FIX: Request Creation Issue
-- This will fix all common issues with creating requests
-- =====================================================

-- 1. First, let's make sure the requests table has all required columns
ALTER TABLE public.requests 
ADD COLUMN IF NOT EXISTS views BIGINT DEFAULT 0;

-- 2. Drop ALL existing policies on requests table
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

-- 3. Create clean, simple policies
-- SELECT: View own requests, open requests, or public requests
CREATE POLICY "requests_select_policy"
ON public.requests FOR SELECT TO authenticated
USING (
  auth.uid() = user_id OR status = 'open' OR is_public = true
);

-- INSERT: Allow authenticated users to create requests
CREATE POLICY "requests_insert_policy"
ON public.requests FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Only update your own requests
CREATE POLICY "requests_update_policy"
ON public.requests FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Only delete your own requests
CREATE POLICY "requests_delete_policy"
ON public.requests FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- 4. Verify policies are created
SELECT 
  policyname,
  cmd as operation,
  '✅' as status
FROM pg_policies 
WHERE tablename = 'requests'
ORDER BY cmd;

-- 5. Check if your user exists in the users table
-- Replace with your actual user ID
SELECT 
  id,
  email,
  first_name,
  last_name,
  user_type
FROM public.users
WHERE id = '44fd530d-c143-432b-986f-b1f67fb39b85';

-- 6. If user doesn't exist, create it
INSERT INTO public.users (
  id,
  email,
  first_name,
  last_name,
  user_type,
  is_verified
)
VALUES (
  '44fd530d-c143-432b-986f-b1f67fb39b85',
  'aktakinro@gmail.com',
  'User',
  'Name',
  'both',
  true
)
ON CONFLICT (id) DO NOTHING;

-- 7. Test: Try to create a request manually
INSERT INTO public.requests (
  user_id,
  title,
  description,
  category,
  status,
  urgency,
  is_public
)
VALUES (
  '44fd530d-c143-432b-986f-b1f67fb39b85',
  'Test Request',
  'This is a test request',
  'test',
  'open',
  'medium',
  true
)
RETURNING id, title, status, created_at;

-- If the above INSERT works, your policies are correct!
-- If it fails, the error message will tell us what's wrong.

SELECT 'Setup complete! Try creating a request in your app now.' as message;


