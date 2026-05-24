create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamp with time zone default now()
);

create table public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  type text not null, -- 'journal' | 'decision'
  text text not null,
  created_at timestamp with time zone default now(),
  tags jsonb,
  emotion text,
  energy text,
  notes text
);

alter table public.entries
  enable row level security;

create policy "user can see own entries"
  on public.entries
  for select using (auth.uid() = user_id);

create policy "user can insert own entries"
  on public.entries
  for insert with check (auth.uid() = user_id);

