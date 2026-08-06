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

    location ~* ^/(robots\.txt|sitemap\.xml|yandex-recrawl(?:-rel)?\.txt)$ {
        try_files $uri =404;
        add_header Cache-Control "no-cache" always;
    }

    location / {
        try_files $uri $uri/ $uri.html /index.html;
        add_header Cache-Control "no-cache" always;
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

- HTML: `200`, `Content-Type: text/html`, `Cache-Control: no-cache`.
- JS/CSS с хешем: `200`, правильный MIME, `Cache-Control: ... immutable`, gzip или Brotli.
- PDF: `200`, `Content-Type: application/pdf`.
- TTF: `200`, тип шрифта, не `text/html`.
- Несуществующий JS/PDF: `404`, не главная страница.

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

1. В GitHub: **Settings → Secrets and variables → Actions → New repository secret**, имя `TELEGRAM_BOT_TOKEN`, значение — токен бота. Деплой сам запишет его в `/etc/dez-federation/lead.env` с правами `600`.
2. Добавить бота в группу `-5244841627` и разрешить отправку сообщений.
3. Добавить в nginx server-блок (443) до `location /`:

```nginx
location = /api/lead {
    proxy_pass http://127.0.0.1:8787;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_read_timeout 20s;
}
```

Затем `nginx -t && systemctl reload nginx`.

Дальше каждый push деплоит и сайт, и сервис заявок автоматически: workflow обновляет `/etc/systemd/system/lead-api.service`, перезапускает сервис и проверяет `/health` до выката HTML.

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

### Поведение

- Сервис слушает только `127.0.0.1:8787`, наружу доступен исключительно через nginx.
- Honeypot-поле `company`: если заполнено — заявка молча игнорируется.
- Лимит 5 заявок в минуту с одного IP, иначе `429`.
- Телефон нормализуется к `+7XXXXXXXXXX`, некорректный — `422`.
- Токен нигде не попадает в репозиторий и в бандл фронтенда.
- Если сервис недоступен, браузер сохраняет заявку в `localStorage` (`offlineQueue`) и отправляет её автоматически при восстановлении связи.