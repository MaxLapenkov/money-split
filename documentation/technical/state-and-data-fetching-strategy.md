# State and Data Fetching Strategy (MVP)

## Decision
- Все запросы к данным выполняются через `server actions`.
- `server actions` вызываются из `server components`.
- Кэширование и инвалидация выполняются встроенными средствами Next.js.
- Дополнительные библиотеки для data fetching/state management не используются.
- Валидация входных/выходных данных выполняется через `zod`.

## Scope
Это правило распространяется на:
- загрузку групп, участников, расходов, балансов;
- создание/изменение сущностей (group, invite, binding, expense);
- обновление UI после мутаций через Next.js revalidation.

## Rationale
- Меньше сложности в MVP (без отдельного client cache слоя).
- Единый подход к данным и доступу.
- Лучше согласуется с App Router и серверной моделью Next.js.

## Technical Rules
- Чтение данных:
  - по умолчанию в `server components`;
  - через `server actions`/серверные функции.
- Мутации:
  - только через `server actions`;
  - после успешной мутации выполнять `revalidatePath` или `revalidateTag`.
- Client components:
  - не ходят напрямую в БД;
  - получают данные через props или вызывают server action только для user-initiated mutation.
- Формы:
  - для клиентского контроля формы используем `react-hook-form`;
  - submit и мутации форм выполняются через `server actions`.
- Валидация:
  - каждый `server action` обязан валидировать input через `zod` schema;
  - при необходимости валидировать response shape перед возвратом в UI;
  - ошибки валидации маппить в единый формат `{ ok: false, error: { code, message } }`.

## Caching Policy (MVP)
- Для страниц с часто меняющимися данными использовать targeted revalidation.
- Не отключать кеш глобально без необходимости.
- Оптимизировать свежесть данных через:
  - `revalidatePath('/groups/[groupId]')` после мутаций в группе;
  - теги для списков, если появится потребность в более точечной инвалидации.

## Error Handling
- Ошибки из server actions возвращаются в едином формате:
  - `{ ok: false, error: { code, message } }`
- UI показывает понятный toast/inline error и не ломает текущий экран.

## Out of Scope for MVP
- `react-query` / `tanstack query`
- SWR
- Redux/Zustand для серверных данных
- Альтернативные form-библиотеки (если есть `react-hook-form` сценарий)

## Validation Standard (zod)
- Общие схемы хранить в `lib/validation` (или аналогичной папке).
- Именование: `<entity><Action>Schema` (например `createExpenseInputSchema`).
- Использовать `safeParse`, чтобы возвращать контролируемые ошибки в UI.

## Related
- [[project-documentation]]
- [[mvp-scope-v1]]
- [[technical/api-endpoints-mvp]]
- [[technical/routes-and-navigation-map]]
- [[technical/group-view-events-spec]]
- [[technical/supabase-rls-policy]]
- [[technical/zod-schema-catalog]]
- [[specs/create-group-page-ui-spec]]
