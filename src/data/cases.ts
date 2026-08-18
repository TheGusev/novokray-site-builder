/**
 * Кейсы из реально снятых выездов.
 *
 * Источник — наши же ролики в /video (src/data/videos.ts): у каждого кейса
 * есть подтверждающее видео. Выдуманных отзывов, оценок и «звёздочек» здесь
 * нет и быть не должно: Review/AggregateRating добавим только тогда, когда
 * появятся подтверждённые отзывы клиентов с их согласием на публикацию.
 */
import { WORK_VIDEOS } from "./videos";

export interface WorkCase {
  /** slug ролика из WORK_VIDEOS — источник подтверждения */
  video: string;
  /** объект выезда */
  object: string;
  /** с чем обратились */
  problem: string;
  /** что сделали */
  work: string;
  /** результат на контроле */
  result: string;
  /** ключи вредителей (PESTS) и объектов (OBJECTS), к которым относится кейс */
  pests: string[];
  objects: string[];
}

export const WORK_CASES: WorkCase[] = [
  {
    video: "obrabotka-spalnogo-mesta",
    object: "Двухкомнатная квартира, Ленинский район",
    problem: "Укусы «дорожкой» по утрам, тёмные точки на матрасе у изголовья.",
    work: "Горячий туман по спальне, отдельная проливка каркаса кровати и матраса, барьер по плинтусу и розеткам.",
    result: "На контрольном осмотре через 14 дней новых укусов и следов нет, повторный выезд не потребовался.",
    pests: ["klopy"],
    objects: ["kvartira", "komnata", "obschezhitie", "gостиница"],
  },
  {
    video: "spalnoe-mesto-holodnyy-tuman",
    object: "Однокомнатная квартира, Октябрьский район",
    problem: "Заражение на ранней стадии: единичные особи в стыках дивана.",
    work: "Холодный туман генератором по всей площади, акцент на спальное место и мягкую мебель.",
    result: "Обработка заняла около часа, помещение проветрено к вечеру того же дня.",
    pests: ["klopy"],
    objects: ["kvartira", "studiya", "komnata"],
  },
  {
    video: "obrabotka-ot-tarakanov",
    object: "Квартира в панельном доме",
    problem: "Тараканы шли от соседей по вентиляции и стояку, днём попадались молодые особи.",
    work: "Холодный туман по всей площади, гелевые приманки в узлах кормления, барьер на вентиляции и вводах коммуникаций.",
    result: "Активность прекратилась в течение недели, гарантия зафиксирована в договоре.",
    pests: ["tarakany"],
    objects: ["kvartira", "kafe", "ofis", "obschezhitie", "sklad"],
  },
  {
    video: "kompleksnaya-obrabotka",
    object: "Нежилое помещение перед открытием",
    problem: "Требовалась подготовка помещения к приёму людей и закрывающие документы.",
    work: "Комплексная обработка: дезинсекция плюс дезинфекция поверхностей и санузлов.",
    result: "Выданы договор, акт и сведения для журнала производственного контроля.",
    pests: ["tarakany", "gryzuny", "muravi"],
    objects: ["ofis", "kafe", "sklad", "proizvodstvo", "detskiy-sad", "salon"],
  },
  {
    video: "obrabotka-uchastka",
    object: "Участок в Новосибирском районе",
    problem: "Клещи в траве по периметру и комары у водоёма.",
    work: "Обработка территории по периметру и зонам отдыха, акцент на высокую траву, кустарник и границу с лесом.",
    result: "Сезонная защита, повторная обработка по регламенту через 3–4 недели.",
    pests: ["kleschi", "komary", "moshka", "osy"],
    objects: ["uchastok", "dacha", "dom", "territoriya"],
  },
];

/** Кейс, подходящий связке «вредитель × объект». */
export function caseFor(pest: string, object: string): WorkCase | undefined {
  return (
    WORK_CASES.find((c) => c.pests.includes(pest) && c.objects.includes(object)) ??
    WORK_CASES.find((c) => c.pests.includes(pest))
  );
}

/** Есть ли у кейса живой ролик (защита от рассинхрона с /video). */
export function caseVideoExists(c: WorkCase): boolean {
  return WORK_VIDEOS.some((v) => v.slug === c.video);
}
