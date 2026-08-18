# Разметка Service + Offer для карточек услуг и гео-страниц

## Что уже есть (проверено)

- `/services/{slug}` — полноценный `Service` с `hasOfferCatalog` и `Offer`, `HowTo`, `FAQPage`, крошки.
- `/price` — `OfferCatalog` + `AggregateOffer` с `itemOffered: Service`.
- `/gorod/{slug}` и `/raion/{slug}` — только `LocalBusiness` + `BreadcrumbList` (+ FAQ у городов). **Ни одного `Service` и ни одной цены** — гео-страницы для поиска выглядят как «просто филиал», без набора услуг.
- `/uslugi/{slug}` (хабы), `/services` и `/category/dezinfekciya-novosibirsk` — только `ItemList` из `ListItem` с именем и ссылкой, без типа услуги и без цены.

То есть Service/Offer сейчас живёт ровно на одной группе страниц из пяти.

## Что сделаем

### 1. Единый генератор разметки

Новый модуль `src/lib/serviceSchema.ts` с функциями:

- `serviceNode()` — узел `Service`: `name`, `serviceType`, `category`, `description`, `provider` (ссылка на общую Organization), `areaServed` (город/район/регион — параметром), `url`, `offers` в виде `Offer` с `priceSpecification` (`minPrice`, `priceCurrency: RUB`, `valueAddedTaxIncluded: true`), `availability`, `areaServed`.
- `serviceListNode()` — `ItemList`, где каждый `ListItem.item` — это вложенный `Service` с ценой (вместо нынешней голой ссылки).
- `aggregateOfferNode()` — `AggregateOffer` (`lowPrice`, `highPrice`, `offerCount`) для страниц-каталогов.

Источник данных — существующий лёгкий `SERVICES_INDEX` (slug, title, h1, category, priceFrom, metaDescription), чтобы не тянуть тяжёлый каталог `services.ts` в head-бандл. Ничего не выдумываем: цены берём из `priceFrom`, тексты — из имеющихся описаний.

### 2. Гео-страницы (главный прирост)

`/gorod/{slug}` и `/raion/{slug}`:

- в `LocalBusiness` добавим `makesOffer` — список `Offer` по приоритетным услугам с ценой «от» и `areaServed` конкретного города/района;
- добавим в `@graph` отдельные узлы `Service` для тех же услуг с `areaServed: City` / `AdministrativeArea` (у района — `containedInPlace: City`), `@id` вида `.../gorod/berdsk#service-unichtozhenie-klopov` и ссылкой на страницу услуги через `url`;
- добавим `ItemList` услуг, чтобы гео-страница явно заявляла свой набор направлений.

Уникальность соблюдаем: `@id` привязаны к гео-URL, `areaServed` разный, каннибализации с `/services/{slug}` не создаём — `url` каждого `Service` ведёт на страницу услуги как на первоисточник.

### 3. Хабы и каталоги

`/uslugi/{slug}`, `/services`, `/category/dezinfekciya-novosibirsk`:

- `ItemList` перепишем на вложенные `Service` с `offers` (цена «от», валюта, наличие);
- на `/services` и хабах добавим `AggregateOffer` с реальным диапазоном цен по входящим услугам.

### 4. Карточки услуг в вёрстке

Компонент `ServiceCard` уже показывает цену «от». Отдельной микроразметки в HTML добавлять не будем — Google и Яндекс приоритетно читают JSON-LD, а дублирование в разметке карточек даёт риск расхождений. Соответствие «что видит пользователь = что в разметке» обеспечиваем тем, что и карточка, и JSON-LD берут цену из одного источника (`priceFrom`).

### 5. Проверка

- Расширим `src/lib/__tests__/headMarkup.test.ts`: на гео- и каталожных страницах обязателен `Service`, у каждого `Service` — `name`, `provider`, `areaServed`, корректный `Offer` с `priceCurrency: "RUB"` и числовой ценой; `@id` уникальны в пределах страницы; все `url` абсолютные.
- Новый тест сверяет цены в разметке с `SERVICES_INDEX` (защита от расхождения цены на странице и в сниппете).
- Прогоним рендер страниц через официальный валидатор Schema.org (как в прошлый раз) — целевое состояние 0 ошибок и 0 предупреждений.

## Технические детали

- Всё пишется в `head().scripts` внутри существующих `@graph` — новых механизмов управления head не вводим.
- Никаких выдуманных `aggregateRating`/`review` внутри `Service` (это нарушение правил Google для отзывов о самой организации).
- `priceFrom` отдаём как `minPrice` в `PriceSpecification`, а не как точный `price`, — цены у нас действительно «от», и точная цена определяется после осмотра.
