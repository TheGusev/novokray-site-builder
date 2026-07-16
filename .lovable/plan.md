
# План: перенос dez-federation.ru на Beget шаред

Beget шаред — только Apache + PHP + статика. Всю SSR-логику и `createServerFn` придётся уводить либо на клиент, либо на тонкий PHP-прокси. Ниже — что делаем.

## 1. Реквизиты и ключ DaData

- Обновляю `src/data/site.ts` → `SITE.bank`:
  - `bankName: 'ООО "Банк Точка"'`
  - `bik: '044525104'`
  - `correspondent: '30101810745374525104'`
  - `account: '40702810020000249125'`
  - Добавляю `SITE.legal.kpp = '541001001'` (в счёте/договоре КПП поставщика теперь заполнен).
- Ключ DaData `d0c1740add81959b6d12859e1b81450fe2d59a75` — сохраняю через `set_secret` как `DADATA_API_KEY` (нужно для сборки прокси, см. п.3).

## 2. Клиентская генерация PDF (договор, КП, счёт)

Все три PDF уже строятся на `pdf-lib` — библиотека работает в браузере. Переношу:

- `src/lib/dogovor/buildPdf.ts`, `src/lib/kp/buildKpPdf.ts`, `src/lib/kp/buildInvoicePdf.ts` — оставляю как есть (они уже изоморфные).
- Убираю обёртки-`createServerFn` в маршрутах `/dogovor/zapolnit`, `/kp` — вызываю билдер напрямую из компонента, отдаю через `Blob` + `URL.createObjectURL`.
- Шрифты PT Sans — уже уложены как ассеты через `.asset.json`, будут раздаваться Beget как обычные статические файлы (или с CDN Lovable-assets, ок для прод).

## 3. DaData по ИНН — PHP-прокси на Beget

DaData Suggestions требует токен в заголовке `Authorization: Token …`. Класть токен в клиент нельзя. Делаю на Beget тонкий PHP-прокси:

- `public/api/dadata.php` — принимает `POST {inn}`, вызывает DaData с токеном из PHP-переменной, отдаёт JSON. Токен вписываем в файл через переменную окружения Beget или прямо в конфиг PHP (Beget шаред: `.env` не читается, кладу в отдельный `public/api/config.php`, который добавлю в `.htaccess` deny).
- Клиент (`src/lib/dadata.functions.ts`) переписываю на обычный `fetch('/api/dadata.php', …)` без TanStack server fn.

## 4. Лид-форма → Telegram Bot

`createServerFn`-эндпоинт лидов на статике не работает. Два варианта на выбор при реализации (по умолчанию беру Telegram):

- `public/api/lead.php` — принимает JSON, шлёт в Telegram Bot API (chat_id + bot token в `config.php`). Быстро, надёжно, лиды приходят в `@one_help`.
- Альтернатива на будущее: SMTP через `mail()` Beget.

Переписываю `src/lib/sendLead.ts` на `fetch('/api/lead.php', …)`.

## 5. Sitemap + robots + llms

- `src/routes/sitemap[.]xml.ts` (серверный роут) заменяю build-time генерацией: скрипт `scripts/build-sitemap.ts` пробегает по всем статическим маршрутам + блог + услуги + города/районы, пишет `public/sitemap.xml`. Запускается в `postbuild`.
- `robots.txt` и `llms.txt` уже в `public/` — оставляю, синхронизирую `Sitemap:` URL.

## 6. Статический билд TanStack Start → SPA

- Смена стратегии сборки: TanStack Start пререндерит все страницы в HTML, дальше клиент гидрирует. Включаю prerender для всего дерева маршрутов (главная, услуги, блог, город/район, docs, garantii, contacts, kp, dogovor/zapolnit, privacy, terms, karta-sayta и т.д.).
- Итог сборки — `dist/` со статикой; заливается на Beget в `public_html/`.
- Убираю `src/server.ts`, `src/start.ts` middleware, `error-capture` — не нужны без SSR.
- Правлю `vite.config.ts`: убираю `tanstackStart.server.entry`, оставляю только prerender.

## 7. `.htaccess` для Beget

Кладу `public/.htaccess`:

- Принудительный HTTPS + canonical на `https://dez-federation.ru` (без `www`).
- Gzip/Brotli, `Cache-Control` на 1 год для `/assets/*`, `no-cache` для `index.html`.
- SPA-fallback: любые не-файловые URL → `/index.html` (но prerender уже даёт настоящие HTML — fallback нужен только для клиентских редиректов).
- Deny на `public/api/config.php` и на `.git/`, `.env`, `*.map`.
- Заголовки безопасности: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` минимально.
- 404 → `/404.html` (сгенерируем prerender-ом).

## 8. Гигиена и грамматика

- Проверяю все внутренние ссылки и телефон `+7 (993) 928-94-88`, TG `@one_help`, лицензию `54.НС.01.003.Л.000080.11.25` — уже стоят из прошлых итераций, пробегусь регэкспом.
- Прогон `bunx vitest run` — все 35 тестов проходят.
- Обновляю canonical URL в `__root.tsx` head — `https://dez-federation.ru`.

## 9. Аудит по 100-балльной шкале (после миграции)

По окончании работ выкачу отчёт по разделам: SEO, скорость, доступность, коммерческие блоки, юридический контент, блог, документы, конверсия. Отдельно — риски статики (без live sitemap, без серверной валидации лидов).

---

### Технические детали

Файлы, которые появятся/изменятся:

- `src/data/site.ts` — bank + kpp
- `public/api/dadata.php`, `public/api/lead.php`, `public/api/config.php`, `public/api/.htaccess`
- `public/.htaccess`
- `scripts/build-sitemap.ts` + `package.json` postbuild-хук
- `src/routes/dogovor.zapolnit.tsx`, `src/routes/kp.tsx` — переход на клиентский PDF
- `src/lib/dadata.functions.ts` → `src/lib/dadata.ts` (client)
- `src/lib/sendLead.ts` — fetch на `/api/lead.php`
- Удаляю `src/routes/sitemap[.]xml.ts`, `src/server.ts`, `src/lib/error-capture.ts` и всё что зависит от SSR
- `vite.config.ts` — prerender-конфиг

Инструкция по деплою на Beget будет приложена в конце реализации: FTP/SSH заливка `dist/` → `public_html/`, куда положить `config.php`, как выставить `chmod 600` на конфиг.

Скажите «ок» — начинаю с п.1–2 и параллельно готовлю PHP-прокси и `.htaccess`. Если хотите SMTP вместо Telegram для лидов — скажите сейчас, чтобы не переделывать.
