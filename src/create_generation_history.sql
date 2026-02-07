-- Create generation_history table

CREATE TABLE IF NOT EXISTS generation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id),
    platform TEXT NOT NULL,
    caption TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    keywords_used TEXT[] DEFAULT '{}',
    variables_used JSONB DEFAULT '{}'::jsonb,
    topic TEXT,
    model TEXT,
    creativity INTEGER,
    intensity INTEGER,
    keyword_count INTEGER
);

-- Enable RLS
ALTER TABLE generation_history ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view their own history" ON generation_history;
CREATE POLICY "Users can view their own history"
ON generation_history FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own history" ON generation_history;
CREATE POLICY "Users can insert their own history"
ON generation_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own history" ON generation_history;
CREATE POLICY "Users can delete their own history"
ON generation_history FOR DELETE
USING (auth.uid() = user_id);
