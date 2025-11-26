# Complete Fix Summary for JSON Coercion & Request Access Errors

## Issues Fixed

### 1. JSON Coercion Error: "Cannot coerce the result to a single JSON object"
**Root Cause:** Using table joins like `.select('*, users(*)')` with `.single()` in Supabase queries.

**Solution:** Removed all joins from queries and fetch related data separately.

### 2. Request Not Found Error
**Root Cause:** Row Level Security (RLS) policies preventing users from viewing requests they want to submit proposals for.

**Solution:** Updated `requests.getById()` to return `null` instead of throwing an error, and provided SQL script to fix RLS policies.

---

## Files Modified

### Web App (`src/lib/supabase.js`)

#### Functions Updated (12 total):

**Proposals:**
- ✅ `getByRequest()` - Removed `users(*)` join, fetch users separately
- ✅ `getUserProposals()` - Removed `requests(*)` join, fetch requests separately
- ✅ `create()` - Changed `.single()` to `.maybeSingle()` for request and user fetches
- ✅ `update()` - Changed `.single()` to `.maybeSingle()` for proposal, request, and user fetches

**Skills:**
- ✅ `getPublicSkills()` - Removed `users(*)` join, fetch users separately

**Requests:**
- ✅ `getAll()` - Removed `users(*)` join, fetch users separately
- ✅ `getById()` - Changed `.single()` to `.maybeSingle()`, returns `null` instead of throwing error

**Messages:**
- ✅ `getConversation()` - Removed `sender:users(*)` join, fetch senders separately
- ✅ `send()` - Removed `sender:users(*)` join, fetch sender separately, changed `.single()` to `.maybeSingle()` for conversation fetch

**Conversations:**
- ✅ `getUserConversations()` - Removed complex joins `user1:users(*), user2:users(*), requests(*)`, fetch all separately

**Payments:**
- ✅ `getById()` - Changed `.single()` to `.maybeSingle()`, returns `null` instead of throwing error
- ✅ `getByProposal()` - Removed nested joins `proposals(*, requests(*), users(*))`, fetch all separately
- ✅ `getUserPayments()` - Removed nested joins, fetch related data separately for each payment
- ✅ `update()` - Removed nested joins, fetch related data separately

**Transactions:**
- ✅ `getByPayment()` - Removed `users(*)` join, fetch users separately
- ✅ `getUserTransactions()` - Removed nested joins `payments(*, proposals(*, requests(*)))`, fetch all separately

### Mobile App (`SkillBApp/src/lib/supabase.js`)
- ✅ `proposals.getByRequest()` - Removed `users(*)` join
- ✅ `proposals.getUserProposals()` - Removed `requests(*)` join
- ✅ `proposals.create()` - Removed joins, fetch related data separately

### Pages Updated

**`src/pages/proposals/CreateProposalPage.js`:**
- ✅ Improved error message for request not found/not accessible

---

## Key Changes

### Before (Problematic):
```javascript
// ❌ Causes JSON coercion error
const { data } = await supabase
  .from('proposals')
  .select('*, users(*), requests(*)')
  .eq('id', id)
  .single();  // ❌ Throws error if data structure doesn't match exactly
```

### After (Fixed):
```javascript
// ✅ Fetch main data first
const { data } = await supabase
  .from('proposals')
  .select('*')
  .eq('id', id)
  .maybeSingle();  // ✅ Returns null if not found, doesn't throw

// ✅ Fetch related data separately
if (data && data.user_id) {
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user_id)
    .maybeSingle();
  
  data.user = user;
}
```

---

## SQL Fixes to Apply

### Fix 1: Declined Proposals Not Updating
**File:** `fix-proposal-decline.sql`

```sql
-- Run this in your Supabase SQL Editor
DROP POLICY IF EXISTS "Allow proposal updates by owner or request owner" ON proposals;

CREATE POLICY "Allow proposal updates by owner or request owner"
ON proposals FOR UPDATE TO authenticated
USING (
  auth.uid() = user_id OR 
  auth.uid() IN (SELECT user_id FROM requests WHERE requests.id = proposals.request_id)
)
WITH CHECK (
  auth.uid() = user_id OR 
  auth.uid() IN (SELECT user_id FROM requests WHERE requests.id = proposals.request_id)
);
```

### Fix 2: Request Access for Proposal Creation
**File:** `fix-request-view-policy.sql`

```sql
-- Run this in your Supabase SQL Editor
DROP POLICY IF EXISTS "Allow users to view public requests" ON requests;
DROP POLICY IF EXISTS "Allow users to view requests" ON requests;

CREATE POLICY "Allow users to view accessible requests"
ON requests FOR SELECT TO authenticated
USING (
  auth.uid() = user_id
  OR
  (status = 'open' AND (is_public = true OR is_public IS NULL))
  OR
  auth.uid() IN (
    SELECT user_id FROM proposals WHERE proposals.request_id = requests.id
  )
);
```

---

## Testing Instructions

1. **Clear browser cache** and refresh the page
2. **Test proposal creation:**
   - Navigate to any open request
   - Click "Submit Proposal"
   - Should load without "Request not found" error
3. **Test proposal acceptance/rejection:**
   - Go to a request with proposals
   - Accept or decline a proposal
   - Should update immediately without reverting
4. **Test notifications:**
   - Click on any notification
   - Should navigate without JSON coercion errors
5. **Test all pages:**
   - Browse skills, requests, messages
   - All should load without coercion errors

---

## Benefits of These Fixes

✅ **Eliminated JSON coercion errors** across entire app
✅ **More predictable behavior** with separate data fetching
✅ **Better error handling** with `maybeSingle()` instead of `.single()`
✅ **Graceful degradation** when related data doesn't exist
✅ **Works with complex database schemas** and RLS policies
✅ **Improved user experience** with clearer error messages

---

## Important Notes

1. **RLS Policies:** Make sure to run the SQL scripts in your Supabase SQL Editor
2. **Performance:** Separate fetching is slightly slower but more reliable
3. **Future Development:** Always avoid joins with `.single()` - use separate fetches instead
4. **Error Handling:** Functions now return `null` for not found instead of throwing errors (except for updates/deletes where an error is expected)

---

## If You Still See Errors

1. **Check Supabase Logs:**
   - Go to your Supabase Dashboard
   - Navigate to Logs → Postgres Logs
   - Look for RLS policy violations

2. **Verify RLS Policies:**
   - Run the SQL scripts provided
   - Check that policies are correctly applied

3. **Clear All Caches:**
   - Browser cache (Ctrl+Shift+Delete)
   - Supabase cache (refresh dashboard)
   - Application cache (hard refresh with Ctrl+F5)

4. **Check Console:**
   - Open browser DevTools (F12)
   - Check Console tab for specific error messages
   - Share full error stack trace for further debugging


