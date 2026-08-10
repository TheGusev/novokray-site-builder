import heroTeam from "@/assets/hero-team.jpg";
import heroSpray from "@/assets/hero-spray.jpg";
import equipmentFlatlay from "@/assets/equipment-flatlay.jpg";
import documentsImg from "@/assets/documents.jpg";
import officeImg from "@/assets/office.jpg";
import b2bCafe from "@/assets/b2b-cafe.jpg";
import svcKlopy from "@/assets/svc-klopy.jpg";
import svcTarakany from "@/assets/svc-tarakany.jpg";
import svcGryzuny from "@/assets/svc-gryzuny.jpg";
import svcBloh from "@/assets/svc-bloh.jpg";
import svcMuravi from "@/assets/svc-muravi.jpg";
import svcOsy from "@/assets/svc-osy.jpg";
import svcMoshkiKomari from "@/assets/svc-moshki-komari.jpg";
import svcKleshchi from "@/assets/svc-kleshchi.jpg";
import svcBorshchevik from "@/assets/svc-borshchevik.jpg";
import svcPlesen from "@/assets/svc-plesen.jpg";
import svcOzon from "@/assets/svc-ozon.jpg";
import svcSushka from "@/assets/svc-sushka.jpg";
import svcFumigaciya from "@/assets/svc-fumigaciya.jpg";
import svcDezinfekciya from "@/assets/svc-dezinfekciya.jpg";
import svcDezodoraciya from "@/assets/svc-dezodoraciya.jpg";

// Реальные рабочие фото с объектов (клопы)
import klopyRazborKrovati from "@/assets/klopy-razbor-krovati.jpg";
import klopyNaMatrase from "@/assets/klopy-na-matrase.jpg";

// Unique blog covers
import blogUkusKlopa from "@/assets/blog-ukus-klopa.jpg";
import blogNovostroyka from "@/assets/blog-novostroyka.jpg";
import blogUchastokVesnoy from "@/assets/blog-uchastok-vesnoy.jpg";
import blogOzonAvto from "@/assets/blog-ozon-avto.jpg";
import blogPlesenVannaya from "@/assets/blog-plesen-vannaya.jpg";
import blogZatopili from "@/assets/blog-zatopili.jpg";
import blogKafe from "@/assets/blog-kafe.jpg";
import blogPodgotovka from "@/assets/blog-podgotovka.jpg";
import blogPodval from "@/assets/blog-podval.jpg";
import blogBorschevik from "@/assets/blog-borschevik.jpg";
import blogOsyBalkon from "@/assets/blog-osy-balkon.jpg";
import blogOzonVirus from "@/assets/blog-ozon-virus.jpg";

// Unique gallery (process-in-action photos)
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";
import gallery5 from "@/assets/gallery-5.jpg";
import gallery6 from "@/assets/gallery-6.jpg";

export const COMMON = {
  heroTeam,
  heroSpray,
  equipment: equipmentFlatlay,
  documents: documentsImg,
  office: officeImg,
  b2bCafe,
};

/** Реальные фото с обработок от клопов — используются на странице услуги и в статьях. */
export const KLOPY_PHOTOS = {
  razborKrovati: klopyRazborKrovati,
  naMatrase: klopyNaMatrase,
};

export const KLOPY_PHOTO_META: Record<keyof typeof KLOPY_PHOTOS, ImgMeta & { caption: string }> = {
  razborKrovati: {
    alt: "Разобранная кровать с открытыми ламелями перед обработкой от клопов в квартире в Новосибирске",
    title: "Точечная обработка спальных мест: кровать разбирается до ламелей",
    caption:
      "Точечная обработка спальных мест: кровать разбираем до ламелей, проливаем короб, изнанку основания и стыки каркаса — там, где клоп прячется днём.",
  },
  naMatrase: {
    alt: "Живые постельные клопы и следы крови на матрасе — реальное фото заражённой квартиры",
    title: "Как выглядят клопы на матрасе — признак заражения спального места",
    caption:
      "Реальное фото с выезда: взрослые клопы и бурые точки на матрасе. Если вы видите такую картину — гнездо уже в спальном месте, обработка нужна по всей комнате.",
  },
};

