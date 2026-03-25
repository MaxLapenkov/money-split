create table if not exists settlements (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  from_group_member_id uuid not null references group_members(id) on delete restrict,
  to_group_member_id uuid not null references group_members(id) on delete restrict,
  amount_minor bigint not null check (amount_minor > 0),
  status settlement_status not null default 'suggested',
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  check (from_group_member_id <> to_group_member_id)
);

create table if not exists group_view_events (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  group_member_id uuid references group_members(id) on delete set null,
  status group_view_status not null default 'viewed',
  viewed_at timestamptz not null default now(),
  acknowledged_at timestamptz,
  last_seen_expense_id uuid references expenses(id) on delete set null,
  updated_at timestamptz not null default now(),
  unique (group_id, user_id)
);
