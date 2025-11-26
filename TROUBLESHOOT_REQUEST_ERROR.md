# Troubleshooting: "Request not found" Error

## Quick Diagnosis Steps

### Step 1: Run Debug Script (2 minutes)

1. **Open Supabase SQL Editor**: https://app.supabase.com
2. **Copy all contents** from `DEBUG_REQUEST_ISSUE.sql`
3. **Paste and Run** in SQL Editor
4. **Check the results:**
   - Does the request exist? (First query should show the request)
   - What are the current policies? (Second query shows policies)
   - Is RLS enabled? (Third query confirms RLS status)

**Expected Result:**
- If the request EXISTS, you should see its title, status, and user_id
- If the request DOESN'T EXIST, that's your problem - the request was deleted

---

### Step 2: Try the Nuclear Option (TEMPORARY FIX)

If the request exists but you still can't see it:

1. **Open Supabase SQL Editor**
2. **Copy all contents** from `NUCLEAR_FIX_ALLOW_ALL.sql`
3. **Run it**
4. **Refresh your web app** (Ctrl+Shift+R)
5. **Try again**

⚠️ **WARNING:** This allows ALL users to see ALL requests (including private ones). Use only for debugging!

**If this works:** The issue is definitely with RLS policies. You can then replace with proper policies later.

**If this doesn't work:** The issue is something else (see below).

---

### Step 3: Check Browser Console

1. **Open Developer Tools**: Press `F12`
2. **Go to Console tab**
3. **Refresh the page**
4. **Look for these logs:**
   - `[requests.getById] Fetching request: ...`
   - `[requests.getById] Query result: ...`
   - `Current user: ...`

**What to check:**
- Is there a user ID logged? (If not, you're not logged in)
- What does the query result show? (data or error?)
- Any red error messages?

---

## Common Issues & Solutions

### Issue 1: Request Doesn't Exist
**Symptoms:** Debug script shows no results for the specific request ID

**Solution:**
- The request was deleted or never existed
- Try creating a NEW test request
- Use that new request ID instead

---

### Issue 2: User Not Authenticated
**Symptoms:** Browser console shows `Current user: undefined`

**Solution:**
1. Log out completely
2. Clear browser cache (Ctrl+Shift+Delete)
3. Log back in
4. Try again

---

### Issue 3: RLS Policies Not Applied
**Symptoms:** Nuclear fix doesn't work, debug script shows policies exist

**Solution:**
```sql
-- Completely disable RLS (TEMPORARY - for testing only)
ALTER TABLE requests DISABLE ROW LEVEL SECURITY;

-- Test if it works now
-- Then re-enable with proper policies:
-- ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
```

---

### Issue 4: Caching Issues
**Symptoms:** Everything looks right but still doesn't work

**Solution:**
1. **Hard refresh:** Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. **Clear all data:**
   - Press F12 → Application tab
   - Clear site data
3. **Restart browser**
4. **Try incognito mode**

---

### Issue 5: Wrong Supabase Project
**Symptoms:** Debug script shows no requests at all

**Solution:**
- Check your `.env` file or environment variables
- Make sure `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` are correct
- Verify you're looking at the right Supabase project in the dashboard

---

## Advanced Debugging

### Check Supabase Auth
```javascript
// Run this in browser console
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);
console.log('User ID:', session?.user?.id);
```

### Check if request is accessible
```javascript
// Run this in browser console
const { data, error } = await supabase
  .from('requests')
  .select('*')
  .eq('id', 'a77bff9a-4033-42f1-b011-514b4b2c8ac9')
  .maybeSingle();
console.log('Data:', data);
console.log('Error:', error);
```

### Check current policies
```sql
-- Run in Supabase SQL Editor
SELECT * FROM pg_policies WHERE tablename = 'requests';
```

---

## After You Fix It

Once everything works, make sure to:

1. **Replace the "nuclear" policy** with proper security:
```sql
DROP POLICY IF EXISTS "debug_allow_all_requests" ON requests;

CREATE POLICY "requests_select_policy"
ON requests FOR SELECT TO authenticated
USING (
  auth.uid() = user_id OR status = 'open'
);
```

2. **Test that:**
   - ✅ You can view your own requests
   - ✅ You can view other people's open requests
   - ✅ You CANNOT view other people's closed/private requests

---

## Still Not Working?

**Share this information:**
1. Output from `DEBUG_REQUEST_ISSUE.sql`
2. Output from `NUCLEAR_FIX_ALLOW_ALL.sql`
3. Browser console logs (all the `[requests.getById]` messages)
4. Your authentication status (are you logged in?)
5. Screenshot of the error

This will help diagnose the exact issue!