export const SERVICE_IMAGES: Record<string, string> = {
  "unichtozhenie-klopov": svcKlopy,
  "unichtozhenie-tarakanov": svcTarakany,
  "obrabotka-uchastkov": svcKleshchi,
  "obrabotka-ot-pleseni": svcPlesen,
  "ozonirovanie-pomescheniy": svcOzon,
  "sushka-posle-zatopleniya": svcSushka,
  "dezinfekciya": svcDezinfekciya,
  "deratizaciya": svcGryzuny,
  "unichtozhenie-blokh": svcBloh,
  "unichtozhenie-os": svcOsy,
  "unichtozhenie-borschevika": svcBorshchevik,
  "fumigaciya": svcFumigaciya,
  "dezodoraciya": svcDezodoraciya,
};

// Re-exports for variety in galleries
export const GALLERY = [
  gallery1, gallery2, gallery3, gallery4, gallery5, gallery6,
];

// Map blog post slug → cover image (reuses service photos thematically)
export const BLOG_COVERS: Record<string, string> = {
  // Насекомые
  "kak-otlichit-ukus-klopa": blogUkusKlopa,
  "priznaki-zarazheniya-klopami": klopyNaMatrase,
  "klopy-v-divane-chto-delat": klopyRazborKrovati,
  "tarakany-v-novostroyke": blogNovostroyka,
  "ryzhie-i-chernye-tarakany-razlichiya": svcTarakany,
  "pochemu-tarakany-vozvraschayutsya": svcTarakany,
  "muravi-v-kvartire-novosibirsk": svcMuravi,
  "faraonovy-muravi-kak-vyvesti": svcMuravi,
  "blohi-iz-podvala": blogPodval,
  "koshachi-blohi-v-kvartire": svcBloh,
  "pischevaya-mol-na-kuhne": svcDezinfekciya,
  "cheshuynitsy-v-vannoy": svcPlesen,
  // Грызуны
  "krysy-v-chastnom-dome-nsk": svcGryzuny,
  "myshi-na-dache-zimoy": svcGryzuny,
  "kroty-na-uchastke-borba": blogUchastokVesnoy,
  "kak-najti-myshinoe-gnezdo": svcGryzuny,
  "deratizatsiya-skladov-trebovaniya": equipmentFlatlay,
  // Участок
  "obrabotka-uchastka-vesnoy": blogUchastokVesnoy,
  "kleshchi-v-akademgorodke-statistika": svcKleshchi,
  "entsefalitnyy-kleshch-pervaya-pomosch": svcKleshchi,
  "osy-na-balkone": blogOsyBalkon,
  "shershni-opasnost-i-udalenie": svcOsy,
  "borschevik-na-dache": blogBorschevik,
  "moshka-i-komary-v-novosibirske": svcMoshkiKomari,
  "obrabotka-bazy-otdyha-ob": blogUchastokVesnoy,
  // Плесень
  "plesen-v-vannoy-prichiny": blogPlesenVannaya,
  "plesen-v-podvale-mnogokvartirnogo-doma": blogPodval,
  "plesen-posle-zatopleniya": blogZatopili,
  "chernaya-plesen-vred-dlya-zdorovya": svcPlesen,
  "plesen-v-konditsionere-avto-i-doma": blogOzonAvto,
  // Запахи
  "ozonirovanie-avto-zachem": blogOzonAvto,
  "ozon-protiv-virusov": blogOzonVirus,
  "kak-ubrat-zapakh-gari-posle-pozhara": svcDezodoraciya,
  "dezodoratsiya-posle-zhivotnyh": svcDezodoraciya,
  "zapakh-tabaka-v-arendnoy-kvartire": svcOzon,
  // ЧС
  "zatopili-sosedi-chto-delat": blogZatopili,
  "sushka-posle-zatopleniya-skolko-stoit": svcSushka,
  "obrabotka-kvartiry-posle-umershego": svcDezinfekciya,
  "obrabotka-posle-pozhara-pervye-shagi": svcDezodoraciya,
  // СанПиН
  "deratizatsiya-v-kafe": blogKafe,
  "dezinfektsiya-v-detskom-sadu-sanpin": svcDezinfekciya,
  "obrabotka-gostinits-trebovaniya": b2bCafe,
  "dezinfektsiya-dlya-uk-i-tsg": svcDezinfekciya,
  "dogovor-na-dezinsektsiyu-obrazets": documentsImg,
  "zhurnal-sanpin-kak-vesti": documentsImg,
  // Препараты
  "goryachiy-tuman-vs-holodnyy": svcFumigaciya,
  "barernaya-obrabotka-chto-eto": equipmentFlatlay,
  "mikrokapsulirovannye-preparaty-2026": equipmentFlatlay,
  "akaritsidy-spisok-i-otlichiya": svcKleshchi,
  "rodentitsidy-bezopasnost-dlya-detey-i-zhivotnyh": svcGryzuny,
  // Доп. (остался из старого набора)
  "kak-podgotovit-kvartiru": blogPodgotovka,
};

