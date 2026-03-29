-- При удалении группы каскадно удаляются group_members раньше, чем успевают
-- уйти строки expenses/expense_splits, если FK на участника оставлен RESTRICT.
-- CASCADE: при удалении участника удаляются связанные траты и доли (при удалении
-- группы участники и так удаляются после расходов за счёт group_id CASCADE,
-- но порядок операций в БД требует согласованных FK).

alter table expenses
  drop constraint if exists expenses_group_member_id_fkey;

alter table expenses
  add constraint expenses_group_member_id_fkey
  foreign key (group_member_id) references group_members (id) on delete cascade;

alter table expense_splits
  drop constraint if exists expense_splits_group_member_id_fkey;

alter table expense_splits
  add constraint expense_splits_group_member_id_fkey
  foreign key (group_member_id) references group_members (id) on delete cascade;

alter table settlements
  drop constraint if exists settlements_from_group_member_id_fkey;

alter table settlements
  add constraint settlements_from_group_member_id_fkey
  foreign key (from_group_member_id) references group_members (id) on delete cascade;

alter table settlements
  drop constraint if exists settlements_to_group_member_id_fkey;

alter table settlements
  add constraint settlements_to_group_member_id_fkey
  foreign key (to_group_member_id) references group_members (id) on delete cascade;
