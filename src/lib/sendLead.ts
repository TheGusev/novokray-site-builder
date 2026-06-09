import { SITE } from "@/data/site";

export interface LeadPayload {
  type: "Заявка на обработку" | "Запрос документов";
  pest?: string;
  object?: string;
  name?: string;
  phone: string;
  org?: string;
  inn?: string;
  priceFrom?: number | null;
  source?: string;
}

function fmt(label: string, value?: string | number | null) {
  if (value === undefined || value === null || value === "") return null;
  return `${label}: ${value}`;
}

/** Builds a wa.me deeplink with a prefilled message containing the lead. */
export function buildLeadWhatsappUrl(p: LeadPayload): string {
  const lines = [
    `🔔 ${p.type} — ${SITE.shortName}`,
    "",
    fmt("Услуга", p.pest),
    fmt("Объект", p.object),
    fmt("Организация", p.org),
    fmt("ИНН", p.inn),
    fmt("Имя", p.name),
    fmt("Телефон", p.phone),
    p.priceFrom ? `Расчётная цена: от ${p.priceFrom.toLocaleString("ru-RU")} ₽` : null,
    fmt("Страница", p.source ?? (typeof window !== "undefined" ? window.location.pathname : undefined)),
  ].filter(Boolean);
  const text = encodeURIComponent(lines.join("\n"));
  const phone = SITE.whatsappHref.replace(/\D/g, "");
  return `https://wa.me/${phone}?text=${text}`;
}

/** Opens a new tab with the prefilled WhatsApp message. Returns true if popup likely succeeded. */
export function sendLeadViaWhatsapp(p: LeadPayload): boolean {
  if (typeof window === "undefined") return false;
  const url = buildLeadWhatsappUrl(p);
  const w = window.open(url, "_blank", "noopener,noreferrer");
  return Boolean(w);
}