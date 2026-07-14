-- Fix RLS policies for petty_thefts table
-- This handles existing policies gracefully

-- First, drop existing policies if they exist
DO $$ 
BEGIN
  -- Drop policies if they exist
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'petty_thefts' AND policyname = 'Public read access') THEN
    DROP POLICY "Public read access" ON petty_thefts;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'petty_thefts' AND policyname = 'Public insert access') THEN
    DROP POLICY "Public insert access" ON petty_thefts;
  END IF;
END $$;

-- Enable RLS on petty_thefts table
ALTER TABLE petty_thefts ENABLE ROW LEVEL SECURITY;

-- Create policies (now safe to create)
CREATE POLICY "Public read access" ON petty_thefts
  FOR SELECT USING (true);

CREATE POLICY "Public insert access" ON petty_thefts
  FOR INSERT WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON petty_thefts TO authenticated, anon;
GRANT INSERT ON petty_thefts TO authenticated, anon;

-- For spatial_ref_sys warning (optional - this is just reference data)
-- You can ignore this warning, but if you want to fix it:
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'spatial_ref_sys') THEN
    ALTER TABLE spatial_ref_sys ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow public read spatial_ref_sys" ON spatial_ref_sys
      FOR SELECT USING (true);
  END IF;
END $$;
