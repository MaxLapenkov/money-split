# All Expenses Page UI Spec (MVP)

### 1. Screen Purpose
Экран показывает полный список расходов/поступлений по выбранной группе, чтобы пользователь мог просмотреть историю операций.

### 2. Wireframe
```text
┌────────────────────────────────────────────┐
│ [BackButton]  Все расходы                  │
├────────────────────────────────────────────┤
│ Group: Название группы                     │
│ Summary: 24 операции                       │
├────────────────────────────────────────────┤
│ List item                                  │
│ [Расход] Пицца                             │
│ Иван заплатил(а) за что-то                 │
│ 21.03.2026                  -1 200.00 RUB  │
├────────────────────────────────────────────┤
│ List item                                  │
│ [Поступление] Возврат долга                │
│ Анна получил(а) деньги за что-то           │
│ 22.03.2026                    +600.00 RUB  │
├────────────────────────────────────────────┤
│ ...                                        │
└────────────────────────────────────────────┘
```

### 3. Layout & Spacing
- Контейнер: `max-width: 640px`, горизонтальные отступы `16px`.
- Базовая сетка: `8px`.
- Заголовочная секция (название группы + summary) с отступом `12px`.
- Список операций: gap `8px`, padding item `12px`.
- Учитывать safe area через `--tg-content-safe-area-inset-top/bottom`.

### 4. Colors
- Только Telegram tokens:
  - фон: `--tg-theme-bg-color`
  - фон карточек/элементов: `--tg-theme-secondary-bg-color`
  - основной текст: `--tg-theme-text-color`
  - вторичный текст: `--tg-theme-hint-color`
  - позитивная сумма (поступление): использовать стиль на базе `--tg-theme-link-color`
  - стандартная сумма (расход): `--tg-theme-text-color`.

### 5. Typography
- Заголовок экрана: `1rem` / `600`.
- Название операции: `0.9375rem` / `500`.
- Строка участника/описания: `0.875rem` / `400`.
- Дата и сумма: `0.875rem` / `500`.
- Служебный текст (summary/empty): `0.8125rem` / `400`.

### 6. Components (shadcn only)
- `Card` или list row на базе `Button variant="ghost"`:
  - элемент операции.
- `Badge`:
  - тип операции (`Расход` / `Поступление`).
- `Separator`:
  - визуальное деление между элементами (по желанию).
- `Skeleton`:
  - загрузка списка.
- `Toast`:
  - ошибки загрузки.

### 7. Data Model Mapping
Каждый элемент списка отображает:
- `type` (`expense`/`income`) -> badge.
- `note` -> заголовок операции.
- `groupMemberName` + динамичная подпись:
  - `заплатил(а) за что-то` для `expense`;
  - `получил(а) деньги за что-то` для `income`.
- `expenseDate` -> дата.
- `amountMinor` + `currency` (в MVP `RUB`) -> сумма с знаком:
  - расход: `-1 234.56 RUB`
  - поступление: `+1 234.56 RUB`.

### 8. Interactions
- Экран read-only в MVP (без редактирования и удаления).
- Данные загружаются server-side через `server actions`.
- При возврате с экрана создания траты список показывает актуальные данные (через `revalidatePath`).

### 9. Navigation
- Экран внутренний: `BackButton` отображается.
- `BackButton` возвращает на [[specs/group-page-ui-spec]].
- Правила поведения по [[technical/telegram-miniapp-integration]].

### 10. States & Edge Cases
- Loading:
  - показывать 3-5 `Skeleton` элементов.
- Empty:
  - текст: "В этой группе пока нет расходов" + CTA "Ввести первую трату".
- Error:
  - toast + inline действие "Повторить".
- Long text:
  - заголовок операции в 1 строку с `ellipsis`, полная версия по tap/expand.

## Related
- [[project-documentation]]
- [[specs/group-page-ui-spec]]
- [[specs/create-expense-page-ui-spec]]
- [[technical/money-formatting-policy]]
- [[technical/state-and-data-fetching-strategy]]
- [[technical/api-endpoints-mvp]]
- [[technical/telegram-miniapp-integration]]
