// Карта поисковых намерений и правил перелинковки.
// Задача: один запрос — одна целевая страница. Коммерческие анкоры ведут
// только на страницу услуги, гео-анкоры — только на гео-страницу,
// информационные — на статьи блога. Хабы и категория — навигационные.

export type Intent = "commercial" | "geo" | "info" | "nav" | "utility";

export interface IntentEntry {
  /** Путь страницы (без домена) */
  path: string;
  intent: Intent;
  /** Главный запрос, за который отвечает страница */
  keyword: string;
}

/** Коммерческий анкор услуги: используется только на ссылке в /services/<slug>. */
export const SERVICE_ANCHOR: Record<string, string> = {
  "unichtozhenie-klopov": "уничтожение клопов",
  "unichtozhenie-tarakanov": "уничтожение тараканов",
  "unichtozhenie-blokh": "уничтожение блох",
  "unichtozhenie-os": "уничтожение ос и шершней",
  "unichtozhenie-borschevika": "уничтожение борщевика",
  deratizaciya: "дератизация",
  dezinfekciya: "дезинфекция помещений",
  dezodoraciya: "удаление запахов",
  "obrabotka-uchastkov": "обработка участка от клещей и комаров",
  "obrabotka-ot-pleseni": "удаление плесени",
  "ozonirovanie-pomescheniy": "озонирование",
  "sushka-posle-zatopleniya": "сушка после затопления",
  fumigaciya: "фумигация",
};

/**
 * Анкор для гео-страницы: коммерческая формулировка обязательно уточняется
 * геопривязкой, иначе гео-страница конкурирует со страницей услуги.
 */
export function geoAnchor(serviceSlug: string, place: string): string {
  const base = SERVICE_ANCHOR[serviceSlug] ?? "санитарная обработка";
  return `${base} ${place}`;
}

/** Нейтральный (некоммерческий) анкор — так услуги ссылаются на статьи. */
export function infoAnchor(title: string): string {
  return title.replace(/\s*[—–-]\s*(цена|стоимость|заказать).*$/i, "").trim();
}

/** Реестр намерений: расширяется вместе с сайтом. */
export const INTENT_MAP: IntentEntry[] = [
  { path: "/", intent: "nav", keyword: "санитарная служба Новосибирск" },
  { path: "/services", intent: "nav", keyword: "услуги санитарной службы" },
  {
    path: "/category/dezinfekciya-novosibirsk",
    intent: "nav",
    keyword: "какая обработка нужна",
  },
  { path: "/price", intent: "utility", keyword: "прайс-лист санитарной обработки" },
  { path: "/blog", intent: "nav", keyword: "библиотека статей о дезинсекции" },
  { path: "/video", intent: "nav", keyword: "видео работ" },
  ...Object.entries(SERVICE_ANCHOR).map(([slug, kw]): IntentEntry => ({
    path: `/services/${slug}`,
    intent: "commercial",
    keyword: `${kw} новосибирск`,
  })),
];

/** Максимум ссылок на соседние гео-страницы, чтобы не размывать вес. */
export const GEO_CROSSLINK_LIMIT = 4;
