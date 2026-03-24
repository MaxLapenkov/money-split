# Auth Flow: Telegram -> Next.js API -> Session

## Goal
Зафиксировать технический сценарий аутентификации без отдельной страницы логина для `Money Split`.

## Local Reference Project
- [quantum-frontend](file:///c:/Users/Maxel/Desktop/projects/quantum-frontend)

## Reference Implementation
Подход взят из проекта `Desktop/projects/quantum-frontend`:
- клиент отправляет `initData` в `POST /api/auth` (в reference проекте);
- в Money Split целевой endpoint: `POST /api/auth/telegram`;
- сервер валидирует подпись Telegram (`hash`) через `BOT_TOKEN`;
- при успешной валидации создает сессию и выставляет cookie.

## Target Flow for Money Split
1. Telegram Mini App открывает приложение и предоставляет `initData`.
2. Клиентский слой Next.js отправляет `initData` в `POST /api/auth/telegram`.
3. API-роут:
   - парсит и валидирует `initData`;
   - достает `user` из payload;
   - создает/обновляет запись пользователя в Supabase;
   - генерирует session token;
   - выставляет `httpOnly` cookie.
4. Клиент проверяет успешный ответ и продолжает работу в защищенной части приложения.

## Validation Details
- Используем Telegram WebApp validation алгоритм:
  - удалить `hash` из набора полей;
  - собрать `data_check_string` (отсортированные `key=value`, разделитель `\n`);
  - получить `secret_key = HMAC_SHA256("WebAppData", BOT_TOKEN)`;
  - сравнить `hash` с `HMAC_SHA256(secret_key, data_check_string)`.
- При несовпадении hash API возвращает `401`.

## API Contract
### Request
- `POST /api/auth/telegram`
- body:
  - `initData: string`

### Success Response
- `200`
- body:
  - `ok: true`
  - `userId: string`

### Error Response
- `401` (invalid telegram data)
- `400` (missing/invalid payload)
- `500` (internal error)

## Session/Cookie Requirements
- Cookie name: `session`
- Flags: `HttpOnly`, `Secure`, `SameSite=None`
- TTL: 7 дней (MVP)
- Продление: fixed (MVP)

## Environment Variables
- `BOT_TOKEN` - токен Telegram бота для проверки подписи.
- `SESSION_SECRET` - секрет подписи/шифрования session token.
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (только сервер)

## Security Notes
- Никогда не доверять `initDataUnsafe` без серверной проверки hash.
- Не хранить чувствительные данные Telegram в открытом виде в клиентском состоянии.
- Ограничить логирование `initData` в продакшене.

## Related
- [[project-documentation]]
- [[product-overview]]
- [[mvp-scope-v1]]
- [[user-flows]]
- [[database-schema-mvp-final]]
- [[technical/auth-api-spec]]
