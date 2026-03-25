-- Helper: check if a user has a binding in a group
create or replace function is_group_participant(p_group_id uuid, p_user_id uuid)
returns boolean as $$
  select exists (
    select 1 from group_participant_bindings
    where group_id = p_group_id and user_id = p_user_id
  );
$$ language sql security definer stable;

-- Helper: check if user is group owner
create or replace function is_group_owner(p_group_id uuid, p_user_id uuid)
returns boolean as $$
  select exists (
    select 1 from groups
    where id = p_group_id and created_by = p_user_id
  );
$$ language sql security definer stable;

-- ============================================================
-- users
-- ============================================================
create policy "users_select_own"
  on users for select
  using (id = auth.uid());

create policy "users_update_own"
  on users for update
  using (id = auth.uid());

create policy "users_insert_service"
  on users for insert
  with check (true);

-- ============================================================
-- groups
-- ============================================================
create policy "groups_select_member"
  on groups for select
  using (
    created_by = auth.uid()
    or is_group_participant(id, auth.uid())
  );

create policy "groups_insert_authenticated"
  on groups for insert
  with check (created_by = auth.uid());

create policy "groups_update_owner"
  on groups for update
  using (created_by = auth.uid());

create policy "groups_delete_owner"
  on groups for delete
  using (created_by = auth.uid());

-- ============================================================
-- group_members
-- ============================================================
create policy "group_members_select"
  on group_members for select
  using (
    is_group_owner(group_id, auth.uid())
    or is_group_participant(group_id, auth.uid())
  );

create policy "group_members_insert_owner"
  on group_members for insert
  with check (is_group_owner(group_id, auth.uid()));

create policy "group_members_update_owner"
  on group_members for update
  using (is_group_owner(group_id, auth.uid()));

create policy "group_members_delete_owner"
  on group_members for delete
  using (is_group_owner(group_id, auth.uid()));

-- ============================================================
-- invite_tokens
-- ============================================================
create policy "invite_tokens_select"
  on invite_tokens for select
  using (
    is_group_owner(group_id, auth.uid())
    or is_group_participant(group_id, auth.uid())
  );

create policy "invite_tokens_insert_owner"
  on invite_tokens for insert
  with check (
    created_by = auth.uid()
    and is_group_owner(group_id, auth.uid())
  );

create policy "invite_tokens_delete_owner"
  on invite_tokens for delete
  using (is_group_owner(group_id, auth.uid()));

-- ============================================================
-- group_participant_bindings
-- ============================================================
create policy "bindings_select"
  on group_participant_bindings for select
  using (
    is_group_owner(group_id, auth.uid())
    or is_group_participant(group_id, auth.uid())
    or user_id = auth.uid()
  );

create policy "bindings_insert_self"
  on group_participant_bindings for insert
  with check (user_id = auth.uid());

create policy "bindings_delete"
  on group_participant_bindings for delete
  using (
    user_id = auth.uid()
    or is_group_owner(group_id, auth.uid())
  );

-- ============================================================
-- expenses
-- ============================================================
create policy "expenses_select"
  on expenses for select
  using (is_group_participant(group_id, auth.uid()) or is_group_owner(group_id, auth.uid()));

create policy "expenses_insert"
  on expenses for insert
  with check (
    created_by_user_id = auth.uid()
    and (is_group_participant(group_id, auth.uid()) or is_group_owner(group_id, auth.uid()))
  );

create policy "expenses_update"
  on expenses for update
  using (
    created_by_user_id = auth.uid()
    or is_group_owner(group_id, auth.uid())
  );

create policy "expenses_delete"
  on expenses for delete
  using (
    created_by_user_id = auth.uid()
    or is_group_owner(group_id, auth.uid())
  );

-- ============================================================
-- expense_splits
-- ============================================================
create policy "expense_splits_select"
  on expense_splits for select
  using (
    exists (
      select 1 from expenses e
      where e.id = expense_splits.expense_id
      and (is_group_participant(e.group_id, auth.uid()) or is_group_owner(e.group_id, auth.uid()))
    )
  );

create policy "expense_splits_insert"
  on expense_splits for insert
  with check (
    exists (
      select 1 from expenses e
      where e.id = expense_splits.expense_id
      and (is_group_participant(e.group_id, auth.uid()) or is_group_owner(e.group_id, auth.uid()))
    )
  );

create policy "expense_splits_delete"
  on expense_splits for delete
  using (
    exists (
      select 1 from expenses e
      where e.id = expense_splits.expense_id
      and (e.created_by_user_id = auth.uid() or is_group_owner(e.group_id, auth.uid()))
    )
  );

-- ============================================================
-- settlements
-- ============================================================
create policy "settlements_select"
  on settlements for select
  using (is_group_participant(group_id, auth.uid()) or is_group_owner(group_id, auth.uid()));

create policy "settlements_insert_service"
  on settlements for insert
  with check (true);

create policy "settlements_update_service"
  on settlements for update
  using (true);

-- ============================================================
-- group_view_events
-- ============================================================
create policy "group_view_events_select"
  on group_view_events for select
  using (is_group_participant(group_id, auth.uid()) or is_group_owner(group_id, auth.uid()));

create policy "group_view_events_insert_self"
  on group_view_events for insert
  with check (user_id = auth.uid());

create policy "group_view_events_update_self"
  on group_view_events for update
  using (user_id = auth.uid());
