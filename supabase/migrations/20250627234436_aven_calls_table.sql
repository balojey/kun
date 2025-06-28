-- Migration: Create aven_calls table

-- Create moddatetime function to auto-update updated_at
create or replace function moddatetime()
returns trigger as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$ language plpgsql;


-- Create aven_calls table
create table public.aven_calls (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    prompt text not null,
    response text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Automatically update updated_at timestamp
create trigger set_updated_at
before update on public.aven_calls
for each row
execute procedure moddatetime();
