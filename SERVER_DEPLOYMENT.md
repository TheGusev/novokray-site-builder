# Схема работы и проверка сервера dez-federation.ru

## Как сайт должен открываться

1. GitHub Actions собирает проект командой `bun run build`.
2. Готовая статическая версия находится в `dist/client`.
3. Для каждого известного маршрута сборка содержит заранее сформированный HTML. Браузер сразу получает текст, изображения и правильную высоту страницы, затем React подключает интерактивность.
4. nginx сначала ищет реальный файл или каталог. Для URL страницы он отдаёт соответствующий prerendered HTML. Только неизвестный HTML-маршрут можно направлять на `/index.html`.
5. Запросы `/assets/*`, `/docs/*`, `/fonts/*`, `sitemap.xml` и `robots.txt` никогда не должны получать HTML-fallback: отсутствующий файл должен вернуть 404.

```text
браузер
  -> nginx
     -> /assets/*, /docs/*, /fonts/*: реальный файл или 404
     -> /blog, /services/...: готовый HTML маршрута
     -> неизвестная страница: /index.html (клиентский роутер покажет 404)
  -> JS гидратирует уже видимую страницу
```

## Ожидаемая структура

```text
/var/www/dez-federation.ru/
  index.html
  assets/*.js, *.css, изображения
  blog/index.html
  blog/<slug>/index.html
  services/index.html
  services/<slug>/index.html
  docs/*.pdf
  fonts/*.ttf
  .well-known/*
  robots.txt
  sitemap.xml
```

## Рекомендуемый nginx server block

Перед применением сравните `server_name`, SSL-сертификаты и путь `root` с действующей конфигурацией.

```nginx
server {
    listen 80;
    server_name dez-federation.ru www.dez-federation.ru;
    return 301 https://dez-federation.ru$request_uri;
}

server {
    listen 443 ssl http2;
    server_name dez-federation.ru;
    root /var/www/dez-federation.ru;
    index index.html;

    include mime.types;
    default_type application/octet-stream;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript application/xml image/svg+xml;

    # --- Канонизация URL: один адрес страницы = один ответ 200 ---
    # /path/index.html -> /path, /path/ -> /path (кроме корня).
    # Без этих правил три разных URL отдают одну страницу и Яндекс/Google видят дубли.
    # Эти правила деплой умеет вставлять сам (маркер `canonical-url-normalization`),
    # но в location / обязателен try_files БЕЗ `$uri/` — иначе nginx сам добавит слэш
    # и получится цикл редиректов.
    location ~ ^(?<clean>/.*)/index\.html$ {
        return 301 $clean$is_args$args;
    }
    if ($request_uri ~ ^/index\.html(\?|$)) {
        return 301 /$is_args$args;
    }
    if ($request_uri ~ ^(?<nosl>/.+)/(\?|$)) {
        return 301 $nosl$is_args$args;
    }

    location ^~ /assets/ {
        try_files $uri =404;
        access_log off;
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable" always;
    }

    location ^~ /docs/ {
        try_files $uri =404;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000" always;
        add_header X-Content-Type-Options "nosniff" always;
    }

    location ^~ /fonts/ {
        try_files $uri =404;
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable" always;
    }

    location ^~ /media/ {
        # Видео и постеры отдаём только реальным файлом: HTML-fallback здесь запрещён,
        # иначе плеер получает страницу вместо ролика и молча не стартует.
        try_files $uri =404;

        # Если в mime.types сервера нет этих типов — они задаются явно здесь.
        types {
            video/mp4  mp4;
            image/webp webp;
        }
        default_type application/octet-stream;

        # Range-запросы нужны для перемотки и для старта воспроизведения в iOS Safari.
        add_header Accept-Ranges "bytes" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Cross-Origin-Resource-Policy "same-origin" always;
        # CORS не требуется: медиа отдаётся с того же домена. Раскомментировать
        # только при переносе файлов на отдельный поддомен или CDN.
        # add_header Access-Control-Allow-Origin "https://dez-federation.ru" always;

        gzip off;   # mp4/webp уже сжаты, gzip только ломает Range
        expires 30d;
        add_header Cache-Control "public, max-age=2592000, immutable" always;
        access_log off;
    }

    location ~* ^/(robots\.txt|sitemap\.xml|yandex-recrawl(?:-rel)?\.txt)$ {
        try_files $uri =404;
        add_header Cache-Control "no-cache" always;
    }

    location / {
        # HTML не кешируем вовсе: телефон с уже сохранённой старой страницей
        # обязан получить свежую версию после каждого деплоя.
        # $uri/ намеренно убран: каталоги отдаются только через /path.html,
        # иначе вернётся дубль со слешем.
        try_files $uri $uri.html $uri/index.html /index.html;
        add_header Cache-Control "no-store" always;
    }
}
```

