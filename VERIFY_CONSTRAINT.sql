-- ============================================
-- Verify Proposals Status Constraint
-- ============================================
-- Run this to check what constraints exist
-- ============================================

-- Check all constraints on proposals table
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.proposals'::regclass
ORDER BY conname;

-- Check if 'completed' status is allowed
-- This will show an error if the constraint doesn't allow 'completed'
DO $$
DECLARE
    test_id UUID;
BEGIN
    -- Get a test proposal ID
    SELECT id INTO test_id FROM proposals LIMIT 1;
    
    IF test_id IS NOT NULL THEN
        -- Try to update to 'completed' (this will fail if constraint doesn't allow it)
        BEGIN
            UPDATE proposals 
            SET status = 'completed' 
            WHERE id = test_id;
            
            -- Rollback the test update
            ROLLBACK;
            
            RAISE NOTICE '✅ SUCCESS: Constraint allows "completed" status';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '❌ ERROR: Constraint does NOT allow "completed" status';
            RAISE NOTICE 'Error: %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE '⚠️  No proposals found to test';
    END IF;
END $$;

