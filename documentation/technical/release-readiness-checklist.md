# Release Readiness Checklist (MVP)

## Purpose
Go/No-Go чеклист перед релизом MVP в production Telegram Mini App.

## Go/No-Go Rule
- **Go**: все блоки `Critical` отмечены.
- **No-Go**: хотя бы один `Critical` пункт не выполнен.

## 1) Product Scope Lock (Critical)
- [ ] Scope релиза соответствует [[mvp-scope-v1]].
- [ ] Все out-of-scope пункты исключены из релиза.
- [ ] UX экраны соответствуют утвержденным спекам в `documentation/specs`.

## 2) Infrastructure and Env (Critical)
- [ ] Production Supabase проект готов.
- [ ] Все необходимые env vars заданы:
  - [ ] `BOT_TOKEN`
  - [ ] `SESSION_SECRET`
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Секреты не попали в репозиторий.

## 3) Database and Security (Critical)
- [ ] Актуальные миграции применены в production.
- [ ] RLS включен для всех продуктовых таблиц.
- [ ] Политики соответствуют [[technical/supabase-rls-policy]].
- [ ] Проверено отсутствие доступа к чужим группам и данным.

## 4) Telegram Bot and Mini App Setup (Critical)
- [ ] Бот настроен в BotFather.
- [ ] Mini App URL указывает на production домен с HTTPS.
- [ ] `startapp` deeplink корректно открывает приложение.
- [ ] Invite deeplink работает end-to-end.

## 5) Core Flows Validation (Critical)
- [ ] Пройден `Auth -> Home -> Create Group`.
- [ ] Пройден `Invite -> Join -> Participant Binding`.
- [ ] Пройден `Create Expense -> Group Overview update`.
- [ ] Пройден `Mark settlement as paid`.
- [ ] Пройден `All expenses list`.

## 6) UI/UX and Platform Checks
- [ ] Light/Dark Telegram theme корректны.
- [ ] Safe area корректна на iOS/Android.
- [ ] `BackButton` поведение соответствует [[technical/routes-and-navigation-map]].
- [ ] Ошибки/empty/loading состояния отображаются по спекам.

## 7) Quality Gates
- [ ] Пройден чеклист [[technical/mvp-test-plan]].
- [ ] Нет критичных багов (P0/P1).
- [ ] Нет блокирующих багов по auth/security/settlements.

## 8) Observability and Support
- [ ] Серверные ошибки логируются.
- [ ] Логируются критичные события:
  - auth fail
  - invite resolve fail
  - settlement mark-paid fail
- [ ] Определен канал быстрого реагирования на инциденты.

## 9) Rollback Plan (Critical)
- [ ] Подготовлен rollback сценарий релиза.
- [ ] Известен последний стабильный деплой.
- [ ] Команда знает, как быстро откатить релиз.

## 10) Release Sign-off
- [ ] Product sign-off.
- [ ] Tech sign-off.
- [ ] QA sign-off.
- [ ] Финальное решение: `GO` / `NO-GO`.

## Related
- [[project-documentation]]
- [[mvp-scope-v1]]
- [[technical/mvp-test-plan]]
- [[technical/supabase-rls-policy]]
- [[technical/routes-and-navigation-map]]
- [[technical/telegram-miniapp-integration]]