Если модуль Brotli установлен, дополнительно включите `brotli on;` и типы `text/css application/javascript application/json image/svg+xml`. Без установленного модуля эти директивы добавлять нельзя.

## Контрольные команды на сервере

```bash
test -f /var/www/dez-federation.ru/index.html
test -f /var/www/dez-federation.ru/blog/index.html
test -f /var/www/dez-federation.ru/docs/dogovor-obrazec.pdf
test -f /var/www/dez-federation.ru/fonts/PTSans-Regular.ttf

nginx -t
curl -I --compressed https://dez-federation.ru/
curl -I --compressed https://dez-federation.ru/blog
curl -I --compressed https://dez-federation.ru/assets/<актуальный-файл>.js
curl -I https://dez-federation.ru/docs/dogovor-obrazec.pdf
curl -I https://dez-federation.ru/fonts/PTSans-Regular.ttf
curl -I https://dez-federation.ru/несуществующий-файл.js
```

Ожидается:

- HTML: `200`, `Content-Type: text/html`, `Cache-Control: no-store`.
- Шрифты: `curl -I https://dez-federation.ru/fonts/inter-400-cyrillic.woff2` → `200`, `font/woff2`. Сайт больше не обращается к `fonts.googleapis.com`; если в HTML снова появится этот домен — это регрессия.
- JS/CSS с хешем: `200`, правильный MIME, `Cache-Control: ... immutable`, gzip или Brotli.
- PDF: `200`, `Content-Type: application/pdf`.
- TTF: `200`, тип шрифта, не `text/html`.
- Несуществующий JS/PDF: `404`, не главная страница.

## Проверка видео и постеров (/media/*)

```bash
curl -I https://dez-federation.ru/media/obrabotka-uchastka.mp4
curl -I https://dez-federation.ru/media/obrabotka-uchastka-poster.webp
curl -s -o /dev/null -w '%{http_code}\n' -H 'Range: bytes=0-1' \
  https://dez-federation.ru/media/obrabotka-uchastka.mp4
curl -s -o /dev/null -w '%{http_code}\n' https://dez-federation.ru/media/nope.mp4
```

Ожидается:

- mp4: `200`, `Content-Type: video/mp4`, `Accept-Ranges: bytes`.
- Постер: `200`, `Content-Type: image/webp`.
- Range-запрос: `206`.
- Несуществующий файл: `404` (не главная страница).

| Симптом | Причина | Что делать |
| --- | --- | --- |
| Плеер чёрный, `Content-Type: text/html` | нет блока `location ^~ /media/`, файл ушёл в SPA-fallback | добавить блок выше `location /`, `nginx -t && systemctl reload nginx` |
| `Content-Type: application/octet-stream` | в `mime.types` нет mp4/webp | оставить блок `types { video/mp4 mp4; image/webp webp; }` внутри `location /media/` |
| Видео не стартует на iPhone, перемотка не работает | Range-запрос отдаёт `200` вместо `206` | убрать `gzip`/сторонние фильтры для `/media/`, проверить `Accept-Ranges: bytes` |
| `404` на существующий файл | сборка не скопирована | `ls /var/www/dez-federation.ru/media/`, повторить деплой |

## Деплой

Workflow копирует новую сборку поверх действующей без предварительной очистки, проверяет главную, блог и PDF, и только после успешной проверки удаляет устаревшие файлы. Поэтому во время обновления nginx не должен видеть пустой каталог.

## Приём заявок: /api/lead

Формы сайта отправляют заявку POST-запросом на `/api/lead`. nginx проксирует его на локальный сервис `lead-api` (Bun, systemd), который пересылает заявку в Telegram-группу.

```text
браузер -> POST /api/lead
  -> nginx (proxy_pass 127.0.0.1:8787)
     -> lead-api (systemd, читает токен из /etc/dez-federation/lead.env)
        -> api.telegram.org -> группа -5244841627
```

### Разовая настройка

1. Вставить токен в env-файл на сервере (в репозитории токена нет и быть не должно):

```bash
mkdir -p /etc/dez-federation
nano /etc/dez-federation/lead.env
```

Содержимое (образец лежит в репозитории: `deploy/lead.env.example`):

```text
TELEGRAM_BOT_TOKEN=сюда_ваш_токен
TELEGRAM_CHAT_ID=-5244841627
LEAD_API_PORT=8787
```

```bash
chmod 600 /etc/dez-federation/lead.env
systemctl restart lead-api
curl -s http://127.0.0.1:8787/health   # ожидается {"ok":true,"token":true,"dadata":true}
```

