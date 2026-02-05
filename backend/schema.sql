-- Create a table for public profiles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  phone_number text,
  date_of_birth date,
  address text,
  city text,
  zip_code text,
  blood_type text,
  height float8,
  weight float8,
  allergies text,
  chronic_conditions text,
  current_medications text,
  emergency_contact_name text,
  emergency_contact_phone text,
  insurance_provider text,
  insurance_number text,
  latitude float8,
  longitude float8,
  medical_history jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Policies
-- Allow authenticated users to read only their own profile
create policy "Users can read their own profile" on public.profiles
  for select using (auth.uid() = id);

-- Allow authenticated users to insert a profile only for themselves
create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

-- Allow authenticated users to update only their own profile
create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Optional: service_role or DB admins can bypass RLS when using service key

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

-- Optional: create profile row automatically on auth.user creation (run as SQL admin)
-- This trigger only runs in the postgres server (requires superuser or admin privileges)
-- Uncomment and adapt if you want DB-side automatic profile creation on sign up.
/*
create function auth.handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, full_name, created_at, updated_at)
    values (new.id, new.raw_user_meta_data->>'full_name', now(), now())
    on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure auth.handle_new_user();
*/
