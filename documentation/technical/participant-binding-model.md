# Participant Binding Model (MVP)

## Local Reference Projects
- [quantum-frontend](file:///c:/Users/Maxel/Desktop/projects/quantum-frontend)
- [Meat-Alco-Calculator](file:///c:/Users/Maxel/Desktop/projects/Meat-Alco-Calculator)

## Goal
Определить минимальную модель, которая позволяет один раз выбрать участника группы и автоматически узнавать его при следующих заходах.

## Problem
В группе есть список "человеческих" участников (например, "Иван", "Петя"), а в приложение заходит Telegram-пользователь. Нужна явная привязка между ними.

## MVP Solution
Добавить таблицу привязок `group_participant_bindings`, где хранится соответствие:
- `group_id`
- `group_member_id`
- `user_id` (из `users`, созданного по Telegram auth)

Ограничение уникальности:
- один `user_id` может иметь только одну привязку внутри одной группы;
- один `group_member_id` может быть привязан только к одному `user_id`.

## Table
### group_participant_bindings
- `id` (uuid, pk)
- `group_id` (uuid, fk -> groups.id)
- `group_member_id` (uuid, fk -> group_members.id)
- `user_id` (uuid, fk -> users.id)
- `created_at` (timestamptz)

## Lookup Logic
1. Пользователь открывает группу по invite-ссылке.
2. По `group_id + user_id` ищем запись в `group_participant_bindings`.
3. Если запись найдена - используем связанного участника автоматически.
4. Если записи нет - показываем экран выбора участника.
5. После выбора создаем запись привязки и используем ее для всех следующих входов.

## Constraints (MVP)
- Повторная смена участника не поддерживается в MVP (можно добавить позже как admin action).
- Если участник удален из группы, соответствующая привязка должна удаляться/деактивироваться.

## Related
- [[project-documentation]]
- [[mvp-scope-v1]]
- [[user-flows]]
- [[database-schema-mvp-final]]
- [[technical/auth-flow-telegram-nextjs]]
