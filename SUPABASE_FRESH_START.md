# Supabase Fresh Start Guide

This guide will help you set up a completely new Supabase project from scratch.

## Step 1: Create a New Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click **"New Project"** (or go to your organization dashboard)
3. Fill in the project details:
   - **Project Name**: SkillBridge (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the region closest to your users
   - **Pricing Plan**: Free tier is fine for development
4. Click **"Create new project"**
5. Wait 2-3 minutes for the project to initialize

## Step 2: Get Your API Keys

1. Once your project is ready, go to **Settings** → **API**
2. You'll see two important values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (a long string starting with `eyJ...`)

3. Copy both values - you'll need them next!

## Step 3: Update Your .env File

1. Open your project's `.env` file (or create one if it doesn't exist)
2. Replace the old values with your new project credentials:

```env
REACT_APP_SUPABASE_URL=https://your-new-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-new-anon-key-here
```

3. **Save the file**
4. **Restart your development server** (if it's running, stop it with Ctrl+C and run `npm start` again)

## Step 4: Set Up Database Schema

Now we'll create all the tables from scratch:

1. Go to Supabase Dashboard → **SQL Editor** → **New Query**
2. Open the `supabase-schema.sql` file in your project
3. Copy the **entire contents** of the file
4. Paste into the SQL Editor
5. Click **"Run"** (or press Ctrl+Enter)
6. Wait for all queries to complete (should take a few seconds)

You should see success messages for all tables, policies, indexes, and triggers.

## Step 5: Verify Setup

1. Go to **Table Editor** in your Supabase dashboard
2. You should see these tables:
   - ✅ users
   - ✅ skills
   - ✅ requests
   - ✅ proposals
   - ✅ conversations
   - ✅ messages
   - ✅ notifications

3. Go to **Authentication** → **Users** - should be empty (ready for new signups)

## Step 6: Test the Connection

1. Make sure your `.env` file has the correct credentials
2. Start your React app: `npm start`
3. Try registering a new user
4. Check Supabase Dashboard → **Authentication** → **Users** to see the new user
5. Check **Table Editor** → **users** to see the profile

## Troubleshooting

### "Supabase credentials not found" warning
- Make sure your `.env` file is in the root directory (same level as `package.json`)
- Check that variable names are exactly: `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY`
- Restart your development server after creating/modifying `.env`

### Tables not showing up
- Check the SQL Editor for any error messages
- Make sure you ran the entire `supabase-schema.sql` file
- Try refreshing the Table Editor page

### Authentication not working
- Verify your API keys are correct in `.env`
- Check Supabase Dashboard → **Authentication** → **Settings**
- For development, you might want to disable "Confirm email" temporarily

## Next Steps

Once everything is set up:
1. Your app should now connect to Supabase
2. Users can register and login
3. All data will be stored in your Supabase database
4. You can view/manage data in the Supabase dashboard

## Need to Switch Projects Again?

If you need to switch to another Supabase project:
1. Just update the `.env` file with new credentials
2. Run the schema setup again (the safe version won't cause errors)
3. Restart your dev server

---

**That's it!** Your fresh Supabase project is ready to go! 🚀

