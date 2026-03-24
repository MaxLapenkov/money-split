# Database Schema MVP Final

## Scope
Финальная схема данных для MVP `Money Split` (PostgreSQL/Supabase), согласованная с:
- `RUB` как единственной валютой;
- participant binding;
- settlement flow;
- group view events.

## Conventions
- Primary keys: `uuid` (`gen_random_uuid()`).
- Временные поля: `timestamptz`.
- Денежные значения: `amount_minor bigint` (копейки), без float/numeric в бизнес-логике.
- Все `created_at`: `default now()`.

## Enums (MVP)
- `group_member_role`: `owner`, `member`
- `expense_type`: `expense`, `income`
- `settlement_status`: `suggested`, `paid`
- `group_view_status`: `viewed`, `acknowledged`

## Tables

### `users`
- `id uuid pk`
- `telegram_id text not null unique`
- `username text null`
- `display_name text not null`
- `created_at timestamptz not null default now()`

Indexes:
- `ux_users_telegram_id (telegram_id unique)`

### `groups`
- `id uuid pk`
- `name text not null check (char_length(name) between 1 and 120)`
- `created_by uuid not null fk -> users(id) on delete restrict`
- `currency text not null default 'RUB' check (currency = 'RUB')`
- `created_at timestamptz not null default now()`

Indexes:
- `ix_groups_created_by (created_by)`

### `group_members`
- `id uuid pk`
- `group_id uuid not null fk -> groups(id) on delete cascade`
- `display_name text not null check (char_length(display_name) between 1 and 80)`
- `role group_member_role not null default 'member'`
- `created_at timestamptz not null default now()`

Constraints:
- `unique (group_id, display_name)` (в MVP имена уникальны внутри группы)

Indexes:
- `ix_group_members_group_id (group_id)`

### `invite_tokens`
- `id uuid pk`
- `group_id uuid not null fk -> groups(id) on delete cascade`
- `token text not null unique`
- `created_by uuid not null fk -> users(id) on delete restrict`
- `created_at timestamptz not null default now()`

Indexes:
- `ux_invite_tokens_token (token unique)`
- `ix_invite_tokens_group_id (group_id)`

### `group_participant_bindings`
- `id uuid pk`
- `group_id uuid not null fk -> groups(id) on delete cascade`
- `group_member_id uuid not null fk -> group_members(id) on delete cascade`
- `user_id uuid not null fk -> users(id) on delete cascade`
- `created_at timestamptz not null default now()`

Constraints:
- `unique (group_id, user_id)` (один пользователь -> один участник в группе)
- `unique (group_member_id)` (участник привязан только к одному пользователю)

Indexes:
- `ix_bindings_group_id (group_id)`
- `ix_bindings_user_id (user_id)`

### `expenses`
- `id uuid pk`
- `group_id uuid not null fk -> groups(id) on delete cascade`
- `type expense_type not null`
- `group_member_id uuid not null fk -> group_members(id) on delete restrict`
- `note text not null check (char_length(note) between 1 and 500)`
- `amount_minor bigint not null check (amount_minor > 0)`
- `currency text not null default 'RUB' check (currency = 'RUB')`
- `expense_date date not null`
- `created_by_user_id uuid not null fk -> users(id) on delete restrict`
- `created_at timestamptz not null default now()`

Indexes:
- `ix_expenses_group_id_created_at (group_id, created_at desc)`
- `ix_expenses_group_id_expense_date (group_id, expense_date desc)`
- `ix_expenses_group_member_id (group_member_id)`

### `expense_splits`
- `id uuid pk`
- `expense_id uuid not null fk -> expenses(id) on delete cascade`
- `group_member_id uuid not null fk -> group_members(id) on delete restrict`
- `amount_minor bigint not null check (amount_minor > 0)`

Constraints:
- `unique (expense_id, group_member_id)`

Indexes:
- `ix_expense_splits_expense_id (expense_id)`
- `ix_expense_splits_group_member_id (group_member_id)`

### `settlements`
- `id uuid pk`
- `group_id uuid not null fk -> groups(id) on delete cascade`
- `from_group_member_id uuid not null fk -> group_members(id) on delete restrict`
- `to_group_member_id uuid not null fk -> group_members(id) on delete restrict`
- `amount_minor bigint not null check (amount_minor > 0)`
- `status settlement_status not null default 'suggested'`
- `created_at timestamptz not null default now()`
- `paid_at timestamptz null`

Constraints:
- `check (from_group_member_id <> to_group_member_id)`

Indexes:
- `ix_settlements_group_id_status (group_id, status)`
- `ix_settlements_from_member (from_group_member_id)`
- `ix_settlements_to_member (to_group_member_id)`

### `group_view_events`
- `id uuid pk`
- `group_id uuid not null fk -> groups(id) on delete cascade`
- `user_id uuid not null fk -> users(id) on delete cascade`
- `group_member_id uuid null fk -> group_members(id) on delete set null`
- `status group_view_status not null default 'viewed'`
- `viewed_at timestamptz not null default now()`
- `acknowledged_at timestamptz null`
- `last_seen_expense_id uuid null fk -> expenses(id) on delete set null`
- `updated_at timestamptz not null default now()`

Constraints:
- `unique (group_id, user_id)` (храним последнее состояние на пользователя)

Indexes:
- `ix_group_view_events_group_id (group_id)`
- `ix_group_view_events_user_id (user_id)`

## Integrity Rules (Application + DB)
- Все `group_member_id` в `expenses`, `expense_splits`, `settlements` должны принадлежать тому же `group_id`.
- В `expense_splits` сумма всех `amount_minor` по `expense_id` должна равняться `expenses.amount_minor`.
- Settlement расчет выполняется на сервере по [[technical/settlement-algorithm-spec]].

## Migration Order (Recommended)
1. Enums
2. `users`
3. `groups`
4. `group_members`
5. `invite_tokens`
6. `group_participant_bindings`
7. `expenses`
8. `expense_splits`
9. `settlements`
10. `group_view_events`
11. Indexes and constraints
12. RLS policies

## Notes
- Источником истины для MVP является этот документ.

## Related
- [[project-documentation]]
- [[technical/sql-migrations-plan]]
- [[technical/supabase-rls-policy]]
- [[technical/group-view-events-spec]]
- [[technical/settlement-algorithm-spec]]
- [[technical/zod-schema-catalog]]
