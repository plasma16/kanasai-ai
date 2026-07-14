-- Enable RLS on petty_thefts table (if not already enabled)
ALTER TABLE petty_thefts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access" ON petty_thefts;
DROP POLICY IF EXISTS "Public insert access" ON petty_thefts;
DROP POLICY IF EXISTS "Public update access" ON petty_thefts;
DROP POLICY IF EXISTS "Public delete access" ON petty_thefts;

-- Policy 1: Anyone can READ (for heat map display)
CREATE POLICY "Public read access" ON petty_thefts
  FOR SELECT USING (true);

-- Policy 2: Authenticated users can INSERT (we'll use anon key with validation)
-- For now, allow inserts but our API validation will handle security
CREATE POLICY "Public insert access" ON petty_thefts
  FOR INSERT WITH CHECK (true);

-- Policy 3: No one can UPDATE or DELETE (data integrity)
-- (No update/delete policies = no updates/deletes allowed)

-- Optional: If you want to restrict inserts to only allow certain fields
-- CREATE POLICY "Restrict insert fields" ON petty_thefts
--   FOR INSERT WITH CHECK (
--     id IS NULL AND
--     created_at IS NULL
--   );

-- Grant necessary permissions to authenticated and anon roles
GRANT SELECT ON petty_thefts TO authenticated, anon;
GRANT INSERT ON petty_thefts TO authenticated, anon;
-- Do NOT grant UPDATE or DELETE

-- For spatial_ref_sys, you can ignore the warning OR enable RLS with a permissive policy
-- This is optional since it's just reference data
ALTER TABLE spatial_ref_sys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read spatial_ref_sys" ON spatial_ref_sys
  FOR SELECT USING (true);
