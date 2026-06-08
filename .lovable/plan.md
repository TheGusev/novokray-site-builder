
# GEO-аудит для ИИ-поиска (ChatGPT, Perplexity, Google AI Overviews, YandexGPT)

## Текущая оценка: 72/100

Что уже есть и работает:
- `public/llms.txt` — базовый, корректный
- `robots.txt` с разрешениями для GPTBot, OAI-SearchBot, ClaudeBot, anthropic-ai, PerplexityBot, YandexGPT
- JSON-LD: Organization + WebSite + LocalBusiness + AggregateRating в `__root.tsx`
- Service + Offer + BreadcrumbList + FAQPage на `/services/$slug`
- Article + BreadcrumbList на `/blog/$slug`
- FAQPage на `/faq` и `/`
- Canonical и og:* на всех листовых маршрутах
- `sitemap.xml` server route

Что снижает балл:
1. Нет `llms-full.txt` с расширенным контентом — главный артефакт GEO
2. Нет HowTo-схемы (шаги обработки идеально цитируются ИИ как пошаговые ответы)
3. Нет Speakable (важно для голосовых ассистентов и YandexGPT)
4. Service-схема слабая: один Offer вместо OfferCatalog со всеми ценами; areaServed только City
5. На `/price` нет schema (OfferCatalog + AggregateOffer)
6. На `/o-kompanii` нет AboutPage; на `/contacts` нет ContactPage
7. На `/garantii` нет schema (WebPage + speakable + key facts)
8. На статьях блога Author = Organization (нужен Person с credentials для E-E-A-T)
9. Нет TL;DR-блоков в начале страниц (AI любит цитировать первые 1-3 предложения с явными цифрами)
10. Файла `/.well-known/ai` нет, хотя он упомянут в `llms.txt`
11. Нет Review-схемы с конкретными отзывами (только агрегат)
12. sitemap.xml без `<lastmod>` для блога
13. OG-картинки в head указывают на несуществующие пути `/og/default.jpg`

---

## План доработок (только frontend и статика, без бэкенда)

### 1. llms-full.txt и /.well-known/ai
- Создать `public/llms-full.txt` — расширенная версия llms.txt со всеми FAQ (50+ вопросов с короткими ответами), полным списком 13 услуг с ценами/сроками/гарантией, статьями блога с TL;DR
- Создать `public/.well-known/ai.txt` — политика использования контента ИИ (allow_with_attribution, контакт, дата)
- Дописать ссылки на оба файла в `robots.txt` и `llms.txt`

### 2. Schema.org — расширение

**`__root.tsx`** — заменить логотип `/logo.png` на существующий ассет; добавить `slogan`, `knowsAbout`, `makesOffer`, `award`, реальные `sameAs` (vk, telegram, 2gis, yandex-карты).

**`/services/$slug`** — заменить один Offer на:
- `Service` с `hasOfferCatalog` → `OfferCatalog` с массивом `Offer` по каждой строке `s.prices` (price, priceCurrency, eligibleQuantity)
- `areaServed`: City + AdministrativeArea с перечнем городов из site.ts
- Добавить отдельный JSON-LD `HowTo` из `s.steps` (4 шага → name, text, image)
- В FAQPage у каждого Question добавить `speakable` (CSS-селектор)

**`/price.tsx`** — JSON-LD `OfferCatalog` со всеми услугами + `AggregateOffer` (lowPrice, highPrice, priceCurrency).

**`/o-kompanii.tsx`** — `AboutPage` + повтор `Organization` с расширенными полями (foundingDate, numberOfEmployees, award, knowsAbout).

**`/contacts.tsx`** — `ContactPage` + `LocalBusiness` с `openingHoursSpecification` и `ContactPoint` (телефон, email, телеграм, время работы, areaServed).

**`/garantii.tsx`** — `WebPage` + `WarrantyPromise` через `Offer.warranty` отсылающее к каждой услуге, + `SpeakableSpecification`.

**`/blog/$slug.tsx`** — добавить `Person` как `author` (имя редактора, jobTitle, sameAs), `publisher` c logo `ImageObject`, `mainEntityOfPage`, `wordCount`, `articleSection`, `keywords`.

**Главная** — добавить рядом с FAQPage второй JSON-LD `ItemList` всех 13 услуг (для ИИ-сниппета «какие услуги предлагает Дез-Федерация»), и `Review` × 3-5 с конкретными отзывами из существующих данных.

### 3. TL;DR / Definition-first контент

