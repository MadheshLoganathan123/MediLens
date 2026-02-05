import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env")
    exit(1)

supabase: Client = create_client(url, key)

def setup_database():
    print("Setting up database schema...")
    
    # SQL to create the profiles table
    # Note: In a production app, you'd typically run this in the Supabase SQL editor.
    # But we can try to execute it if we have service_role permissions.
    
    sql = """
    -- Create a table for public profiles
    create table if not exists public.profiles (
      id uuid references auth.users on delete cascade not null primary key,
      full_name text,
      phone_number text,
      date_of_birth date,
      latitude float8,
      longitude float8,
      medical_history jsonb default '[]'::jsonb,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );

    -- Set up Row Level Security (RLS)
    alter table public.profiles enable row level security;

    create policy "Public profiles are viewable by everyone." on public.profiles
      for select using (true);

    create policy "Users can insert their own profile." on public.profiles
      for insert with check (auth.uid() = id);

    create policy "Users can update own profile." on public.profiles
      for update using (auth.uid() = id);

    -- Trigger to handle updated_at
    create or replace function public.handle_updated_at()
    returns trigger as $$
    begin
      new.updated_at = now();
      return new;
    end;
    $$ language plpgsql;

    create trigger on_profiles_updated
      before update on public.profiles
      for each row execute procedure public.handle_updated_at();
    """
    
    try:
        # Running raw SQL via the supabase client is limited/deprecated in some libraries.
        # Usually, migrations are done through the Supabase Dashboard or CLI.
        # We will print the SQL for the user to run if the direct execution fails.
        print("\n--- SQL SCHEMA START ---")
        print(sql)
        print("--- SQL SCHEMA END ---\n")
        print("Please copy the SQL above and run it in your Supabase SQL Editor.")
        
    except Exception as e:
        print(f"Error suggesting schema: {e}")

if __name__ == "__main__":
    setup_database()
