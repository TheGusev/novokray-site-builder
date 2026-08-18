/**
 * Узлы Organization / LocalBusiness / FAQPage.
 *
 * Единый источник реквизитов: название, адрес, телефон, график и areaServed
 * берутся из SITE, чтобы данные не расходились между страницами.
 */
import { SITE } from "@/data/site";
import { areaNode, type AreaServed } from "@/lib/serviceSchema";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/** График работы: ежедневно 07:00–23:00. */
export function openingHoursNode() {
  return [{ "@type": "OpeningHoursSpecification", dayOfWeek: DAYS, opens: "07:00", closes: "23:00" }];
}

/** Почтовый адрес компании. */
export function postalAddressNode(withStreet = true) {
  return {
    "@type": "PostalAddress",
    addressCountry: "RU",
    addressRegion: SITE.region,
    addressLocality: SITE.city,
    ...(withStreet ? { streetAddress: SITE.address } : {}),
  };
}

/** Города и районы обслуживания по умолчанию: Новосибирск, область, спутники. */
export const SERVICE_AREA: AreaServed[] = [
  { kind: "city", name: "Новосибирск" },
  { kind: "region", name: SITE.region },
  { kind: "city", name: "Бердск" },
  { kind: "city", name: "Искитим" },
  { kind: "city", name: "Кольцово" },
  { kind: "city", name: "Краснообск" },
  { kind: "city", name: "Обь" },
];

export const SERVICE_AREA_JSON = SERVICE_AREA.map(areaNode);

interface LocalBusinessOptions {
  /** Уникальный @id: домен для глобального узла, URL страницы для гео-узлов. */
  id: string;
  /** Название с гео-уточнением, например «Дез-Федерация.ру — Бердск». */
  name?: string;
  url?: string;
  areaServed?: unknown;
  /** Координаты и рейтинг ставим только у головного узла. */
  withGeo?: boolean;
  withRating?: boolean;
  /** Ссылка на головную организацию для дочерних гео-узлов. */
  parent?: boolean;
  extra?: Record<string, unknown>;
}

/** LocalBusiness с NAP (название, адрес, телефон) и графиком работы. */
export function localBusinessNode(o: LocalBusinessOptions) {
  return {
    "@type": "LocalBusiness",
    "@id": o.id,
    name: o.name ?? SITE.name,
    image: `${SITE.domain}/og/default.jpg`,
    logo: `${SITE.domain}/logo.png`,
    url: o.url ?? SITE.domain,
    telephone: SITE.phone,
    email: SITE.email,
    priceRange: "1500–25000 RUB",
    currenciesAccepted: "RUB",
    paymentAccepted: "Наличные, банковская карта, безналичный расчёт",
    address: postalAddressNode(),
    ...(o.withGeo ? { geo: { "@type": "GeoCoordinates", latitude: SITE.geo.lat, longitude: SITE.geo.lng } } : {}),
    ...(o.withGeo ? { hasMap: `https://yandex.ru/maps/?text=${encodeURIComponent(SITE.address)}` } : {}),
    openingHoursSpecification: openingHoursNode(),
    areaServed: o.areaServed ?? SERVICE_AREA_JSON,
    sameAs: [SITE.social.telegram, SITE.social.max],
    ...(o.parent ? { parentOrganization: { "@id": `${SITE.domain}#organization` } } : {}),
    ...(o.withRating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: SITE.rating.value,
            reviewCount: SITE.rating.count,
            bestRating: "5",
            worstRating: "1",
          },
        }
      : {}),
    ...(o.extra ?? {}),
  };
}

export interface QaItem {
  q: string;
  a: string;
}

/**
 * FAQPage из тех же вопросов, что видит пользователь на странице.
 * pageUrl нужен для уникального @id, если FAQ соседствует с другими узлами.
 */
export function faqPageNode(items: QaItem[], pageUrl: string) {
  return {
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}