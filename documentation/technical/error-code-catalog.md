# Error Code Catalog (MVP)

## Purpose
Единый справочник кодов ошибок для server actions/API, чтобы фронтенд и бэкенд одинаково обрабатывали ошибки.

## Response Shape
```json
{
  "ok": false,
  "error": {
    "code": "SOME_CODE",
    "message": "Human readable message"
  }
}
```

## Auth
- `UNAUTHORIZED` - отсутствует/просрочена сессия.
- `INVALID_TELEGRAM_SIGNATURE` - не прошла проверка `initData/hash`.
- `INVALID_PAYLOAD` - тело запроса невалидно (`zod`).

## Group and Access
- `GROUP_NOT_FOUND` (`404`) - группа не найдена.
- `FORBIDDEN_GROUP_ACCESS` (`403`) - нет доступа к группе.
- `GROUP_MEMBER_NOT_FOUND` (`404`) - участник группы не найден.
- `BINDING_ALREADY_EXISTS` (`409`) - текущий пользователь уже привязан к участнику в этой группе.
- `BINDING_CONFLICT` (`409`) - выбранный участник уже привязан к другому пользователю.

## Invite
- `INVITE_NOT_FOUND` - invite token не найден.
- `INVITE_EXPIRED` - invite token истек (post-MVP ready).
- `INVITE_INVALID_FORMAT` - некорректный формат токена.

## Expense
- `EXPENSE_NOT_FOUND` - операция не найдена.
- `INVALID_EXPENSE_PAYLOAD` - невалидные поля расхода/поступления.
- `INVALID_EXPENSE_SPLITS` - сумма сплитов не равна сумме операции.

## Settlements
- `SETTLEMENT_NOT_FOUND` - settlement не найден.
- `SETTLEMENT_ALREADY_PAID` - settlement уже отмечен как `paid`.
- `SETTLEMENT_INVALID_STATE` - недопустимый переход статуса.

## View Events
- `VIEW_EVENT_NOT_FOUND` - запись просмотра не найдена.
- `ACKNOWLEDGE_INVALID_STATE` - недопустимая отметка "ознакомился".

## Generic
- `VALIDATION_ERROR` - `zod` validation error.
- `CONFLICT` - конфликт данных.
- `INTERNAL_ERROR` - непредвиденная серверная ошибка.

## Usage Rules
- `code` стабильный и машиночитаемый.
- `message` можно локализовать и менять без изменения `code`.
- UI логика ветвится по `code`, а не по `message`.

## Related
- [[project-documentation]]
- [[technical/api-endpoints-mvp]]
- [[technical/zod-schema-catalog]]
- [[technical/state-and-data-fetching-strategy]]
