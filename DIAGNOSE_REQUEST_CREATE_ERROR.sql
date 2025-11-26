-- =====================================================
-- DIAGNOSTIC: Check Request Creation Issue
-- Run this to find out why request creation is failing
-- =====================================================

-- 1. Check if requests table exists and has correct columns
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'requests'
ORDER BY ordinal_position;

-- 2. Check RLS is enabled and policies exist
SELECT 
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE tablename = 'requests' AND schemaname = 'public';

-- 3. Check INSERT policy exists
SELECT 
  policyname,
  permissive,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'requests' AND cmd = 'INSERT';

-- 4. Try to manually insert a test request (will show exact error)
-- Replace YOUR_USER_ID with your actual user ID
INSERT INTO public.requests (
  user_id, 
  title, 
  description, 
  category, 
  status
)
VALUES (
  auth.uid(),  -- Your user ID
  'Test Request',
  'Test Description',
  'Test Category',
  'open'
)
RETURNING id, title, created_at;

-- If above fails, try with explicit user ID:
-- INSERT INTO public.requests (user_id, title, category, status)
-- VALUES ('44fd530d-c143-432b-986f-b1f67fb39b85', 'Test', 'test', 'open')
-- RETURNING *;

-- 5. Check if there are any triggers that might be failing
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'requests';


