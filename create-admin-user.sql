-- ============================================
-- Create Admin User Script
-- ============================================
-- This script creates an admin user with:
-- Username/Email: root@
-- Password: HelloKitty91
-- ============================================
-- Run this in Supabase SQL Editor
-- Location: Supabase Dashboard → SQL Editor → New Query
-- ============================================

-- Step 1: Add admin columns to users table if they don't exist
DO $$ 
BEGIN
  -- Add is_admin column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE public.users ADD COLUMN is_admin BOOLEAN DEFAULT false;
  END IF;

  -- Add admin_level column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'admin_level'
  ) THEN
    ALTER TABLE public.users ADD COLUMN admin_level TEXT CHECK (admin_level IN ('none', 'moderator', 'admin', 'super_admin')) DEFAULT 'none';
  END IF;

  -- Add admin_permissions column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'admin_permissions'
  ) THEN
    ALTER TABLE public.users ADD COLUMN admin_permissions JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Step 2: Create admin user in auth.users (if not exists)
-- Note: This creates the user in Supabase Auth
DO $$
DECLARE
  admin_user_id UUID;
  admin_email TEXT := 'root@';
  admin_password TEXT := 'HelloKitty91';
BEGIN
  -- Check if user already exists
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = admin_email;
  
  IF admin_user_id IS NULL THEN
    -- Create user in auth.users using Supabase Auth Admin API
    -- Note: Direct insertion into auth.users requires service role key
    -- For production, use Supabase Dashboard → Authentication → Add User
    -- OR use Supabase Management API
    
    RAISE NOTICE 'Admin user needs to be created manually:';
    RAISE NOTICE '1. Go to Supabase Dashboard → Authentication → Users';
    RAISE NOTICE '2. Click "Add User" → "Create new user"';
    RAISE NOTICE '3. Email: root@';
    RAISE NOTICE '4. Password: HelloKitty91';
    RAISE NOTICE '5. Auto Confirm User: Yes';
    RAISE NOTICE '6. After creating, run the UPDATE statement below with the user ID';
  ELSE
    RAISE NOTICE 'Admin user already exists with ID: %', admin_user_id;
    
    -- Update the user profile to be admin
    UPDATE public.users
    SET 
      is_admin = true,
      admin_level = 'super_admin',
      admin_permissions = '[
        "view_users", "edit_users", "delete_users", "suspend_users",
        "view_content", "moderate_content", "delete_content",
        "view_reports", "resolve_reports",
        "view_analytics", "export_data",
        "manage_payments", "resolve_disputes",
        "manage_admins", "system_settings"
      ]'::jsonb,
      first_name = 'Admin',
      last_name = 'User',
      user_type = 'both',
      is_verified = true,
      updated_at = NOW()
    WHERE id = admin_user_id;
    
    -- Insert profile if it doesn't exist
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
    SELECT 
      admin_user_id,
      admin_email,
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
    WHERE NOT EXISTS (
      SELECT 1 FROM public.users WHERE id = admin_user_id
    );
    
    RAISE NOTICE 'Admin profile updated successfully!';
  END IF;
END $$;

-- Step 3: Manual instructions if user creation is needed
-- ============================================
-- INSTRUCTIONS FOR CREATING ADMIN USER:
-- ============================================
-- Since direct SQL insertion into auth.users requires admin privileges,
-- please follow these steps:
--
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add User" → "Create new user"
-- 3. Enter:
--    - Email: root@
--    - Password: HelloKitty91
--    - Auto Confirm User: Yes (important!)
-- 4. Click "Create User"
-- 5. Copy the User ID (UUID) from the newly created user
-- 6. Run the UPDATE statement below with your User ID:
--
-- UPDATE public.users
-- SET 
--   is_admin = true,
--   admin_level = 'super_admin',
--   admin_permissions = '[
--     "view_users", "edit_users", "delete_users", "suspend_users",
--     "view_content", "moderate_content", "delete_content",
--     "view_reports", "resolve_reports",
--     "view_analytics", "export_data",
--     "manage_payments", "resolve_disputes",
--     "manage_admins", "system_settings"
--   ]'::jsonb,
--   first_name = 'Admin',
--   last_name = 'User',
--   user_type = 'both',
--   is_verified = true,
--   updated_at = NOW()
-- WHERE id = 'YOUR_USER_ID_HERE';
--
-- INSERT INTO public.users (
--   id, email, first_name, last_name, user_type, 
--   is_admin, admin_level, admin_permissions, is_verified
-- )
-- VALUES (
--   'YOUR_USER_ID_HERE',
--   'root@',
--   'Admin',
--   'User',
--   'both',
--   true,
--   'super_admin',
--   '[
--     "view_users", "edit_users", "delete_users", "suspend_users",
--     "view_content", "moderate_content", "delete_content",
--     "view_reports", "resolve_reports",
--     "view_analytics", "export_data",
--     "manage_payments", "resolve_disputes",
--     "manage_admins", "system_settings"
--   ]'::jsonb,
--   true
-- )
-- ON CONFLICT (id) DO UPDATE SET
--   is_admin = true,
--   admin_level = 'super_admin',
--   admin_permissions = EXCLUDED.admin_permissions,
--   is_verified = true,
--   updated_at = NOW();
-- ============================================

