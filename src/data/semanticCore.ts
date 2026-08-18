/**
 * Семантическое ядро сайта: ВЧ → СЧ → НЧ → СНЧ.
 *
 * Один запрос — одна целевая страница. Файл нужен, чтобы:
 *  1) видеть, какие кластеры уже закрыты посадочными, а какие нет;
 *  2) не допускать каннибализации (два URL под один запрос);
 *  3) прогонять это тестом при каждой сборке (src/data/__tests__/semanticCore.test.ts).
 *
 * tier:
 *  vch  — высокочастотные («дезинсекция Новосибирск»)
 *  sch  — среднечастотные («уничтожение клопов Новосибирск»)
 *  nch  — низкочастотные («обработка квартиры от клопов цена»)
 *  snch — сверхнизкочастотные / микро-НЧ («клопы в общежитии Новосибирск обработка секции»)
 */
import { LANDINGS, PESTS, OBJECTS } from "./landings";
import { SERVICES_INDEX } from "./servicesIndex";
import { CITIES } from "./cities";
import { DISTRICTS } from "./districts";

export type Tier = "vch" | "sch" | "nch" | "snch";

export interface CoreQuery {
  /** поисковая фраза в нижнем регистре */
  q: string;
  tier: Tier;
  /** единственная целевая страница */
  target: string;
}

/** ВЧ и общие коммерческие кластеры — хабы и главная. */
const HEAD: CoreQuery[] = [
  { q: "санэпидемстанция новосибирск", tier: "vch", target: "/" },
  { q: "сэс новосибирск", tier: "vch", target: "/" },
  { q: "дезинфекция новосибирск", tier: "vch", target: "/category/dezinfekciya-novosibirsk" },
  { q: "дезинсекция новосибирск", tier: "vch", target: "/uslugi/unichtozhenie-vrediteley" },
  { q: "санитарная обработка новосибирск", tier: "vch", target: "/uslugi/sanitarnaya-obrabotka" },
  { q: "обработка участка новосибирск", tier: "sch", target: "/uslugi/obrabotka-uchastkov" },
  { q: "цены на дезинсекцию новосибирск", tier: "sch", target: "/price" },
  { q: "договор на дезинсекцию", tier: "nch", target: "/dogovor/zapolnit" },
  { q: "коммерческое предложение на дезинсекцию", tier: "snch", target: "/kp" },
  { q: "гарантия на обработку от насекомых", tier: "nch", target: "/garantii" },
  { q: "видео обработки от насекомых", tier: "snch", target: "/video" },
];

/** СЧ: услуга + город. */
const SERVICE_QUERIES: CoreQuery[] = SERVICES_INDEX.map((s) => ({
  q: `${s.title.toLowerCase()} новосибирск`,
  tier: "sch" as Tier,
  target: `/services/${s.slug}`,
}));

/** НЧ/СНЧ: вредитель × объект. */
const LANDING_QUERIES: CoreQuery[] = LANDINGS.flatMap((l) => {
  const pest = PESTS[l.pest];
  const obj = OBJECTS[l.object];
  const base = `обработка ${obj.genitive} от ${pest.genitive} новосибирск`;
  return [
    { q: base, tier: "nch" as Tier, target: `/obrabotka/${l.slug}` },
    { q: `${base} цена`, tier: "snch" as Tier, target: `/obrabotka/${l.slug}` },
  ];
});

/** НЧ: гео (районы и города области). */
const GEO_QUERIES: CoreQuery[] = [
  ...DISTRICTS.map((d) => ({
    q: `дезинсекция ${d.prepositional.toLowerCase()} новосибирска`,
    tier: "nch" as Tier,
    target: `/raion/${d.slug}`,
  })),
  ...CITIES.map((c) => ({
    q: `санитарная обработка ${c.prepositional.toLowerCase()}`,
    tier: "nch" as Tier,
    target: `/gorod/${c.slug}`,
  })),
];

/**
 * Кластер срочности. Отдельных URL под «срочно/сегодня/ночью» не делаем —
 * это привело бы к дублям; запросы закреплены за уже существующими
 * посадочными, где на странице есть блок «Нужно срочно — приедем сегодня».
 */
const URGENCY_QUERIES: CoreQuery[] = [
  { q: "сэс новосибирск срочно", tier: "sch", target: "/" },
  { q: "дезинсекция срочно новосибирск", tier: "nch", target: "/uslugi/unichtozhenie-vrediteley" },
  { q: "обработка от насекомых сегодня новосибирск", tier: "nch", target: "/uslugi/unichtozhenie-vrediteley" },
  { q: "сэс новосибирск круглосуточно", tier: "nch", target: "/contacts" },
  { q: "дезинсекция в выходные новосибирск", tier: "snch", target: "/contacts" },
  ...LANDINGS.flatMap((l) => {
    const pest = PESTS[l.pest];
    const obj = OBJECTS[l.object];
    return [
      {
        q: `срочная обработка ${obj.genitive} от ${pest.genitive} новосибирск`,
        tier: "snch" as Tier,
        target: `/obrabotka/${l.slug}`,
      },
    ];
  }),
];

export const SEMANTIC_CORE: CoreQuery[] = [
  ...HEAD,
  ...URGENCY_QUERIES,
  ...SERVICE_QUERIES,
  ...LANDING_QUERIES,
  ...GEO_QUERIES,
];

/** Запросы, закреплённые за одной страницей. */
export function queriesFor(path: string): CoreQuery[] {
  return SEMANTIC_CORE.filter((c) => c.target === path);
}

/** Проверка каннибализации: запрос, у которого больше одной целевой страницы. */
export function cannibalized(): Array<{ q: string; targets: string[] }> {
  const map = new Map<string, Set<string>>();
  for (const c of SEMANTIC_CORE) {
    if (!map.has(c.q)) map.set(c.q, new Set());
    map.get(c.q)!.add(c.target);
  }
  return [...map.entries()]
    .filter(([, targets]) => targets.size > 1)
    .map(([q, targets]) => ({ q, targets: [...targets] }));
}

export function coreStats(): Record<Tier, number> {
  return SEMANTIC_CORE.reduce(
    (acc, c) => ({ ...acc, [c.tier]: acc[c.tier] + 1 }),
    { vch: 0, sch: 0, nch: 0, snch: 0 } as Record<Tier, number>,
  );
}