// =====================================================================
// Уникальные alt / title для всех изображений сайта (SEO + a11y)
// =====================================================================

export interface ImgMeta { alt: string; title: string }

// Общие фото (hero, оборудование, документы, офис)
export const COMMON_IMAGE_META: Record<keyof typeof COMMON, ImgMeta> = {
  heroTeam: {
    alt: "Бригада санитарной службы Дез-Федерация на выезде в Новосибирске",
    title: "Дез-Федерация — выезд бригады по Новосибирску с 2014 года",
  },
  heroSpray: {
    alt: "Специалист Дез-Федерация обрабатывает квартиру холодным туманом против насекомых",
    title: "Профессиональная обработка холодным туманом — гарантия до 12 месяцев",
  },
  equipment: {
    alt: "Профессиональное оборудование Дез-Федерация: ULV-генератор, респиратор, перчатки и распылители",
    title: "Сертифицированное оборудование для дезинсекции, дератизации и дезинфекции",
  },
  documents: {
    alt: "Договор, акт выполненных работ и сертификат дезинфекции от Дез-Федерация",
    title: "Закрывающие документы для физлиц и юрлиц — договор, акт, чек/счёт",
  },
  office: {
    alt: "Диспетчерская и офис санитарной службы Дез-Федерация в Новосибирске",
    title: "Круглосуточная диспетчерская Дез-Федерация — приём заявок 24/7",
  },
  b2bCafe: {
    alt: "Обработка зала кафе по СанПиН — Дез-Федерация для бизнеса",
    title: "Договор на санобслуживание кафе, столовых и магазинов",
  },
};

// Уникальные подписи для 6 кадров главной галереи
export const GALLERY_META: ImgMeta[] = [
  {
    alt: "Дезинсектор Дез-Федерация обрабатывает кухонные шкафы от тараканов в квартире в Новосибирске",
    title: "Точечная обработка кухни от тараканов — гарантия до 12 месяцев",
  },
  {
    alt: "Холодный туман ULV-генератора заполняет комнату при обработке от клопов",
    title: "Холодный туман от клопов — проникает в плинтусы и швы мебели",
  },
  {
    alt: "Установка безопасной приманочной станции от грызунов в подвале многоквартирного дома",
    title: "Дератизация подвалов и техэтажей — договор для УК и ТСЖ",
  },
  {
    alt: "Обработка участка от клещей и комаров туманогенератором у частного дома",
    title: "Барьерная обработка участка от клещей — сезон до 6 недель",
  },
  {
    alt: "Термическая обработка спальни от постельных клопов профессиональным нагревателем",
    title: "Термообработка от клопов без химии — 100% уничтожение за один выезд",
  },
  {
    alt: "Загрузка профессионального оборудования в сервисный фургон бригады Дез-Федерация",
    title: "Выезд день в день по Новосибирску и области",
  },
];

