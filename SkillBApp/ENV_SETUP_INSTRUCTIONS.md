# Quick Setup: Supabase Credentials for Mobile App

## Option 1: Create .env File (Recommended)

1. Create a file named `.env` in the `SkillBApp` directory
2. Add these lines (replace with your actual values):

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important:** 
- No quotes around values
- No spaces around `=`
- Use the same URL and key from your web app's `.env` file

## Option 2: Update app.json

1. Open `SkillBApp/app.json`
2. Find the `"extra"` section
3. Replace the placeholder values with your actual Supabase credentials:

```json
"extra": {
  "supabaseUrl": "https://your-actual-project-id.supabase.co",
  "supabaseAnonKey": "your-actual-anon-key-here"
}
```

## Where to Get Your Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → Use as `EXPO_PUBLIC_SUPABASE_URL` or `supabaseUrl`
   - **anon/public key** → Use as `EXPO_PUBLIC_SUPABASE_ANON_KEY` or `supabaseAnonKey`

## After Configuration

1. **Save the file** (.env or app.json)
2. **Restart Expo server**: Press `Ctrl+C` then run `npm start` again
3. Test the app - you should be able to log in and connect to Supabase!

## Same Credentials as Web App

The mobile app uses the **same Supabase project** as your web app. 

If you already have the web app configured, just copy the values:
- From web app `.env`: `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY`
- To mobile app `.env`: `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`

**The actual URL and key values are the same**, just different variable names!


