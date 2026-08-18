
export interface WorkVideo {
  slug: string;
  title: string;
  description: string;
  src: string;
  poster: string;
  /** Кадр: вертикальный (съёмка на телефон) или горизонтальный */
  orientation: "portrait" | "landscape";
  durationSec: number;
  sizeBytes: number;
  /** Слаги услуг для перелинковки */
  services: string[];
  /** Тема лид-формы */
  pest: string;
  tags: string[];
  /** Главный ролик услуги: показываем его на посадочной странице */
  primary?: boolean;
}

export const WORK_VIDEOS: WorkVideo[] = [
  {
    slug: "obrabotka-spalnogo-mesta",
    title: "Обработка спального места горячим туманом",
    description:
      "Точечная обработка кровати и матраса: туман проникает в швы, стыки каркаса и складки — там, где прячутся клопы.",
    src: "/media/obrabotka-spalnogo-mesta.mp4",
    poster: "/media/obrabotka-spalnogo-mesta-poster.webp",
    orientation: "portrait",
    durationSec: 35,
    sizeBytes: 2307560,
    services: ["unichtozhenie-klopov"],
    pest: "Клопы",
    tags: ["клопы", "горячий туман", "квартира"],
    primary: true,
  },
  {
    slug: "rezultat-klopy-tuman",
    title: "Результат обработки от клопов туманом",
    description:
      "Что видит клиент после обработки: погибшие насекомые на обработанных поверхностях уже в первые часы.",
    src: "/media/rezultat-klopy-tuman.mp4",
    poster: "/media/rezultat-klopy-tuman-poster.webp",
    orientation: "landscape",
    durationSec: 17,
    sizeBytes: 1646419,
    services: ["unichtozhenie-klopov"],
    pest: "Клопы",
    tags: ["клопы", "результат"],
  },
  {
    slug: "spalnoe-mesto-holodnyy-tuman",
    title: "Обработка спального места генератором холодного тумана",
    description:
      "Холодный туман по каркасу кровати, швам и кантам матраса: мелкая капля оседает в стыках и складках, где держатся клопы.",
    src: "/media/spalnoe-mesto-holodnyy-tuman.mp4",
    poster: "/media/spalnoe-mesto-holodnyy-tuman-poster.webp",
    orientation: "portrait",
    durationSec: 15,
    sizeBytes: 1143517,
    services: ["unichtozhenie-klopov"],
    pest: "Клопы",
    tags: ["клопы", "холодный туман", "спальное место"],
  },
  {
    slug: "obrabotka-ot-tarakanov",
    title: "Обработка квартиры от тараканов",
    description:
      "Пролив кухонного гарнитура, плинтусов и коммуникаций: препарат заходит в щели и работает барьером несколько недель.",
    src: "/media/obrabotka-ot-tarakanov.mp4",
    poster: "/media/obrabotka-ot-tarakanov-poster.webp",
    orientation: "portrait",
    durationSec: 46,
    sizeBytes: 3414277,
    services: ["unichtozhenie-tarakanov"],
    pest: "Тараканы",
    tags: ["тараканы", "кухня", "барьер"],
    primary: true,
  },
  {
    slug: "kompleksnaya-obrabotka",
    title: "Комплексная обработка помещения",
    description:
      "Полный цикл по помещению: генератор тумана обрабатывает объём, мебель и труднодоступные зоны за один выезд.",
    src: "/media/kompleksnaya-obrabotka.mp4",
    poster: "/media/kompleksnaya-obrabotka-poster.webp",
    orientation: "portrait",
    durationSec: 18,
    sizeBytes: 1249066,
    services: ["dezinfekciya", "unichtozhenie-klopov"],
    pest: "Другое",
    tags: ["комплекс", "туман", "помещение"],
  },
  {
    slug: "obrabotka-uchastka",
    title: "Обработка участка от клещей, комаров и ос",
    description:
      "Моторный опрыскиватель проходит траву, кустарник и периметр — защита участка на весь сезон активности.",
    src: "/media/obrabotka-uchastka.mp4",
    poster: "/media/obrabotka-uchastka-poster.webp",
    orientation: "portrait",
    durationSec: 19,
    sizeBytes: 3211425,
    services: ["obrabotka-uchastkov", "unichtozhenie-os"],
    pest: "Клещи / комары",
    tags: ["участок", "клещи", "комары", "осы"],
  },
];

export const WORK_VIDEOS_BY_SLUG: Record<string, WorkVideo> = Object.fromEntries(
  WORK_VIDEOS.map((v) => [v.slug, v]),
);

/** Фото с выезда на участок — используется в блоке про участковые работы. */
export const UCHASTOK_PHOTO = {
  url: "/media/uchastok-obrabotka-foto.webp",
  alt: "Обработка участка с бассейном от клещей и комаров — Новосибирская область",
  title: "Выезд на участок: обработка территории от клещей и комаров",
};

/** Видео, относящиеся к конкретной услуге. */
export function videosForService(slug: string): WorkVideo[] {
  return WORK_VIDEOS.filter((v) => v.services.includes(slug));
}

/** Один главный ролик услуги — для посадочных страниц. */
export function primaryVideoForService(slug: string): WorkVideo | undefined {
  const list = videosForService(slug);
  return list.find((v) => v.primary) ?? list[0];
}

/** Ролик по умолчанию для гео-страниц (наглядная обработка спального места). */
export const GEO_VIDEO_SLUG = "obrabotka-spalnogo-mesta";

/** Размер кадра ролика (съёмка на телефон). */
export function videoDimensions(v: WorkVideo) {
  return v.orientation === "portrait" ? { width: 464, height: 848 } : { width: 720, height: 394 };
}

/** Дата публикации роликов на сайте (ISO). */
export const VIDEO_UPLOAD_DATE = "2026-08-11";

/**
 * JSON-LD VideoObject для ролика. `origin` — абсолютный адрес сайта,
 * ссылки на файл и постер должны быть абсолютными.
 */
export function videoJsonLd(v: WorkVideo, origin: string, pageUrl?: string) {
  const { width, height } = videoDimensions(v);
  return {
    "@type": "VideoObject",
    "@id": `${pageUrl ?? `${origin}/video`}#video-${v.slug}`,
    name: v.title,
    description: v.description,
    thumbnailUrl: [`${origin}${v.poster}`],
    contentUrl: `${origin}${v.src}`,
    uploadDate: VIDEO_UPLOAD_DATE,
    duration: `PT${v.durationSec}S`,
    width,
    height,
    inLanguage: "ru-RU",
    isFamilyFriendly: true,
    keywords: v.tags.join(", "),
    url: pageUrl ?? `${origin}/video#${v.slug}`,
    publisher: {
      "@type": "Organization",
      "@id": `${origin}#organization`,
    },
  };
}