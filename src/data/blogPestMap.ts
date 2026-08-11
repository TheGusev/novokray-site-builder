// Сопоставление темы статьи с услугой/вредителем для сквиз-форм в блоге.
// Файл намеренно лёгкий: без импорта src/data/blog.ts.

export interface BlogOffer {
  /** id вредителя из списка в LeadForm (должен совпадать точь-в-точь) */
  pest: string;
  /** Заголовок предложения под тему статьи */
  heading: string;
  /** Подзаголовок */
  sub: string;
  /** Короткие преимущества */
  bullets: string[];
  /** Цена «от», ₽ */
  priceFrom: number | null;
  /** Slug услуги для ссылки */
  service: string;
}

const BY_SERVICE: Record<string, BlogOffer> = {
  "unichtozhenie-klopov": {
    pest: "Клопы", service: "unichtozhenie-klopov", priceFrom: 1900,
    heading: "Клопы в квартире? Избавим за один выезд",
    sub: "Точечная обработка спальных мест, препараты без запаха, гарантия по договору.",
    bullets: ["Выезд за 60 минут по Новосибирску", "Препараты без запаха, можно с детьми", "Гарантия до 12 месяцев"],
  },
  "unichtozhenie-tarakanov": {
    pest: "Тараканы", service: "unichtozhenie-tarakanov", priceFrom: 1900,
    heading: "Тараканы? Обработаем за один визит",
    sub: "Холодный или горячий туман + барьерная защита, чтобы соседские не вернулись.",
    bullets: ["Барьер от соседских тараканов", "Безопасно для детей и животных", "Гарантия до 12 месяцев"],
  },
  "deratizaciya": {
    pest: "Грызуны", service: "deratizaciya", priceFrom: 2500,
    heading: "Мыши или крысы? Выведем и закроем ходы",
    sub: "Дератизация с обследованием, безопасные приманочные станции, договор и акт.",
    bullets: ["Находим и перекрываем пути входа", "Безопасные станции под замком", "Работаем с УК, кафе, складами"],
  },
  "unichtozhenie-blokh": {
    pest: "Блохи", service: "unichtozhenie-blokh", priceFrom: 1900,
    heading: "Блохи в доме? Обработаем полы, плинтусы и подвал",
    sub: "Обработка с учётом жизненного цикла — личинки тоже погибают.",
    bullets: ["Безопасно для питомцев", "Обработка плинтусов и щелей", "Гарантия по договору"],
  },
  "unichtozhenie-os": {
    pest: "Осы", service: "unichtozhenie-os", priceFrom: 1500,
    heading: "Осиное гнездо? Уберём безопасно",
    sub: "Срочный выезд, снятие гнезда, обработка места, чтобы не заселились снова.",
    bullets: ["Срочный выезд в день обращения", "Снимаем гнездо целиком", "Работаем на высоте и под крышей"],
  },
  "obrabotka-uchastkov": {
    pest: "Клещи / комары", service: "obrabotka-uchastkov", priceFrom: 2500,
    heading: "Клещи, комары, мошка на участке?",
    sub: "Акарицидная обработка территории с гарантией на сезонный период.",
    bullets: ["Обработка от 25 ₽/м²", "Гарантия 1,5 месяца", "Работаем по НСК и области"],
  },
  "unichtozhenie-borschevika": {
    pest: "Борщевик", service: "unichtozhenie-borschevika", priceFrom: 2500,
    heading: "Борщевик на участке? Уничтожим под корень",
    sub: "Гербицидная обработка с повторным контролем всходов.",
    bullets: ["Обработка полей, обочин, участков", "Контроль всходов", "НСО целиком"],
  },
  "obrabotka-ot-pleseni": {
    pest: "Плесень", service: "obrabotka-ot-pleseni", priceFrom: 1800,
    heading: "Плесень или грибок? Уберём причину, а не пятно",
    sub: "Антисептики глубокого проникновения, просушка и заключение по объекту.",
    bullets: ["Гарантия до 24 месяцев", "Работаем с подвалами МКД и УК", "Заключение и акт для管 документов"],
  },
  "ozonirovanie-pomescheniy": {
    pest: "Озонирование", service: "ozonirovanie-pomescheniy", priceFrom: 2500,
    heading: "Запах не уходит? Озонируем помещение",
    sub: "Гарь, табак, животные, сырость — расщепляем запах, а не маскируем.",
    bullets: ["Без химии и разводов", "Квартиры, авто, офисы", "Результат за один выезд"],
  },
  "dezodoraciya": {
    pest: "Озонирование", service: "dezodoraciya", priceFrom: 2500,
    heading: "Сложный запах в помещении?",
    sub: "Дезодорация и озонирование: гарь, табак, биологические запахи.",
    bullets: ["Устраняем источник запаха", "Без химии и разводов", "Выезд день в день"],
  },
  "sushka-posle-zatopleniya": {
    pest: "Сушка после потопа", service: "sushka-posle-zatopleniya", priceFrom: 3500,
    heading: "Затопило? Сушим и обрабатываем от плесени",
    sub: "Промышленные осушители, антисептик, фиксация ущерба для страховой.",
    bullets: ["Выезд 24/7", "Сушим стены, полы, мебель", "Документы для возмещения"],
  },
  "dezinfekciya": {
    pest: "Другое", service: "dezinfekciya", priceFrom: 1500,
    heading: "Нужна дезинфекция помещения?",
    sub: "Квартиры, офисы, транспорт, объекты по СанПиН — с договором и актом.",
    bullets: ["Лицензированная служба", "Договор и акт выполненных работ", "Выезд день в день"],
  },
  "fumigaciya": {
    pest: "Другое", service: "fumigaciya", priceFrom: 10000,
    heading: "Нужна фумигация склада или зерна?",
    sub: "Лицензированные специалисты, сертификаты для экспорта.",
    bullets: ["Элеваторы, склады, контейнеры", "Полный пакет документов", "Работаем по НСО"],
  },
};

const BY_CATEGORY: Record<string, string> = {
  nasekomye: "unichtozhenie-tarakanov",
  gryzuny: "deratizaciya",
  uchastok: "obrabotka-uchastkov",
  plesen: "obrabotka-ot-pleseni",
  zapahi: "ozonirovanie-pomescheniy",
  chs: "sushka-posle-zatopleniya",
  sanpin: "dezinfekciya",
  preparaty: "dezinfekciya",
};

const FALLBACK: BlogOffer = {
  pest: "Другое", service: "dezinfekciya", priceFrom: 1500,
  heading: "Нужна помощь санитарной службы?",
  sub: "Опишите ситуацию — подскажем решение и назовём цену до выезда.",
  bullets: ["Лицензированная служба", "Договор и гарантия", "Выезд день в день"],
};

/** Подбирает предложение под тему статьи. */
export function getBlogOffer(category: string, relatedServices: string[] = []): BlogOffer {
  for (const slug of relatedServices) {
    const found = BY_SERVICE[slug];
    if (found) return found;
  }
  const byCat = BY_CATEGORY[category];
  if (byCat && BY_SERVICE[byCat]) return BY_SERVICE[byCat];
  return FALLBACK;
}

export const BLOG_OFFERS = BY_SERVICE;
