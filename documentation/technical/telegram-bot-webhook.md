# Telegram Bot Webhook (приветствие /start)

## Назначение

При команде **`/start`** в личном чате с ботом сервер отправляет приветственное сообщение и кнопку со ссылкой на Mini App (`https://t.me/<bot>/<shortname>`). Реализация: [`app/api/telegram/webhook/route.ts`](../../app/api/telegram/webhook/route.ts).

## Переменные окружения

| Переменная | Назначение |
|------------|------------|
| `BOT_TOKEN` | Вызов `sendMessage` через Bot API |
| `NEXT_PUBLIC_BOT_USERNAME` | Имя бота без `@` |
| `NEXT_PUBLIC_APP_SHORTNAME` | Short name Mini App в BotFather |
| `TELEGRAM_WEBHOOK_SECRET` | Должен совпадать с `secret_token` при `setWebhook`; без заголовка `X-Telegram-Bot-Api-Secret-Token` запросы отклоняются (401). Если переменная **не задана**, проверка отключена (удобно только для локальной отладки без webhook). |

Хелпер ссылки: [`lib/telegram/mini-app-link.ts`](../../lib/telegram/mini-app-link.ts) — `getTelegramMiniAppDeepLink()`.

## Регистрация webhook (один раз на окружение)

После деплоя на HTTPS (например Vercel) выполните:

```bash
curl -sS "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
  -d "url=https://<your-domain>/api/telegram/webhook" \
  -d "secret_token=<TELEGRAM_WEBHOOK_SECRET>"
```

Значение `secret_token` должно совпадать с `TELEGRAM_WEBHOOK_SECRET` в переменных окружения.

Проверка:

```bash
curl -sS "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo"
```

## Локальная отладка

Telegram шлёт обновления только на **публичный HTTPS**. Для тестов можно:

- Временно указать webhook на **ngrok** (`https://xxxx.ngrok.io/api/telegram/webhook`) с тем же `secret_token`, или
- Тестировать только на **staging/production** URL.

## Related

- [[technical/invite-link-spec]]
- [[technical/vercel-deploy]]
