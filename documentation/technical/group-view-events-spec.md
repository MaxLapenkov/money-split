# Group View Events Spec (MVP)

## Purpose
Определить, как фиксируется просмотр группы участниками и как заполняется блок "Кто уже просмотрел группу?".

## Terms
- `viewed` - пользователь выбрал, кто он такой из списка участников группы (момент первичной идентификации в группе).
- `acknowledged` - пользователь явно отметил, что ознакомился (если такая кнопка есть в UI).

## Data Model (MVP)
- Рекомендуемая таблица: `group_view_events`
  - `id` (uuid, pk)
  - `group_id` (uuid, fk -> groups.id)
  - `user_id` (uuid, fk -> users.id)
  - `group_member_id` (uuid, fk -> group_members.id, nullable до binding)
  - `status` (`viewed` | `acknowledged`)
  - `viewed_at` (timestamptz)
  - `acknowledged_at` (timestamptz, nullable)
  - `last_seen_expense_id` (uuid, nullable)
  - `updated_at` (timestamptz)

## Event Rules
- При выборе участника в flow join/binding:
  - создать или обновить (`upsert`) событие просмотра со статусом `viewed`;
  - записать `viewed_at`.
- При последующих заходах пользователя с уже существующим binding:
  - `viewed_at` не обновляется повторно; статус `просмотрено` фиксируется единожды в момент выбора участника.
- Если пользователь нажимает "Отметился":
  - обновить статус до `acknowledged`,
  - записать `acknowledged_at`.
- Если пользователь уже `acknowledged`, повторный просмотр не откатывает статус на `viewed`.

## UI Mapping
- Блок "Кто уже просмотрел группу?" получает список участников с computed статусом:
  - есть `acknowledged_at` -> `отметился`
  - есть `viewed_at`, но нет `acknowledged_at` -> `просмотрено`
  - нет записи -> `не просмотрено`

## Privacy/Access
- Данные просмотров видны только участникам группы.
- Запись событий возможна только для текущего пользователя и только в группах с доступом.

## API / Actions Contract
- `recordGroupViewAction(groupId)`
  - вызывается в момент успешного выбора участника (binding step).
- `acknowledgeGroupAction(groupId)`
  - вызывается по кнопке "Отметиться" (если кнопка включена в UI).
- `getGroupViewStatusesAction(groupId)`
  - возвращает список участников + статус.

## Edge Cases
- Пользователь открывает группу до binding:
  - статус `viewed` не фиксируется до выбора участника.
- Пользователь удален из группы:
  - в UI не показывать персональные статусы удаленного пользователя.
- Большое число просмотров:
  - хранить только последнее состояние на участника (upsert), а не бесконечный лог (MVP).

## Related
- [[project-documentation]]
- [[specs/group-page-ui-spec]]
- [[technical/participant-binding-model]]
- [[technical/supabase-rls-policy]]
- [[technical/api-endpoints-mvp]]
