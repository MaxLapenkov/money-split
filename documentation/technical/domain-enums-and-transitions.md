# Domain Enums and Transitions (MVP)

## Purpose
Зафиксировать разрешенные enum-значения и переходы состояний в доменной логике MVP.

## Enums

### `group_member_role`
- `owner`
- `member`

Transitions (MVP):
- `owner -> member`: not supported in MVP.
- `member -> owner`: not supported in MVP.
- Ownership transfer — post-MVP feature.

### `expense_type`
- `expense`
- `income`

Transitions:
- immutable after create in MVP (изменение типа не поддерживается).

### `settlement_status`
- `suggested`
- `paid`

Transitions:
- `suggested -> paid` (allowed)
- `paid -> suggested` (not allowed in MVP)

### `group_view_status`
- `viewed`
- `acknowledged`

Transitions:
- `viewed -> acknowledged` (allowed)
- `acknowledged -> viewed` (not allowed)

## Invariants
- Settlement не может иметь одинакового `from` и `to`.
- `paid_at` заполняется только при переходе `suggested -> paid`.
- `acknowledged_at` заполняется только при `viewed -> acknowledged`.

## Validation Hooks
- Проверка переходов в server action до записи в БД.
- При нарушении перехода возвращать `SETTLEMENT_INVALID_STATE` или `ACKNOWLEDGE_INVALID_STATE`.

## Related
- [[project-documentation]]
- [[database-schema-mvp-final]]
- [[technical/settlement-algorithm-spec]]
- [[technical/group-view-events-spec]]
- [[technical/error-code-catalog]]
