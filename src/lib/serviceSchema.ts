/**
 * Генератор JSON-LD узлов Service / Offer / ItemList / AggregateOffer.
 *
 * Источник данных — лёгкий SERVICES_INDEX (не тянет тяжёлый каталог services.ts
 * в head-бандл). Цены берём из priceFrom и отдаём как minPrice: у нас цены «от»,
 * точная стоимость определяется после осмотра.
 */
import { SITE } from "@/data/site";
import { SERVICES_INDEX, type ServiceIndexItem } from "@/data/servicesIndex";

/** Область оказания услуги: город, район города или регион. */
export type AreaServed =
  | { kind: "city"; name: string }
  | { kind: "district"; name: string; city: string }
  | { kind: "region"; name: string };

export const DEFAULT_AREA: AreaServed[] = [
  { kind: "city", name: SITE.city },
  { kind: "region", name: SITE.region },
];

export function areaNode(a: AreaServed) {
  if (a.kind === "district") {
    return {
      "@type": "AdministrativeArea",
      name: a.name,
      containedInPlace: { "@type": "City", name: a.city },
    };
  }
  if (a.kind === "city") return { "@type": "City", name: a.name };
  return { "@type": "AdministrativeArea", name: a.name };
}

interface ServiceNodeOptions {
  /** Страница, на которой размещается узел — определяет уникальный @id. */
  pageUrl: string;
  /** Области оказания. По умолчанию — Новосибирск и область. */
  areas?: AreaServed[];
  /** Уточнение названия для гео-страниц: «Уничтожение клопов в Бердске». */
  nameSuffix?: string;
  /** Описание, если нужно переопределить metaDescription. */
  description?: string;
}

/** Узел Service с ценовым Offer. url всегда ведёт на страницу услуги — она первоисточник. */
export function serviceNode(s: ServiceIndexItem, o: ServiceNodeOptions) {
  const areas = o.areas ?? DEFAULT_AREA;
  const serviceUrl = `${SITE.domain}/services/${s.slug}`;
  const name = o.nameSuffix ? `${s.title} ${o.nameSuffix}` : s.h1;
  const areaJson = areas.map(areaNode);
  return {
    "@type": "Service",
    "@id": `${o.pageUrl}#service-${s.slug}`,
    name,
    serviceType: s.title,
    category: s.category,
    description: o.description ?? s.metaDescription,
    url: serviceUrl,
    provider: { "@id": `${SITE.domain}#organization` },
    areaServed: areaJson,
    offers: offerNode(s, { areas, url: serviceUrl }),
  };
}

/** Ценовое предложение «от N ₽» для конкретной услуги. */
export function offerNode(
  s: ServiceIndexItem,
  o: { areas?: AreaServed[]; url?: string } = {},
) {
  const areas = o.areas ?? DEFAULT_AREA;
  return {
    "@type": "Offer",
    name: s.title,
    url: o.url ?? `${SITE.domain}/services/${s.slug}`,
    availability: "https://schema.org/InStock",
    areaServed: areas.map(areaNode),
    priceSpecification: {
      "@type": "PriceSpecification",
      minPrice: s.priceFrom,
      priceCurrency: "RUB",
      valueAddedTaxIncluded: true,
      // обычные пробелы: неразрывные ломают JSON-LD-аудит и сниппеты
      description: `от ${String(s.priceFrom).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ₽`,
    },
  };
}

/** Offer, привязанный к LocalBusiness через makesOffer (с itemOffered). */
export function makesOfferNode(s: ServiceIndexItem, areas: AreaServed[]) {
  return {
    ...offerNode(s, { areas }),
    itemOffered: {
      "@type": "Service",
      name: s.title,
      serviceType: s.title,
      url: `${SITE.domain}/services/${s.slug}`,
    },
  };
}

/**
 * ItemList, где каждый элемент — Service с ценой.
 * useRefs=true отдаёт ссылку по @id: используется, когда сами узлы Service
 * уже лежат в @graph страницы (иначе получились бы дубли @id).
 */
export function serviceListNode(
  items: ServiceIndexItem[],
  o: ServiceNodeOptions & { listName: string; useRefs?: boolean },
) {
  return {
    "@type": "ItemList",
    name: o.listName,
    numberOfItems: items.length,
    itemListElement: items.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE.domain}/services/${s.slug}`,
      name: o.nameSuffix ? `${s.title} ${o.nameSuffix}` : s.title,
      item: o.useRefs
        ? { "@id": `${o.pageUrl}#service-${s.slug}` }
        : serviceNode(s, o),
    })),
  };
}

/** AggregateOffer с реальным диапазоном цен по набору услуг. */
export function aggregateOfferNode(items: ServiceIndexItem[], pageUrl: string) {
  const prices = items.map((s) => s.priceFrom);
  return {
    "@type": "AggregateOffer",
    priceCurrency: "RUB",
    lowPrice: Math.min(...prices),
    highPrice: Math.max(...prices),
    offerCount: items.length,
    availability: "https://schema.org/InStock",
    url: pageUrl,
  };
}

/** Приоритетные услуги для гео-страниц (порядок — по priority, затем по цене). */
export const GEO_SERVICE_LIMIT = 8;

export function geoServices(limit = GEO_SERVICE_LIMIT): ServiceIndexItem[] {
  return [...SERVICES_INDEX]
    .sort((a, b) => b.priority - a.priority || a.priceFrom - b.priceFrom)
    .slice(0, limit);
}