# API Endpoints Catalog (MVP)

## Purpose
Единая точка для всех API ручек MVP: auth, группы, invite, расходы, балансы.

## Execution Model (MVP)
- Основной способ вызова бизнес-операций: `server actions` из `server components`.
- Endpoint-ы в этом документе описывают server-side contracts и структуру данных.
- Дополнительный клиентский data-fetch слой не используется.

## Local Reference Project
- [quantum-frontend](file:///c:/Users/Maxel/Desktop/projects/quantum-frontend)

## Auth
### `POST /api/auth/telegram`
- Назначение: Telegram `initData` validation + создание сессии.
- Подробнее: [[technical/auth-api-spec]].

### `GET /api/session`
- Назначение: проверить активную сессию пользователя.
- `200`: `{ ok: true, userId }`
- `401`: `{ ok: false, error: { code: "UNAUTHORIZED" } }`

### `POST /api/telegram/webhook`
- Назначение: приём обновлений от Telegram Bot API (`setWebhook`).
- Ожидает JSON **Update**; при `message` в личном чате с текстом `/start` отправляет приветствие и кнопку ссылки на Mini App.
- Заголовок `X-Telegram-Bot-Api-Secret-Token` должен совпадать с `TELEGRAM_WEBHOOK_SECRET`, если переменная задана.
- Подробнее: [[technical/telegram-bot-webhook]].

## Groups
### `POST /api/groups`
- Создать группу.
- body: `{ name: string, participants: Array<{ displayName: string }> }`
- Первый участник (`participants[0]`) = автор, роль `owner`; остальные = `member`.
- `201`: `{ ok: true, groupId: string }`

### `GET /api/groups/:groupId`
- Получить данные группы + участников.
- `200`: `{ ok: true, group }`
- `403` если пользователь не состоит в группе.

### `GET /api/groups/:groupId/balances`
- Получить текущие балансы и список рекомендаций по погашению.
- `200`:
  - `ok: true`
  - `balances: Array<{ groupMemberId, groupMemberName, netMinor }>`
  - `settlements: Array<{ id, fromGroupMemberId, fromName, toGroupMemberId, toName, amountMinor, status }>`
- Алгоритм расчета: [[technical/settlement-algorithm-spec]].

## Invite + Participant Binding
### `POST /api/groups/:groupId/invite`
- Сгенерировать invite-ссылку.
- `200`: `{ ok: true, inviteUrl: string, inviteToken: string, expiresAt: string | null }`
- Подробнее по формату: [[technical/invite-link-spec]].

### `POST /api/groups/:groupId/bind-participant`
- Привязать текущего Telegram-пользователя к участнику группы.
- body: `{ groupMemberId: string }`
- `200`: `{ ok: true, bindingId: string }`
- `409`: `{ ok: false, error: { code: "BINDING_CONFLICT" } }` — участник уже привязан к другому пользователю.
- Модель: [[technical/participant-binding-model]].

### `GET /api/groups/:groupId/my-participant`
- Узнать текущую привязку участника для пользователя.
- `200`: `{ ok: true, groupMemberId: string | null }`

### `POST /api/invite/resolve`
- Резолв invite токена в `groupId`.
- `200`: `{ ok: true, groupId: string }`
- Детали: [[technical/invite-link-spec]].

## Expenses
### `POST /api/groups/:groupId/expenses`
- Создать расход или поступление.
- body:
  - `type: "expense" | "income"`
  - `groupMemberId: string`
  - `note: string`
  - `amount: number` (major units, например `1234.56`; сервер конвертирует в `amount_minor` при сохранении)
  - `currency: "RUB"`
  - `splitBetween: string[]` (список `groupMemberId`)
  - `expenseDate: string`
- `201`: `{ ok: true, expenseId: string }`

### `GET /api/groups/:groupId/expenses`
- Получить список расходов группы (MVP без сложных фильтров).
- `200`: `{ ok: true, expenses: [] }`

## Settlements + View Events
### `POST /api/groups/:groupId/settlements/:settlementId/mark-paid`
- Отметить рекомендацию по переводу как `paid`.
- `200`: `{ ok: true }`
- Логика settlement: [[technical/settlement-algorithm-spec]].

### `POST /api/groups/:groupId/view-events`
- Зафиксировать `viewed` при успешном выборе участника (binding step). Не вызывается при обычном открытии группы.
- `200`: `{ ok: true }`

### `POST /api/groups/:groupId/acknowledge`
- Отметить "ознакомился с группой".
- `200`: `{ ok: true }`

### `GET /api/groups/:groupId/view-statuses`
- Получить статусы просмотра участников для блока "Кто уже просмотрел группу?".
- `200`: `{ ok: true, statuses: [] }`
- Модель событий: [[technical/group-view-events-spec]].

## Conventions
- Все ошибки в формате:
  - `{ ok: false, error: { code: string, message: string } }`
- Для защищенных ручек обязательна валидная session cookie.
- Валюта MVP: только `RUB`.
- Все request payload валидируются через `zod`.
- Для ключевых ответов используется `zod`-валидация response shape на сервере.

## Related
- [[project-documentation]]
- [[mvp-scope-v1]]
- [[technical/auth-api-spec]]
- [[technical/error-code-catalog]]
- [[technical/domain-enums-and-transitions]]
- [[technical/invite-link-spec]]
- [[technical/routes-and-navigation-map]]
- [[technical/settlement-algorithm-spec]]
- [[technical/group-view-events-spec]]
- [[technical/participant-binding-model]]
- [[technical/zod-schema-catalog]]
