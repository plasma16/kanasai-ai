-- Add category column to petty_thefts table
ALTER TABLE petty_thefts 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'others';

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_petty_thefts_category ON petty_thefts(category);
CREATE INDEX IF NOT EXISTS idx_petty_thefts_occurred_at ON petty_thefts(occurred_at);

-- Update existing records with auto-categorized values based on item_stolen
UPDATE petty_thefts 
SET category = CASE 
  WHEN LOWER(item_stolen) LIKE '%phone%' OR LOWER(item_stolen) LIKE '%iphone%' OR LOWER(item_stolen) LIKE '%samsung%' OR LOWER(item_stolen) LIKE '%mobile%' THEN 'phone'
  WHEN LOWER(item_stolen) LIKE '%wallet%' OR LOWER(item_stolen) LIKE '%purse%' THEN 'wallet'
  WHEN LOWER(item_stolen) LIKE '%laptop%' OR LOWER(item_stolen) LIKE '%computer%' OR LOWER(item_stolen) LIKE '%macbook%' THEN 'laptop'
  WHEN LOWER(item_stolen) LIKE '%bag%' OR LOWER(item_stolen) LIKE '%backpack%' OR LOWER(item_stolen) LIKE '%handbag%' THEN 'bag'
  WHEN LOWER(item_stolen) LIKE '%bike%' OR LOWER(item_stolen) LIKE '%bicycle%' THEN 'bicycle'
  WHEN LOWER(item_stolen) LIKE '%watch%' OR LOWER(item_stolen) LIKE '%smartwatch%' OR LOWER(item_stolen) LIKE '%apple watch%' THEN 'watch'
  ELSE 'others'
END
WHERE category = 'others' OR category IS NULL;
