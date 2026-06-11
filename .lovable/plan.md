## Цель
Сделать из блога настоящую «библиотеку» санитарной службы НСК/НО: **50 реальных статей** с упором на Новосибирск и область, рубрикацией, скачиваемыми документами, законами/СанПиНами/препаратами, AI-friendly структурой и полной schema-разметкой. Главная блога — навигация уровня «зашёл и сразу нашёл».

---

## 1. Контент-модель `src/data/blog.ts`

Расширить `BlogPost`:
```ts
interface BlogPost {
  slug; title; excerpt; body;            // существующие
  date; readMin; tags; relatedServices;  // существующие
  category: BlogCategory;                // NEW — для рубрикации
  hf: "ВЧ" | "СЧ" | "НЧ";                // частота запроса (для бейджа)
  h2: { id: string; title: string }[];   // авто-TOC, парсится из body
  faq?: { q: string; a: string }[];      // для FAQPage JSON-LD
  sources?: { label: string; url: string }[]; // СанПиНы/законы
  relatedDocs?: string[];                // slugs из DOCS (для блока «Скачать»)
  updatedAt?: string;                    // dateModified
  geo?: "novosibirsk" | "oblast" | "both";
}
```

Body переходит на лёгкий markdown: `## H2`, `### H3`, списки `- `, таблицы `| a | b |`, callout `> ⚠️`, ссылки `[текст](/url)`. Парсер — простой in-house рендерер (без зависимостей), потому что библиотеки markdown тянут лишнее в SSR.

### Рубрики (8 категорий)
1. **Насекомые в квартире** — клопы, тараканы, муравьи, блохи, моль, мокрицы, чешуйницы (12)
2. **Грызуны** — крысы, мыши, кроты (5)
3. **Участок и дача** — клещи, осы/шершни, борщевик, мошка/комары, медведка, тля (8)
4. **Плесень и грибок** — ванная, подвал, после потопа, чёрная/белая, кондиционер (5)
5. **Запахи и воздух** — озонирование квартир/авто/общепита, дезодорация, гарь, табак (5)
6. **После ЧС** — затопление, пожар, после умершего, после животных (4)
7. **Бизнес и СанПиН** — общепит, школы/сады, гостиницы, УК/ТСЖ, склады, медицина (6)
8. **Препараты и технологии** — горячий/холодный туман, барьерная, микрокапсулы, акарициды, родентициды (5)

### 50 статей (слаги)
**Насекомые:** `kak-otlichit-ukus-klopa` (есть), `priznaki-zarazheniya-klopami`, `klopy-v-divane-chto-delat`, `tarakany-v-novostroyke` (есть), `ryzhie-i-chernye-tarakany-razlichiya`, `pochemu-tarakany-vozvraschayutsya`, `muravi-v-kvartire-novosibirsk`, `faraonovy-muravi-kak-vyvesti`, `blohi-iz-podvala` (есть), `koshachi-blohi-v-kvartire`, `pischevaya-mol-na-kuhne`, `cheshuynitsy-v-vannoy`.

**Грызуны:** `krysy-v-chastnom-dome-nsk`, `myshi-na-dache-zimoy`, `kroty-na-uchastke-borba`, `kak-najti-myshinoe-gnezdo`, `deratizatsiya-skladov-trebovaniya`.

**Участок:** `obrabotka-uchastka-vesnoy` (есть), `kleshchi-v-akademgorodke-statistika`, `entsefalitnyy-kleshch-pervaya-pomosch`, `osy-na-balkone` (есть), `sherzhni-opasnost-i-udalenie`, `borschevik-na-dache` (есть), `moshka-i-komary-v-novosibirske`, `obrabotka-bazy-otdyha-ob`.

**Плесень:** `plesen-v-vannoy-prichiny` (есть), `plesen-v-podvale-mnogokvartirnogo-doma`, `plesen-posle-zatopleniya`, `chernaya-plesen-vred-dlya-zdorovya`, `plesen-v-konditsionere-avto-i-doma`.

**Запахи:** `ozonirovanie-avto-zachem` (есть), `ozon-protiv-virusov` (есть), `kak-ubrat-zapakh-gari-posle-pozhara`, `dezodoratsiya-posle-zhivotnyh`, `zapakh-tabaka-v-arendnoy-kvartire`.

**ЧС:** `zatopili-sosedi-chto-delat` (есть), `sushka-posle-zatopleniya-skolko-stoit`, `obrabotka-kvartiry-posle-umershego`, `obrabotka-posle-pozhara-pervye-shagi`.