// Уникальные alt/title для каждой услуги — отдельно для hero-страницы и карточки
export interface ServiceImgMeta { heroAlt: string; heroTitle: string; cardAlt: string; cardTitle: string }
export const SERVICE_IMAGE_META: Record<string, ServiceImgMeta> = {
  "unichtozhenie-klopov": {
    heroAlt: "Уничтожение постельных клопов в квартире — Дез-Федерация, Новосибирск",
    heroTitle: "Травля клопов холодным туманом с гарантией до 12 месяцев",
    cardAlt: "Услуга «Уничтожение клопов» — обработка спальни и мягкой мебели",
    cardTitle: "От 2 500 ₽ — выезд день в день, гарантия до года",
  },
  "unichtozhenie-tarakanov": {
    heroAlt: "Уничтожение тараканов в квартире и на кухне — Дез-Федерация, Новосибирск",
    heroTitle: "Травля тараканов гелем и туманом — гарантия до 12 месяцев",
    cardAlt: "Услуга «Уничтожение тараканов» — обработка кухни и санузла",
    cardTitle: "От 1 800 ₽ — безопасно для детей и животных",
  },
  "obrabotka-uchastkov": {
    heroAlt: "Обработка участка от клещей, комаров и муравьёв — Дез-Федерация",
    heroTitle: "Барьерная обработка дачного участка с защитой до 6 недель",
    cardAlt: "Услуга «Обработка участка» — газон, кустарники и периметр",
    cardTitle: "От 3 500 ₽ за сотку — безопасно для пчёл и питомцев",
  },
  "obrabotka-ot-pleseni": {
    heroAlt: "Удаление чёрной плесени с потолка ванной — Дез-Федерация",
    heroTitle: "Антигрибковая обработка с гарантией до 24 месяцев",
    cardAlt: "Услуга «Обработка от плесени» — стены, потолок и швы",
    cardTitle: "От 3 000 ₽ — фунгициды профессионального класса",
  },
  "ozonirovanie-pomescheniy": {
    heroAlt: "Озонирование квартиры от запахов и вирусов — Дез-Федерация",
    heroTitle: "Озонирование за 60 минут — безопасный экологичный способ",
    cardAlt: "Услуга «Озонирование помещений» — удаление запахов гари, табака и животных",
    cardTitle: "От 2 500 ₽ — выезд день в день по Новосибирску",
  },
  "sushka-posle-zatopleniya": {
    heroAlt: "Сушка квартиры после затопления промышленными осушителями",
    heroTitle: "Сушка стен и полов — спасение ремонта от соседей сверху",
    cardAlt: "Услуга «Сушка после затопления» — осушители и тепловые пушки",
    cardTitle: "От 4 000 ₽ — выезд в течение 60 минут",
  },
  "dezinfekciya": {
    heroAlt: "Дезинфекция помещения от вирусов и бактерий — Дез-Федерация",
    heroTitle: "Профессиональная дезинфекция по СанПиН с актом и сертификатом",
    cardAlt: "Услуга «Дезинфекция» — обработка квартир, офисов и общепита",
    cardTitle: "От 2 500 ₽ — антисептики 4 класса опасности",
  },
  "deratizaciya": {
    heroAlt: "Дератизация подвала и склада от крыс и мышей — Дез-Федерация",
    heroTitle: "Дератизация с приманочными станциями и гарантийным выездом",
    cardAlt: "Услуга «Дератизация» — уничтожение крыс и мышей",
    cardTitle: "От 3 000 ₽ — договор для УК, ТСЖ и бизнеса",
  },
  "unichtozhenie-blokh": {
    heroAlt: "Уничтожение блох в квартире из подвала — Дез-Федерация",
    heroTitle: "Травля блох холодным туманом с обработкой полов и плинтусов",
    cardAlt: "Услуга «Уничтожение блох» — комплексная обработка пола и подстилок",
    cardTitle: "От 2 200 ₽ — безопасно для детей и питомцев",
  },
  "unichtozhenie-os": {
    heroAlt: "Удаление осиного гнезда с балкона и кровли — Дез-Федерация",
    heroTitle: "Удаление ос и шершней с гарантией невозврата",
    cardAlt: "Услуга «Уничтожение ос» — снятие гнёзд на высоте",
    cardTitle: "От 2 000 ₽ — выезд в течение часа",
  },
  "unichtozhenie-borschevika": {
    heroAlt: "Уничтожение борщевика Сосновского на участке — Дез-Федерация",
    heroTitle: "Травля борщевика гербицидами с актом обработки",
    cardAlt: "Услуга «Уничтожение борщевика» — обработка зарослей на даче",
    cardTitle: "От 3 500 ₽ за сотку — обработка под корень",
  },
  "fumigaciya": {
    heroAlt: "Фумигация склада и зерна — Дез-Федерация",
    heroTitle: "Газовая фумигация с лицензией и сопровождением документов",
    cardAlt: "Услуга «Фумигация» — обработка складов и контейнеров",
    cardTitle: "По договору — выезд по Новосибирской области",
  },
  "dezodoraciya": {
    heroAlt: "Дезодорация помещений — удаление стойких запахов после пожара",
    heroTitle: "Дезодорация без отдушек — устраняем источник запаха",
    cardAlt: "Услуга «Дезодорация» — нейтрализация запахов гари, табака и животных",
    cardTitle: "От 2 500 ₽ — озон + спецсредства",
  },
};

