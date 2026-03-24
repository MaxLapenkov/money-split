# Routes and Navigation Map (MVP)

## Purpose
Зафиксировать единый контракт маршрутов, переходов между экранами и поведение Telegram `BackButton`.

## Route Map

### Public Entry
- `/` - Home page ([[specs/home-page-ui-spec]])

### Group Flow
- `/groups/[groupId]` - Group page (state-based: onboarding + expenses) ([[specs/group-page-ui-spec]])
- `/groups/[groupId]/expenses/new` - Create expense ([[specs/create-expense-page-ui-spec]])
- `/groups/[groupId]/expenses` - All expenses ([[specs/all-expenses-page-ui-spec]])

### Create Group Flow
- `/groups/new` - Create group ([[specs/create-group-page-ui-spec]])

## Telegram Deeplink Mapping
- Deeplink:
  - `https://t.me/<bot_username>/<app_shortname>?startapp=join_<inviteToken>`
- Mapping:
  1) `startapp` читается в Telegram WebApp;
  2) invite токен резолвится через `POST /api/invite/resolve`;
  3) пользователь переводится на `/groups/[groupId]`.

## Navigation Transitions
- `/` -> `/groups/new` (кнопка "Создать группу")
- `/groups/new` -> `/groups/[groupId]` (успешное создание)
- `/groups/[groupId]` -> `/groups/[groupId]/expenses/new` (кнопка "Ввести трату")
- `/groups/[groupId]` -> `/groups/[groupId]/expenses` (кнопка "Посмотреть все расходы")
- `/groups/[groupId]/expenses/new` -> `/groups/[groupId]` (BackButton; или остаемся на форме после успешного создания, если выбран сценарий быстрого ввода)
- `/groups/[groupId]/expenses` -> `/groups/[groupId]` (BackButton)

## BackButton Rules
- `BackButton` hidden:
  - `/`
- `BackButton` visible:
  - `/groups/new`
  - `/groups/[groupId]`
  - `/groups/[groupId]/expenses/new`
  - `/groups/[groupId]/expenses`
- Обработчик:
  - на внутренних экранах -> `history.back()`;
  - при скрытии обязательно `offClick(handler)`.

## MainButton Rules
- `/`:
  - optional sync with CTA "Создать группу".
- `/groups/new`:
  - "Создать группу" (enabled only when form valid).
- `/groups/[groupId]/expenses/new`:
  - "Создать" (enabled only when form valid).

## Guard Rules
- Если нет валидной session cookie:
  - редирект в auth flow Telegram (без отдельного login page).
- Если пользователь не имеет доступа к `groupId`:
  - показывать error state и возврат на `/`.
- Если invite invalid:
  - показывать invite invalid state и CTA на `/`.

## Related
- [[project-documentation]]
- [[technical/invite-link-spec]]
- [[technical/telegram-miniapp-integration]]
- [[technical/mvp-test-plan]]
- [[specs/home-page-ui-spec]]
- [[specs/group-page-ui-spec]]
- [[specs/create-group-page-ui-spec]]
- [[specs/create-expense-page-ui-spec]]
- [[specs/all-expenses-page-ui-spec]]
