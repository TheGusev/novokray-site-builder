# Аудит проекта dez-federation.ru

## Общая оценка

Проект технически зрелый: централизованные данные (`SITE`, `SERVICES`, `CITIES`), 50 постов блога с тегами/гео/категориями, schema.org на всех ключевых страницах, корректный robots.txt с AI-политикой, рабочий PDF-генератор договоров. Реквизиты, телефоны, Telegram, MAX — везде единообразны (берутся из `SITE`).

Архитектура чистая, серьёзных багов нет. Все основные роуты (`/services`, `/blog`, `/garantii`, `/contacts`, `/gorod/*`, `/raion/*`, `/uslugi/*`) на месте, перелинковка работает, формы и алерты корректны.

Ниже — список конкретных найденных проблем и план их исправления.

---

## Что планирую исправить

### 🔴 Критично

**1. Захардкоженный устаревший номер лицензии**
- `src/routes/index.tsx:61` → `"№ 54.НС.01.000 от 2014 г."`
- `src/routes/gorod.$slug.tsx:175` → `"Лицензия Роспотребнадзора № 54.НС.01.000"`

Заменю на актуальный `SITE.legal.licenseNo` = `54.НС.01.003.Л.000080.11.25` (от 14.11.2025).

**2. Относительные `og:url` и `canonical` на всех страницах**

OpenGraph-спецификация требует абсолютный URL; относительный canonical хуже индексируется. В 8+ роутах (`index`, `services.index`, `blog.index`, `garantii`, `contacts`, `o-kompanii`, `faq`, `price`, `terms`, `privacy`, `karta-sayta`, `category.dezinfekciya-novosibirsk`, `services.$slug`, `uslugi.$slug`, `gorod.$slug`, `raion.$slug`, `docs.$slug`, `blog.$slug`) заменю:
```
content: "/path"  →  content: `${SITE.domain}/path`
href:    "/path"  →  href:    `${SITE.domain}/path`
```

### 🟠 Высокий

**3. `/docs/$slug` отсутствует в sitemap**

Маршрут существует (`/docs/dogovor`, `/docs/akt-vypolnennyh-rabot`, `/docs/zhurnal-sanpin`, `/docs/sertifikat-dezinfekcii`), на него ссылаются из блога и `/garantii`. Добавлю в `src/routes/sitemap[.]xml.ts` через `DOCS` из `src/data/docs.ts`.

**4. Пагинация блога индексируется как дубль**

В `src/routes/blog.index.tsx` `hasFilter` срабатывает только на `cat`. Расширю на все query-параметры (`page > 1`, `geo`, `hf`, `tag`, `q`) → отдавать `robots: noindex, follow` для всех вариантов кроме `/blog`. Дополнительно добавлю `Disallow: /blog?page=` в `public/robots.txt`.

**5. Опечатка в slug поста**

`src/data/blog.ts:811` — `slug: "sherzhni-opasnost-i-udalenie"` → правильно `"shershni-opasnost-i-udalenie"`. Заодно проверю все внутренние ссылки на этот slug и обновлю.

### 🟡 Средний

**6. Сломанный bullet в блоге**

`src/data/blog.ts:706` — строка начинается с `|` (рендерится как сломанная таблица). Заменю `|` на `-`.

**7. Тег для единообразия**

В посте про шершней `tags: ["шершни", "опасность"]` — заменю `"опасность"` на `"удаление"` (соответствует стилю остальных тегов).

---

## Что НЕ трогаю

- **Контракт-билдер** `/dogovor/zapolnit` — работает корректно, реквизиты подтягиваются из `SITE.legal`. UX по `masterFio` оставлю как есть (поле необязательное по дизайну — мастер может быть назначен позже).
- **Параллельные `/uslugi/$slug` (хабы) и `/services/$slug` (листы)** — это сознательная архитектура, slugs не пересекаются.
- **Контент 50 постов** — стиль и грамматика в норме, кроме п.5–7 выше.
- **robots.txt** в части AI-ботов и UTM — всё корректно.

---

## Технические детали

**Файлы под изменение:**
- `src/routes/index.tsx` — лицензия
- `src/routes/gorod.$slug.tsx` — лицензия
- `src/routes/sitemap[.]xml.ts` — добавить DOCS
- `src/routes/blog.index.tsx` — расширить `hasFilter`
- `src/data/blog.ts` — slug, символ `|`, тег
- `public/robots.txt` — `Disallow: /blog?page=`
- Все head()-роуты — абсолютные URL в canonical/og:url (~18 файлов, мелкие правки по 2 строки)

**Что НЕ создаётся**: новых файлов нет, новых зависимостей нет.

**Проверка после правок**: re-grep по `54.НС.01.000`, `content: "/`, `href: "/` в src/routes/, `sherzhni` — должны не находиться. Сборка должна пройти без ошибок.
