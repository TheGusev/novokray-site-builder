// Единая точка отправки целей в Яндекс.Метрику.
// Составные цели (all_conversions, conv_<услуга>) собираются в интерфейсе счётчика.
import { collectUtm } from "@/lib/leadSender";

export const YM_COUNTER_ID = 110968995;

/** Атомарные цели — имена должны совпадать с настройками в Метрике. */
export const GOALS = {
  leadHero: "lead_hero",
  leadModal: "lead_modal",
  leadService: "lead_service",
  leadPrice: "lead_price",
  docsRequest: "docs_request",
  kpSubmit: "kp_submit",
  kpPdf: "kp_pdf",
  invoicePdf: "invoice_pdf",
  dogovorPdf: "dogovor_pdf",
  callClick: "call_click",
  telegramClick: "telegram_click",
  heroCallClick: "hero_call_click",
  heroCalcClick: "hero_calc_click",
  statsInfoOpen: "stats_info_open",
} as const;

export type GoalName = (typeof GOALS)[keyof typeof GOALS] | (string & {});

type YmFn = (id: number, action: string, ...rest: unknown[]) => void;

function ym(): YmFn | null {
  if (typeof window === "undefined") return null;
  const fn = (window as unknown as { ym?: YmFn }).ym;
  return typeof fn === "function" ? fn : null;
}

const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
  и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch",
  ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

/** Превращает название услуги в стабильный латинский slug для имени цели. */
export function serviceSlug(label: string): string {
  const base = (label || "")
    .toLowerCase()
    .split("")
    .map((ch) => (ch in TRANSLIT ? TRANSLIT[ch] : ch))
    .join("")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
  return base || "other";
}

function baseParams(): Record<string, unknown> {
  if (typeof window === "undefined") return {};
  return {
    page: window.location.pathname,
    device: /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? "mobile" : "desktop",
    ...collectUtm(),
  };
}

/** Безопасно отправляет цель: не падает без Метрики и при SSR. */
export function trackGoal(name: GoalName, params?: Record<string, unknown>): void {
  const payload = { ...baseParams(), ...(params ?? {}) };
  try {
    ym()?.(YM_COUNTER_ID, "reachGoal", name, payload);
  } catch {
    /* аналитика не должна ломать интерфейс */
  }
  if (import.meta.env?.DEV && typeof console !== "undefined") {
    console.debug("[goal]", name, payload);
  }
}

/** Лид: общая цель по форме + цель по конкретной услуге. */
export function trackLead(
  formGoal: GoalName,
  service?: string,
  params?: Record<string, unknown>,
): void {
  trackGoal(formGoal, { service: service ?? "", ...(params ?? {}) });
  if (service) trackGoal(`lead_${serviceSlug(service)}`, { form: formGoal, ...(params ?? {}) });
}