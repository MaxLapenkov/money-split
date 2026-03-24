# Settlement Algorithm Spec (MVP)

## Purpose
Определить детерминированный алгоритм расчета "кто кому платит" для блока "Как закрыть все задолженности?".

## Input
- Список участников группы.
- Баланс каждого участника (`net`):
  - `net > 0`: участнику должны.
  - `net < 0`: участник должен.
  - `net = 0`: закрыт.

## Output
- Список переводов:
  - `fromGroupMemberId`
  - `toGroupMemberId`
  - `amountMinor` (копейки, отображение: `1 234.56 RUB`)
  - `status` (`suggested` | `paid`)

## Algorithm (Greedy, MVP)
1. Сформировать 2 списка:
   - `debtors` (`net < 0`, хранить абсолютный долг);
   - `creditors` (`net > 0`).
2. Отсортировать:
   - `debtors` по размеру долга по убыванию;
   - `creditors` по размеру требования по убыванию.
3. Идти двумя указателями:
   - `d` по debtors,
   - `c` по creditors.
4. На каждом шаге:
   - `transfer = min(debtors[d].amount, creditors[c].amount)`;
   - создать settlement `debtor -> creditor` на `transfer`;
   - уменьшить остатки у обоих;
   - если остаток 0, перейти к следующему элементу списка.
5. Повторять, пока один из списков не закончится.

## Rounding Rules
- Все расчеты в копейках (целое число minor units), не в float.
- При отображении делить на 100 и форматировать как `1 234.56 RUB`.
- После расчета сумма всех `paid`/`suggested` переводов должна балансировать total debt/credit.

## Determinism Rules
- При равных значениях сортировать дополнительно по `groupMemberId` (asc), чтобы результат был повторяемым.
- Один и тот же набор входных данных должен давать идентичный список settlement.

## Paid Flow
- Кнопка `Отметить как оплаченное` переводит settlement в `paid`.
- Изменение статуса не меняет исторические расходы.
- Для обновленного расчета можно:
  - либо скрывать `paid` из активного списка;
  - либо пересчитывать новый набор `suggested` поверх оставшихся обязательств (post-MVP).

## Complexity
- Сортировка: `O(n log n)`.
- Проход двумя указателями: `O(n)`.
- Подходит для MVP (малые/средние группы).

## Validation
- Перед расчетом проверять, что:
  - валюта группы `RUB`;
  - сумма positive net ~= сумма absolute negative net (с учетом rounding rules).

## Related
- [[project-documentation]]
- [[specs/group-page-ui-spec]]
- [[technical/api-endpoints-mvp]]
- [[technical/state-and-data-fetching-strategy]]
- [[database-schema-mvp-final]]
- [[technical/mvp-test-plan]]
