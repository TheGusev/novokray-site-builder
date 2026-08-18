# Связность schema.org и гарантия SSR-разметки

## Что делаем

1. Связываем узлы JSON-LD между собой, чтобы поисковики видели единую структуру:
   страница → услуга → предложения → вопросы-ответы, а не набор независимых блоков.
2. Проверяем автоматически, что вся разметка приходит уже в HTML с сервера и не
   зависит от выполнения JavaScript — на всех страницах услуг, хабов, городов и районов.

## Часть 1. Связка FAQPage ↔ Service ↔ OfferCatalog

Общий принцип: у каждой страницы появляется корневой узел `WebPage` с `@id`, а
остальные узлы ссылаются на него и друг на друга по `@id`, без дублирования данных.

- `src/lib/orgSchema.ts`
  - `faqPageNode` получает опции `about` (ссылка на `@id` услуги или каталога),
    `isPartOf` (ссылка на `WebPage`) и `inLanguage: "ru-RU"`.
  - Добавляем `webPageNode({ url, name, description, primaryEntityId })` — корневой
    узел страницы с `mainEntity` и `isPartOf` на глобальный `WebSite`.
- `src/lib/serviceSchema.ts`
  - `serviceNode`: `mainEntityOfPage` на `WebPage` и `hasOfferCatalog` ссылкой на
    `@id` каталога страницы, когда каталог на странице есть.
  - `offerCatalogNode`: обязательный `@id`; у каждого `Offer` поле
    `itemOffered` становится ссылкой `{ "@id": ... }` на узел `Service` того же
    графа, а если такого узла нет — остаётся вложенный `Service`, как сейчас.
  - `groupedOfferCatalogNode`: связь корневого каталога и групп через
    `hasPart` / `isPartOf`.
- Страницы услуг `services.$slug.tsx`: прайс-каталог получает свой `@id`, услуга
  на него ссылается, `HowTo` связывается с услугой через `about`.
- Хабы `uslugi.$slug.tsx`, категория, `gorod.$slug.tsx`, `raion.$slug.tsx`:
  `FAQPage.about` указывает на каталог или `LocalBusiness` страницы,
  `ItemList` ссылается на узлы `Service` по `@id`,
  `LocalBusiness.hasOfferCatalog` — на каталог страницы.
- Поле `producesOrder` не используем: в schema.org его нет у `Service` (оно
  относится к `OrderAction`). Связку «услуга → заказ» выражаем валидно —
  `Offer` плюс `potentialAction: OrderAction` с `target` на форму заявки.

Существующая проверка на дубли `@id` продолжит работать: все связи делаем
именно ссылками, а не копиями узлов.

## Часть 2. Проверка SSR-рендера разметки

- Расширяем `src/lib/__tests__/headMarkup.test.ts`:
  - проверка связности: каждая ссылка `{ "@id": ... }` внутри графа страницы
    должна разрешаться в узел того же графа или в глобальные
    `#organization` / `#website` из корневого макета;
  - `FAQPage` обязан иметь `about` и `isPartOf`, `OfferCatalog` — `@id`,
    `Service` — `mainEntityOfPage`;
  - фиксируем, что JSON-LD присутствует в исходном HTML ответа (без исполнения
    скриптов) для всех услуг, хабов, городов и районов.
- Добавляем скрипт `scripts/check-prerender-schema.ts`: обходит HTML-файлы
  статической сборки (`STATIC_EXPORT=1`) и валидирует наличие и связность
  JSON-LD. Это ловит случай, когда разметка есть в dev-SSR, но теряется
  в продакшен-экспорте.

## Технические детали

- `@id` строятся от `SITE.domain` с суффиксами: `#webpage`, `#service-<slug>`,
  `#catalog`, `#faq`, `#localbusiness`.
- Глобальные `Organization` и `WebSite` остаются только в `__root.tsx`,
  страницы ссылаются на них по `@id`.
- Видимый интерфейс не меняется: правки затрагивают только JSON-LD и тесты.