-- Add Views Tracking to Requests Table
-- Run this in Supabase SQL Editor

-- 1. Add views column to requests table
ALTER TABLE requests 
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- 2. Add viewed_by column to track unique viewers (optional - for analytics)
ALTER TABLE requests 
ADD COLUMN IF NOT EXISTS viewed_by JSONB DEFAULT '[]'::jsonb;

-- 3. Create index for performance
CREATE INDEX IF NOT EXISTS idx_requests_views ON requests(views);

-- 4. Update existing requests to have 0 views if null
UPDATE requests SET views = 0 WHERE views IS NULL;

-- 5. Create a function to increment views safely
CREATE OR REPLACE FUNCTION increment_request_views(request_id_param UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_view_count INTEGER;
BEGIN
  -- Increment the views column
  UPDATE requests
  SET views = COALESCE(views, 0) + 1
  WHERE id = request_id_param
  RETURNING views INTO new_view_count;
  
  RETURN new_view_count;
END;
$$;

-- 6. Grant execute permission on the function
GRANT EXECUTE ON FUNCTION increment_request_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_request_views(UUID) TO anon;

-- 7. Verify the changes
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'requests' 
  AND column_name IN ('views', 'viewed_by');

-- 8. Test the function (optional - replace with real request ID)
-- SELECT increment_request_views('your-request-id-here');

-- 9. Check current view counts
SELECT id, title, views 
FROM requests 
ORDER BY created_at DESC 
LIMIT 10;


