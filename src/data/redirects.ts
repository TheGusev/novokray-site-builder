/**
 * Устаревшие адреса (старые ссылки, объявления, внешние упоминания).
 *
 * Единый источник для правил Apache (.htaccess) и nginx: оба файла
 * генерируются в scripts/generate-static.mjs, поэтому расхождений быть не может.
 * Всё, чего нет ни в маршрутах, ни в этом списке, отдаёт 404.
 */
export interface LegacyRedirect {
  /** старый путь без слэша на конце */
  from: string;
  /** актуальный путь */
  to: string;
}

export const LEGACY_REDIRECTS: LegacyRedirect[] = [
  // короткие адреса по вредителям
  { from: "/klopy", to: "/services/unichtozhenie-klopov" },
  { from: "/tarakany", to: "/services/unichtozhenie-tarakanov" },
  { from: "/gryzuny", to: "/services/deratizaciya" },
  { from: "/blohi", to: "/services/unichtozhenie-blokh" },
  { from: "/osy", to: "/services/unichtozhenie-os" },
  { from: "/plesen", to: "/services/obrabotka-ot-pleseni" },
  { from: "/borschevik", to: "/services/unichtozhenie-borschevika" },

  // старая схема /uslugi/<услуга> (сейчас /uslugi/ — только хабы)
  { from: "/uslugi/unichtozhenie-klopov", to: "/services/unichtozhenie-klopov" },
  { from: "/uslugi/unichtozhenie-tarakanov", to: "/services/unichtozhenie-tarakanov" },
  { from: "/uslugi/unichtozhenie-blokh", to: "/services/unichtozhenie-blokh" },
  { from: "/uslugi/unichtozhenie-os", to: "/services/unichtozhenie-os" },
  { from: "/uslugi/unichtozhenie-borschevika", to: "/services/unichtozhenie-borschevika" },
  { from: "/uslugi/deratizaciya", to: "/services/deratizaciya" },
  { from: "/uslugi/dezinfekciya", to: "/services/dezinfekciya" },
  { from: "/uslugi/dezodoraciya", to: "/services/dezodoraciya" },
  { from: "/uslugi/fumigaciya", to: "/services/fumigaciya" },
  { from: "/uslugi/ozonirovanie-pomescheniy", to: "/services/ozonirovanie-pomescheniy" },
  { from: "/uslugi/obrabotka-ot-pleseni", to: "/services/obrabotka-ot-pleseni" },
  { from: "/uslugi/sushka-posle-zatopleniya", to: "/services/sushka-posle-zatopleniya" },
  { from: "/uslugi", to: "/services" },

  // прочие старые адреса
  { from: "/dezinfekciya", to: "/services/dezinfekciya" },
  { from: "/deratizaciya", to: "/services/deratizaciya" },
  { from: "/dezinsekciya", to: "/category/dezinfekciya-novosibirsk" },
  { from: "/ozonirovanie", to: "/services/ozonirovanie-pomescheniy" },
  { from: "/ceny", to: "/price" },
  { from: "/prices", to: "/price" },
  { from: "/cennik", to: "/price" },
  { from: "/contact", to: "/contacts" },
  { from: "/kontakty", to: "/contacts" },
  { from: "/about", to: "/o-kompanii" },
  { from: "/news", to: "/blog" },
  { from: "/stati", to: "/blog" },
  { from: "/sitemap", to: "/karta-sayta" },
];
