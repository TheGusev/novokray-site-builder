## Текущее состояние (после аудита)

Уже реализовано в проекте:

- **`src/routes/sitemap[.]xml.ts`** — динамический sitemap покрывает все маршруты: `/`, `/services`, `/services/$slug` (×13), `/uslugi/$slug` (×4 хаба), `/gorod/$slug`, `/raion/$slug`, `/blog`, `/blog/$slug`, `/price`, `/faq`, `/contacts`, `/garantii`, `/o-kompanii`, `/category/dezinfekciya-novosibirsk`, `/karta-sayta`, `/privacy`, `/terms`. С `lastmod`, `changefreq`, `priority`.
- **`public/robots.txt`** — `Allow: /`, закрыты `/admin`, `/api/`, `/lovable/`, UTM/yclid/gclid, отдельные правила для GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, YandexGPT, Googlebot, директива `Sitemap:` и `Clean-param` для Яндекса.
- **Schema.org**:
  - `__root.tsx` — Organization, WebSite (SearchAction), LocalBusiness, AggregateRating.
  - `index.tsx` — FAQPage, ItemList, LocalBusiness + Review.
  - `services.$slug.tsx` — Service + Offer + HowTo + FAQPage + BreadcrumbList.
  - `services.index.tsx` — BreadcrumbList.
  - `uslugi.$slug.tsx` — CollectionPage + ItemList + BreadcrumbList.
  - `faq.tsx` — FAQPage.
  - `contacts.tsx` — ContactPage + BreadcrumbList.
  - `o-kompanii.tsx` — AboutPage + BreadcrumbList.
  - `garantii.tsx` — WebPage + BreadcrumbList.
  - `price.tsx` — OfferCatalog + AggregateOffer + BreadcrumbList.
  - `blog.$slug.tsx` — Article + BreadcrumbList.
  - `gorod.$slug.tsx`, `raion.$slug.tsx` — LocalBusiness + BreadcrumbList (+ FAQPage в городах).

Пагинации в проекте нет (блог/категории отдают полный список единым `ItemList`), поэтому правил под `?page=` в robots не требуется.

## Что добавить

1. **`src/routes/contacts.tsx`** — добавить отдельный блок `LocalBusiness` с `@id`, `telephone`, `email`, `address` (PostalAddress), `geo` (GeoCoordinates из `SITE.geo`), `openingHoursSpecification`, `areaServed` (Новосибирск + города), `priceRange`, `image`, `url`. Это нужно именно на странице контактов как первичный профиль бизнеса (сейчас LocalBusiness есть только в `__root.tsx` и привязан к WebSite).
2. **`src/routes/category.dezinfekciya-novosibirsk.tsx`** — добавить JSON-LD `CollectionPage` + `ItemList` со ссылками на все 13 услуг и `BreadcrumbList` (сейчас разметки на странице нет вообще).
3. **`src/routes/blog.index.tsx`** — добавить `Blog` + `BreadcrumbList` + `ItemList` со списком постов (сейчас разметки нет).
4. **`src/routes/karta-sayta.tsx`** — добавить `BreadcrumbList` + `SiteNavigationElement` (минимальный JSON-LD для навигационной карты).
5. **`src/routes/sitemap[.]xml.ts`** — мелкие правки:
   - `Entry.changefreq` типизировать union вместо `string` (для соответствия XSD-словарю sitemap).
   - В `<urlset>` добавить namespace `xmlns:xhtml` (заготовка под будущие hreflang, не обязательно, но безопасно).
6. **`public/robots.txt`** — без изменений по содержанию; навести порядок:
   - Сгруппировать секции с комментариями.
   - Подтвердить, что `Sitemap:` указывает на `https://dez-federation.ru/sitemap.xml` (уже да).

## Чего НЕ трогаю

- Существующий JSON-LD на страницах услуг/FAQ/гарантий/блога — там уже корректные типы.
- Структуру маршрутов и наполнение страниц.
- Картинки/тексты — задача только про SEO-разметку.

## Файлы под изменение

- `src/routes/contacts.tsx` — расширить блок JSON-LD объектом LocalBusiness.
- `src/routes/category.dezinfekciya-novosibirsk.tsx` — добавить `<script type="application/ld+json">` с CollectionPage/ItemList/BreadcrumbList.
- `src/routes/blog.index.tsx` — добавить JSON-LD Blog + ItemList + BreadcrumbList.
- `src/routes/karta-sayta.tsx` — добавить BreadcrumbList + SiteNavigationElement.
- `src/routes/sitemap[.]xml.ts` — узкий рефактор типа `changefreq` + namespace.

После внедрения SEO-ревью можно пересканировать кнопкой Rescan в SEO-панели.
