# Supabase RLS Policy (MVP)

## Purpose
Зафиксировать минимальные правила доступа к данным в Supabase для безопасного MVP.

## Core Principle
- Пользователь работает только со своими группами.
- Доступ к данным группы определяется membership/binding внутри этой группы.

## Local Reference Project
- [quantum-frontend](file:///c:/Users/Maxel/Desktop/projects/quantum-frontend)

## Tables and Access Rules

### `users`
- `SELECT/UPDATE`: только для собственной записи пользователя.
- `INSERT`: через серверный flow auth (upsert).

### `groups`
- `SELECT`: если пользователь состоит в группе.
- `INSERT`: любой аутентифицированный пользователь.
- `UPDATE/DELETE`: только создатель группы (`created_by`) в MVP.

### `group_members`
- `SELECT`: только участники соответствующей группы.
- `INSERT/UPDATE/DELETE`: только владелец группы в MVP.

### `invite_tokens`
- `SELECT`: участники группы или серверный flow при resolve.
- `INSERT`: только владелец группы (`created_by`) или серверный flow.
- `DELETE`: только владелец группы.

### `group_participant_bindings`
- `SELECT`: участники группы.
- `INSERT`: текущий пользователь может создать binding только на себя (`user_id = current user`) и только в группе, где он имеет доступ.
- `UPDATE/DELETE`: владелец binding или owner группы.

### `expenses`
- `SELECT`: только участники группы.
- `INSERT`: только участники группы с валидным binding.
- `UPDATE/DELETE`: автор расхода или owner группы (MVP правило).

### `expense_splits`
- `SELECT`: только участники группы.
- `INSERT/UPDATE/DELETE`: по правам родительского `expense`.

### `settlements`
- `SELECT`: только участники группы.
- `INSERT/UPDATE`: серверный слой (service role) при пересчете.

### `group_view_events`
- `SELECT`: только участники группы.
- `INSERT/UPDATE`: только для текущего пользователя в доступной группе.
- Запрещено изменять view-статусы других пользователей.

## Enforcement Strategy
- Клиент не обращается к таблицам напрямую с privileged правами.
- Критичные операции через Next.js API + server-side проверки.
- RLS остается последней линией защиты, даже если API проверка пропущена.

## MVP Security Checklist
- Включить RLS на всех продуктовых таблицах.
- Запретить anon доступ к приватным данным.
- Проверить, что пользователь не может читать чужие группы по UUID.
- Проверить, что пользователь не может привязаться к участнику из чужой группы.

## Related
- [[project-documentation]]
- [[database-schema-mvp-final]]
- [[technical/participant-binding-model]]
- [[technical/api-endpoints-mvp]]
- [[technical/group-view-events-spec]]
- [[technical/settlement-algorithm-spec]]
