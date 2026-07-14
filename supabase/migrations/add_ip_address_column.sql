-- Add ip_address column to petty_thefts table for moderation
ALTER TABLE petty_thefts ADD COLUMN IF NOT EXISTS ip_address TEXT;

-- Create index on ip_address for faster queries when reviewing/cleaning data
CREATE INDEX IF NOT EXISTS idx_petty_thefts_ip_address ON petty_thefts(ip_address);

-- Add comment to document the column
COMMENT ON COLUMN petty_thefts.ip_address IS 'User IP address for moderation and abuse prevention';
