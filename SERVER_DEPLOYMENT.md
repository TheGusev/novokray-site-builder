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

## Приём заявок: /api/lead.php

Формы сайта отправляют заявку POST-запросом на `https://dez-federation.ru/api/lead.php`, скрипт пересылает её в Telegram-группу.

### Установка

1. Скопировать `public-php/lead.php` из репозитория в `public_html/api/lead.php` (файл не входит в сборку сайта и не удаляется при деплое).
2. Вписать токен бота: либо в переменную окружения `TELEGRAM_BOT_TOKEN`, либо в константу `TELEGRAM_TOKEN_FALLBACK` в начале файла.
3. Добавить бота в группу `-5244841627` и разрешить ему отправлять сообщения.
4. Убедиться, что PHP на хостинге включён и в nginx есть обработка `location ~ \.php$` через php-fpm; каталог `/api/` не должен попадать под HTML-fallback.

### Проверка

```bash
curl -X POST https://dez-federation.ru/api/lead.php \
  -H "Content-Type: application/json" \
  -d '{"type":"Заявка на обработку","phone":"89999999999","pest":"Клопы","object":"Студия"}'
```

Ожидается `{"ok":true}` и сообщение в Telegram-группе.

### Поведение

- Honeypot-поле `company`: если заполнено — заявка молча игнорируется.
- Лимит 5 заявок в минуту с одного IP, иначе `429`.
- Телефон нормализуется к `+7XXXXXXXXXX`, некорректный — `422`.
- Если скрипт недоступен, браузер сохраняет заявку в `localStorage` (`offlineQueue`) и отправляет её автоматически при восстановлении связи.