**Бизнес/СанПиН:** `deratizatsiya-v-kafe` (есть), `dezinfektsiya-v-detskom-sadu-sanpin`, `obrabotka-gostinits-trebovaniya`, `dezinfektsiya-dlya-uk-i-tsg`, `dogovor-na-dezinsektsiyu-obrazets`, `zhurnal-sanpin-kak-vesti`.

**Препараты/технологии:** `goryachiy-tuman-vs-holodnyy`, `barernaya-obrabotka-chto-eto`, `mikrokapsulirovannye-preparaty-2026`, `akaritsidy-spisok-i-otlichiya`, `rodentitsidy-bezopasnost-dlya-detey-i-zhivotnyh`.

Тело каждой статьи — 5–8 H2-секций: «Кратко», «Признаки/Причины», «Что говорит закон/СанПиН» (где уместно), «Как делаем мы в НСК», «Препараты», «Сколько стоит в Новосибирске», «FAQ», «Скачать документы». Длина — 500–900 слов, реалистичные данные (нормативка существует, цифры — из текущего сайта).

Дата `2025-09` → `2026-06` равномерно. `readMin` = round(words/180).

---

## 2. Маппинг обложек `src/data/images.ts`

42 новых поста — реальных файлов в `src/assets/` хватит не на всех. Стратегия: **переиспользуем 12 существующих `blog-*.jpg` + 14 сервисных `svc-*.jpg` тематически** (например, `obrabotka-kvartiry-posle-umershego` → `svc-dezinfekciya.jpg`, `goryachiy-tuman-vs-holodnyy` → `svc-fumigaciya.jpg`). Каждый slug получает запись в `BLOG_COVERS` и `BLOG_IMAGE_META` (уникальный alt+title). Перегенерация картинок — **не делаем** (запрет из прошлых итераций).

---

## 3. Markdown-рендерер `src/lib/mdx-lite.tsx`

Чистая функция `renderBody(body: string): ReactNode[]`:
- `## ...` → `<h2 id={slugify}>` (заодно собираем TOC),
- `### ...` → `<h3>`,
- `- ` → `<ul><li>`,
- `| a | b |\n|---|---|\n| c | d |` → `<table>`,
- `> ` → callout-блок с иконкой,
- `[t](u)` → `<Link>` если внутренняя ссылка, `<a>` если внешняя,
- абзацы — `<p>`.

Без сторонних зависимостей, ~80 строк.

---

## 4. UI: «Библиотека» `src/routes/blog.index.tsx`

Полная переразметка списка, дизайн в духе библиотечного каталога:

```text
┌─────────────────────────────────────────────────┐
│ HERO: «Библиотека санитарной службы НСК»        │
│ поиск по статьям + счётчик «50 материалов»      │
├──────────────┬──────────────────────────────────┤
│ СТЕЛЛАЖИ      │ ВЫБОР РЕДАКЦИИ (3 pillar-статьи) │
│ ▸ Насекомые 12│ карточки 16:10 крупные           │
│ ▸ Грызуны 5   ├──────────────────────────────────┤
│ ▸ Участок 8   │ ВСЕ СТАТЬИ — фильтр по рубрике    │
│ ▸ Плесень 5   │ + по геo (Новосибирск / область)  │
│ ▸ Запахи 5    │ + по частоте (ВЧ/СЧ/НЧ бейдж)     │
│ ▸ ЧС 4        │ грид 3×N с превью+meta+тегами     │
│ ▸ СанПиН 6    │                                  │
│ ▸ Препараты 5 ├──────────────────────────────────┤
│ ОБЛАКО ТЕГОВ  │ ДОКУМЕНТЫ К СКАЧИВАНИЮ (4 PDF)    │
└──────────────┴──────────────────────────────────┘
```

- Фильтр по категории/гео/частоте — клиентский, через `useSearch` (query-параметры `?cat=&geo=&hf=`).
- Поиск — простой substring по title+excerpt+tags, без бэка.
- Пагинация остаётся (POSTS_PER_PAGE=12), сбрасывается при смене фильтра.
- Бейджи: рубрика (цвет рубрики), `ВЧ/СЧ/НЧ`, гео-метка «НСК»/«НО».
- Дизайн: тёплая «бумажная» подложка для сайдбара (semantic token `--paper`), карточки как книги на полке, hover поднимает на 2px и подсвечивает корешок (border-l-4 primary).

---

## 5. UI: страница статьи `src/routes/blog.$slug.tsx`

- **Левая колонка (sticky на ≥lg):** TOC, собранный из H2.
- **Центр:** обложка → H1 → метабар (дата, обновлено, читать N мин, рубрика, гео) → лид-блок (excerpt) → markdown-body → блок «Скачать документы» (карточки PDF из `relatedDocs`) → FAQ (если есть) → блок «Источники» (СанПиНы/законы, внешние ссылки `rel="nofollow noopener"`).
- **Правая колонка (sticky):** мини-LeadForm + «По теме статьи» (services).
- Низ: «Читайте также» (3 из той же рубрики, fallback — latest), «Услуги по теме».
- Подсветка `prose-content` через `@tailwindcss/typography`-стили в `styles.css` (без плагина — свои `.prose-content h2/h3/ul/table/blockquote`).