// Уникальные alt/title для обложек блога (все 50 статей)
export const BLOG_IMAGE_META: Record<string, ImgMeta> = {
  // Насекомые
  "kak-otlichit-ukus-klopa": { alt: "Дорожка укусов постельного клопа на руке — фото к статье", title: "Как отличить укус клопа от комара и блохи — Дез-Федерация" },
  "priznaki-zarazheniya-klopami": { alt: "Живые постельные клопы на матрасе — реальное фото заражённой квартиры в Новосибирске", title: "10 признаков заражения квартиры клопами — проверка по чек-листу" },
  "klopy-v-divane-chto-delat": { alt: "Разобранная кровать с ламелями перед точечной обработкой мягкой мебели от клопов", title: "Клопы в диване: можно ли спасти мебель обработкой" },
  "tarakany-v-novostroyke": { alt: "Пустая кухня новостройки Новосибирска как зона риска по тараканам", title: "Тараканы в новостройке Новосибирска — причины и решение" },
  "ryzhie-i-chernye-tarakany-razlichiya": { alt: "Сравнение рыжего и чёрного таракана — внешний вид", title: "Рыжие и чёрные тараканы: отличия и тактика борьбы" },
  "pochemu-tarakany-vozvraschayutsya": { alt: "Гель-приманка против тараканов на кухонной поверхности", title: "Почему тараканы возвращаются через 2 недели — 5 причин" },
  "muravi-v-kvartire-novosibirsk": { alt: "Рыжие домовые муравьи на стене и плинтусе", title: "Муравьи в квартире Новосибирска: виды и методы борьбы" },
  "faraonovy-muravi-kak-vyvesti": { alt: "Колония фараоновых муравьёв в пустоте стены — гель-приманка", title: "Как вывести фараоновых муравьёв в многоквартирном доме" },
  "blohi-iz-podvala": { alt: "Специалист осматривает подвал многоквартирного дома на наличие блох", title: "Блохи на первом этаже: почему идут из подвала" },
  "koshachi-blohi-v-kvartire": { alt: "Кот сидит на ковре в квартире — обработка от кошачьих блох", title: "Кошачьи блохи в квартире: схема обработки с питомцем" },
  "pischevaya-mol-na-kuhne": { alt: "Заражённая крупа с личинками огнёвки мельничной", title: "Пищевая моль на кухне: как избавиться навсегда" },
  "cheshuynitsy-v-vannoy": { alt: "Серебристая чешуйница на белой кафельной плитке ванной", title: "Чешуйницы в ванной: безвредны, но как от них избавиться" },
  // Грызуны
  "krysy-v-chastnom-dome-nsk": { alt: "Серая крыса возле деревянной стены частного дома", title: "Крысы в частном доме под Новосибирском — схема защиты" },
  "myshi-na-dache-zimoy": { alt: "Мышиное гнездо в утеплителе дачного дома", title: "Мыши на даче зимой: профилактика и борьба" },
  "kroty-na-uchastke-borba": { alt: "Кротовины на газоне дачного участка в Сибири", title: "Кроты на участке: 4 метода и 1 миф" },
  "kak-najti-myshinoe-gnezdo": { alt: "Фонарик исследует пространство за холодильником в квартире", title: "Как найти мышиное гнездо в квартире за 30 минут" },
  "deratizatsiya-skladov-trebovaniya": { alt: "Стеллажи логистического склада с приманочными станциями", title: "Дератизация склада: СанПиН, периодичность, цены" },
  // Участок
  "obrabotka-uchastka-vesnoy": { alt: "Опрыскиватель распыляет акарицид на газон загородного участка", title: "Календарь обработки участка от клещей в НСО 2026" },
  "kleshchi-v-akademgorodke-statistika": { alt: "Лесная тропа Академгородка — зона риска клещевого энцефалита", title: "Клещи в Академгородке: статистика и зоны риска" },
  "entsefalitnyy-kleshch-pervaya-pomosch": { alt: "Удаление присосавшегося клеща пинцетом — первая помощь", title: "Первая помощь при укусе клеща — пошаговая инструкция" },
  "osy-na-balkone": { alt: "Бумажное осиное гнездо под деревянным карнизом балкона", title: "Осиное гнездо на балконе — снимать ли самому" },
  "shershni-opasnost-i-udalenie": { alt: "Шершень обыкновенный Vespa crabro на деревянной поверхности", title: "Шершни в Новосибирске: опасность и удаление гнезда" },
  "borschevik-na-dache": { alt: "Заросли борщевика Сосновского с зонтиковидными соцветиями", title: "Уничтожение борщевика на даче — гербициды и сроки" },
  "moshka-i-komary-v-novosibirske": { alt: "Туча мошки над рекой Обью в начале июня", title: "Мошка и комары в Новосибирске — обработка участка" },
  "obrabotka-bazy-otdyha-ob": { alt: "Турбаза на берегу Обского моря — комплексная сезонная обработка", title: "Обработка базы отдыха на Оби — комплекс на сезон" },
  // Плесень
  "plesen-v-vannoy-prichiny": { alt: "Очаги чёрной плесени на потолке ванной панельного дома", title: "Чёрная плесень в ванной — 7 причин и решение" },
  "plesen-v-podvale-mnogokvartirnogo-doma": { alt: "Сырой подвал многоквартирного дома с грибком на стенах", title: "Плесень в подвале МКД — ответственность управляющей компании" },
  "plesen-posle-zatopleniya": { alt: "Гипсокартонная стена с пятнами плесени после потопа", title: "Плесень после затопления — профилактика в первые 48 часов" },
  "chernaya-plesen-vred-dlya-zdorovya": { alt: "Колония Stachybotrys chartarum на стене жилой квартиры", title: "Чёрная плесень и здоровье — что говорят исследования" },
  "plesen-v-konditsionere-avto-i-doma": { alt: "Открытый испаритель сплит-системы с налётом плесени", title: "Плесень в кондиционере: автомобиль, дом, офис" },
  // Запахи
  "ozonirovanie-avto-zachem": { alt: "Озонатор внутри салона автомобиля во время обработки от запахов", title: "Озонирование автомобиля — когда нужно и сколько стоит" },
  "ozon-protiv-virusov": { alt: "Промышленный озонатор в зале офиса для дезинфекции воздуха", title: "Озон против вирусов: что говорит наука" },
  "kak-ubrat-zapakh-gari-posle-pozhara": { alt: "Закопчённая квартира после пожара — следы сажи на стенах", title: "Как убрать запах гари после пожара — рабочие технологии" },
  "dezodoratsiya-posle-zhivotnyh": { alt: "УФ-фонарь выявляет следы мочи кошки на ламинате", title: "Запах мочи кошки и собаки — как убрать навсегда" },
  "zapakh-tabaka-v-arendnoy-kvartire": { alt: "Жёлтый налёт никотиновой смолы на потолке после курильщика", title: "Запах табака в квартире: удаление после курильщика" },
  // ЧС
  "zatopili-sosedi-chto-delat": { alt: "Лужи воды на ламинате квартиры после затопления соседями", title: "Затопили соседи — пошаговая инструкция в первые часы" },
  "sushka-posle-zatopleniya-skolko-stoit": { alt: "Промышленный осушитель Trotec в работе после потопа", title: "Сушка квартиры после потопа — цена и сроки в Новосибирске" },
  "obrabotka-kvartiry-posle-umershego": { alt: "Дезинфектор в СИЗ обрабатывает помещение после санитарного ЧС", title: "Обработка квартиры после умершего — деликатный сервис" },
  "obrabotka-posle-pozhara-pervye-shagi": { alt: "Квартира после тушения пожара — следы сажи и воды", title: "Обработка квартиры после пожара — первые 48 часов" },
  // СанПиН
  "deratizatsiya-v-kafe": { alt: "Специалист проверяет приманочную станцию на кухне ресторана", title: "Дератизация в кафе по СанПиН — требования Роспотребнадзора" },
  "dezinfektsiya-v-detskom-sadu-sanpin": { alt: "Светлая игровая комната детского сада после дезинфекции", title: "Дезинфекция в детском саду по СанПиН 2.4.3648-20" },
  "obrabotka-gostinits-trebovaniya": { alt: "Уборка номера гостиницы между гостями с антисептиком", title: "Обработка гостиниц — стандарт между гостями" },
  "dezinfektsiya-dlya-uk-i-tsg": { alt: "Подвал многоквартирного дома после обработки управляющей компанией", title: "Дезинфекция и дератизация для УК и ТСЖ — тарифы" },
  "dogovor-na-dezinsektsiyu-obrazets": { alt: "Подписанный договор на дезинсекцию с печатями сторон", title: "Договор на дезинсекцию — образец и чек-лист пунктов" },
  "zhurnal-sanpin-kak-vesti": { alt: "Журнал учёта дератизационных мероприятий с записями", title: "Журнал СанПиН — как вести и хранить" },
  // Препараты
  "goryachiy-tuman-vs-holodnyy": { alt: "Генератор горячего тумана в работе во время обработки помещения", title: "Горячий и холодный туман: разница и применение" },
  "barernaya-obrabotka-chto-eto": { alt: "Распыление микрокапсулированного барьерного препарата по плинтусу", title: "Барьерная обработка — что это и зачем нужна" },
  "mikrokapsulirovannye-preparaty-2026": { alt: "Промышленный распылитель с микрокапсулированным препаратом", title: "Микрокапсулированные препараты 2026 — рейтинг" },
  "akaritsidy-spisok-i-otlichiya": { alt: "Линейка флаконов акарицидных препаратов для обработки участка", title: "Акарициды для участка — список и отличия" },
  "rodentitsidy-bezopasnost-dlya-detey-i-zhivotnyh": { alt: "Закрытая приманочная станция с замком против крыс и мышей", title: "Родентициды и безопасность для детей и животных" },
  // Прочее
  "kak-podgotovit-kvartiru": { alt: "Гостиная с накрытой плёнкой мебелью — подготовка к обработке", title: "Как подготовить квартиру к дезинсекции — чек-лист" },
};