-- Create health_cases table
-- IMPORTANT: This references profiles(id) instead of auth.users(id)
-- because we're using custom authentication with local SQLite

CREATE TABLE IF NOT EXISTS health_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    symptoms TEXT NOT NULL,
    ai_analysis JSONB,
    severity TEXT,
    category TEXT,
    status TEXT DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE health_cases ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can view their own health cases" ON health_cases;
DROP POLICY IF EXISTS "Users can create their own health cases" ON health_cases;
DROP POLICY IF EXISTS "Users can update their own health cases" ON health_cases;
DROP POLICY IF EXISTS "Users can delete their own health cases" ON health_cases;
DROP POLICY IF EXISTS "Service role can manage all health cases" ON health_cases;

-- RLS Policy: Allow service role to bypass RLS (for backend operations)
CREATE POLICY "Service role can manage all health cases"
    ON health_cases
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_health_cases_user_id ON health_cases(user_id);
CREATE INDEX IF NOT EXISTS idx_health_cases_created_at ON health_cases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_cases_user_id_created_at ON health_cases(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_cases_status ON health_cases(status);
CREATE INDEX IF NOT EXISTS idx_health_cases_severity ON health_cases(severity);
