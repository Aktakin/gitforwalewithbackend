# Quick Admin Setup Guide

## Step 1: Create User in Supabase Dashboard

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **"Add User"** → **"Create new user"**
3. Fill in:
   - **Email:** `aktakinro@gmail.com`
   - **Password:** `HelloKitty91`
   - **Auto Confirm User:** ✅ **Yes** (Important!)
4. Click **"Create User"**
5. **Don't worry about copying the User ID** - the script will find it automatically!

## Step 2: Run the Setup Script

1. Go to **Supabase Dashboard** → **SQL Editor** → **New Query**
2. Copy and paste the **ENTIRE** contents of `setup-admin-user.sql`
3. Click **"Run"** or press `Ctrl+Enter`

The script will:
- ✅ Add admin columns to the users table
- ✅ Find your `aktakinro@gmail.com` user automatically
- ✅ Set that user as super_admin
- ✅ Show you the user details at the end

## Step 3: Verify Login

1. Go to your login page
2. Enter:
   - **Email:** `aktakinro@gmail.com`
   - **Password:** `HelloKitty91`
3. Click **Sign In**

You should now be logged in as admin!

## Troubleshooting

### Error: "User with email aktakinro@gmail.com not found"
**Solution:** Make sure you created the user in Step 1 with email `aktakinro@gmail.com`

### Error: "Already exists"
**Solution:** The script uses `ON CONFLICT` so it's safe to run multiple times. It will update existing records.

### Still can't login?
1. Check browser console (F12) for error messages
2. Verify user exists: Run this in SQL Editor:
   ```sql
   SELECT * FROM auth.users WHERE email = 'aktakinro@gmail.com';
   ```
3. Verify admin profile exists:
   ```sql
   SELECT * FROM public.users WHERE email = 'aktakinro@gmail.com';
   ```

