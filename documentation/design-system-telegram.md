# Design System: Telegram-First (MVP)

## Screen Purpose
Зафиксировать единый UI-стандарт для `Money Split`: строгий Telegram-стиль, поддержка светлой/темной темы и реализация интерфейса только на `shadcn` компонентах.

## Wireframe
```text
┌────────────────────────────────────┐
│ Header                             │
│ [BackButton]   Group Name          │
├────────────────────────────────────┤
│ Section: Balances                  │
│ ┌────────────────────────────────┐ │
│ │ User A -> User B 1 250.00 RUB │ │
│ └────────────────────────────────┘ │
│                                    │
│ Section: Expenses                  │
│ ┌────────────────────────────────┐ │
│ │ Pizza       -900.00 RUB        │ │
│ │ Paid by: Ivan                  │ │
│ └────────────────────────────────┘ │
│                                    │
│ [Secondary Action: Invite Link]    │
├────────────────────────────────────┤
│ [MainButton: Add Expense]          │
└────────────────────────────────────┘
```

## Layout & Spacing
- Базовая сетка: `8px`.
- Внешний контейнер: `max-width: 640px`, горизонтальные отступы `16px`.
- Отступы секций: `16px`, расстояние между секциями: `24px`.
- Safe area учитывать через Telegram переменные:
  - `var(--tg-content-safe-area-inset-top)`
  - `var(--tg-content-safe-area-inset-bottom)`.
- Высота контента должна опираться на `--tg-viewport-height`.

## Colors (Telegram Tokens Only)
- Никаких хардкод-цветов в компонентах.
- Использовать только Telegram CSS переменные:
  - `--tg-theme-bg-color`
  - `--tg-theme-secondary-bg-color`
  - `--tg-theme-text-color`
  - `--tg-theme-hint-color`
  - `--tg-theme-link-color`
  - `--tg-theme-button-color`
  - `--tg-theme-button-text-color`
  - `--tg-theme-destructive-text-color`.
- Для `light/dark` режима источник истины: `WebApp.colorScheme`.

## Typography
- Только системный стек:
  `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`.
- Иерархия:
  - Title: `1rem` / `600`
  - Body: `0.9375rem` / `400`
  - Caption: `0.8125rem` / `400`
  - Hint: `0.75rem` / `400`.

## Component Policy (Strict)
- Используем **только `shadcn/ui`** как базу компонентов.
- Любой новый UI-элемент собирается из `shadcn` primitives.
- Кастомные компоненты допустимы только как композиция поверх `shadcn`, без отдельной дизайн-системы.
- Визуальная стилизация должна приводить `shadcn` к Telegram-паттернам (плотность, радиусы, состояния, токены).

## Mandatory shadcn Set for MVP
- `Button` (primary/secondary/destructive)
- `Card`
- `Input`
- `Label`
- `Textarea`
- `Select`
- `Dialog` (если нужен модальный сценарий)
- `DropdownMenu` (если нужен контекстный список)
- `Skeleton`
- `Toast` (или существующая система уведомлений).

## @twa-dev/sdk Theme Integration
- При инициализации SDK:
  - читаем `WebApp.colorScheme`;
  - подписываемся на `themeChanged`;
  - обновляем CSS переменные и класс `dark` на корневом элементе.
- Тема Telegram всегда имеет приоритет над локальным переключателем.
- Все shadcn tokens (`--background`, `--foreground`, `--primary`, и т.д.) маппятся на `--tg-theme-*`.

Пример маппинга:
- `--background` -> `var(--tg-theme-bg-color)`
- `--card` -> `var(--tg-theme-secondary-bg-color)`
- `--foreground` -> `var(--tg-theme-text-color)`
- `--muted-foreground` -> `var(--tg-theme-hint-color)`
- `--primary` -> `var(--tg-theme-button-color)`
- `--primary-foreground` -> `var(--tg-theme-button-text-color)`
- `--destructive` -> `var(--tg-theme-destructive-text-color)`.

## Interactions
- Tap feedback:
  - Android: ripple-подобное ощущение;
  - iOS: opacity fade.
- Haptics через `WebApp.HapticFeedback` для ключевых действий (save/share/confirm).
- Confirm/alert сценарии через Telegram-native popup APIs.

## Navigation
- `BackButton` обязателен с `v1` (см. [[technical/telegram-miniapp-integration]]).
- На стартовом экране `BackButton` скрыта, на внутренних экранах показана.
- `MainButton` опционально синхронизируется с primary CTA на формах создания по правилам [[technical/routes-and-navigation-map]].

## Edge Cases
- Пустые состояния: friendly copy + CTA.
- Ошибки сети/API: toast + retry action.
- Длинные названия групп/участников: ellipsis + tooltip/expand по тапу.
- Клавиатура на мобильных: не ломает layout, контент учитывает `viewportStableHeight`.

## Related
- [[project-documentation]]
- [[technical/telegram-miniapp-integration]]
- [[mvp-scope-v1]]
- [[user-flows]]
