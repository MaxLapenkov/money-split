# MVP Implementation Order

## Purpose
Порядок реализации MVP по этапам, чтобы избежать блокировок между слоями.

## Phase 0: Foundation
1. Подтвердить источники истины:
   - [[mvp-scope-v1]]
   - [[database-schema-mvp-final]]
   - [[technical/routes-and-navigation-map]]
2. Подготовить структуру проекта для:
   - `server actions`
   - `lib/validation` (`zod`)
   - UI `shadcn`.

## Phase 1: Data Layer
1. Применить миграции по [[technical/sql-migrations-plan]].
2. Настроить RLS по [[technical/supabase-rls-policy]].
3. Подготовить базовые server-side репозитории/queries.

## Phase 2: Auth + Routing Skeleton
1. Реализовать auth flow:
   - Telegram `initData` validation.
   - Session cookie.
2. Реализовать маршруты и BackButton поведение по [[technical/routes-and-navigation-map]].

## Phase 3: Group Core
1. Экран Home ([[specs/home-page-ui-spec]]).
2. Экран Create Group ([[specs/create-group-page-ui-spec]]).
3. Invite resolve + binding flow:
   - [[technical/invite-link-spec]]
   - [[technical/participant-binding-model]].

## Phase 4: Expense Flow
1. Экран Create Expense ([[specs/create-expense-page-ui-spec]]).
2. Экран Group ([[specs/group-page-ui-spec]]) с state A/B.
3. Экран All Expenses ([[specs/all-expenses-page-ui-spec]]).

## Phase 5: Calculations and Events
1. Settlement calculation:
   - [[technical/settlement-algorithm-spec]].
2. Group view events:
   - [[technical/group-view-events-spec]].
3. Унифицировать формат денег:
   - [[technical/money-formatting-policy]].

## Phase 6: Hardening
1. Подключить единый error handling:
   - [[technical/error-code-catalog]].
2. Пройти DoD:
   - [[specs/spec-dod-checklist]].
3. Пройти тест-план:
   - [[technical/mvp-test-plan]].

## Phase 7: Release Readiness
1. Пройти release checklist:
   - [[technical/release-readiness-checklist]].
2. Финальный smoke в Telegram iOS/Android.

## Related
- [[project-documentation]]
- [[technical/state-and-data-fetching-strategy]]
- [[technical/zod-schema-catalog]]
- [[specs/spec-dod-checklist]]
- [[technical/mvp-test-plan]]
