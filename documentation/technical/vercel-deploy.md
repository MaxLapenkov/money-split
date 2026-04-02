# Деплой на Vercel (Money Split)

## Требования
- Репозиторий на GitHub/GitLab/Bitbucket (или импорт через Vercel CLI).
- Проект **Next.js 16** в корне репозитория (файл `bun.lock` — Vercel подхватит **Bun** для install/build).
- Production **Supabase** с применёнными миграциями и RLS.

## Переменные окружения

В **Vercel → Project → Settings → Environment Variables** добавьте для **Production** (и при необходимости Preview) те же имена, что в `.env.local.example`:

| Переменная | Где взять | Примечание |
|------------|-----------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API | Публичный URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API | **Секрет**, только server |
| `BOT_TOKEN` | BotFather | Токен бота |
| `NEXT_PUBLIC_BOT_USERNAME` | Имя бота без `@` | Для ссылок invite |
| `NEXT_PUBLIC_APP_SHORTNAME` | BotFather → Mini App | Короткое имя Web App |
| `SESSION_SECRET` | Сгенерировать (≥32 символов) | Для подписи сессии (jose) |
| `TELEGRAM_WEBHOOK_SECRET` | Случайная строка | Совпадает с `secret_token` в `setWebhook`; см. [[technical/telegram-bot-webhook]] |

Секреты не коммитить; в Vercel хранятся зашифрованно.

После первого деплоя скопируйте **Production URL** (например `https://money-split-xxx.vercel.app`).

## Подключение проекта

### Через GitHub (рекомендуется)
1. [vercel.com](https://vercel.com) → **Add New… → Project**.
2. Импортируйте репозиторий с этим приложением.
3. **Framework Preset:** Next.js (определится сам).
4. **Root Directory:** корень монорепо, если приложение лежит в подпапке — укажите её.
5. Добавьте переменные из таблицы выше → **Deploy**.

### Через CLI (локально)
```bash
npm i -g vercel   # или: npx vercel
cd /path/to/money-split
vercel login
vercel link
vercel env pull .env.local   # опционально: подтянуть секреты локально
vercel --prod
```

Папка `.vercel` в `.gitignore` — не коммитить.

## Сборка

- **Install:** при наличии `bun.lock` Vercel использует Bun (`bun install`).
- **Build:** `bun run build` → `next build` (скрипт из `package.json`).

Если в корне пользователя есть лишний `package-lock.json` вне проекта, в логах сборки может мелькать предупреждение Next про `turbopack.root` — на деплой на Vercel это обычно не влияет, если **Root Directory** в Vercel указывает на папку с `money-split`.

## После деплоя: Telegram

1. **BotFather** → ваш бот → **Bot Settings** → **Menu Button** / **Configure Mini App** → укажите HTTPS URL продакшена (например `https://your-app.vercel.app`).
2. Зарегистрируйте **webhook** для приветствия по `/start`: см. [[technical/telegram-bot-webhook]] (`setWebhook` на `https://<your-domain>/api/telegram/webhook` и `TELEGRAM_WEBHOOK_SECRET`).
3. Проверьте сценарии: открытие Mini App, auth, создание группы, invite, команда `/start` в чате с ботом.

## Проверка

- `GET https://<your-domain>/` отдаёт главную.
- `POST /api/auth/telegram` с валидным `initData` после настройки домена в Telegram.

## Related
- [[technical/release-readiness-checklist]]
- [[technical/telegram-bot-webhook]]
- `.env.local.example`
