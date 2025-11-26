# Supabase Setup for Mobile App

This guide will help you configure Supabase credentials for the SkillBridge mobile app.

## Step 1: Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project (the same one used for the web app)
3. Navigate to **Settings** → **API**
4. Copy these two values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (a long string starting with `eyJ...`)

## Step 2: Configure in .env File (Recommended)

1. Open the `.env` file in the `SkillBApp` directory
2. Replace the placeholder values with your actual credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

3. **Save the file**

**Important Format Rules:**
- ✅ No quotes around values
- ✅ No spaces around the `=` sign
- ✅ Use `EXPO_PUBLIC_` prefix (not `REACT_APP_`)
- ❌ Don't use: `EXPO_PUBLIC_SUPABASE_URL = "https://..."` (wrong)
- ✅ Use: `EXPO_PUBLIC_SUPABASE_URL=https://...` (correct)

## Step 3: Configure in app.json (Alternative Method)

If you prefer, you can also configure credentials in `app.json`:

```json
{
  "expo": {
    "extra": {
      "supabaseUrl": "https://your-project-id.supabase.co",
      "supabaseAnonKey": "your-anon-key-here"
    }
  }
}
```

**Note:** The `.env` file method is recommended as it keeps credentials out of version control.

## Step 4: Restart Expo Server

After updating credentials, **restart the Expo development server**:

1. Stop the current server (press `Ctrl+C` in the terminal)
2. Start it again: `npm start` or `npx expo start`

Expo reads environment variables when the server starts, so changes won't take effect until you restart.

## Step 5: Verify Configuration

1. Start the app and check the console/logs
2. You should see:
   - ✅ No errors about Supabase credentials
   - ✅ Successful connection messages
3. Try logging in - it should connect to your Supabase database

## Troubleshooting

### "Supabase credentials not configured" Error

- Check that `.env` file exists in `SkillBApp` directory
- Verify the variable names are exactly: `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Make sure there are no typos or extra spaces
- Restart the Expo server after making changes

### "Failed to fetch" Error

- Verify your Supabase project is active (not paused)
- Check that the URL and key are correct
- Ensure your Supabase project has the same database schema as the web app

### Using Same Credentials as Web App

The mobile app uses the **same Supabase project** as the web app, but:
- Web app uses: `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY`
- Mobile app uses: `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`

**The actual values (URL and key) should be the same**, just with different variable names!

## Quick Copy from Web App

If you already have the web app configured, you can copy the values from the web app's `.env` file:

1. Open the web app's `.env` file (in `gitForWale-main` directory)
2. Copy the values from `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY`
3. Paste them into the mobile app's `.env` file as `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Example:
```env
# Web app (.env in gitForWale-main/)
REACT_APP_SUPABASE_URL=https://abc123.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Mobile app (.env in SkillBApp/)
EXPO_PUBLIC_SUPABASE_URL=https://abc123.supabase.co  # Same URL!
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # Same key!
```


