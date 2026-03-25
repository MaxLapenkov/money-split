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
