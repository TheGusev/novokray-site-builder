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
  "priznaki-zarazheniya-klopami": blogUkusKlopa,
  "klopy-v-divane-chto-delat": svcKlopy,
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
  "sherzhni-opasnost-i-udalenie": svcOsy,
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

// Уникальные alt/title для обложек блога
export const BLOG_IMAGE_META: Record<string, ImgMeta> = {
  "kak-otlichit-ukus-klopa": {
    alt: "Характерная дорожка укусов постельного клопа на руке — фото для статьи",
    title: "Как отличить укус клопа от комара — статья в блоге Дез-Федерация",
  },
  "tarakany-v-novostroyke": {
    alt: "Пустая кухня в новостройке Новосибирска — потенциальное место заселения тараканов",
    title: "Почему тараканы заводятся в новостройках и как от них избавиться",
  },
  "obrabotka-uchastka-vesnoy": {
    alt: "Обработка дачного участка от клещей и муравьёв весной",
    title: "Когда и как обрабатывать участок от клещей весной",
  },
  "ozonirovanie-avto-zachem": {
    alt: "Озонатор внутри салона автомобиля во время обработки от запахов",
    title: "Озонирование автомобиля — что даёт и сколько стоит",
  },
  "plesen-v-vannoy-prichiny": {
    alt: "Очаги чёрной плесени на потолке ванной комнаты",
    title: "Почему появляется плесень в ванной и как её вывести навсегда",
  },
  "zatopili-sosedi-chto-delat": {
    alt: "Лужи воды на ламинате после затопления соседями сверху",
    title: "Что делать сразу после затопления — пошаговая инструкция",
  },
  "deratizatsiya-v-kafe": {
    alt: "Специалист осматривает зал кафе при дератизации по СанПиН",
    title: "Дератизация в кафе и ресторанах — требования Роспотребнадзора",
  },
  "kak-podgotovit-kvartiru": {
    alt: "Гостиная с накрытой плёнкой мебелью — подготовка квартиры к обработке",
    title: "Как подготовить квартиру к дезинсекции — чек-лист",
  },
  "blohi-iz-podvala": {
    alt: "Специалист в защитном костюме осматривает подвал многоквартирного дома",
    title: "Откуда блохи в квартире на 1 этаже и что делать жителям",
  },
  "borschevik-na-dache": {
    alt: "Заросли борщевика Сосновского у деревянного забора дачи",
    title: "Как безопасно уничтожить борщевик на даче — методы и сроки",
  },
  "osy-na-balkone": {
    alt: "Осиное гнездо под деревянным карнизом балкона летом",
    title: "Что делать с осиным гнездом на балконе — безопасные способы",
  },
  "ozon-protiv-virusov": {
    alt: "Светлый зал детского сада с озонатором для дезинфекции воздуха",
    title: "Озон против вирусов и бактерий — что говорят исследования",
  },
};