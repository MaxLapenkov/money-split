# Screen Definition of Done Checklist (MVP)

## Purpose
Единый чеклист готовности для каждого экранного спека.

## 1) Home ([[specs/home-page-ui-spec]])
- [ ] Показаны CTA и список групп.
- [ ] Работают loading/empty/error состояния.
- [ ] Переходы на `create-group` и `group` корректны.

## 2) Create Group ([[specs/create-group-page-ui-spec]])
- [ ] Поля и лейблы соответствуют спецификации.
- [ ] `RUB` заблокирован как единственная валюта.
- [ ] Минимум 2 участника проверяется.
- [ ] `react-hook-form + zod` ошибки отображаются корректно.
- [ ] Успешный submit создает группу и переводит на group page.

## 3) Group Page ([[specs/group-page-ui-spec]])
- [ ] Корректно работают оба состояния (без расходов / с расходами).
- [ ] `Пригласить друзей` открывает Telegram share.
- [ ] `Посмотреть все расходы` открывает историю.
- [ ] `Отметить как оплаченное` меняет статус settlement.
- [ ] Блок "Кто уже просмотрел группу?" показывает верные статусы.

## 4) Create Expense ([[specs/create-expense-page-ui-spec]])
- [ ] Переключатель `Расход/Поступление` работает.
- [ ] Есть выбор участника + динамичная подпись.
- [ ] Все обязательные поля валидируются.
- [ ] После успеха: success toast + reset формы.

## 5) All Expenses ([[specs/all-expenses-page-ui-spec]])
- [ ] Показаны тип, описание, участник, дата и сумма.
- [ ] Суммы форматируются по `money-formatting-policy`.
- [ ] Работают loading/empty/error состояния.

## Cross-Screen Acceptance
- [ ] Telegram BackButton поведение соответствует routes map.
- [ ] Светлая/темная тема корректны на всех экранах.
- [ ] Safe area/viewport корректны в Telegram iOS/Android.
- [ ] Ошибки обрабатываются через `error-code-catalog`.

## Related
- [[project-documentation]]
- [[technical/routes-and-navigation-map]]
- [[technical/error-code-catalog]]
- [[technical/money-formatting-policy]]
- [[technical/mvp-test-plan]]
