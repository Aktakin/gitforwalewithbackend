-- Add unique constraint to prevent duplicate proposals
-- Run this in Supabase SQL Editor

-- Create a unique constraint on (request_id, user_id) to ensure
-- each user can only submit one proposal per request
ALTER TABLE public.proposals
ADD CONSTRAINT unique_user_proposal_per_request 
UNIQUE (request_id, user_id);

-- This will prevent duplicate proposals at the database level
-- If a user tries to submit a second proposal, PostgreSQL will throw an error

