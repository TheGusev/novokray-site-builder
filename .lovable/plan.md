## Что не так сейчас

1. Подзаголовок выглядит «кривым» потому, что каждое слово завёрнуто в `inline-block` + `whitespace-nowrap` + неразрывный пробел, а внутри ещё `WaveText` со своими `inline-block` буквами. Из-за этого ломается базовая линия, переносы рваные, буквы «прыгают» blur'ом — на премиум-сайте это читается как любительская анимация.
2. Фон статичен — нет ощущения «движения по комнате».

## Премиум-решение

### 1) Фон — медленный «room tour» (Ken Burns)
- Добавлю keyframe `hero-kenburns` в `src/styles.css`: 40 сек, `ease-in-out infinite alternate`, плавный `scale(1 → 1.08)` + лёгкий `translate3d(-1.5%, -1%, 0)` — будто камера медленно проплывает по интерьеру.
- На `<img>` в hero повешу класс `hero-kenburns` + `transform-origin: 60% 55%` (смещение к окну, чтобы движение «дышало» к свету). Уважаю `prefers-reduced-motion`.

### 2) Подзаголовок — премиум-ревил по словам, **без сдвигов вёрстки**
Полностью переписываю `src/components/site/WaveSentences.tsx`:
- Текст рендерится как обычный inline-поток слов в `<p>` — без `inline-block`, без `whitespace-nowrap`, без NBSP. Перенос строк такой же ровный, как у обычного `<p>`.
- Каждое слово оборачивается в `<span class="reveal-word">` с инициальным `opacity: 0.08` (еле виден контур, текст уже занимает место — никаких layout-shift).
- На монтировании запускается единая CSS-анимация: `opacity 0.08 → 1`, длительность 320 мс, ease-out, **только opacity, никакого translate/blur** — это и даёт ощущение «начитки» без дёрганья.
- Между словами шаг 80–90 мс, между предложениями — пауза 600 мс.
- Цветовая «волна» применяется ко **всему абзацу целиком** через `background-clip: text` + анимированный `background-position` (gradient в палитре заголовка: white → primary-glow → accent → white). Эффект — единый цветной отблеск, плавно скользящий по тексту слева-направо, без посимвольной мозаики. Это и есть «премиум» вариант градиентной волны.
- На уровне `<p>` остаётся `aria-label` с полным текстом + `<span class="sr-only">` для SEO/копипаста.
- `prefers-reduced-motion`: слова сразу полностью видны, волна отключена.

Удаляю компонент `WaveText` из подзаголовка (он остаётся для H1 как есть — там посимвольная волна уместна и работает корректно).

### 3) CSS добавки в `src/styles.css`
- `@keyframes hero-kenburns` + класс `.hero-kenburns` (с `prefers-reduced-motion: reduce`).
- `@keyframes reveal-word` (opacity-only) + `.reveal-word` базовый стиль.
- `@keyframes paragraph-wave` (animated `background-position`) + класс `.paragraph-wave` с `background-clip: text; -webkit-text-fill-color: transparent;` и градиентом `linear-gradient(100deg, #fff 0%, var(--color-primary-glow) 25%, var(--color-accent) 50%, #fff 75%, #fff 100%)` с `background-size: 250% 100%`.

## Затрагиваемые файлы

- `src/components/site/WaveSentences.tsx` — полностью переписан (премиум-ревил + paragraph-wave).
- `src/styles.css` — новые keyframes/классы, удалить устаревший `.wave-word-in`.
- `src/routes/index.tsx` — добавить класс `hero-kenburns` на hero `<img>`.

Что НЕ трогаю: H1 с `WaveText`, кнопки, метрики, ticker, остальные секции, фоновое изображение (оно подходит), палитра.