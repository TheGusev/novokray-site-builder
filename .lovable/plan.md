# Корректная раздача /media/* (видео и постеры)

## Что уже есть

- Файлы лежат в `public/media/` (5 роликов mp4 + постеры webp + фото участка) и попадают в `dist/client/media/`.
- Деплой уже проверяет наличие трёх файлов в сборке и content-type одного mp4 через nginx.

## Чего не хватает

- В рекомендованной конфигурации nginx (`SERVER_DEPLOYMENT.md`) нет отдельного блока `location ^~ /media/`. Сейчас медиа попадает в общий `location /` с `try_files $uri $uri/ $uri.html /index.html` — при опечатке или отсутствии файла браузер получит HTML вместо видео, плеер молча не стартует.
- Не зафиксированы MIME-типы `video/mp4` и `image/webp`, поддержка Range-запросов (перемотка и старт воспроизведения на iOS) и кеширование.
- Проверка в деплое одна и покрывает только один mp4.

## Что сделаю

1. **Блок nginx для /media/** в `SERVER_DEPLOYMENT.md`: `try_files $uri =404` (никакого HTML-fallback), явные типы `video/mp4`, `image/webp`, `Accept-Ranges: bytes`, отключённый `gzip` для видео, `expires 30d` + `immutable`, `X-Content-Type-Options: nosniff`, `Cross-Origin-Resource-Policy: same-origin`. CORS-заголовок `Access-Control-Allow-Origin` не нужен — видео отдаётся с того же домена; добавлю его только как закомментированный вариант на случай CDN.
2. **Проверка типов**: убедиться, что в `mime.types` сервера есть mp4/webp; если модуль подключается без них — добавить `types { video/mp4 mp4; image/webp webp; }` прямо в блок.
3. **Расширю проверки деплоя** в `.github/workflows/deploy.yml`: наличие всех 5 mp4 и всех постеров в сборке; по домену — content-type mp4 (`video/*`), content-type постера (`image/webp`), ответ `206 Partial Content` на Range-запрос, и что несуществующий `/media/nope.mp4` возвращает `404`, а не HTML.
4. **Клиентская устойчивость плеера** в `src/components/site/VideoCard.tsx`: `preload="metadata"`, `playsInline`, `crossOrigin` не задаётся, обработчик `onError` — если файл не отдался, вместо пустого чёрного окна показывается понятное сообщение и кнопка «Повторить».
5. **Раздел диагностики** в `SERVER_DEPLOYMENT.md` с готовыми командами curl и таблицей «симптом → причина → что сделать».

## Технические детали

- `SERVER_DEPLOYMENT.md`: новый `location ^~ /media/` строго выше `location /`, плюс блок контрольных команд:
  `curl -I https://dez-federation.ru/media/obrabotka-uchastka.mp4`,
  `curl -s -o /dev/null -w '%{http_code}' -H 'Range: bytes=0-1' .../*.mp4` → `206`,
  `curl -I .../media/nope.mp4` → `404`.
- `.github/workflows/deploy.yml`: цикл по списку медиафайлов вместо трёх отдельных `test -f`, плюс три новых curl-проверки с понятными сообщениями «ОШИБКА: …».
- `VideoCard.tsx`: только состояние ошибки и атрибуты тега `<video>`; ленивая загрузка (video появляется в DOM после клика) остаётся без изменений.
