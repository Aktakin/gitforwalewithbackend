# How to Fix: "Request not found or you do not have permission to view it"

## Problem
You cannot view requests to submit proposals because of Row Level Security (RLS) policies in Supabase.

## Solution (2 Minutes)

### Step 1: Open Supabase SQL Editor
1. Go to your **Supabase Dashboard**: https://app.supabase.com
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run the Fix Script
1. Open the file `FIX_RLS_POLICIES_COMPLETE.sql` in your code editor
2. **Copy ALL the contents** of that file
3. **Paste** it into the Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter)

### Step 3: Verify the Fix
The script will show:
- ✅ All policies that were created
- ✅ A table showing current policies
- ✅ Information about the specific request you're trying to access

### Step 4: Refresh Your App
1. Go back to your web app
2. **Hard refresh**: Press `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)
3. Try creating a proposal again

---

## Quick Alternative (If You Just Want Requests to Work)

If you just want to fix the requests table quickly, run this minimal script:

```sql
-- Quick Fix for Requests
DROP POLICY IF EXISTS "Allow users to view public requests" ON requests;
DROP POLICY IF EXISTS "Allow users to view requests" ON requests;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON requests;

CREATE POLICY "requests_select_policy"
ON requests FOR SELECT TO authenticated
USING (
  auth.uid() = user_id OR status = 'open'
);
```

This allows:
- ✅ Users to view their own requests
- ✅ Anyone to view **open** requests (so they can submit proposals)

---

## What This Fix Does

### Before (Problem):
- ❌ Users can only view their own requests
- ❌ Cannot view other people's requests to submit proposals
- ❌ Gets "Request not found" error

### After (Fixed):
- ✅ Users can view their own requests
- ✅ Users can view **open** requests from anyone (to submit proposals)
- ✅ Users can view requests they've already submitted proposals for
- ✅ Closed/completed requests remain private to the owner

---

## Troubleshooting

### "Still seeing the error after running the script"
1. Clear browser cache: `Ctrl + Shift + Delete`
2. Hard refresh: `Ctrl + Shift + R`
3. Check if you're logged in
4. Try logging out and back in

### "The script has errors"
- Make sure you copied the **entire** contents of `FIX_RLS_POLICIES_COMPLETE.sql`
- Check that you're using the correct Supabase project
- Verify RLS is enabled on the tables

### "Request still not found"
The request might not exist in the database. Run this in SQL Editor:

```sql
SELECT id, title, status, user_id 
FROM requests 
WHERE id = 'a77bff9a-4033-42f1-b011-514b4b2c8ac9';
```

If this returns nothing, the request was deleted or never existed.

---

## Need Help?

If you still see the error after following these steps:
1. Share the **output** from the SQL script
2. Share any **error messages** from the SQL Editor
3. Check the **browser console** (F12) for any JavaScript errors


