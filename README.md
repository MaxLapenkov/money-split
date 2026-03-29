# Money Split

Telegram Mini App для учёта совместных расходов и расчётов между участниками группы: траты, балансы, рекомендуемые переводы для закрытия долгов.

## Возможности

- Группы расходов, приглашения, привязка участника Telegram ↔ запись в группе
- Ввод трат и долей, сводка по группе
- Расчёт задолженностей и подсказки «кто кому переводит»
- Отметка оплат по строкам расчёта, история на странице возвратов
- Сессия через Telegram Web App, данные в Supabase

## Стек

| Слой | Технологии |
|------|------------|
| UI | Next.js (App Router), React 19, Tailwind CSS 4, shadcn/ui (Base UI) |
| Данные | Supabase (PostgreSQL), server actions, кэш `unstable_cache` + `revalidateTag` |
| Telegram | `@twa-dev/sdk`, тема через CSS variables `--tg-theme-*` |
| Аналитика (опционально на Vercel) | `@vercel/analytics`, `@vercel/speed-insights` |

## Требования

- **Node.js** ≥ 20.9
- **Bun** (рекомендуется; в Vercel используется `bun install` / `bun run build`, см. `vercel.json`)

## Быстрый старт

1. Клонируй репозиторий и установи зависимости:

   ```bash
   bun install
   ```

2. Скопируй переменные окружения и заполни значения:

   ```bash
   cp .env.local.example .env.local
   ```

   | Переменная | Назначение |
   |------------|------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | URL проекта Supabase |
   | `SUPABASE_SERVICE_ROLE_KEY` | Service role (только сервер) |
   | `BOT_TOKEN` | Токен Telegram-бота |
   | `NEXT_PUBLIC_BOT_USERNAME` | Username бота (без `@`) |
   | `NEXT_PUBLIC_APP_SHORTNAME` | Short name Mini App в BotFather |
   | `SESSION_SECRET` | Секрет для JWT-сессии, **не короче 32 символов** |

3. Запусти dev-сервер (HTTPS, как у Mini App):

   ```bash
   bun dev
   ```

   Открой указанный в консоли URL (часто `https://localhost:3000`). Для полноценной проверки авторизации нужен контекст Telegram (Mini App или настроенная отладка).

## Скрипты

| Команда | Описание |
|---------|----------|
| `bun dev` | Разработка (`next dev --experimental-https`) |
| `bun run build` | Production-сборка |
| `bun start` | Запуск после `build` |
| `bun run lint` | ESLint |

## Деплой

Проект рассчитан на **Vercel**: в `vercel.json` заданы `installCommand` и `buildCommand` под Bun. Переменные из `.env.local.example` нужно продублировать в настройках проекта на Vercel. Подробности — в `documentation/technical/vercel-deploy.md`.

## Документация

В каталоге [`documentation/`](documentation/) лежат обзор продукта, схема БД, спеки экранов, потоки авторизации и технические заметки.

## Лицензия

[MIT](LICENSE)
