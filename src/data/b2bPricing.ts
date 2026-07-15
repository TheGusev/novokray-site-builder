// Тарификация для юридических лиц: гибрид «₽/м² × коэф. типа × коэф. вредителя».
// Значения — базовые ориентиры для КП. Мастер может уточнить в подробной смете.

export type ObjectKind =
  | "office"
  | "warehouse"
  | "catering"
  | "production"
  | "retail"
  | "medical"
  | "other";

export interface ObjectKindDef {
  key: ObjectKind;
  label: string;
  ratePerM2: number; // ₽/м² базовая ставка на один вид обработки
  hint?: string;
}

export const OBJECT_KINDS: ObjectKindDef[] = [
  { key: "office", label: "Офис", ratePerM2: 25 },
  { key: "warehouse", label: "Склад / логистика", ratePerM2: 22 },
  { key: "catering", label: "Общепит (кафе, ресторан, столовая)", ratePerM2: 35, hint: "Действуют требования СанПиН 2.3/2.4.3590-20." },
  { key: "production", label: "Производство", ratePerM2: 30 },
  { key: "retail", label: "Торговля / магазин", ratePerM2: 28 },
  { key: "medical", label: "Медучреждение / детское учреждение", ratePerM2: 40, hint: "Обработка в соответствии с СанПиН 3.3686-21." },
  { key: "other", label: "Иное", ratePerM2: 26 },
];

export interface PestPricing {
  key: string;
  label: string;
  multiplier: number; // множитель к базовой ставке ₽/м²
  barrierFixed?: number; // фикс за барьер, если применимо
}

export const PEST_OPTIONS: PestPricing[] = [
  { key: "tarakany", label: "Тараканы", multiplier: 1.0 },
  { key: "klopy", label: "Клопы", multiplier: 1.2 },
  { key: "gryzuny", label: "Грызуны (дератизация)", multiplier: 1.1 },
  { key: "muhi", label: "Мухи / комары в помещении", multiplier: 0.9 },
  { key: "muravi", label: "Муравьи", multiplier: 1.0 },
  { key: "kompleks", label: "Комплекс (насекомые + грызуны)", multiplier: 1.4 },
  { key: "dezinfekciya", label: "Дезинфекция помещений", multiplier: 1.0 },
  { key: "uchastok", label: "Обработка территории (клещи/комары)", multiplier: 0.6, barrierFixed: 2000 },
];

export type Periodicity = "once" | "monthly" | "quarterly";
export const PERIODICITY_LABEL: Record<Periodicity, string> = {
  once: "Разовая обработка",
  monthly: "Ежемесячно (12 визитов в год)",
  quarterly: "Ежеквартально (4 визита в год)",
};

export const MIN_TICKET = 3500; // минимальный чек ₽
export const VAT_RATE = 0.20;

export function getObjectKind(key: string): ObjectKindDef | undefined {
  return OBJECT_KINDS.find((k) => k.key === key);
}

export function getPest(key: string): PestPricing | undefined {
  return PEST_OPTIONS.find((p) => p.key === key);
}

export interface QuickPriceInput {
  objectKind: ObjectKind;
  areaM2: number;
  pests: string[]; // ключи PEST_OPTIONS
  withBarrier: boolean;
  vatIncluded: boolean;
  periodicity: Periodicity;
}

export interface QuickPriceResult {
  perVisit: number; // ₽ за один выезд, без НДС
  perVisitVat: number; // сумма НДС для одного визита
  perVisitTotal: number; // ₽ с НДС (если включён)
  visitsPerYear: number;
  perYearTotal: number;
  lines: Array<{ name: string; sum: number }>; // расшифровка
  minTicketApplied: boolean;
}

function visitsPerYear(p: Periodicity): number {
  if (p === "monthly") return 12;
  if (p === "quarterly") return 4;
  return 1;
}

export function calcQuickPrice(input: QuickPriceInput): QuickPriceResult {
  const kind = getObjectKind(input.objectKind);
  const area = Math.max(0, Math.round(input.areaM2 || 0));
  const rate = kind?.ratePerM2 ?? 25;
  const lines: Array<{ name: string; sum: number }> = [];

  let perVisit = 0;
  for (const key of input.pests) {
    const pest = getPest(key);
    if (!pest) continue;
    const raw = area * rate * pest.multiplier;
    const sum = Math.round(raw);
    lines.push({ name: `${pest.label} · ${area} м² × ${rate} ₽/м² × ${pest.multiplier}`, sum });
    perVisit += sum;
  }
  if (input.withBarrier) {
    const barrier = input.pests
      .map((k) => getPest(k)?.barrierFixed ?? 0)
      .reduce((s, x) => Math.max(s, x), 0) || 2000;
    lines.push({ name: "Барьерная защита периметра", sum: barrier });
    perVisit += barrier;
  }

  let minTicketApplied = false;
  if (perVisit > 0 && perVisit < MIN_TICKET) {
    lines.push({ name: `Минимальный выезд (${MIN_TICKET.toLocaleString("ru-RU")} ₽)`, sum: MIN_TICKET - perVisit });
    perVisit = MIN_TICKET;
    minTicketApplied = true;
  }

  const vat = input.vatIncluded ? Math.round(perVisit * VAT_RATE) : 0;
  const perVisitTotal = perVisit + vat;
  const visits = visitsPerYear(input.periodicity);

  return {
    perVisit,
    perVisitVat: vat,
    perVisitTotal,
    visitsPerYear: visits,
    perYearTotal: perVisitTotal * visits,
    lines,
    minTicketApplied,
  };
}
