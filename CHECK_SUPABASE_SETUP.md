# Quick Supabase Setup Check

## Is "Failed to fetch" error appearing?

This usually means Supabase credentials are not set up correctly. Follow these steps:

### Step 1: Check if .env file exists

1. Look in your project root folder (same level as `package.json`)
2. You should see a file named `.env`
3. If it doesn't exist, create it

### Step 2: Add Supabase credentials to .env

Open `.env` and add these lines (replace with YOUR actual values):

```env
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

**Where to find these values:**
1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → paste as `REACT_APP_SUPABASE_URL`
   - **anon/public key** → paste as `REACT_APP_SUPABASE_ANON_KEY`

### Step 3: Verify .env format

✅ **Correct:**
```env
REACT_APP_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

❌ **Wrong:**
```env
# Don't use quotes
REACT_APP_SUPABASE_URL="https://..."
# Don't have spaces around =
REACT_APP_SUPABASE_URL = https://...
# Don't forget REACT_APP_ prefix
SUPABASE_URL=https://...
```

### Step 4: Restart your dev server

**IMPORTANT:** After creating or modifying `.env`, you MUST restart:

1. Stop the server (press `Ctrl+C` in terminal)
2. Start again: `npm start`

React only reads `.env` files when the server starts!

### Step 5: Verify in browser console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for:
   - ✅ No errors about Supabase = Good!
   - ❌ "Supabase credentials not configured" = Check .env file
   - ❌ "Failed to fetch" = Check URL and key are correct

### Step 6: Test your Supabase project

1. Go to Supabase Dashboard
2. Check if your project status is **Active** (not paused)
3. Go to **Authentication** → **Users** to see if you can view the page

### Common Issues

**Issue: "Failed to fetch"**
- ✅ Check .env file exists
- ✅ Check credentials are correct (no typos)
- ✅ Restart dev server after creating .env
- ✅ Check Supabase project is not paused

**Issue: "Invalid API key"**
- ✅ Make sure you're using the **anon/public** key (not service_role)
- ✅ Copy the entire key (it's very long)

**Issue: "Project not found"**
- ✅ Check the URL is correct
- ✅ Make sure project is active in Supabase dashboard

### Still having issues?

1. Open browser console (F12)
2. Check the exact error message
3. Verify your `.env` file has the correct format
4. Make sure you restarted the dev server

---

**Quick Test:**
After setting up, try registering a new user. If it works, your Supabase is configured correctly! 🎉