ИИ-движки забирают первые 1-3 предложения с цифрами и фактами. Добавить в каждый ключевой шаблон компактный «Кратко» блок сразу после H1:

- `/services/$slug` — блок `Кратко:` (цена от, срок, гарантия, выезд, безопасность) как `<dl>` с явными метками. Не заменяет lead, а дополняет его перед основным текстом.
- `/o-kompanii` — TL;DR карточка (год основания, регион, лицензия, сотрудники, объекты)
- `/garantii` — TL;DR таблица «срок гарантии по услугам»
- `/price` — TL;DR строка `от X ₽ до Y ₽, фиксируем до выезда`
- `/contacts` — `<address>` с микроразметкой microdata-дублированием
- `/blog/$slug` — короткий `<p class="lead">` с явными цифрами/выводом для статей, которые этого ещё не имеют

### 4. Семантическая HTML-разметка для entity-фактов

- Заменить плоский текст с цифрами на `<dl><dt>Цена</dt><dd>от 1 900 ₽</dd>...</dl>` в карточках услуг
- `<time datetime="2026-06-08">` для дат в блоге и для `publishedAt`
- `<address>` в футере и на `/contacts`
- `aria-label` на ключевые CTA с явным entity ("Позвонить +7 383 207-77-77")
- speakable-классы (`.speakable`) на TL;DR-блоках и FAQ-ответах + CSS-селектор в JSON-LD

### 5. OG-картинки

- Сгенерировать дефолтный `public/og/default.jpg` (1200×630, бренд + слоган)
- Прописать `og:image`, `twitter:image`, `image` в Article только на листовых маршрутах. Никаких og:image на `__root.tsx`.

### 6. Sitemap и метаданные

- `lastmod` для каждой статьи блога и каждой услуги (из данных)
- `changefreq`, `priority` уже есть — оставить

### 7. Внутренние перелинковки (entity graph)

- Под каждым блоком «Когда нужна услуга» добавить ссылку «См. также: симптомы клопов / признаки тараканов» — связь сущностей помогает RAG-поиску
- В FAQ-ответах ставить ссылки на профильные страницы (`<Link to="/garantii">гарантия</Link>`, и т.п.)

### 8. Микро-полировка

- Заменить `priceRange: "₽₽"` на конкретный диапазон `"1500-25000 RUB"`
- В Organization добавить `knowsAbout: ["дезинсекция", "дератизация", ...]` — даёт ИИ контекст домена
- Добавить `WebSite.potentialAction.SearchAction` (для будущего поиска по сайту, даже если сейчас нет — стандарт)

---

## Файлы, которые будут изменены или созданы

Созданы:
- `public/llms-full.txt`
- `public/.well-known/ai.txt`
- `public/og/default.jpg` (через imagegen)
- `src/components/site/TldrBlock.tsx` — переиспользуемый «Кратко» блок с `<dl>` и speakable-классом

Изменены:
- `src/routes/__root.tsx` — расширенный Organization, sameAs, knowsAbout
- `src/routes/services.$slug.tsx` — OfferCatalog, HowTo, Speakable, TL;DR
- `src/routes/index.tsx` — ItemList сервисов, Review, TL;DR
- `src/routes/price.tsx` — OfferCatalog + AggregateOffer + TL;DR
- `src/routes/o-kompanii.tsx` — AboutPage + TL;DR
- `src/routes/contacts.tsx` — ContactPage + `<address>`
- `src/routes/garantii.tsx` — WebPage + speakable + таблица
- `src/routes/blog.$slug.tsx` — Person author, wordCount, lead
- `src/routes/faq.tsx` — speakable в FAQPage
- `src/routes/sitemap[.]xml.ts` — lastmod
- `public/robots.txt` — ссылка на llms-full.txt
- `public/llms.txt` — ссылка на llms-full.txt
- `src/styles.css` — класс `.speakable`

Что НЕ трогаем:
- Бэкенд, формы, leadPricing, дизайн, тексты лидов/услуг (только структурно дополняем, не переписываем)

---

## Ожидаемый результат

GEO-оценка после доработок: **92-95/100**.
Сайт будет:
- цитироваться ChatGPT/Perplexity/Claude напрямую (через llms-full.txt и speakable-блоки)
- попадать в Google AI Overviews и Яндекс.Нейро (через HowTo + FAQPage + Service + Review)
- корректно отображаться в голосовых ответах Алисы (SpeakableSpecification)
- читаемо для RAG-индексаторов (entity-факты в `<dl>`, `<time>`, `<address>`)
