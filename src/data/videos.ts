import kompleksnaya from "@/assets/video/kompleksnaya-obrabotka.mp4.asset.json";
import kompleksnayaPoster from "@/assets/video/kompleksnaya-obrabotka-poster.webp.asset.json";
import tarakany from "@/assets/video/obrabotka-ot-tarakanov.mp4.asset.json";
import tarakanyPoster from "@/assets/video/obrabotka-ot-tarakanov-poster.webp.asset.json";
import spalnoe from "@/assets/video/obrabotka-spalnogo-mesta.mp4.asset.json";
import spalnoePoster from "@/assets/video/obrabotka-spalnogo-mesta-poster.webp.asset.json";
import uchastok from "@/assets/video/obrabotka-uchastka.mp4.asset.json";
import uchastokPoster from "@/assets/video/obrabotka-uchastka-poster.webp.asset.json";
import klopyResult from "@/assets/video/rezultat-klopy-tuman.mp4.asset.json";
import klopyResultPoster from "@/assets/video/rezultat-klopy-tuman-poster.webp.asset.json";
import uchastokFoto from "@/assets/video/uchastok-foto.webp.asset.json";

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
}

export const WORK_VIDEOS: WorkVideo[] = [
  {
    slug: "obrabotka-spalnogo-mesta",
    title: "Обработка спального места горячим туманом",
    description:
      "Точечная обработка кровати и матраса: туман проникает в швы, стыки каркаса и складки — там, где прячутся клопы.",
    src: spalnoe.url,
    poster: spalnoePoster.url,
    orientation: "portrait",
    durationSec: 35,
    sizeBytes: spalnoe.size,
    services: ["unichtozhenie-klopov"],
    pest: "Клопы",
    tags: ["клопы", "горячий туман", "квартира"],
  },
  {
    slug: "rezultat-klopy-tuman",
    title: "Результат обработки от клопов туманом",
    description:
      "Что видит клиент после обработки: погибшие насекомые на обработанных поверхностях уже в первые часы.",
    src: klopyResult.url,
    poster: klopyResultPoster.url,
    orientation: "landscape",
    durationSec: 17,
    sizeBytes: klopyResult.size,
    services: ["unichtozhenie-klopov"],
    pest: "Клопы",
    tags: ["клопы", "результат"],
  },
  {
    slug: "obrabotka-ot-tarakanov",
    title: "Обработка квартиры от тараканов",
    description:
      "Пролив кухонного гарнитура, плинтусов и коммуникаций: препарат заходит в щели и работает барьером несколько недель.",
    src: tarakany.url,
    poster: tarakanyPoster.url,
    orientation: "portrait",
    durationSec: 46,
    sizeBytes: tarakany.size,
    services: ["unichtozhenie-tarakanov"],
    pest: "Тараканы",
    tags: ["тараканы", "кухня", "барьер"],
  },
  {
    slug: "kompleksnaya-obrabotka",
    title: "Комплексная обработка помещения",
    description:
      "Полный цикл по помещению: генератор тумана обрабатывает объём, мебель и труднодоступные зоны за один выезд.",
    src: kompleksnaya.url,
    poster: kompleksnayaPoster.url,
    orientation: "portrait",
    durationSec: 18,
    sizeBytes: kompleksnaya.size,
    services: ["dezinfekciya", "unichtozhenie-klopov"],
    pest: "Другое",
    tags: ["комплекс", "туман", "помещение"],
  },
  {
    slug: "obrabotka-uchastka",
    title: "Обработка участка от клещей, комаров и ос",
    description:
      "Моторный опрыскиватель проходит траву, кустарник и периметр — защита участка на весь сезон активности.",
    src: uchastok.url,
    poster: uchastokPoster.url,
    orientation: "portrait",
    durationSec: 19,
    sizeBytes: uchastok.size,
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
  url: uchastokFoto.url,
  alt: "Обработка участка с бассейном от клещей и комаров — Новосибирская область",
  title: "Выезд на участок: обработка территории от клещей и комаров",
};

/** Видео, относящиеся к конкретной услуге. */
export function videosForService(slug: string): WorkVideo[] {
  return WORK_VIDEOS.filter((v) => v.services.includes(slug));
}