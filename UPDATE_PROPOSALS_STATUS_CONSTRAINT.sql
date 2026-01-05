-- ============================================
-- Update Proposals Status Constraint
-- ============================================
-- This adds 'completed' status to the proposals table
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop the existing check constraint
ALTER TABLE public.proposals 
DROP CONSTRAINT IF EXISTS proposals_status_check;

-- Add new constraint that includes 'completed'
ALTER TABLE public.proposals 
ADD CONSTRAINT proposals_status_check 
CHECK (status IN ('pending', 'accepted', 'rejected', 'completed'));

-- Verify the constraint
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.proposals'::regclass
AND conname = 'proposals_status_check';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Proposals status constraint updated! Now allows: pending, accepted, rejected, completed';
END $$;

