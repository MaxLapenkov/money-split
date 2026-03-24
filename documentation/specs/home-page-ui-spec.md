# Home Page UI Spec (MVP)

### 1. Screen Purpose
Главная страница объясняет ценность сервиса, показывает как он работает, отображает список созданных групп и дает быстрый старт через создание новой группы.

### 2. Wireframe
```text
┌────────────────────────────────────┐
│ Money Split                        │
│ Разделяйте расходы без споров      │
├────────────────────────────────────┤
│ [MainButton: Создать группу]       │
├────────────────────────────────────┤
│ Section: My groups                 │
│ ┌────────────────────────────────┐ │
│ │ Trip to Sochi           >      │ │
│ └────────────────────────────────┘ │
│ ┌────────────────────────────────┐ │
│ │ BBQ Weekend            >       │ │
│ └────────────────────────────────┘ │
│ [Empty state if no groups]         │
├────────────────────────────────────┤
│ Card: Why this service             │
│ - Быстрый расчет долгов            │
│ - Прозрачные траты                 │
│ - Удобно для поездок/ужинов        │
├────────────────────────────────────┤
│ Card: How it works                 │
│ 1) Создайте группу                 │
│ 2) Добавляйте расходы              │
│ 3) Получайте "кто кому платит"     │
└────────────────────────────────────┘
```

### 3. Layout & Spacing
- Контейнер: `max-width: 640px`, горизонтальные отступы `16px`.
- Вертикальный rhythm: `8/16/24px` по grid.
- Порядок секций: `Создать группу` -> `My groups` -> `Why this service` -> `How it works`.
- Между секциями отступ `16px`.
- Список групп: row padding `12px`, gap `8px`.
- Учитывать safe area через `--tg-content-safe-area-inset-top/bottom`.

### 4. Colors
- Только Telegram tokens:
  - фон экрана: `--tg-theme-bg-color`
  - фон карточек/секций: `--tg-theme-secondary-bg-color`
  - основной текст: `--tg-theme-text-color`
  - вспомогательный текст: `--tg-theme-hint-color`
  - CTA: `--tg-theme-button-color` + `--tg-theme-button-text-color`.
- Light/dark режим переключается по `WebApp.colorScheme`.

### 5. Typography
- Заголовок экрана: `1rem`, `600`.
- Подзаголовок/описание: `0.9375rem`, `400`.
- Текст в карточках и списке групп: `0.9375rem`, `400`.
- Подписи/хинты: `0.8125rem`, `400`.
- Только системный font stack из [[design-system-telegram]].

### 6. Components (shadcn only)
- `Card`:
  - блок "Why this service";
  - блок "How it works".
- `Button`:
  - primary action "Создать группу" (синхронизировать с Telegram MainButton).
- `Skeleton`:
  - loading состояния списка групп.
- `Toast`:
  - ошибки загрузки/перехода.
- `Separator` (опционально):
  - визуальное разделение секций.
- Группа в списке:
  - реализовать как кликабельный row на базе `Button variant="ghost"` или композиции `Card + Button`.

### 7. Interactions
- Тап по группе -> переход на страницу группы.
- Тап по "Создать группу" -> открытие сценария создания группы.
- Haptic feedback:
  - light при нажатии на группу;
  - medium при создании группы.
- Loading:
  - пока грузятся группы, показывать `Skeleton` rows.

### 8. Navigation
- Это стартовый экран, `BackButton` скрыта.
- На переходах к внутренним экранам `BackButton` включается по правилам [[technical/telegram-miniapp-integration]].
- Primary CTA:
  - в UI присутствует `Button`,
  - опционально синхронизируется через Telegram `MainButton` (текст: "Создать группу") по правилам [[technical/routes-and-navigation-map]].

### 9. Edge Cases
- Нет групп:
  - показать empty state: "У вас пока нет групп" + CTA "Создать первую группу".
- Ошибка загрузки:
  - toast + inline кнопка "Повторить".
- Очень длинные названия групп:
  - одна строка с `ellipsis`, полный текст по long-press/tooltip.
- Медленная сеть:
  - skeleton не менее 2 строк, затем graceful fallback.

## Related
- [[project-documentation]]
- [[design-system-telegram]]
- [[mvp-scope-v1]]
- [[user-flows]]
- [[technical/telegram-miniapp-integration]]
