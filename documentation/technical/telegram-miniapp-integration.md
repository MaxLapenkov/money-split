# Telegram Mini App Integration

## Goal
Зафиксировать техническую интеграцию Telegram Mini App для `Money Split` на основе практики из `Meat-Alco-Calculator`.

## Local Reference Projects
- [quantum-frontend](file:///c:/Users/Maxel/Desktop/projects/quantum-frontend)
- [Meat-Alco-Calculator](file:///c:/Users/Maxel/Desktop/projects/Meat-Alco-Calculator)

## Reference (Studied)
Из проекта `Meat-Alco-Calculator` взяты рабочие подходы:
- подключение `telegram-web-app.js` в `layout` через `beforeInteractive`;
- провайдер `WebAppSdkProvider` с динамическим импортом `@twa-dev/sdk` (без SSR-ошибок);
- инициализация `ready()`, `disableVerticalSwipes()`, `expand()`;
- подписки на `themeChanged` и `viewportChanged`;
- использование `openTelegramLink`, `openLink`, `HapticFeedback`.

Из проекта `quantum-frontend` взят паттерн управления `BackButton`:
- показывать кнопку только на внутренних экранах;
- скрывать кнопку на стартовом экране и redirect-роутах;
- обрабатывать клик через внутренний router history (`history.back()`), а не браузерный `window.history` напрямую;
- обязательно снимать обработчик через `offClick`, чтобы не накапливались дубли.

## Required Setup for Money Split

### 1) Layout
- В `app/layout.tsx` подключить:
  - `https://telegram.org/js/telegram-web-app.js` через `next/script` с `strategy="beforeInteractive"`.
- Установить `viewport`:
  - `width=device-width`
  - `initialScale=1`
  - `maximumScale=1`
  - `userScalable=false`
  - `viewportFit='cover'`

### 2) WebApp SDK Provider
- Создать клиентский провайдер (например `components/web-app-sdk.tsx`).
- Внутри `useEffect` динамически загружать `@twa-dev/sdk`.
- На успешной загрузке вызывать:
  - `WebApp.ready()`
  - `WebApp.disableVerticalSwipes()`
  - `WebApp.expand()`
- Передавать объект `WebApp` через React context.

### 3) Theme Sync
- Применять тему по `WebApp.colorScheme` (`light`/`dark`) на `<html>`.
- Подписаться на `WebApp.onEvent('themeChanged', ...)`.
- (Опционально) кешировать тему в `localStorage`, чтобы снизить визуальный flicker при первом рендере.

### 4) Viewport and Safe Areas
- Хранить высоту Telegram viewport в CSS variable:
  - `--tg-viewport-height`.
- Обновлять на `viewportChanged` и использовать `viewportStableHeight`.
- В layout учитывать safe area:
  - `padding-top: env(safe-area-inset-top)`
  - `padding-bottom: env(safe-area-inset-bottom)`

### 5) Native UX Helpers
- Haptic feedback на ключевых действиях (`impactOccurred('light'|'medium')`).
- Внешние ссылки открывать через `WebApp.openLink(...)`.
- Share-поток через `WebApp.openTelegramLink('https://t.me/share/url?...')` при необходимости.

### 6) BackButton (Required from v1)
- `BackButton` используем с самого начала.
- На стартовом экране (`/`) кнопка скрыта.
- На внутренних страницах (например группа, добавление расхода, детали) кнопка показана.
- По клику вызываем `history.back()` из приложения.
- При скрытии кнопки обязательно делать `BackButton.offClick(handler)`.

Пример логики (по образцу `quantum-frontend`):
```ts
const onBackHandler = () => history.back()

if (isStartRoute) {
  webApp.BackButton.hide()
  webApp.BackButton.offClick(onBackHandler)
} else {
  webApp.BackButton.show()
  webApp.BackButton.onClick(onBackHandler)
}
```

## Integration with Auth Flow
- Telegram SDK дает `WebApp.initData`.
- Клиент отправляет `initData` в `POST /api/auth/telegram`.
- API валидирует payload и создает сессию (см. [[technical/auth-flow-telegram-nextjs]] и [[technical/auth-api-spec]]).
- Отдельной страницы логина нет.

## Fallback Behavior
- Если приложение открыто вне Telegram:
  - SDK может быть недоступен;
  - UI не должен падать;
  - можно включить ограниченный web fallback (без production auth).

## MVP Boundaries
- В `v1` использовать `BackButton` как обязательную механику навигации.
- В `v1` `MainButton` используется опционально: синхронизировать с primary CTA на формах создания (группа, расход) по правилам [[technical/routes-and-navigation-map]].
- Основной UX строим на обычных React-компонентах приложения.
- Telegram API используем для контейнера, темы, viewport и auth-потока.

## QA Checklist
- Приложение корректно открывается в Telegram iOS/Android.
- Тема синхронизируется и обновляется без перезагрузки.
- Ничего не "прыгает" при открытии клавиатуры.
- Safe area корректна на устройствах с вырезами.
- Auth-поток по `initData` стабильно создает сессию.
- На стартовом экране `BackButton` скрыта, на вложенных экранах показана.
- Клик `BackButton` выполняет корректный возврат внутри Mini App.

## Related
- [[project-documentation]]
- [[product-overview]]
- [[mvp-scope-v1]]
- [[design-system-telegram]]
- [[technical/auth-flow-telegram-nextjs]]
- [[technical/auth-api-spec]]
- [[technical/invite-link-spec]]