---

## 6. Schema.org / AI-выдача

Per статья в `head().scripts`:
- `Article` (+`image`, `author`, `publisher`, `wordCount`, `inLanguage`, `articleSection`=category, `keywords`, `dateModified`).
- `BreadcrumbList` (Главная → Блог → Рубрика → Статья).
- `FAQPage` — если есть `faq[]`.
- `HowTo` — для практических инструкций («первая помощь», «как удалить гнездо», «подготовка к обработке»).

Per `/blog`:
- `Blog` + `ItemList` (все 50), `BreadcrumbList`, `CollectionPage`.
- Per рубрика (`?cat=`) — `noindex` для фильтрованных URL (canonical → `/blog`).

В `__root.tsx` уже есть Organization — не дублируем.

`speakable` cssSelector расширяем: `.speakable, .prose-content h2, .prose-content p:first-of-type`.

---

## 7. SEO infrastructure

- **`src/routes/sitemap[.]xml.ts`** — после расширения POSTS попадёт автоматически (уже мапится). Добавим `<lastmod>` из `updatedAt ?? date` и `priority` 0.7 для статей.
- **`public/robots.txt`** — добавить `Disallow: /blog?` блокировку фильтрованных URL (фильтр-страницы — noindex через canonical, но дополнительно блокируем краулинг параметров, чтобы не растрачивать crawl-budget).
- **`public/llms.txt` / `llms-full.txt`** — пересобрать списком 50 статей (slug + title + excerpt + URL). Это и есть «оптимизация под ИИ-выдачу».
- **`src/routes/karta-sayta.tsx`** — секция блога уже мапит POSTS, ничего не меняем кроме группировки по рубрикам.

---

## 8. Design tokens

В `src/styles.css` добавить:
- `--paper: oklch(0.97 0.01 80)` — фон сайдбара-«библиотеки»;
- `--shelf-line: oklch(0.85 0.02 60)`;
- `--cat-color-{1..8}` — 8 рубричных цветов (мягкие, не кричащие);
- `--hf-vch / --hf-sch / --hf-nch` — бейджи частотности (зелёный/жёлтый/серый).

Все цвета — semantic tokens, никаких хардкодов в компонентах.

---

## 9. Чего НЕ делаем
- **Не генерируем новые изображения** — переиспользуем существующие.
- **Не создаём новые PDF** — используем 4 имеющихся (`dogovor`, `zhurnal-sanpin`, `akt`, `sertifikat`).
- **Не подключаем CMS** — статьи остаются в `src/data/blog.ts` (статика, edge-friendly).
- **Не вводим i18n** — только русский.
- **Не выдумываем нормативку** — ссылаемся на реальные: СанПиН 2.3/2.4.3590-20, СанПиН 3.5.2.3472-17 (дезинсекция), СанПиН 3.3686-21 (санэпид), ФЗ-52 «О сан-эпид благополучии», МУ 3.5.2.1759-03.

---

## 10. Порядок реализации
1. Тип `BlogPost` + 50 объектов в `src/data/blog.ts` (главный объём текста).
2. Дополнить `BLOG_COVERS` + `BLOG_IMAGE_META` на 38 новых слагов в `src/data/images.ts`.
3. `src/lib/mdx-lite.tsx` — рендерер.
4. Дизайн-токены в `src/styles.css`.
5. Переразметка `src/routes/blog.index.tsx` (библиотека + фильтры).
6. Переразметка `src/routes/blog.$slug.tsx` (TOC + markdown + FAQ + docs + sources).
7. Schema: Article/BreadcrumbList/FAQPage/HowTo, расширение в обоих файлах.
8. `public/llms.txt` + `llms-full.txt` пересборка.
9. `public/robots.txt` — `Disallow: /blog?`.
10. Smoke-check: открыть `/blog`, `/blog/kak-otlichit-ukus-klopa`, `/blog?cat=plesen`, `/sitemap.xml`.

---

## Проверка качества контента
Перед коммитом каждой статьи внутренний чек: реальный СанПиН/закон существует → ссылка ведёт на consultant.ru/garant.ru/rospotrebnadzor.ru; названия препаратов — реальные действующие вещества (фипронил, дельтаметрин, циперметрин, лямбда-цигалотрин, бромадиолон); цены коррелируют с `src/data/services.ts`; температуры/сроки/дозировки — реалистичные для НСО.
