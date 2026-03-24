# Open Questions

## Resolved for MVP
- Мультивалютность не входит в `v1`, используем одну валюту: `RUB`.
- Офлайн-режим не входит в `v1`.
- Монетизация и ограничения бесплатной версии не входят в `v1`.
- Push-уведомления внутри Telegram не входят в `v1`.
- Модель авторизации: Telegram `initData` -> валидация в Next.js API -> `httpOnly` session cookie -> upsert пользователя в Supabase.
- Realtime в `v1` не обязателен, используем server refresh/re-fetch после действий.
- Пересчет балансов в `v1`: on-the-fly (без materialized snapshot).
- Data fetching стратегия в `v1`: server actions + server components + кэш Next.js, без дополнительных библиотек.
- Валидация данных в `v1`: `zod` schemas для всех входных payload и критичных ответов.

## Post-MVP
- Мультивалютность.
- Push-уведомления.
- Realtime-обновления.
- Snapshot/materialized стратегия для производительности при росте данных.

## Related
- [[project-documentation]]
- [[feature-backlog]]
- [[database-schema-mvp-final]]
- [[technical/state-and-data-fetching-strategy]]