Деплой этот файл не перетирает: вставленное вручную значение сохраняется при каждом push.
Если файла нет, деплой создаст заготовку с пустым токеном и напишет об этом в лог.
Опционально можно задать секрет `TELEGRAM_BOT_TOKEN` в GitHub — он подставится только тогда, когда токен в файле пуст.

2. Добавить бота в группу `-5244841627` и разрешить отправку сообщений.
3. Добавить в nginx server-блок (443) до `location /`:

```nginx
location ~ ^/api/(lead|dadata)$ {
    proxy_pass http://127.0.0.1:8787;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_read_timeout 20s;
}
```

`/api/lead` — заявки в Telegram, `/api/dadata` — автозаполнение реквизитов по ИНН на странице `/kp`.
Если раньше стоял блок `location = /api/lead`, замените его на этот regex-блок (он должен идти **до** `location /`).

Затем `nginx -t && systemctl reload nginx`.

Дальше каждый push деплоит и сайт, и сервис заявок автоматически: workflow обновляет `/etc/systemd/system/lead-api.service`, перезапускает сервис и проверяет `/health` до выката HTML.

Смена токена: поменять строку в `/etc/dez-federation/lead.env` и выполнить `systemctl restart lead-api`. Передеплой не нужен.

### Проверка

```bash
systemctl status lead-api
journalctl -u lead-api -n 50
curl -s http://127.0.0.1:8787/health

curl -s -X POST https://dez-federation.ru/api/lead \
  -H "Content-Type: application/json" \
  -d '{"type":"Заявка на обработку","phone":"89999999999","pest":"Клопы","object":"Студия"}'
```

Ожидается `{"ok":true}` и сообщение в Telegram-группе.

Проверка реквизитов по ИНН:

```bash
curl -s -X POST https://dez-federation.ru/api/dadata \
  -H "Content-Type: application/json" -d '{"inn":"5410169338"}'
```

Ожидается `{"ok":true,"party":{...}}`.

### Диагностика одной командой

```bash
systemctl status lead-api --no-pager && \
curl -s http://127.0.0.1:8787/health && echo && \
curl -s -X POST http://127.0.0.1:8787/api/lead -H "Content-Type: application/json" \
  -d '{"type":"Проверка","phone":"+70000000000","formName":"deploy-check"}' && echo && \
curl -s -X POST https://dez-federation.ru/api/lead -H "Content-Type: application/json" \
  -d '{"type":"Проверка","phone":"+70000000000","formName":"deploy-check"}' && echo && \
journalctl -u lead-api -n 30 --no-pager
```

Заявки с `formName: deploy-check` приходят в группу с пометкой «🧪 Проверка канала».

| Ответ | Причина | Что делать |
| --- | --- | --- |
| `{"ok":true,"token":false}` на `/health` | токен не задан | вписать токен в `/etc/dez-federation/lead.env`, `systemctl restart lead-api` |
| `503 token_not_configured` | то же | то же |
| `502 telegram_failed`, в логе «chat not found» | бот не в группе или неверный chat id | добавить бота в группу `-5244841627` |
| `502 telegram_failed`, в логе «Unauthorized» | неверный токен | заменить токен и перезапустить сервис |
| `422 invalid_phone` | телефон не в формате РФ | так и задумано, проверка ввода |
| `429 rate_limited` | больше 5 заявок в минуту с IP | подождать минуту |
| `404` от nginx на `/api/lead` | нет блока `location = /api/lead` | добавить блок, `nginx -t && systemctl reload nginx` |
| `405 Method Not Allowed` на `/api/lead` | POST обрабатывает статика (нет блока `location = /api/lead` выше `location /`) | добавить блок проксирования **до** общего `location /`, затем `nginx -t && systemctl reload nginx` |
| `503 key_not_configured` на `/api/dadata` | не задан `DADATA_API_KEY` | вписать ключ DaData в `/etc/dez-federation/lead.env`, `systemctl restart lead-api` |
| `502 upstream_failed` на `/api/dadata`, в логе 401/403 | неверный ключ DaData или исчерпан лимит | заменить ключ, проверить лимиты в кабинете DaData |
| `404 not_found` на `/api/dadata` при верном ИНН | организации нет в ЕГРЮЛ | заполнить реквизиты вручную |
| curl не отвечает, сайт работает | сервис упал | `journalctl -u lead-api -n 50`, `systemctl restart lead-api` |

Деплой сам проверяет цепочку: если токена нет, порт 8787 занят чужим процессом, Telegram отвергает сообщение или nginx не проксирует `/api/lead` — GitHub Actions падает с понятной ошибкой, не выкатывая сайт с неработающими формами.

### Поведение

