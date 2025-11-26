-- ============================================
-- EMERGENCY FIX: Infinite Recursion in Requests
-- Run this NOW in Supabase SQL Editor
-- ============================================

-- Drop the problematic policy
DROP POLICY IF EXISTS "requests_select_policy" ON public.requests;

-- Create simple policy WITHOUT subquery (no recursion)
CREATE POLICY "requests_select_policy" ON public.requests
  FOR SELECT TO authenticated USING (
    auth.uid() = user_id OR 
    status = 'open' OR 
    is_public = true
  );

-- Verify it worked
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'requests' 
AND policyname = 'requests_select_policy';

-- ✅ Done! Try creating a request now.

