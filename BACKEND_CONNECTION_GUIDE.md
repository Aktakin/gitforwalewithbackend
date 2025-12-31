# Backend Connection Guide

## Supabase Backend Setup

### 1. Environment Variables

Create a `.env` file in the root directory with your Supabase credentials:

```env
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

**How to get these:**
1. Go to your Supabase project dashboard
2. Click on "Settings" → "API"
3. Copy:
   - **Project URL** → `REACT_APP_SUPABASE_URL`
   - **anon/public key** → `REACT_APP_SUPABASE_ANON_KEY`

### 2. Verify Connection

The app will automatically check if Supabase is configured. If not configured:
- The app will still load (won't crash)
- Auth features won't work
- Database operations won't work

### 3. Database Schema

Make sure you've run:
- `supabase-schema.sql` - Main database schema
- `payment-schema.sql` - Payment tables (if using payments)

### 4. Authentication Setup

In Supabase Dashboard:
1. Go to **Authentication** → **Settings**
2. Configure:
   - **Site URL**: `http://localhost:3001` (for development)
   - **Redirect URLs**: Add `http://localhost:3001/reset-password`
   - **Email Templates**: Customize if needed

### 5. Email Configuration (for password reset)

1. Go to **Authentication** → **Settings** → **Email Templates**
2. Configure the "Reset Password" template
3. Set redirect URL to: `http://localhost:3001/reset-password`

For production, update URLs to your production domain.

### 6. Test Connection

After setting up `.env`:
1. Restart your dev server (`npm start`)
2. Try logging in
3. Check browser console for any connection errors

## Password Reset Flow

### How It Works:

1. **User requests reset** (`/forgot-password`)
   - Enters email
   - Supabase sends reset email

2. **User clicks email link**
   - Email contains recovery token
   - Redirects to `/reset-password` with token in URL

3. **User sets new password** (`/reset-password`)
   - Token is extracted from URL
   - Session is set with recovery token
   - Password is updated
   - User is signed out (security)

4. **User logs in** (`/login`)
   - Uses new password

## Change Password (Logged In Users)

Users can change their password while logged in:
- Go to **Settings** → **Privacy & Security**
- Click **Change Password**
- Or go directly to `/change-password`

This requires:
- Current password (for verification)
- New password
- Confirm new password

## Troubleshooting

### "Supabase not configured" error
- Check `.env` file exists
- Check variable names are correct (REACT_APP_ prefix required)
- Restart dev server after creating `.env`

### Password reset email not received
- Check Supabase email settings
- Check spam folder
- Verify email is correct
- Check Supabase logs for errors

### "Invalid reset link" error
- Link may have expired (default: 1 hour)
- Link may have been used already
- Request a new reset link

### Connection errors
- Verify Supabase project is active (not paused)
- Check network connection
- Verify URL and key are correct
- Check browser console for specific errors

## Production Setup

For production:
1. Update `.env` with production Supabase credentials
2. Update redirect URLs in Supabase dashboard
3. Set production site URL
4. Configure custom email domain (optional)
5. Enable email rate limiting
6. Set up proper CORS settings




