
# Переход на статический сайт для Beget (public_html)

## Анализ ситуации

Текущий проект — TanStack Start в SSR-режиме (Nitro + Cloudflare Worker таргет). На Beget shared hosting нет Node.js runtime, есть только Apache + PHP 5.6, поэтому `.output/server` работать не будет. Нужна полная статика + `.htaccess`.

Что мешает «просто собрать статику»:

1. **Серверные обработчики** (нужно перенести в build-time генерацию файлов):
   - `src/routes/sitemap[.]xml.ts` → статический `public/sitemap.xml`
   - `src/routes/yandex-recrawl[.]txt.ts` → статический `public/yandex-recrawl.txt`
   - `src/routes/yandex-recrawl-rel[.]txt.ts` → статический `public/yandex-recrawl-rel.txt`
   - `src/lib/dadata.functions.ts` (createServerFn для поиска по ИНН) — нужен серверный ключ DaData. На чистой статике вариантов два:
     a) вызывать DaData Suggestions напрямую из браузера с публичным токеном (DaData это разрешает, токен видно — приемлемо для Suggestions API);
     b) временно скрыть форму B2B по ИНН.
   - `src/lib/api/example.functions.ts` — не используется, удалить.

2. **Шелл SSR** (`src/server.ts`, `src/start.ts`, `error-capture`, `error-page`, override `tanstackStart.server.entry`) — убрать, они не нужны для статики.

3. **Динамические маршруты** — все данные детерминированы из `src/data/*`, поэтому prerender возможен для 100% страниц:
   - `/services/$slug` × 13
   - `/uslugi/$slug` × 4 хаба
   - `/gorod/$slug` × 9, `/raion/$slug` × 10
   - `/blog/$slug` × 50, `/docs/$slug` × 4
   - плюс ~13 статических страниц = **~103 HTML файла**

## План работ

### 1. Переключить сборку на pure Vite SPA + prerender

- В `vite.config.ts` отключить SSR-режим TanStack Start, включить `prerender: { enabled: true, crawlLinks: true }` и явно передать список всех маршрутов (генерируется из `SERVICES`, `CITIES`, `DISTRICTS`, `POSTS`, `DOCS`).
- Убрать `tanstackStart.server.entry` override.
- Удалить `src/server.ts`, `src/start.ts`, `src/lib/error-capture.ts`, зависимость на Nitro/Cloudflare.
- Настроить `outDir: "dist"` — итог: чистая папка со статикой + `index.html` для каждого маршрута.

### 2. Заменить server-routes на статические файлы

- Написать скрипт `scripts/generate-static.ts`, который на этапе `postbuild` создаёт в `dist/`:
  - `sitemap.xml` (та же логика, что в текущем route)
  - `yandex-recrawl.txt`, `yandex-recrawl-rel.txt`
  - `robots.txt` (уже есть в `public/`, проверить)
- Удалить `src/routes/sitemap[.]xml.ts`, `src/routes/yandex-recrawl*.ts`.

### 3. DaData по ИНН

Спрошу ниже как поступить (клиентский токен или временно отключить). По умолчанию — оставить форму, но переключить на прямой fetch к `https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party` с публичным токеном из `VITE_DADATA_TOKEN`.

### 4. `.htaccess` для Apache/Beget

Кладём в `public/.htaccess` (попадёт в `dist/.htaccess`):

```apache
RewriteEngine On
# HTTPS (у вас редирект уже включён на хостинге, дублируем на всякий случай)
RewriteCond %{HTTPS} off
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Отдаём готовые .html для маршрутов TanStack (SSG уже создал файлы вида /services/uslugi.html)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.+?)/?$ /$1.html [L]

# Fallback на index.html (на случай ручного deep-link, где .html не сгенерирован)
ErrorDocument 404 /404.html

# Кэш статики
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/* "access plus 6 months"
  ExpiresByType font/woff2 "access plus 1 year"
</IfModule>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript image/svg+xml
</IfModule>
```

### 5. Проверка перед выдачей

- `bun run build` → проверить, что в `dist/` есть `index.html`, `services/index.html`, `blog/kak-otlichit-*/index.html` и т. д. для всех 103 URL.
- Проверить, что `sitemap.xml`, `robots.txt`, `yandex-recrawl*.txt` лежат в корне `dist/`.
- Локально: `npx serve dist` и обход всех разделов.
- Собрать `dist.zip` в `/mnt/documents/` для скачивания и заливки в `public_html`.

## Уточнения перед стартом

1. **DaData / форма КП по ИНН на `/kp`** — оставить (клиентский токен, будет виден в браузере) или временно скрыть форму B2B?
2. **PDF-договор и КП** (`pdf-lib`) — работает целиком в браузере, останется без изменений. Подтверждаете?
3. **Метрика Яндекса** — оставляем как есть (инлайн-скрипт в `<head>` каждой статики).

По скринам: `dez-federation.ru` уже указывает на Beget (`public_html`), HTTPS-редирект и HTTP/2 включены — этого достаточно, PHP-версия не важна. Индексация в Яндексе уже пошла (видны сниппеты «Санитарная служба №1»), после заливки статики просто отправите переобход.
