# Create Group Page UI Spec (MVP)

### 1. Screen Purpose
Экран создания группы позволяет задать название группы, выбрать валюту (в MVP фиксированная `RUB`) и ввести участников, где автор заполняет имя под лейблом "Вы", а также добавляет минимум одного дополнительного участника.

### 2. Wireframe
```text
┌────────────────────────────────────┐
│ [BackButton]  Создание группы      │
├────────────────────────────────────┤
│ Label: Название группы             │
│ [Input: Например, Поездка в Сочи]  │
│                                    │
│ Label: Валюта                      │
│ [Select/Field: RUB (disabled)]     │
│ Hint: В MVP доступен только RUB    │
├────────────────────────────────────┤
│ Section: Участники                 │
│ Label: Вы                          │
│ [Input: Ваше имя]                  │
│                                    │
│ Label: Участник 1                  │
│ [Input: Имя участника]             │
│ [ + Добавить участника ]           │
│ [Удалить у доп. участников]        │
├────────────────────────────────────┤
│ Error area (validation)            │
├────────────────────────────────────┤
│ [MainButton: Создать группу]       │
└────────────────────────────────────┘
```

### 3. Layout & Spacing
- Контейнер: `max-width: 640px`, горизонтальные отступы `16px`.
- Базовая сетка: `8px`.
- Gap между полями: `12px`.
- Gap между секциями: `16px`.
- Safe area учитывать через `--tg-content-safe-area-inset-top/bottom`.

### 4. Colors
- Только Telegram tokens:
  - фон: `--tg-theme-bg-color`
  - карточки/секции: `--tg-theme-secondary-bg-color`
  - основной текст: `--tg-theme-text-color`
  - хинты: `--tg-theme-hint-color`
  - ошибки: `--tg-theme-destructive-text-color`
  - CTA: `--tg-theme-button-color` / `--tg-theme-button-text-color`.
- Light/dark переключение через `WebApp.colorScheme`.

### 5. Typography
- Title: `1rem` / `600`.
- Label: `0.875rem` / `500`.
- Input text: `0.9375rem` / `400`.
- Hint/Error: `0.8125rem` / `400`.

### 6. Components (shadcn only)
- `Input`:
  - название группы;
  - имя автора ("Вы");
  - имена дополнительных участников.
- `Label`:
  - лейблы для каждого поля.
- `Button`:
  - "Добавить участника";
  - удаление дополнительного участника;
  - primary action "Создать группу" (в UI; опционально синхронизируется через Telegram `MainButton`).
- `Select` или `Input` (disabled):
  - валюта `RUB` (заблокировано в MVP).
- `Card`/`Separator`:
  - визуальная группировка блока участников.
- `Toast`:
  - ошибки server action.

### 7. Form Control and Validation
- Управление формой: `react-hook-form`.
- Структура данных формы:
  - `name: string`
  - `currency: "RUB"`
  - `participants: Array<{ displayName: string }>`
- Правила:
  - `name` обязателен.
  - Под лейблом "Вы" имя обязательно.
  - Дополнительных участников минимум `1`.
  - Итого участников минимум `2` (автор + минимум один участник).
- Валидация схемы через `zod` (`createGroupInputSchema`) с подключением через resolver.
- Ошибки показываются inline под полями и в общем error area.

### 8. Interactions
- `+ Добавить участника` добавляет поле `Участник {n}`.
- Удаление доступно только для дополнительных участников (поле "Вы" удалить нельзя).
- Кнопка/`MainButton` "Создать группу":
  - disabled, пока форма невалидна;
  - при submit вызывает server action создания группы;
  - при успехе переход на страницу созданной группы;
  - при ошибке показать toast + оставить введенные данные.

### 9. Navigation
- Экран внутренний, `BackButton` видима.
- Клик `BackButton` возвращает на Home.
- Правила BackButton соответствуют [[technical/telegram-miniapp-integration]].

### 10. Edge Cases
- Пользователь пытается отправить пустую форму -> показать validation errors.
- Введены только данные "Вы", но нет других участников -> блокирующая ошибка.
- Очень длинные имена -> обрезка на уровне валидации (`max length`) и понятный текст ошибки.
- Сетевой сбой при создании -> toast + кнопка повторной отправки.

## Related
- [[project-documentation]]
- [[design-system-telegram]]
- [[mvp-scope-v1]]
- [[technical/state-and-data-fetching-strategy]]
- [[technical/zod-schema-catalog]]
- [[technical/telegram-miniapp-integration]]