- Сервис слушает только `127.0.0.1:8787`, наружу доступен исключительно через nginx.
- Honeypot-поле `company`: если заполнено — заявка молча игнорируется.
- Лимит 5 заявок в минуту с одного IP, иначе `429`.
- Телефон нормализуется к `+7XXXXXXXXXX`, некорректный — `422`.
- Ключ DaData (`DADATA_API_KEY`) читается только сервисом: браузер обращается к `/api/dadata`, ключ в бандл не попадает. Лимит 20 запросов в минуту с IP.
- Каждая принятая заявка сначала пишется в журнал `/var/log/dez-federation/leads.jsonl` (права 600, ротация при 10 МБ в `leads.jsonl.1`) и только потом уходит в Telegram. Если Telegram недоступен, сервис повторяет отправку через 5 и 30 секунд, а сайту отвечает `{"ok":true,"queued":true}` — заявка не теряется.
- Токен и настройку nginx деплой делает сам: секрет `TELEGRAM_BOT_TOKEN` из GitHub синхронизируется в `/etc/dez-federation/lead.env`, а блок `location ~ ^/api/(lead|dadata)$` добавляется в конфиг сайта перед `location /` (с бэкапом и откатом при `nginx -t` с ошибкой). В конце лога GitHub Actions печатается сводка: токен, nginx, Telegram, ИНН.
- Просмотреть последние заявки на сервере: `tail -n 20 /var/log/dez-federation/leads.jsonl`.
- Токен нигде не попадает в репозиторий и в бандл фронтенда: его читает только systemd через `EnvironmentFile`.
- Если токен не задан, `/api/lead` отвечает `503 token_not_configured`, а `/health` — `{"ok":true,"token":false}`.
- Если сервис недоступен, браузер сохраняет заявку в `localStorage` (`offlineQueue`) и отправляет её автоматически при восстановлении связи.
## Аналитика: цели Яндекс.Метрики (счётчик 110968995)

Все цели отправляются через `src/lib/analytics.ts` (`trackGoal` / `trackLead`).
В коде описаны только атомарные цели — составные собираются в кабинете Метрики.

### 1. Атомарные цели (тип «JavaScript-событие»)

| Идентификатор | Что означает |
|---|---|
| `lead_hero` | заявка из формы в первом экране |
| `lead_modal` | заявка из модального окна |
| `lead_service` | заявка с карточной формы (услуга, город, район, контакты) |
| `lead_price` | заявка из встроенной формы (прайс, инлайн-блоки) |
| `lead_<услуга>` | заявка по конкретной услуге, см. п.2 |
| `docs_request` | запрос документов/договора |
| `kp_submit` | сформировано коммерческое предложение на /kp |
| `kp_pdf` | скачано КП |
| `invoice_pdf` | скачан счёт |
| `dogovor_pdf` | скачан договор (форма /dogovor/zapolnit или /kp) |
| `call_click` | клик по телефону |
| `hero_call_click` | клик по кнопке «Позвонить» в первом экране главной |
| `hero_calc_click` | клик по кнопке «Расчёт за 5 сек» в первом экране главной |
| `stats_info_open` | раскрытие пояснения к счётчику «38 000+ заявок по РФ» |
| `telegram_click` | клик по Telegram |
| `whatsapp_click` | клик по WhatsApp |
| `contacts_call_click` | клик по кнопке «Позвонить» в блоке быстрых действий на /contacts |
| `contacts_whatsapp_click` | клик по кнопке «Написать в WhatsApp» на /contacts |
| `contacts_max_click` | клик по MAX на /contacts |

### 2. Цели по услугам

Формируются автоматически из названия услуги в форме:

```text
lead_klopy, lead_tarakany, lead_gryzuny, lead_blohi, lead_muravi,
lead_osy, lead_kleschi_komary, lead_plesen, lead_ozonirovanie,
lead_sushka_posle_potopa, lead_borschevik, lead_drugoe
```

### 3. Составные цели (создать в Метрике → Цели → Составная)

- `all_conversions` = `lead_hero` + `lead_modal` + `lead_service` + `lead_price` + `docs_request` + `kp_submit`
- `contacts` = `call_click` + `hero_call_click` + `telegram_click` + `whatsapp_click` + `contacts_call_click` + `contacts_whatsapp_click` + `contacts_max_click`
- `hero_cta` = `hero_call_click` + `hero_calc_click`
- `documents` = `kp_pdf` + `invoice_pdf` + `dogovor_pdf`
- по каждой услуге: `conv_klopy` = `lead_klopy` + `call_click`, `conv_tarakany` = `lead_tarakany` + `call_click` и т.д.

### 4. Параметры визита

К каждой цели прикладываются: страница, устройство, utm-метки (`utm_source`,
`utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `yclid`, `gclid`),
а для лидов — услуга, объект и расчётная цена.
