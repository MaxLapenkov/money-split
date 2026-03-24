# Zod Schema Catalog (MVP)

## Purpose
Зафиксировать минимальный набор `zod`-схем для MVP и единые правила их использования в `server actions`.

## Location Convention
- Базовая папка: `lib/validation`.
- Рекомендуемая структура:
  - `lib/validation/auth.ts`
  - `lib/validation/groups.ts`
  - `lib/validation/invite.ts`
  - `lib/validation/expenses.ts`
  - `lib/validation/common.ts`

## Core Schemas (MVP)

### Auth
- `authTelegramInputSchema`
  - `{ initData: z.string().min(1) }`
- `authTelegramSuccessSchema`
  - `{ ok: z.literal(true), userId: z.string().uuid() }`

### Groups
- `createGroupInputSchema`
  - `{ name: z.string().min(1).max(120), participants: z.array(participantInputSchema).min(2) }`
- `participantInputSchema`
  - `{ displayName: z.string().min(1).max(80) }`
- Примечание для формы создания группы:
  - первый участник соответствует лейблу "Вы" и обязателен;
  - минимум один дополнительный участник (`participants.length >= 2`).

### Invite
- `resolveInviteInputSchema`
  - `{ inviteToken: z.string().min(8).max(256) }`
- `resolveInviteSuccessSchema`
  - `{ ok: z.literal(true), groupId: z.string().uuid() }`

### Participant Binding
- `bindParticipantInputSchema`
  - `{ groupMemberId: z.string().uuid() }`
- `myParticipantResponseSchema`
  - `{ ok: z.literal(true), groupMemberId: z.string().uuid().nullable() }`

### Expenses
- `createExpenseInputSchema`
  - `{ type: z.enum(["expense", "income"]), groupMemberId: z.string().uuid(), note: z.string().min(1).max(500), amount: z.number().positive(), currency: z.literal("RUB"), splitBetween: z.array(z.string().uuid()).min(1), expenseDate: z.string() }`
- `expenseListItemSchema`
  - `{ id: z.string().uuid(), type: z.enum(["expense", "income"]), groupMemberId: z.string().uuid(), groupMemberName: z.string(), note: z.string(), amountMinor: z.number(), currency: z.literal("RUB"), expenseDate: z.string(), createdAt: z.string() }`
- `expenseListResponseSchema`
  - `{ ok: z.literal(true), expenses: z.array(expenseListItemSchema) }`

### Common
- `apiErrorSchema`
  - `{ ok: z.literal(false), error: { code: z.string(), message: z.string() } }`

## Usage Rules
- Каждый `server action`:
  - валидирует input через `safeParse`;
  - при ошибке возвращает `apiErrorSchema`-совместимый ответ с кодом `VALIDATION_ERROR`;
  - по возможности валидирует критичный output перед возвратом.
- Не пробрасывать raw `zod` errors в UI.

## Example Flow
1. Получили input в server action.
2. `const parsed = createExpenseInputSchema.safeParse(input)`.
3. Если `!parsed.success` -> вернуть `{ ok: false, error: { code: "VALIDATION_ERROR", message: "Invalid expense payload" } }`.
4. Если `success` -> выполнять бизнес-логику с `parsed.data`.

## Related
- [[project-documentation]]
- [[technical/state-and-data-fetching-strategy]]
- [[technical/api-endpoints-mvp]]
- [[technical/auth-api-spec]]
- [[technical/invite-link-spec]]
- [[specs/create-group-page-ui-spec]]
