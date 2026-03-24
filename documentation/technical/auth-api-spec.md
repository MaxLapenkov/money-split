# Auth API Spec

## Local Reference Project
- [quantum-frontend](file:///c:/Users/Maxel/Desktop/projects/quantum-frontend)

## Endpoint
- `POST /api/auth/telegram`

## Purpose
Принять `initData` из Telegram Mini App, валидировать подпись, создать/обновить пользователя и выдать сессию через cookie.

## Request
### Headers
- `Content-Type: application/json`

### Body
```json
{
  "initData": "query_id=AA...&user=%7B...%7D&auth_date=1710000000&hash=abc123..."
}
```

## Success Response
### Status
- `200 OK`

### Body
```json
{
  "ok": true,
  "userId": "9dc8d50d-7f80-4c43-8ffa-2c2d5af0ce99"
}
```

### Set-Cookie
- `session=<token>; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=604800`

## Error Responses

### 400 Bad Request
Когда `initData` отсутствует или имеет неверный формат.

```json
{
  "ok": false,
  "error": {
    "code": "INVALID_PAYLOAD",
    "message": "initData is required"
  }
}
```

### 401 Unauthorized
Когда Telegram hash не прошел валидацию.

```json
{
  "ok": false,
  "error": {
    "code": "INVALID_TELEGRAM_SIGNATURE",
    "message": "Telegram initData validation failed"
  }
}
```

### 500 Internal Server Error
Серверная ошибка (Supabase/session/signing).

```json
{
  "ok": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Unexpected server error"
  }
}
```

## Validation Rules
- `initData` должен содержать поля `auth_date`, `user`, `hash`.
- `auth_date` должен быть в допустимом временном окне (например, не старше 24 часов).
- `hash` должен совпадать с вычисленным HMAC по Telegram алгоритму.
- Request body валидируется через `zod` schema до запуска Telegram hash проверки.

## Session Rules
- Cookie name: `session`
- Flags: `HttpOnly`, `Secure`, `SameSite=None`
- TTL: 7 дней (MVP)
- Формат токена: подписанный/зашифрованный payload с `userId`, `telegramId`, `exp`
- Токен хранится только в `httpOnly` cookie

## Env Requirements
- `BOT_TOKEN`
- `SESSION_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Related
- [[technical/auth-flow-telegram-nextjs]]
- [[project-documentation]]
- [[mvp-scope-v1]]
