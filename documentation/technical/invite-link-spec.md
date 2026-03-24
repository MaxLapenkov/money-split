# Invite Link Spec (MVP)

## Purpose
Зафиксировать формат и поведение invite-ссылки для перехода в конкретную группу и последующей привязки участника.

## Local Reference Projects
- [quantum-frontend](file:///c:/Users/Maxel/Desktop/projects/quantum-frontend)
- [Meat-Alco-Calculator](file:///c:/Users/Maxel/Desktop/projects/Meat-Alco-Calculator)

## URL Format (MVP)
- Telegram start param:
  - `startapp=join_<inviteToken>`
- Внутренний маршрут приложения после открытия:
  - `/groups/:groupId` (после резолва токена)

Пример deeplink:
- `https://t.me/<bot_username>/<app_shortname>?startapp=join_abcd1234`

## Token Requirements
- `inviteToken` - случайный непрогнозируемый токен (не короткий group id).
- Токен хранится в БД с привязкой к `group_id`.
- Для MVP: многоразовый токен, без обязательного TTL.
- Ротация токена вручную через "Regenerate invite link" (опционально для v1.1).

## Resolve Flow
1. Пользователь открывает Mini App по deeplink.
2. Клиент читает `start_param` из Telegram WebApp.
3. Клиент вызывает `POST /api/invite/resolve` с `inviteToken`.
4. API возвращает `groupId`.
5. Клиент редиректит пользователя на экран группы.
6. Дальше проверяется binding (см. [[technical/participant-binding-model]]).

## API Contract
### `POST /api/invite/resolve`
- body: `{ inviteToken: string }`
- `200`: `{ ok: true, groupId: string }`
- `404`: `{ ok: false, error: { code: "INVITE_NOT_FOUND" } }`
- `410`: `{ ok: false, error: { code: "INVITE_EXPIRED" } }` (заготовка на будущее, если введем TTL)

## Edge Cases
- Невалидный `start_param` -> показать понятную ошибку + переход на домашний экран.
- Токен не найден -> экран "Invite invalid".
- Пользователь уже привязан в этой группе -> сразу открывать группу без шага выбора участника.
- Пользователь не привязан -> показать экран выбора участника.

## Security Notes
- Не использовать в invite ссылке прямой `group_id` как единственный идентификатор доступа.
- Проверять токен только на сервере.
- Логировать частые invalid resolve попытки (анти-абьюз).

## Related
- [[project-documentation]]
- [[mvp-scope-v1]]
- [[user-flows]]
- [[technical/api-endpoints-mvp]]
- [[technical/participant-binding-model]]
