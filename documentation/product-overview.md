# Product Overview

## Vision
`Money Split` - аналог `kittysplit.com` в формате Telegram Mini App для удобного учета совместных расходов и расчета балансов между участниками.

## Platform and Stack
- **Client platform:** Telegram Mini App
- **Frontend:** Next.js
- **Backend:** Next.js (API routes / server actions)
- **Database:** Supabase (PostgreSQL + Auth + Realtime при необходимости)

## Product Goal
Сделать быстрый и понятный инструмент, в котором пользователь может:
- создать группу расходов;
- добавить участников;
- фиксировать траты;
- видеть, кто кому сколько должен;
- получить простой план закрытия долгов.

## Authentication Approach
- Отдельной страницы логина не будет.
- Для входа используется информация о пользователе из Telegram Mini App.
- На бэкенде Next.js проверяется payload Telegram, после чего через API генерируется токен сессии для пользователя.

## Related
- [[project-documentation]]
- [[mvp-scope-v1]]
- [[feature-backlog]]
- [[technical/auth-flow-telegram-nextjs]]
