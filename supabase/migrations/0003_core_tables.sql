create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  telegram_id text not null unique,
  username text,
  display_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  created_by uuid not null references users(id) on delete restrict,
  currency text not null default 'RUB' check (currency = 'RUB'),
  created_at timestamptz not null default now()
);

create table if not exists group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  role group_member_role not null default 'member',
  created_at timestamptz not null default now(),
  unique (group_id, display_name)
);
