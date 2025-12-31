# Google Sign-In Setup Guide

## Overview
Google sign-in is now implemented using Supabase OAuth. Users can sign in or register using their Google account.

## How It Works

1. **User clicks "Sign in with Google"**
   - Redirects to Google OAuth consent screen
   - User authorizes the app
   - Google redirects back to `/auth/callback`

2. **Auth Callback Page**
   - Processes the OAuth response
   - Creates user profile if it doesn't exist
   - Redirects to dashboard

## Supabase Configuration

### Step 1: Enable Google Provider in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Google** in the list
4. Click **Enable**
5. You'll need to configure Google OAuth credentials

### Step 2: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable **Google+ API** (if not already enabled)
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
5. Choose **Web application**
6. Configure:
   - **Name**: SkillBridge (or your app name)
   - **Authorized JavaScript origins**:
     - `http://localhost:3001` (for development)
     - `https://yourdomain.com` (for production)
   - **Authorized redirect URIs**:
     - `https://your-project-id.supabase.co/auth/v1/callback`
     - (Supabase provides this URL - check your Supabase dashboard)

7. Copy the **Client ID** and **Client Secret**

### Step 3: Configure Supabase with Google Credentials

1. In Supabase Dashboard → **Authentication** → **Providers** → **Google**
2. Paste your **Client ID** and **Client Secret**
3. Click **Save**

### Step 4: Configure Redirect URLs

1. In Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**:
   - `http://localhost:3001/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)

## Testing

1. Make sure your `.env` file has Supabase credentials:
   ```env
   REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key
   ```

2. Restart your dev server

3. Click "Sign in with Google" on:
   - Login page (`/login`)
   - Register page (`/register`)
   - Sign-in modal (if used)

4. You should be redirected to Google, then back to your app

## Troubleshooting

### "Redirect URI mismatch" error
- Check that your redirect URI in Google Console matches exactly:
  - `https://your-project-id.supabase.co/auth/v1/callback`
- Make sure there are no trailing slashes or typos

### "Invalid client" error
- Verify Client ID and Client Secret are correct in Supabase
- Make sure Google OAuth credentials are for a "Web application" type

### User not redirected after Google sign-in
- Check browser console for errors
- Verify `/auth/callback` route is accessible
- Check Supabase logs for OAuth errors

### Profile not created automatically
- The callback page should create a profile automatically
- Check browser console for any errors
- Verify database permissions allow profile creation

## User Profile Creation

When a user signs in with Google for the first time:
- A user record is created in Supabase Auth
- A profile is automatically created in the `users` table
- Profile fields populated from Google:
  - `email`: From Google account
  - `first_name`: Extracted from Google name
  - `last_name`: Extracted from Google name
  - `profile_picture`: From Google avatar (if available)
  - `user_type`: Defaults to 'customer'

## Security Notes

- OAuth tokens are handled securely by Supabase
- Never expose your Google Client Secret in frontend code
- Use environment variables for all sensitive credentials
- Regularly rotate OAuth credentials

## Production Checklist

- [ ] Google OAuth credentials created
- [ ] Supabase Google provider enabled and configured
- [ ] Redirect URLs configured in both Google Console and Supabase
- [ ] Production domain added to authorized origins
- [ ] Tested sign-in flow end-to-end
- [ ] Profile creation verified
- [ ] Error handling tested




