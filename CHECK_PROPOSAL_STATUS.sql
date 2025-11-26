-- Check Proposal Status and Permissions
-- Run this to debug what's happening with proposals

-- 1. Check if proposals are actually updating in the database
SELECT 
  id,
  status,
  user_id as proposal_creator,
  request_id,
  created_at,
  updated_at
FROM proposals
ORDER BY updated_at DESC
LIMIT 10;

-- 2. Check request ownership (to verify who can update)
SELECT 
  p.id as proposal_id,
  p.status as proposal_status,
  p.user_id as proposal_creator,
  r.id as request_id,
  r.user_id as request_owner,
  r.title as request_title
FROM proposals p
JOIN requests r ON r.id = p.request_id
ORDER BY p.created_at DESC
LIMIT 10;

-- 3. Check if there are any triggers on the proposals table
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'proposals';

-- 4. Test update directly (replace with actual proposal_id)
-- UPDATE proposals 
-- SET status = 'accepted', updated_at = NOW()
-- WHERE id = 'YOUR_PROPOSAL_ID_HERE';
-- 
-- SELECT * FROM proposals WHERE id = 'YOUR_PROPOSAL_ID_HERE';


