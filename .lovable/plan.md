## Полный аудит сайта Дез-Федерация.ру

Проверил роутинг, перелинковку, sitemap, robots, JSON-LD, мета-теги, заголовки, доступность, мобильную версию и коммерческие посадочные. Структура в целом сильная (13 услуг + 4 хаба + 5 городов + 12 статей + commercial pages). Ниже — список реальных проблем и план их устранения.

---

### Найденные проблемы (по приоритету)

**Критичные (ломают SEO/Schema/шеринг):**
1. `public/og/default.jpg` и `public/logo.png` — указаны в JSON-LD (Organization.logo, LocalBusiness.image, Article.publisher.logo), но **файлов нет**. Google Rich Results будет ругаться, превью в соцсетях битое.
2. Нет `favicon.ico`, `apple-touch-icon.png`, `site.webmanifest`, `theme-color` icon — теряем брендинг во вкладках и PWA-сигналы.
3. Нет `og:image` ни на одной странице (ни в `__root.tsx`, ни на лифах). При шеринге в Telegram/VK/WhatsApp превью без картинки.
4. На листовых страницах услуг (`services/$slug`) и статьях (`blog/$slug`) `og:image` не подставляется из карточек — теряем CTR в соцсетях.
5. `AggregateRating` в JSON-LD (Organization + каждый /gorod/$slug) **без реальных опубликованных отзывов на странице** — нарушает Google Review Snippet policy, риск manual action.

**Важные (теряем трафик/доверие):**
6. `Header` не содержит ссылку на `/faq` — а это сильная информационная посадочная (FAQPage schema). Пользователи и боты находят её только через футер.
7. Footer `"Реквизиты"` ведёт на `/contacts` — семантически неверно (реквизиты ≠ контакты). Либо добавить блок реквизитов на `/contacts`, либо убрать ссылку.
8. Внешние соц-ссылки в Footer (`vk`, `telegram`, `whatsapp`) без `target="_blank"` и `rel="noopener noreferrer"` — небезопасно и плохо для UX.
9. На `/gorod/$slug` хлебная крошка `position 2 "Города области"` ведёт на сам же `/gorod/$slug` (циклическая ссылка) — должна быть на родительский хаб (например `/` или новый `/gorod` индекс).
10. WhatsApp-номер (+7 913…) отличается от телефона компании (+7 383…) и не отражён в JSON-LD `contactPoint` — пользователь видит несоответствие.
11. `priceRange: "1500–25000 RUB"` использует em-dash и слово RUB — корректный формат Schema.org `"₽₽"` или `"1500-25000"`.
12. Robots.txt: блоки `Disallow: /admin`, `/cart`, `/checkout`, `/account`, `/login` для несуществующих путей — мусор, путает Search Console.

**Полезные доработки:**
13. Нет страницы-индекса `/gorod` (хаб всех городов области) — потеряна перелинковка городов между собой.
14. Главная не имеет блока «Ближайшие выезды» или «Последние отзывы» с реальными цитатами — поддержит `AggregateRating`.
15. Нет 301-редиректов `index.html`, `/index`, путей со слешем в конце — TanStack обычно справляется, но стоит проверить `/services/` → `/services`.
16. `sitemap.xml`: нет блока изображений (`<image:image>`) и нет `<lastmod>` синхронизированного с реальной датой правки статьи (сейчас всё `today`).
17. `karta-sayta.tsx` — внутренние ссылки на `/sitemap.xml`, `/robots.txt`, `/llms.txt` сделаны через `<a href>` (это правильно для не-route файлов — оставляем).
18. Скрипт Google Fonts грузится блокирующе; есть `display=swap` — ок, но можно вынести в `preload` для LCP.

---

### План правок

#### 1. OG/брендинг ассеты (фундамент)
- Сгенерировать `public/og/default.jpg` (1200×630, фирменный градиент + лого + «Санитарная служба №1 в Новосибирске»).
- Сгенерировать `public/og/services.jpg`, `public/og/blog.jpg`, `public/og/gorod.jpg`, `public/og/contacts.jpg` (по одному шаблону для разных разделов).
- Сгенерировать `public/logo.png` (512×512, прозрачный фон, бренд-цвет).
- Создать `public/favicon.ico`, `public/apple-touch-icon.png` (180×180), `public/site.webmanifest`.
- В `__root.tsx` добавить `<link rel="icon">`, `apple-touch-icon`, `manifest`, дефолтный `og:image` + `twitter:image`.

#### 2. Per-page og:image
- `services.$slug.tsx`: подставить `og:image` из `s.image` (если нет — `/og/services.jpg`).
- `blog.$slug.tsx`: подставить `og:image` из `p.cover` (если нет — `/og/blog.jpg`); добавить поле `cover?: string` в `Post`.
- `gorod.$slug.tsx`, `uslugi.$slug.tsx`, `category.*`, `price`, `garantii`, `o-kompanii`, `faq`, `contacts`, `blog.index`, `services.index`: дефолтные OG-картинки разделов.

