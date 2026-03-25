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
