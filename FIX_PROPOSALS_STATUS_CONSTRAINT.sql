-- ============================================
-- Fix Proposals Status Constraint (Robust Version)
-- ============================================
-- This script finds and updates the status constraint
-- to allow 'completed' status
-- ============================================

-- Step 1: Find all check constraints on the proposals table
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.proposals'::regclass
AND contype = 'c'
ORDER BY conname;

-- Step 2: Drop ALL check constraints on status column
-- (This handles cases where constraint name might be different)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'public.proposals'::regclass 
        AND contype = 'c'
        AND pg_get_constraintdef(oid) LIKE '%status%'
    LOOP
        EXECUTE 'ALTER TABLE public.proposals DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
        RAISE NOTICE 'Dropped constraint: %', r.conname;
    END LOOP;
END $$;

-- Step 3: Add the new constraint with 'completed' status
ALTER TABLE public.proposals 
ADD CONSTRAINT proposals_status_check 
CHECK (status IN ('pending', 'accepted', 'rejected', 'completed'));

-- Step 4: Verify the new constraint
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.proposals'::regclass
AND conname = 'proposals_status_check';

-- Step 5: Test the constraint (should work)
-- Uncomment the line below to test:
-- UPDATE proposals SET status = 'completed' WHERE id = (SELECT id FROM proposals LIMIT 1);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Proposals status constraint updated successfully!';
    RAISE NOTICE '✅ Now allows: pending, accepted, rejected, completed';
END $$;