#### 3. JSON-LD чистка
- Убрать `AggregateRating` из `Organization`/`LocalBusiness` в `__root.tsx` и `/gorod/$slug` **до момента**, когда на странице появится виджет отзывов с реальными цитатами. Альтернатива: добавить блок «Отзывы клиентов» на главную и в /gorod/$slug (минимум 5 цитат с авторами и датами) и сохранить AggregateRating.
- Поправить `priceRange` на `"1500-25000"` (без RUB, без em-dash).
- В `/gorod/$slug` BreadcrumbList: `position 2` → «Главная → Зона выезда → Город», ведёт на якорь главной `#region` (или на новый `/gorod`).

#### 4. Навигация и перелинковка
- В `Header` (десктоп + мобильный Sheet) добавить ссылку «FAQ» (`/faq`) и «Карта сайта» (мобильный).
- В Footer: убрать «Реквизиты» или сделать редирект на блок `#rekvizity` на `/contacts` (добавить блок реквизитов: ИНН/ОГРН/р.счёт).
- Соц-ссылки: добавить `target="_blank" rel="noopener noreferrer"`.
- Создать `src/routes/gorod.index.tsx` — хаб «Зона выезда: Новосибирск и область» с карточками 5 городов, картой/радиусом, общим LocalBusiness + ItemList. Добавить в sitemap, в карту сайта и в навигацию Footer.

#### 5. Контакты и телефония
- Добавить WhatsApp-номер во второй `contactPoint` в Organization JSON-LD (`contactType: "WhatsApp"`).
- На странице `/contacts` рядом с телефоном явно указать оба номера + назначение.

#### 6. Sitemap.xml
- В `entries` блогпостов использовать `p.date` (это уже сделано — проверить).
- Добавить `<image:image>` namespace и `<image:loc>` для статей с обложками и страниц услуг с превью.
- Добавить новый `/gorod` (если будет создан).
- Удалить из sitemap записи на 404 (privacy/terms ок, остаются).

#### 7. Robots.txt
- Удалить `Disallow: /cart`, `/checkout`, `/account`, `/login` (на сайте нет).
- Оставить `Disallow: /admin`, `/api/` — превентивно ок.
- Дополнительно `Disallow: /lovable/`.

#### 8. UX/CRO для лидерства в регионе
- На главной добавить блок «Отзывы клиентов» (5–8 цитат с городом и датой) — поддержит AggregateRating и социальное доказательство.
- На `/gorod/$slug` добавить блок «Кейсы выезда в {город}» (2–3 коротких кейса) + локальный отзыв.
- В `services.$slug` под FAQ добавить блок «Заказать в другом городе области» с 5 ссылками `/gorod/$slug`.
- Добавить sticky CTA «Позвонить» на мобильном (фикс-кнопка внизу) — увеличит конверсию.

#### 9. Технические мелочи
- Проверить `<a href="/">` в ErrorComponent — оставить как есть (boundary fallback).
- Все внешние `<a>` — добавить `rel="noopener"`.
- Проверить, что `services/$slug` редиректит trailing slash (TanStack по умолчанию ок).
- В `__root.tsx` добавить `<link rel="preload" as="image" href="/og/default.jpg">` для LCP главной (если будет использоваться в hero).

---

### Файлы, которые буду менять

**Создать:** `public/favicon.ico`, `public/apple-touch-icon.png`, `public/site.webmanifest`, `public/logo.png`, `public/og/default.jpg`, `public/og/services.jpg`, `public/og/blog.jpg`, `public/og/gorod.jpg`, `src/routes/gorod.index.tsx`, `src/components/site/Reviews.tsx`, `src/components/site/StickyCallCta.tsx`, `src/data/reviews.ts`.

**Править:** `src/routes/__root.tsx` (favicons + og:image + убрать/доработать AggregateRating + priceRange), `src/components/site/Header.tsx` (+FAQ), `src/components/site/Footer.tsx` (rel/target соц-ссылок, реквизиты, блок «гарантия выезда по области»), `src/routes/services.$slug.tsx` (og:image), `src/routes/blog.$slug.tsx` (og:image + cover в данных), `src/routes/gorod.$slug.tsx` (breadcrumbs fix, локальный кейс, опц. убрать AggregateRating), `src/routes/index.tsx` (блок отзывов, sticky CTA wrap), `src/routes/contacts.tsx` (реквизиты + два телефона), `src/routes/sitemap[.]xml.ts` (новый /gorod, image:image), `public/robots.txt` (чистка), `src/data/blog.ts` (поле cover), `src/data/site.ts` (whatsappContactType).

**Не трогаю:** `src/routeTree.gen.ts` (авто), коммерческие тексты услуг (отдельно по запросу), бизнес-логику форм.

### Что хочу уточнить перед стартом

Один развилочный момент: блок «Отзывы клиентов» с **реальными цитатами/именами/датами** — оставить ли пока **шаблонные** (5 примеров с пометкой «отзыв клиента, имя изменено») или вы дадите 5–10 настоящих отзывов из CRM/2GIS? От этого зависит, сохраняем ли `AggregateRating` в JSON-LD (Google запрещает разметку без видимых отзывов на странице).
