# Локальная разметка, каталоги предложений, FAQ и пошаговое подписание договора

## 1. LocalBusiness / Organization: усилить локальный сигнал

Глобальный граф в шапке сайта уже содержит `Organization`, `WebSite` и `LocalBusiness` с названием, адресом, телефоном и графиком 07:00–23:00. Доработки:

- Добавить `areaServed` самой организации (сейчас область указана только у `LocalBusiness` и `contactPoint`): Новосибирск + Новосибирская область + города-спутники.
- Добавить в `LocalBusiness` поля `hasMap`, `currenciesAccepted`, `paymentAccepted`, `logo`, `sameAs` (Telegram, MAX) и ссылку `provider`/`parentOrganization` на `#organization`, чтобы узлы связались в один граф.
- Единый источник данных: расширить `src/lib/serviceSchema.ts` (или новый `src/lib/orgSchema.ts`) функциями `organizationNode()`, `localBusinessNode(area)`, `openingHoursNode()` — сейчас часы и адрес продублированы в трёх файлах руками.
- Гео-страницы города и района переиспользуют `localBusinessNode` со своим `areaServed`, чтобы реквизиты нигде не расходились.

## 2. ItemList и OfferCatalog для каталогов

`ItemList` уже стоит на `/services`, хабах `/uslugi/*` и гео-страницах, `OfferCatalog` — только на `/price`. Дополнить:

- Новая функция `offerCatalogNode(items, {name, url})` в `serviceSchema.ts`: `OfferCatalog` c вложенными `Offer` → `itemOffered: Service` и ценой «от».
- Подключить `OfferCatalog` к `Organization`/`LocalBusiness` через `hasOfferCatalog` (каталог по трём группам: вредители, спецобработка, участки).
- Добавить `ItemList` + `OfferCatalog` туда, где их сейчас нет: страница категории `/category/dezinfekciya-novosibirsk`, `/price` (к существующему `OfferCatalog` добавить `ItemList` с позициями), `/karta-sayta` — `ItemList` разделов.
- Сохранить механику `useRefs`, чтобы `@id` узлов `Service` не дублировались внутри одного `@graph`.

## 3. FAQPage там, где блоки вопросов уже есть на странице

`FAQPage` сейчас стоит на главной, `/faq`, страницах услуг и страницах городов. Не хватает разметки при фактическом наличии блока вопросов:

- `/raion/*` — на странице есть массив из 5 вопросов, отрисованных компонентом FAQ, но в `@graph` их нет. Вынести массив в лоадер и переиспользовать в разметке (важно: текст вопроса-ответа в разметке обязан совпадать с видимым текстом).
- Хабы `/uslugi/*` — добавить 4–5 вопросов «что входит в услугу, сколько занимает, нужна ли подготовка, какая гарантия, безопасно ли для детей и животных» + вывод их в UI через существующий компонент FAQ.
- `/category/dezinfekciya-novosibirsk` — то же самое, с уклоном в дезинфекцию и СанПиН.
- Общий хелпер `faqPageNode(items, pageUrl)`, чтобы формат был одинаковым везде.

## 4. Договор: блокировка шагов подписания и прогресс 1/3 → 2/3 → 3/3

В блоке «5. Подписание» на `/dogovor/zapolnit`:

- Шаг 1/3 — подпись мастера. Холст клиента заблокирован (неактивен, пояснение «Сначала подписывает мастер»).
- Шаг 2/3 — после сохранения подписи мастера холст клиента разблокируется.
- Шаг 3/3 — обе подписи получены, кнопка «Сформировать PDF» становится активной.
- Индикатор прогресса над блоком: три сегмента с подписями «Мастер», «Заказчик», «PDF» и текстом «Шаг 1 из 3».
- Кнопка PDF блокируется, пока нет обеих подписей или есть ошибки в блоках работ; текст подсказки объясняет, чего не хватает.
- Очистка подписи мастера сбрасывает подпись клиента (договор нельзя подписать «задним числом»).

## Технические детали

- Новый модуль `src/lib/orgSchema.ts`: `organizationNode`, `localBusinessNode`, `openingHoursNode`, `faqPageNode`; `serviceSchema.ts` дополняется `offerCatalogNode`.
- Правки роутов: `__root.tsx`, `index.tsx`, `services.index.tsx`, `uslugi.$slug.tsx`, `gorod.$slug.tsx`, `raion.$slug.tsx`, `category.dezinfekciya-novosibirsk.tsx`, `price.tsx`, `karta-sayta.tsx`.
- Правки UI договора: `src/routes/dogovor.zapolnit.tsx` + `src/components/dogovor/SignaturePad.tsx` (проп `disabled`, проп `onClear`).
- Тесты: расширить `src/lib/__tests__/headMarkup.test.ts` — на каждой странице проверяются наличие `LocalBusiness` с телефоном и графиком, соответствие вопросов `FAQPage` видимому тексту, отсутствие неразрывных пробелов, абсолютные URL, уникальность `@id` в пределах графа. Добавить тесты логики блокировки подписи.
