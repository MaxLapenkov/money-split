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
