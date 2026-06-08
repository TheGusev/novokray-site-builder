# Аудит и доработка структуры под максимальное SEO/GEO

## Что уже работает (не трогаем)
- 13 услуг + 13 статей, dynamic-routes `services/$slug`, `blog/$slug`.
- `__root.tsx`: Organization + LocalBusiness + WebSite JSON-LD, areaServed для 6 городов области.
- Footer/Header перелинкованы со всеми услугами (group by category) и разделами.
- `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/llms-full.txt`, `/.well-known/ai.txt`.
- Пагинация блога (`?page=`), 404/error boundaries, canonical на leaf-роутах, breadcrumbs JSON-LD.
- `/karta-sayta` — человекочитаемая карта.

## Что доработаем

### 1. Гео-страницы городов области (главный рычаг для GEO)
Создаём 5 коммерческих посадочных под каждый город из `areaServed`:
- `src/routes/$city.tsx` через единый параметризованный роут с whitelist (`berdsk`, `iskitim`, `koltsovo`, `krasnoobsk`, `ob`).
- На каждой: H1 «Санитарная служба в {Город} — выезд из Новосибирска», список всех 13 услуг с локализованными ценами (+ надбавка за выезд если нужно — пока без), отзывы города, FAQ «работаете ли в {Город}», JSON-LD `LocalBusiness` с `areaServed: City` и `Service` с `areaServed`.
- Внутренняя перелинковка: блок «Города области» в footer + на главной.

Альтернатива (если проще): 5 отдельных файлов `berdsk.tsx`, `iskitim.tsx` и т.д. — выбираю именно так, потому что typed-routes TanStack для whitelisted-параметров сложнее, а 5 файлов = чёткий контроль контента.

### 2. Хабы категорий услуг
Сейчас есть только `/category/dezinfekciya-novosibirsk`. Добавим 4 хаба по группам из `services.ts`:
- `/uslugi/unichtozhenie-vrediteley` — клопы, тараканы, блохи, муравьи, осы, грызуны.
- `/uslugi/sanitarnaya-obrabotka` — дезинфекция, плесень.
- `/uslugi/obrabotka-uchastkov` — клещи, комары, борщевик.
- `/uslugi/spec-uslugi` — озон, сушка, фумигация, дезодорация.

Каждый хаб: H1 с гео, описание категории 80-120 слов, ServiceCard сетка, FAQ блок, JSON-LD `CollectionPage` + `ItemList`. Линкуется из меню «Услуги», footer, breadcrumbs у `services/$slug` (Главная → Категория → Услуга).

### 3. Связки блог ↔ услуги
- В `blog.$slug.tsx`: блок «Заказать услугу по теме» с карточками из `post.relatedServices` (поле уже есть в данных).
- В `services.$slug.tsx`: блок «Статьи по теме» — фильтруем `POSTS` где `relatedServices.includes(slug)`.
- В `index.tsx`: секция «Последние материалы» (3 свежих поста) — если ещё нет.

### 4. Sitemap.xml
Добавить отсутствующие индексируемые URL:
- `/privacy`, `/terms` (priority 0.2).
- 5 гео-страниц городов (priority 0.85).
- 4 хаба категорий (priority 0.85).
- `<xhtml:link rel="alternate" hreflang="ru-RU">` на каждый URL.

### 5. Пагинация блога — SEO-сигналы
- В `blog.index.tsx` `head()` динамически: добавить `?page=N` к canonical при N>1; `rel="prev"`/`rel="next"`; для N>1 — `title` суффикс «— Страница N», `robots: noindex,follow` на пустых страницах не нужно (есть `safePage` clamp).
- Текущая пагинация рендерит все номера — при росте >10 статей сделаем компактную (1 … N-1 N N+1 … last). Пока 13 постов / `POSTS_PER_PAGE` — 2 страницы, оставим как есть; добавим только rel-теги.

### 6. Перелинковка и UX-фиксы
- Breadcrumbs на `/blog/$slug` и `/services/$slug` уже включают категорию? — добавим категорию-хаб в путь для `/services/$slug`.
- В 404 (`NotFoundComponent`) добавить блок «Популярные услуги» (4 топа по `priority`) и поиск.
- Проверить и убрать любые `<a href="/...">` для внутренних роутов в пользу `<Link to>` (быстрый grep после правок).

### 7. robots.txt и canonical
- Текущий `robots.txt` ок. Добавим `Clean-param: utm_source&utm_medium&utm_campaign&yclid&gclid /` для Yandex.
- Проверить, что canonical на гео-страницах = свой URL, а не главная.

## Технические детали

**Файлы создать:**
- `src/routes/berdsk.tsx`, `iskitim.tsx`, `koltsovo.tsx`, `krasnoobsk.tsx`, `ob.tsx` (или единый `gorod.$slug.tsx` — решу при имплементации, склоняюсь к отдельным файлам).
- `src/routes/uslugi.unichtozhenie-vrediteley.tsx`, `uslugi.sanitarnaya-obrabotka.tsx`, `uslugi.obrabotka-uchastkov.tsx`, `uslugi.spec-uslugi.tsx`.
- `src/components/site/CityHero.tsx`, `src/components/site/CategoryHub.tsx` (общие шаблоны).
- `src/data/cities.ts` — словарь городов (slug, name, в/во, расстояние, fixture-отзыв).

**Файлы изменить:**
- `src/routes/sitemap[.]xml.ts` — добавить новые URL.
- `src/routes/blog.index.tsx` — rel prev/next, динамический title/canonical.
- `src/routes/blog.$slug.tsx` — блок related services.
- `src/routes/services.$slug.tsx` — блок related posts, breadcrumb с категорией.
- `src/routes/index.tsx` — секция «Города области», «Свежее в блоге» (если нет).
- `src/routes/karta-sayta.tsx` — добавить города и хабы.
- `src/components/site/Footer.tsx` — колонка/блок «Города области».
- `src/components/site/Header.tsx` — в попап услуг добавить ссылки на хабы категорий.
- `src/routes/__root.tsx` `NotFoundComponent` — топ-услуги.
- `public/robots.txt` — Clean-param.

**Без бэкенда.** Данные статические, форма лидов уже работает.

## Объём
~10 новых файлов, ~10 правок. После — все 13 услуг × 5 городов = 65 потенциальных коммерческих посадочных через гео-хабы + 4 категории + сильная внутренняя перелинковка.