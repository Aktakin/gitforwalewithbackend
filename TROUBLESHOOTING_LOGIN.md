# Troubleshooting Login Issues

If you're getting "Invalid login credentials" error, follow these steps:

## Step 1: Verify User Exists in Supabase

1. Go to your **Supabase Dashboard**
2. Navigate to **Authentication** → **Users**
3. Check if a user with email `root@` exists
4. If not, you need to create it first (see CREATE_ADMIN_USER.md)

## Step 2: Create Admin User (If Not Created Yet)

### Option A: Using Supabase Dashboard (Recommended)

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **"Add User"** → **"Create new user"**
3. Fill in:
   - **Email:** `root@`
   - **Password:** `HelloKitty91`
   - **Auto Confirm User:** ✅ **Yes** (Very important!)
4. Click **"Create User"**
5. Copy the **User ID** (UUID)

### Option B: Using SQL Script

After creating the user in Dashboard, run this SQL in Supabase SQL Editor:

```sql
-- First, add admin columns if they don't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS admin_level TEXT CHECK (admin_level IN ('none', 'moderator', 'admin', 'super_admin')) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS admin_permissions JSONB DEFAULT '[]'::jsonb;

-- Then update the user profile (replace YOUR_USER_ID_HERE with actual UUID)
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
  'YOUR_USER_ID_HERE',  -- Replace with UUID from Step 1
  'root@',
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
```

## Step 3: Test Login

1. Go to your login page
2. Enter:
   - **Email:** `root` (will auto-convert to `root@`)
   - **Password:** `HelloKitty91`
3. Click **Sign In**

## Step 4: Check Browser Console

Open browser DevTools (F12) → Console tab and check for:
- Any error messages
- Login attempt logs (should show "Attempting login with email: root@")
- Supabase auth errors

## Common Issues:

### Issue 1: "User not found"
**Solution:** User doesn't exist in Supabase. Create it using Step 2 above.

### Issue 2: "Wrong password"
**Solution:** 
- Verify password is exactly `HelloKitty91` (case-sensitive)
- Try resetting password in Supabase Dashboard → Authentication → Users → Edit user

### Issue 3: "Email not confirmed"
**Solution:** Make sure "Auto Confirm User" was set to **Yes** when creating the user

### Issue 4: "Invalid email format"
**Solution:** The app should auto-convert "root" to "root@". If not, try entering "root@" directly.

## Quick Verification SQL

Run this in Supabase SQL Editor to check if admin user exists:

```sql
-- Check if user exists in auth.users
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'root@';

-- Check if profile exists in public.users
SELECT id, email, is_admin, admin_level, admin_permissions 
FROM public.users 
WHERE email = 'root@';
```

If both queries return empty, the user doesn't exist and needs to be created.

