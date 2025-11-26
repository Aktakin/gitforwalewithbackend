-- =====================================================
-- DEBUG SCRIPT - Check Request and RLS Policies
-- Run this in Supabase SQL Editor to diagnose the issue
-- =====================================================

-- 1. Check if the request exists (bypassing RLS)
-- =====================================================
SET ROLE postgres;  -- Temporarily bypass RLS
SELECT 
  id,
  title,
  status,
  is_public,
  user_id,
  created_at,
  updated_at
FROM requests
WHERE id = 'a77bff9a-4033-42f1-b011-514b4b2c8ac9';

-- 2. Check ALL current RLS policies on requests table
-- =====================================================
SELECT 
  policyname,
  permissive,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'requests';

-- 3. Check if RLS is enabled on requests table
-- =====================================================
SELECT 
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE tablename = 'requests' AND schemaname = 'public';

-- 4. Test query as authenticated user would see it
-- =====================================================
RESET ROLE;  -- Back to normal
SELECT count(*) as "Total Open Requests Visible" 
FROM requests 
WHERE status = 'open';

-- 5. Check all requests (to see if any exist)
-- =====================================================
SET ROLE postgres;
SELECT 
  id,
  title,
  status,
  is_public,
  created_at
FROM requests
ORDER BY created_at DESC
LIMIT 10;

RESET ROLE;


