# Fix Proposal Update Issue - Not Leaving Pending Status

## Problem
Proposals remain in "pending" status after clicking "Accept" - the update doesn't persist in the database.

## Root Cause
This is most likely caused by **Row Level Security (RLS) policies** on the proposals table blocking the update operation.

## Solution Steps

### Step 1: Check Browser Console
Open the browser console (F12) and look for these logs when accepting a proposal:
- `[Proposals.update] Updating proposal: {id}`
- `[Proposals.update] Update result: [...]`
- Any error messages

### Step 2: Fix RLS Policies in Supabase

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project
   - Go to **SQL Editor**

2. **Run the Fix SQL**
   Copy and run the contents of `FIX_PROPOSAL_UPDATE.sql`:
   - This will create proper policies allowing request owners to update proposals
   - Allows both proposal creators and request owners to update proposals

3. **Verify the Fix**
   Run the `CHECK_PROPOSAL_STATUS.sql` to verify:
   - Policies were created correctly
   - Check current proposal statuses

### Step 3: Alternative - Temporary Test Without RLS

If you want to test if RLS is the issue, temporarily disable it:

```sql
-- TEMPORARY TEST ONLY - DO NOT USE IN PRODUCTION
ALTER TABLE proposals DISABLE ROW LEVEL SECURITY;

-- After testing, re-enable it:
-- ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
```

### Step 4: Test the Fix

1. Try accepting a proposal again
2. Check browser console for success logs
3. Verify the proposal moves to "Accepted" tab and stays there
4. Refresh the page - it should still be "Accepted"

## Expected Behavior After Fix

✅ Click "Accept Proposal"  
✅ Proposal updates to "accepted" status  
✅ Moves to "Accepted" tab  
✅ Status persists after page refresh  
✅ Database shows status = 'accepted'  

## Common Issues & Solutions

### Issue 1: "Permission denied for table proposals"
**Solution:** User doesn't have permission. Run the RLS policy fix SQL.

### Issue 2: Update succeeds but reverts after refresh
**Solution:** Check if there are database triggers reverting the status.

### Issue 3: No error but status doesn't change
**Solution:** RLS policy is silently blocking. Run the fix SQL.

## Verify Database Directly

In Supabase SQL Editor, check the actual database value:

```sql
-- Check a specific proposal by ID
SELECT id, status, updated_at 
FROM proposals 
WHERE id = 'YOUR_PROPOSAL_ID';

-- Try manual update to test
UPDATE proposals 
SET status = 'accepted' 
WHERE id = 'YOUR_PROPOSAL_ID';
```

## What the Fix Does

The `FIX_PROPOSAL_UPDATE.sql` creates two policies:

1. **Update Policy**: Allows updates by:
   - Proposal creator (to edit their proposal)
   - Request owner (to accept/reject proposals)

2. **Select Policy**: Allows viewing by:
   - Proposal creator (see their own proposals)
   - Request owner (see proposals for their requests)

## Need More Help?

If the issue persists after running the fix:

1. Check browser console logs
2. Run `CHECK_PROPOSAL_STATUS.sql` and share results
3. Check if status changes in database but not in UI
4. Verify you're logged in as the request owner

---

**Quick Fix Command:**
```bash
# In Supabase SQL Editor, just run:
cat FIX_PROPOSAL_UPDATE.sql
# Copy and execute the contents
```


