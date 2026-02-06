-- Fix Foreign Key Constraints for Custom Authentication
-- Run this in Supabase SQL Editor

-- Step 1: Drop existing health_cases table if it exists
DROP TABLE IF EXISTS health_cases CASCADE;

-- Step 2: Modify profiles table to remove auth.users dependency
-- First, drop the existing foreign key constraint
ALTER TABLE IF EXISTS profiles 
  DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Make sure profiles table exists with correct structure
CREATE TABLE IF NOT EXISTS profiles (
  id UUID NOT NULL PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  phone_number TEXT,
  date_of_birth DATE,
  address TEXT,
  city TEXT,
  zip_code TEXT,
  blood_type TEXT,
  height FLOAT8,
  weight FLOAT8,
  allergies TEXT,
  chronic_conditions TEXT,
  current_medications TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  insurance_provider TEXT,
  insurance_number TEXT,
  latitude FLOAT8,
  longitude FLOAT8,
  medical_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Update RLS policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage all profiles" ON profiles;
CREATE POLICY "Service role can manage all profiles" ON profiles
  FOR ALL USING (true) WITH CHECK (true);

-- Step 4: Create health_cases table referencing profiles
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

-- Step 5: Enable RLS for health_cases
ALTER TABLE health_cases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage all health cases" ON health_cases;
CREATE POLICY "Service role can manage all health cases" ON health_cases
  FOR ALL USING (true) WITH CHECK (true);

-- Step 6: Create indexes
CREATE INDEX IF NOT EXISTS idx_health_cases_user_id ON health_cases(user_id);
CREATE INDEX IF NOT EXISTS idx_health_cases_created_at ON health_cases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_cases_status ON health_cases(status);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Step 7: Create updated_at trigger for profiles
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profiles_updated ON profiles;
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS on_health_cases_updated ON health_cases;
CREATE TRIGGER on_health_cases_updated
  BEFORE UPDATE ON health_cases
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Done! Now your backend can:
-- 1. Insert users into profiles table (no auth.users dependency)
-- 2. Create health_cases that reference profiles(id)
