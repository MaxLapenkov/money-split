create table if not exists invite_tokens (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  token text not null unique,
  created_by uuid not null references users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists group_participant_bindings (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  group_member_id uuid not null references group_members(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (group_id, user_id),
  unique (group_member_id)
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  type expense_type not null,
  group_member_id uuid not null references group_members(id) on delete restrict,
  note text not null check (char_length(note) between 1 and 500),
  amount_minor bigint not null check (amount_minor > 0),
  currency text not null default 'RUB' check (currency = 'RUB'),
  expense_date date not null,
  created_by_user_id uuid not null references users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists expense_splits (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references expenses(id) on delete cascade,
  group_member_id uuid not null references group_members(id) on delete restrict,
  amount_minor bigint not null check (amount_minor > 0),
  unique (expense_id, group_member_id)
);
