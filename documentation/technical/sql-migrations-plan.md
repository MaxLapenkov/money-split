# SQL Migrations Plan (MVP)

## Purpose
Пошаговый план SQL-миграций для Supabase/PostgreSQL на основе [[database-schema-mvp-final]].

## Migration 0001: Extensions
```sql
create extension if not exists pgcrypto;
```

## Migration 0002: Enums
```sql
do $$ begin
  create type group_member_role as enum ('owner', 'member');
exception when duplicate_object then null; end $$;

do $$ begin
  create type expense_type as enum ('expense', 'income');
exception when duplicate_object then null; end $$;

do $$ begin
  create type settlement_status as enum ('suggested', 'paid');
exception when duplicate_object then null; end $$;

do $$ begin
  create type group_view_status as enum ('viewed', 'acknowledged');
exception when duplicate_object then null; end $$;
```

## Migration 0003: Core Tables
```sql
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
```

## Migration 0004: Invite Tokens and Bindings
```sql
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
```

## Migration 0005: Settlements and Views
```sql
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
```

## Migration 0006: Indexes
```sql
create index if not exists ix_groups_created_by on groups (created_by);
create index if not exists ix_group_members_group_id on group_members (group_id);
create index if not exists ix_invite_tokens_group_id on invite_tokens (group_id);
create index if not exists ix_bindings_group_id on group_participant_bindings (group_id);
create index if not exists ix_bindings_user_id on group_participant_bindings (user_id);

create index if not exists ix_expenses_group_id_created_at on expenses (group_id, created_at desc);
create index if not exists ix_expenses_group_id_expense_date on expenses (group_id, expense_date desc);
create index if not exists ix_expenses_group_member_id on expenses (group_member_id);

create index if not exists ix_expense_splits_expense_id on expense_splits (expense_id);
create index if not exists ix_expense_splits_group_member_id on expense_splits (group_member_id);

create index if not exists ix_settlements_group_id_status on settlements (group_id, status);
create index if not exists ix_settlements_from_member on settlements (from_group_member_id);
create index if not exists ix_settlements_to_member on settlements (to_group_member_id);

create index if not exists ix_group_view_events_group_id on group_view_events (group_id);
create index if not exists ix_group_view_events_user_id on group_view_events (user_id);
```

## Migration 0007: Triggers (updated_at)
```sql
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_group_view_events_updated_at on group_view_events;
create trigger trg_group_view_events_updated_at
before update on group_view_events
for each row execute function set_updated_at();
```

## Migration 0008: RLS Enablement
```sql
alter table users enable row level security;
alter table groups enable row level security;
alter table group_members enable row level security;
alter table invite_tokens enable row level security;
alter table group_participant_bindings enable row level security;
alter table expenses enable row level security;
alter table expense_splits enable row level security;
alter table settlements enable row level security;
alter table group_view_events enable row level security;
```

## Migration 0009: RLS Policies (Template)
> Финальные SQL policy-выражения держим в одном месте и синхронизируем с [[technical/supabase-rls-policy]].

```sql
-- users: own row
-- groups: accessible by membership/binding
-- group_members: only same-group participants
-- bindings: user can write only own binding
-- expenses/splits/settlements: only same-group participants
-- group_view_events: only own write, same-group read
```

## Post-Migration Verification
- [ ] Все таблицы созданы.
- [ ] Все индексы созданы.
- [ ] RLS включен на всех таблицах.
- [ ] Минимальный smoke SQL:
  - [ ] create user
  - [ ] create group
  - [ ] add members
  - [ ] create expense + splits
  - [ ] create settlement
  - [ ] upsert group_view_event

## Related
- [[project-documentation]]
- [[database-schema-mvp-final]]
- [[technical/supabase-rls-policy]]
- [[technical/group-view-events-spec]]
- [[technical/settlement-algorithm-spec]]
