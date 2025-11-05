-- ============================================
-- Setup Admin User - Complete Script
-- ============================================
-- This script will:
-- 1. Add admin columns to users table
-- 2. Find the user with email 'root@' 
-- 3. Set that user as admin
-- ============================================
-- Run this ENTIRE script in Supabase SQL Editor
-- ============================================

-- Step 1: Add admin columns if they don't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS admin_level TEXT CHECK (admin_level IN ('none', 'moderator', 'admin', 'super_admin')) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS admin_permissions JSONB DEFAULT '[]'::jsonb;

-- Step 2: Find the user ID for 'aktakinro@gmail.com' and set as admin
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Find the user ID from auth.users
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'aktakinro@gmail.com';
  
  IF admin_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email "aktakinro@gmail.com" not found. Please create the user first:
    1. Go to Supabase Dashboard → Authentication → Users
    2. Click "Add User" → "Create new user"
    3. Email: aktakinro@gmail.com
    4. Password: HelloKitty91
    5. Auto Confirm User: Yes
    6. Then run this script again.';
  END IF;
  
  RAISE NOTICE 'Found user with ID: %', admin_user_id;
  
  -- Insert or update user profile as admin
  INSERT INTO public.users (
    id, 
    email, 
    first_name, 
    last_name, 
    user_type, 
    is_admin, 
    admin_level, 
    admin_permissions, 
    is_verified
  )
  VALUES (
    admin_user_id,
    'aktakinro@gmail.com',
    'Admin',
    'User',
    'both',
    true,
    'super_admin',
    '[
      "view_users", "edit_users", "delete_users", "suspend_users",
      "view_content", "moderate_content", "delete_content",
      "view_reports", "resolve_reports",
      "view_analytics", "export_data",
      "manage_payments", "resolve_disputes",
      "manage_admins", "system_settings"
    ]'::jsonb,
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    is_admin = true,
    admin_level = 'super_admin',
    admin_permissions = EXCLUDED.admin_permissions,
    first_name = 'Admin',
    last_name = 'User',
    user_type = 'both',
    is_verified = true,
    updated_at = NOW();
  
  RAISE NOTICE 'Admin user setup complete! User ID: %', admin_user_id;
END $$;

-- Step 3: Verify the admin user was created
SELECT 
  id,
  email,
  first_name,
  last_name,
  is_admin,
  admin_level,
  admin_permissions,
  is_verified
FROM public.users 
WHERE email = 'aktakinro@gmail.com';

