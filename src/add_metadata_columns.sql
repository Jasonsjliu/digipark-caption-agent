-- Add metadata columns to generation_history table

DO $$ 
BEGIN
    -- Add 'model' column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generation_history' AND column_name = 'model') THEN
        ALTER TABLE generation_history ADD COLUMN model TEXT;
    END IF;

    -- Add 'creativity' column if it doesn't exist (0-100)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generation_history' AND column_name = 'creativity') THEN
        ALTER TABLE generation_history ADD COLUMN creativity INTEGER;
    END IF;

    -- Add 'intensity' column if it doesn't exist (1-5)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generation_history' AND column_name = 'intensity') THEN
        ALTER TABLE generation_history ADD COLUMN intensity INTEGER;
    END IF;

    -- Add 'keyword_count' column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generation_history' AND column_name = 'keyword_count') THEN
        ALTER TABLE generation_history ADD COLUMN keyword_count INTEGER;
    END IF;
END $$;
