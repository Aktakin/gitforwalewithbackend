# Step-by-Step Guide to Fix the Proposals Status Constraint

## Problem
You're getting an error: `new row for relation "proposals" violates check constraint "proposals_status_check"` when trying to mark a project as completed.

## Solution

### Step 1: Open Supabase SQL Editor
1. Go to https://app.supabase.com
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: First, Check What Constraints Exist
Copy and paste this query to see what constraints are currently on the proposals table:

```sql
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.proposals'::regclass
AND contype = 'c'
ORDER BY conname;
```

**Run this query** and note the constraint name(s) you see.

### Step 3: Run the Fix Script
Copy and paste the **entire contents** of `FIX_PROPOSALS_STATUS_CONSTRAINT.sql` into the SQL Editor and click **Run**.

This script will:
- Find all status-related constraints
- Drop them
- Create a new constraint that allows: `'pending'`, `'accepted'`, `'rejected'`, `'completed'`

### Step 4: Verify It Worked
After running the fix script, you should see output showing:
- The constraint was dropped
- A new constraint was created
- A success message

### Step 5: Test It
Run this verification query to make sure it works:

```sql
-- This should NOT give an error
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.proposals'::regclass
AND conname = 'proposals_status_check';
```

You should see the constraint definition showing: `CHECK (status IN ('pending', 'accepted', 'rejected', 'completed'))`

### Step 6: Try Completing a Project Again
1. Go back to your app
2. Try marking a project as "Complete"
3. Check the browser console (F12) for any error messages
4. The project should now move to the "Completed" tab

## Troubleshooting

### If the SQL script gives an error:
1. **Check the constraint name**: The constraint might have a different name. Look at the output from Step 2.
2. **Manual fix**: If the script fails, you can manually drop and recreate:

```sql
-- Replace 'actual_constraint_name' with the name from Step 2
ALTER TABLE public.proposals DROP CONSTRAINT IF EXISTS actual_constraint_name;

-- Then add the new one
ALTER TABLE public.proposals 
ADD CONSTRAINT proposals_status_check 
CHECK (status IN ('pending', 'accepted', 'rejected', 'completed'));
```

### If it still doesn't work:
1. Open browser console (F12)
2. Try completing a project
3. Look for error messages
4. Share the exact error message you see

## Alternative: If You Can't Modify the Constraint

If you cannot modify the database constraint, we can change the code to use `'accepted'` status for completed projects instead. Let me know if you need this alternative approach.

