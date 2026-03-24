# Telegram Mini App Design System Reference

## Table of Contents

1. [Theme Color Tokens](#theme-color-tokens)
2. [CSS Variables](#css-variables)
3. [Typography Scale](#typography-scale)
4. [Viewport & Safe Areas](#viewport--safe-areas)
5. [Native Components API](#native-components-api)
6. [Popup & Alert Specs](#popup--alert-specs)
7. [Haptic Feedback](#haptic-feedback)
8. [Platform Detection](#platform-detection)
9. [Loading & Performance](#loading--performance)
10. [Accessibility](#accessibility)

---

## Theme Color Tokens

Telegram Mini Apps receive 14 color tokens from the parent Telegram client. These adapt to the user's chosen theme (light, dark, or custom). Always design with these tokens — never hardcode hex values.

| Token                       | CSS Variable                           | Purpose                        |
| --------------------------- | -------------------------------------- | ------------------------------ |
| `bg_color`                  | `--tg-theme-bg-color`                  | Primary background             |
| `secondary_bg_color`        | `--tg-theme-secondary-bg-color`        | Alternate/secondary background |
| `header_bg_color`           | `--tg-theme-header-bg-color`           | Header area background         |
| `bottom_bar_bg_color`       | `--tg-theme-bottom-bar-bg-color`       | Bottom navigation bar          |
| `section_bg_color`          | `--tg-theme-section-bg-color`          | Card/section container         |
| `text_color`                | `--tg-theme-text-color`                | Primary text                   |
| `subtitle_text_color`       | `--tg-theme-subtitle-text-color`       | Secondary/subtitle text        |
| `hint_color`                | `--tg-theme-hint-color`                | Placeholder, helper text       |
| `link_color`                | `--tg-theme-link-color`                | Hyperlinks                     |
| `accent_text_color`         | `--tg-theme-accent-text-color`         | Accented/highlighted text      |
| `section_header_text_color` | `--tg-theme-section-header-text-color` | Section titles                 |
| `destructive_text_color`    | `--tg-theme-destructive-text-color`    | Destructive/danger actions     |
| `button_color`              | `--tg-theme-button-color`              | Primary button background      |
| `button_text_color`         | `--tg-theme-button-text-color`         | Primary button text            |

### Default Light Theme Values

```
bg_color:                  #FFFFFF
secondary_bg_color:        #EFEFF4
text_color:                #000000
hint_color:                #707579
link_color:                #007AFF
button_color:              #007AFF
button_text_color:         #FFFFFF
section_separator:         rgba(0, 0, 0, 0.15)
```

### Default Dark Theme Values

```
bg_color:                  #17212B
secondary_bg_color:        #232E3C
header_bg_color:           #17212B
section_bg_color:          #17212B
text_color:                #F5F5F5
hint_color:                #708499
subtitle_text_color:       #708499
link_color:                #6AB3F3
accent_text_color:         #6AB2F2
section_header_text_color: #6AB3F3
button_color:              #5288C1
button_text_color:         #FFFFFF
destructive_text_color:    #EC3942
section_separator:         rgba(255, 255, 255, 0.05)
```

### Additional Tokens (TelegramUI)

```
skeleton:     rgba(255, 255, 255, 0.03)
```

---

## CSS Variables

### Theme Colors

All 14 tokens are available as CSS custom properties:

```css
var(--tg-theme-bg-color)
var(--tg-theme-text-color)
var(--tg-theme-hint-color)
var(--tg-theme-link-color)
var(--tg-theme-button-color)
var(--tg-theme-button-text-color)
var(--tg-theme-secondary-bg-color)
var(--tg-theme-header-bg-color)
var(--tg-theme-bottom-bar-bg-color)
var(--tg-theme-accent-text-color)
var(--tg-theme-section-bg-color)
var(--tg-theme-section-header-text-color)
var(--tg-theme-section-separator-color)
var(--tg-theme-subtitle-text-color)
var(--tg-theme-destructive-text-color)
```

### Viewport

```css
var(--tg-viewport-height)        /* Current viewport height */
var(--tg-viewport-stable-height) /* Stable height (ignores keyboard) */
```

### Safe Areas (device-level)

```css
var(--tg-safe-area-inset-top)
var(--tg-safe-area-inset-bottom)
var(--tg-safe-area-inset-left)
var(--tg-safe-area-inset-right)
```

### Content Safe Areas (Telegram UI-level)

```css
var(--tg-content-safe-area-inset-top)
var(--tg-content-safe-area-inset-bottom)
var(--tg-content-safe-area-inset-left)
var(--tg-content-safe-area-inset-right)
```

---

## Typography Scale

Telegram uses platform-native system fonts. Never use custom web fonts.

### Font Stack

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
-webkit-font-smoothing: antialiased;
```

### Type Hierarchy

| Level         | Size      | Line Height | Weight   | Use for                  |
| ------------- | --------- | ----------- | -------- | ------------------------ |
| Large Title   | 2rem      | 2.625rem    | Bold     | Onboarding, hero screens |
| Title 1       | 1.75rem   | 2.25rem     | Bold     | Page titles              |
| Title 2       | 1.375rem  | 2rem        | Bold     | Section titles           |
| Title 3       | 1.25rem   | 1.75rem     | Semibold | Card titles              |
| Headline      | 1.0625rem | 1.375rem    | Semibold | List item titles         |
| Body (Text)   | 1rem      | 1.625rem    | Regular  | Body text                |
| Subheadline 1 | 0.9375rem | 1.5rem      | Regular  | Secondary info           |
| Subheadline 2 | 0.875rem  | 1.375rem    | Regular  | Metadata                 |
| Caption 1     | 0.75rem   | 1rem        | Regular  | Small labels             |
| Caption 2     | 0.6875rem | 0.875rem    | Regular  | Badges, timestamps       |

### Rules

- Use `rem` or `em` — not fixed `px` for font sizes.
- Minimum contrast ratio: **4.5:1** (WCAG 2.2 AA).
- Respect system Dynamic Type settings.

---

## Viewport & Safe Areas

### Viewport Properties

- `Telegram.WebApp.viewportHeight` — current viewport height in px
- `Telegram.WebApp.viewportStableHeight` — height excluding keyboard
- `Telegram.WebApp.isExpanded` — whether at maximum height
- `Telegram.WebApp.isFullscreen` — fullscreen mode (Bot API 8.0+)

### Methods

- `expand()` — expand to maximum height
- `requestFullscreen()` / `exitFullscreen()`
- `lockOrientation()` / `unlockOrientation()`

### Safe Area Handling

Always account for safe areas in layouts. Use CSS variables:

```css
.app-container {
  padding-top: calc(var(--tg-safe-area-inset-top) + var(--tg-content-safe-area-inset-top));
  padding-bottom: var(--tg-safe-area-inset-bottom);
  padding-left: var(--tg-safe-area-inset-left);
  padding-right: var(--tg-safe-area-inset-right);
}
```

---

## Native Components API

### MainButton

Fixed at the bottom of the webview. Use for the screen's primary action.

| Property            | Type   | Description                        |
| ------------------- | ------ | ---------------------------------- |
| `text`              | string | Button label (default: "Continue") |
| `color`             | string | Background color                   |
| `textColor`         | string | Text color                         |
| `isVisible`         | bool   | Whether button is shown            |
| `isActive`          | bool   | Whether button is interactive      |
| `hasShineEffect`    | bool   | Animated shine effect              |
| `isProgressVisible` | bool   | Show loading spinner               |

Methods: `setText()`, `show()`, `hide()`, `enable()`, `disable()`, `showProgress()`, `hideProgress()`, `onClick()`, `offClick()`, `setParams()`

**When to use:** Pay, Submit, Next, Continue, Save, Confirm.

### SecondaryButton

Same API as MainButton, plus:

- `position`: `left | right | top | bottom` (relative to MainButton)
- `iconCustomEmojiId`: custom emoji icon

### BackButton

| Property    | Type | Description                  |
| ----------- | ---- | ---------------------------- |
| `isVisible` | bool | Whether back button is shown |

Methods: `show()`, `hide()`, `onClick()`, `offClick()`

**When to use:** Any screen that isn't the root/home screen.

### SettingsButton

Same API as BackButton. Appears in the top-right area.

---

## Popup & Alert Specs

### showPopup(params)

```
title:   string (0-64 chars, optional)
message: string (1-256 chars, required)
buttons: PopupButton[] (1-3 buttons)
```

PopupButton types:

- `default` — default style
- `ok` — "OK" label
- `close` — "Close" label
- `cancel` — "Cancel" label
- `destructive` — red/danger style

### showAlert(message)

Simple alert with "OK" button.

### showConfirm(message)

Confirmation with OK/Cancel. Returns boolean.

**Design rule:** Always use native popups for confirmations and critical alerts. They match Telegram's visual language and feel trustworthy.

---

## Haptic Feedback

### Impact

`Telegram.WebApp.HapticFeedback.impactOccurred(style)`

| Style    | When to use                          |
| -------- | ------------------------------------ |
| `light`  | Toggle switches, small button taps   |
| `medium` | Regular button presses               |
| `heavy`  | Significant actions (delete, submit) |
| `rigid`  | Collision-like feedback              |
| `soft`   | Gentle confirmation                  |

### Notification

`Telegram.WebApp.HapticFeedback.notificationOccurred(type)`

| Type      | When to use                          |
| --------- | ------------------------------------ |
| `success` | Transaction complete, save confirmed |
| `warning` | Validation issue, caution needed     |
| `error`   | Failed action, invalid input         |

### Selection

`Telegram.WebApp.HapticFeedback.selectionChanged()`

Use when user changes a selection (picker, segment control).

---

## Platform Detection

```javascript
Telegram.WebApp.platform
// Returns: "android", "ios", "tdesktop", "web", etc.
```

### Platform-Specific Interactions

| Aspect       | Android                | iOS               |
| ------------ | ---------------------- | ----------------- |
| Tap feedback | Ripple effect          | Opacity 0.7       |
| Motion       | Material motion curves | Spring animations |
| Z-index base | 1                      | 1                 |
| Scrolling    | Standard               | Momentum/bounce   |

---

## Loading & Performance

### Startup

Call `Telegram.WebApp.ready()` immediately to prevent flickering.

### Performance Targets

- LCP (Largest Contentful Paint): <= 2.5 seconds
- INP (Interaction to Next Paint): <= 200ms
- Animations: 60fps minimum

### Loading States

Use **skeleton screens** that mirror the final layout shape:

- Skeleton color: `rgba(255, 255, 255, 0.03)` (or platform-appropriate)
- Animate with subtle pulse
- Match the exact dimensions of the content they replace

### Offline State

Show "Reconnecting..." with Telegram-style aesthetics instead of generic error pages.

---

## Accessibility

- Semantic HTML: proper heading hierarchy (h1-h6)
- ARIA labels on interactive elements
- Visible focus indicators: `outline: 0.125rem solid [accent-color]; outline-offset: 0.125rem`
- Full keyboard navigation via `[tabindex]`
- Minimum touch target: 44x44px
- Minimum contrast: 4.5:1 (WCAG AA)
