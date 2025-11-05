# Create Admin User - Step by Step Guide

**⚠️ QUICK START:** See `QUICK_ADMIN_SETUP.md` for the easiest method using the automated script!

This guide will help you set up admin access for:
- **Email:** `aktakinro@gmail.com`
- **Password:** `HelloKitty91`

## Step 1: Add Admin Columns to Database

Run the SQL script in Supabase SQL Editor:

```sql
-- Add admin columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS admin_level TEXT CHECK (admin_level IN ('none', 'moderator', 'admin', 'super_admin')) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS admin_permissions JSONB DEFAULT '[]'::jsonb;
```

Or run the full `create-admin-user.sql` file which includes this.

## Step 2: Create User in Supabase Auth

1. Go to your **Supabase Dashboard**
2. Navigate to **Authentication** → **Users**
3. Click **"Add User"** → **"Create new user"**
4. Fill in the form:
   - **Email:** `root@`
   - **Password:** `HelloKitty91`
   - **Auto Confirm User:** ✅ **Yes** (This is important!)
5. Click **"Create User"**
6. **Copy the User ID** (UUID) - you'll need this in the next step

## Step 3: Update User Profile to Admin

**EASIEST METHOD:** Simply run the `setup-admin-user.sql` file - it will automatically find your user ID!

**OR** manually run this SQL (replace `YOUR_USER_ID_HERE` with the actual UUID from Step 2):

```sql
-- Update existing user to admin OR insert new admin profile
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
  'YOUR_USER_ID_HERE',  -- Replace with the UUID from Step 2
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

## Step 4: Verify Admin Access

1. Log out of your current session (if logged in)
2. Log in with:
   - Email: `root@`
   - Password: `HelloKitty91`
3. You should now have access to:
   - Admin Dashboard (`/admin`)
   - All admin features
   - Full permissions

## Troubleshooting

If the admin user doesn't have admin access:

1. Check that the user profile exists in `public.users`:
   ```sql
   SELECT * FROM public.users WHERE email = 'root@';
   ```

2. Verify admin fields are set:
   ```sql
   SELECT is_admin, admin_level, admin_permissions 
   FROM public.users 
   WHERE email = 'root@';
   ```

3. If fields are missing, run the UPDATE statement from Step 3 again.

## Admin Permissions

The admin user has the following permissions:
- `view_users`, `edit_users`, `delete_users`, `suspend_users`
- `view_content`, `moderate_content`, `delete_content`
- `view_reports`, `resolve_reports`
- `view_analytics`, `export_data`
- `manage_payments`, `resolve_disputes`
- `manage_admins`, `system_settings`

## Security Note

⚠️ **Important:** Change the default password after first login for production use!

