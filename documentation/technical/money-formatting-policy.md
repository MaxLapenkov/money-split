# Money Formatting Policy (MVP)

## Purpose
Единые правила хранения, расчета и отображения денежных значений в приложении.

## Storage
- Все суммы хранятся в minor units: `amount_minor` (`bigint`), копейки.
- Валюта MVP фиксирована: `RUB`.
- Запрещено хранение денег в `float`.

## Calculation
- Все промежуточные вычисления в копейках.
- Округление в копейки выполняется на этапе преобразования ввода.
- Для settlement балансов сумма debt == сумма credit (в minor units).

## Display Format
- В UI показываем major units с 2 знаками после запятой.
- Финальный формат для `RUB`: `1 234.56 RUB` (пробел как разделитель тысяч, точка как разделитель дробной части).
- Для операций:
  - `expense`: префикс `-`
  - `income`: префикс `+`
- Для settlement-рекомендаций знак не обязателен, так как направление задано текстом "A переводит B".

## Input Parsing
- Пользователь вводит сумму в major units (`1234.56`).
- Перед сохранением переводим в `amount_minor`:
  - `amount_minor = round(value * 100)`.
- Невалидные значения блокируются `zod`:
  - `> 0`,
  - максимум по бизнес-ограничению (напр. до 9_999_999_99 копеек).

## UI Consistency Rules
- В overview, history, create-form и settlement использовать одинаковый formatter.
- Во всех экранах использовать только формат `1 234.56 RUB`.
- Для MVP без мультивалютности символ валюты не меняется.

## Recommended Helper
- Единая функция `formatMoney(amountMinor: number): string`.
- Единая функция `parseMoneyInput(value: string): number`.

## Related
- [[project-documentation]]
- [[database-schema-mvp-final]]
- [[technical/settlement-algorithm-spec]]
- [[technical/zod-schema-catalog]]
- [[specs/create-expense-page-ui-spec]]
- [[specs/all-expenses-page-ui-spec]]
