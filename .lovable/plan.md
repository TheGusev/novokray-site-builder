# Автодеплой приёма заявок и токен бота

## Проблема

1. Токен бота хранится в Lovable как секрет — его значение мне не видно, вписать строку в файл я физически не могу. Нужен способ, при котором токен попадает на сервер, но не лежит в репозитории (иначе Telegram отзовёт его, как только увидит в публичном GitHub).
2. Файл `public-php/lead.php` сейчас не участвует в деплое: workflow копирует только `dist/client`, а PHP на сервере может быть не установлен. Значит форма отправляет запрос в никуда.

## Решение

Отказаться от PHP и поднять на сервере крошечный сервис на Bun (bun уже установлен и используется в деплое), который принимает заявку и шлёт её в Telegram. nginx проксирует `/api/lead` на этот сервис. Токен хранится в GitHub Secrets и записывается деплоем в защищённый env-файл на сервере.

```text
браузер -> POST /api/lead
  -> nginx (proxy_pass 127.0.0.1:8787)
     -> bun-сервис lead-api (systemd), читает токен из /etc/dez-federation/lead.env
        -> api.telegram.org -> группа -5244841627
```

## Что делаю в коде

- `server/lead-api.ts` — сервис на Bun: POST `/api/lead`, honeypot, лимит 5 заявок/мин с IP, нормализация телефона, отправка в Telegram, ответ `{ok:true}`.
- `src/lib/leadSender.ts` — меняю endpoint с `https://dez-federation.ru/api/lead.php` на относительный `/api/lead`. Офлайн-очередь и honeypot остаются как есть.
- Удаляю `public-php/lead.php`.
- `.github/workflows/deploy.yml` — добавляю шаги: записать токен из `secrets.TELEGRAM_BOT_TOKEN` в `/etc/dez-federation/lead.env` (права 600), установить/обновить systemd-юнит `lead-api.service`, перезапустить его и проверить эндпоинт curl-ом до перезагрузки nginx.
- `SERVER_DEPLOYMENT.md` — обновляю раздел приёма заявок: новая схема, блок nginx `location /api/lead`, команды проверки.

## Что нужно от вас (один раз)

1. В GitHub: **Settings → Secrets and variables → Actions → New repository secret**, имя `TELEGRAM_BOT_TOKEN`, значение — токен бота.
2. Добавить бота в группу `-5244841627` и дать право писать сообщения.
3. Добавить в nginx-конфиг блок (я дам готовый текст в `SERVER_DEPLOYMENT.md`):

```nginx
location = /api/lead {
    proxy_pass http://127.0.0.1:8787;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

После этого каждый push деплоит и сайт, и сервис заявок автоматически.

## Альтернатива, если хотите проще

Если на сервере уже настроен PHP-fpm, можно остаться на `lead.php` — тогда деплой будет копировать его в `/var/www/dez-federation.ru/api/` и подставлять токен из того же GitHub Secret. Скажите, если PHP есть, и я переделаю план на этот вариант.

## Технические детали

- Сервис слушает только `127.0.0.1:8787`, наружу выходит исключительно через nginx.
- Токен нигде не попадает в репозиторий и в бандл фронтенда: он читается процессом из env-файла на сервере.
- systemd-юнит с `Restart=always`, логи в journald (`journalctl -u lead-api`).
- Проверка после деплоя: `curl -X POST localhost:8787/api/lead -d '{"phone":"89990000000","type":"Заявка на обработку"}'` — ожидается `{"ok":true}`.
