import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only create client if env vars are set
export const supabase = url && key && !url.includes("your_") ? createClient(url, key) : null;

export const isSupabaseEnabled = !!supabase;

// SQL to run in Supabase dashboard:
/*
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  profile jsonb,
  plan jsonb,
  plan_generated_at timestamptz,
  is_premium boolean default false,
  chat_count_today int default 0,
  chat_count_date date,
  created_at timestamptz default now()
);
alter table users enable row level security;
create policy "Users can manage own data" on users
  using (auth.uid() = id) with check (auth.uid() = id);
*/
