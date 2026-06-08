import { SITE } from "./site";

export interface CityInfo {
  slug: string;
  name: string;            // именительный
  prepositional: string;   // в Бердске / в Кольцово
  genitive: string;        // из Бердска
  distanceKm: number;      // от Новосибирска
  travelMin: number;       // время выезда
  population?: string;
  description: string;     // 1-2 предложения для intro
  landmark?: string;       // район/ориентир
}

export const CITIES: CityInfo[] = [
  {
    slug: "berdsk",
    name: "Бердск",
    prepositional: "в Бердске",
    genitive: "Бердска",
    distanceKm: 35,
    travelMin: 45,
    population: "≈100 000",
    description: "Обслуживаем все микрорайоны Бердска: центр, Северный, Южный, Микрорайон, частный сектор и СНТ вдоль Обского моря.",
    landmark: "Бердск, центр и микрорайоны",
  },
  {
    slug: "iskitim",
    name: "Искитим",
    prepositional: "в Искитиме",
    genitive: "Искитима",
    distanceKm: 60,
    travelMin: 70,
    population: "≈55 000",
    description: "Выезжаем в Искитим и Искитимский район: квартиры, частные дома, кафе, склады и производственные объекты.",
    landmark: "Искитим и район",
  },
  {
    slug: "koltsovo",
    name: "Кольцово",
    prepositional: "в Кольцово",
    genitive: "Кольцово",
    distanceKm: 25,
    travelMin: 35,
    population: "≈20 000",
    description: "Наукоград Кольцово — обрабатываем квартиры, коттеджи и коммерческие помещения с соблюдением требований биобезопасности.",
    landmark: "наукоград Кольцово",
  },
  {
    slug: "krasnoobsk",
    name: "Краснообск",
    prepositional: "в Краснообске",
    genitive: "Краснообска",
    distanceKm: 15,
    travelMin: 25,
    population: "≈18 000",
    description: "Краснообск (ВАСХНИЛ) — выезжаем в день обращения, работаем с многоквартирными домами и частным сектором.",
    landmark: "ВАСХНИЛ, Краснообск",
  },
  {
    slug: "ob",
    name: "Обь",
    prepositional: "в Оби",
    genitive: "Оби",
    distanceKm: 17,
    travelMin: 25,
    population: "≈28 000",
    description: "Город Обь рядом с аэропортом Толмачёво — обрабатываем жильё, гостиницы и складские помещения.",
    landmark: "Обь, рядом с Толмачёво",
  },
];

export const CITIES_BY_SLUG: Record<string, CityInfo> = Object.fromEntries(
  CITIES.map((c) => [c.slug, c]),
);

export const CITY_AREA_LABEL = `${SITE.city} и Новосибирская область`;