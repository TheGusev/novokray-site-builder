# Почему заявки не долетают в Telegram: диагностика на сервере

Цепочка такая: форма → `POST /api/lead` → nginx → сервис `lead-api` (порт 8787) → Telegram-группа `-5244841627`. Молчание в группе означает обрыв в одном из четырёх мест: нет токена, бот не в группе, сервис не запущен, nginx не проксирует `/api/lead`.

## Шаг 1. Одна команда на сервере (по SSH)

```bash
systemctl status lead-api --no-pager | head -5; echo "--- health ---"; \
curl -s http://127.0.0.1:8787/health; echo; echo "--- локально ---"; \
curl -s -X POST http://127.0.0.1:8787/api/lead -H "Content-Type: application/json" \
  -d '{"type":"Проверка","phone":"+79069989888","formName":"deploy-check"}'; echo; \
echo "--- через nginx ---"; \
curl -s -o /dev/null -w "%{http_code}\n" -X POST https://dez-federation.ru/api/lead \
  -H "Content-Type: application/json" -d '{"type":"Проверка","phone":"+79069989888","formName":"deploy-check"}'; \
echo "--- лог ---"; journalctl -u lead-api -n 20 --no-pager
```

Пришлите мне весь вывод — по нему видно точную причину.

## Шаг 2. Что означает результат

```text
health: {"ok":true,"token":false}   -> токен не вписан в /etc/dez-federation/lead.env
локально: 502 telegram_failed        -> бот не добавлен в группу или неверный токен
локально ok:true, через nginx 404/405-> в nginx нет блока проксирования /api/lead
Unit lead-api not found / inactive   -> сервис не установлен или упал
```

Соответствующее лечение:

- Токен: `nano /etc/dez-federation/lead.env` → `TELEGRAM_BOT_TOKEN=...`, `TELEGRAM_CHAT_ID=-5244841627`, `LEAD_API_PORT=8787`, затем `chmod 600` и `systemctl restart lead-api`.
- Бот: добавить бота в группу и снять ограничение на отправку сообщений (в группе с включённым «privacy mode» боту достаточно прав администратора).
- nginx: в server-блок 443 **до** `location /` добавить:

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
затем `nginx -t && systemctl reload nginx`.

- Сервис: `systemctl enable --now lead-api` (юнит деплой ставит сам при следующем push).

## Шаг 3. Что доработаю в коде после вашего вывода

- Добавлю в сайт страховку: если `/api/lead` вернул ошибку, форма всё равно показывает успех и кладёт заявку в очередь — сейчас так и есть, но заявка теряется, если посетитель закрыл вкладку. Заведу дублирующий канал (запись заявки на сервере в файл `/var/log/leads.jsonl`), чтобы ни одна заявка не пропадала, даже когда Telegram недоступен.
- Уточню диагностику в `SERVER_DEPLOYMENT.md` по фактической причине, которую покажет вывод.
