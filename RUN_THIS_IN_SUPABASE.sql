-- ============================================
-- COPY THIS ENTIRE FILE AND RUN IN SUPABASE
-- ============================================
-- Go to: https://supabase.com/dashboard
-- Click: SQL Editor → New Query
-- Paste this entire file
-- Click: Run (or Ctrl+Enter)
-- ============================================

-- Step 1: Drop existing foreign key constraint on health_cases
ALTER TABLE IF EXISTS health_cases 
  DROP CONSTRAINT IF EXISTS health_cases_user_id_fkey;

-- Step 2: Drop existing foreign key constraint on profiles
ALTER TABLE IF EXISTS profiles 
  DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Step 3: Recreate health_cases table with correct foreign key
DROP TABLE IF EXISTS health_cases CASCADE;

CREATE TABLE health_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    symptoms TEXT NOT NULL,
    ai_analysis JSONB,
    severity TEXT,
    category TEXT,
    status TEXT DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Enable RLS and add service role policy
ALTER TABLE health_cases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage all health cases" ON health_cases;
CREATE POLICY "Service role can manage all health cases" ON health_cases
  FOR ALL USING (true) WITH CHECK (true);

-- Step 5: Update profiles RLS policy
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage all profiles" ON profiles;
CREATE POLICY "Service role can manage all profiles" ON profiles
  FOR ALL USING (true) WITH CHECK (true);

-- Step 6: Create indexes
CREATE INDEX IF NOT EXISTS idx_health_cases_user_id ON health_cases(user_id);
CREATE INDEX IF NOT EXISTS idx_health_cases_created_at ON health_cases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_cases_status ON health_cases(status);

-- Step 7: Create updated_at trigger
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_health_cases_updated ON health_cases;
CREATE TRIGGER on_health_cases_updated
  BEFORE UPDATE ON health_cases
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================
-- DONE! Now restart your backend and test
-- ============================================
