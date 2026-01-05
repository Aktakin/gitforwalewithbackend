-- Quick verification script
-- Run this in Supabase SQL Editor to check if payments table exists

-- Check if table exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'payments'
        ) 
        THEN '✅ payments table EXISTS'
        ELSE '❌ payments table DOES NOT EXIST'
    END AS table_status;

-- Show table structure if it exists
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'payments'
ORDER BY ordinal_position;

