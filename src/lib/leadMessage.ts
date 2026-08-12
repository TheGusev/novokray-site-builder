// Формирование текста сообщения о заявке для Telegram.
// Вынесено из lead-api.ts, чтобы покрывать тестами без запуска сервера.

const NOT_SET = "не указано";

export function clean(v: unknown, max = 200): string {
  if (typeof v !== "string" && typeof v !== "number") return "";
  return String(v).replace(/\s+/g, " ").trim().slice(0, max);
}

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Есть ли в заявке хоть что-то, кроме телефона. */
export function hasContext(d: Record<string, unknown>): boolean {
  const docs = Array.isArray(d.docs) ? d.docs.filter(Boolean) : [];
  return Boolean(
    clean(d.name) || clean(d.pest) || clean(d.object) || clean(d.org) ||
    clean(d.inn) || clean(d.formName) || clean(d.page) || clean(d.source) ||
    docs.length,
  );
}

export function buildMessage(d: Record<string, unknown>, phone: string, now: Date = new Date()): string {
  const f = (v: unknown, max?: number) => escapeHtml(clean(v, max));
  const isCheck = clean(d.formName) === "deploy-check";
  const lines: string[] = [
    isCheck
      ? "<b>🧪 Проверка канала (автотест деплоя)</b>"
      : `<b>🔔 ${f(d.type || "Заявка с сайта", 60)}</b>`,
    "",
  ];
  const add = (label: string, value: string, fallback = "") => {
    const v = value || fallback;
    if (v) lines.push(`${label}: ${v}`);
  };

  // КТО
  lines.push("<b>Кто</b>");
  add("Имя", f(d.name, 60), NOT_SET);
  lines.push(`Телефон: <a href="tel:${phone}">${phone}</a>`);
  add("Организация", f(d.org, 120));
  add("ИНН", f(d.inn, 12));

  // ЧТО
  const docs = Array.isArray(d.docs)
    ? (d.docs as unknown[]).map((x) => clean(x, 60)).filter(Boolean).slice(0, 12)
    : [];
  lines.push("", "<b>Что нужно</b>");
  add("Услуга", f(d.pest, 80), NOT_SET);
  add("Объект", f(d.object, 80), NOT_SET);
  if (docs.length) lines.push(`Документы: ${escapeHtml(docs.join(", "))}`);
  add("Комментарий", f(d.comment, 300));

  // ПОЧЕМУ такая цена
  const price = Number(d.priceFrom);
  if (Number.isFinite(price) && price > 0) {
    lines.push("", "<b>Цена</b>", `Расчёт: от ${price.toLocaleString("ru-RU")} ₽`);
    add("Основание", f(d.priceBasis, 160));
  }

  // ОТКУДА
  lines.push("", "<b>Источник</b>");
  add("Форма", f(d.formName, 80), NOT_SET);
  add("Страница", f(d.page || d.source, 200), NOT_SET);
  add("Переход с", f(d.referrer, 200));
  const utm = d.utm && typeof d.utm === "object" && !Array.isArray(d.utm)
    ? (d.utm as Record<string, unknown>)
    : {};
  const utmLine = Object.entries(utm)
    .map(([k, v]) => `${clean(k, 20)}=${clean(v, 120)}`)
    .filter((s) => !s.endsWith("="))
    .slice(0, 7)
    .join(", ");
  if (utmLine) lines.push(`Метки: ${escapeHtml(utmLine)}`);
  add("Устройство", f(d.device, 20));

  const sentAt = Date.parse(clean(d.sentAt, 40));
  if (Number.isFinite(sentAt) && now.getTime() - sentAt > 5 * 60_000) {
    lines.push(
      `⏳ Из офлайн-очереди, создана: ${new Date(sentAt).toLocaleString("ru-RU", { timeZone: "Asia/Novosibirsk" })}`,
    );
  }
  lines.push(`Время: ${now.toLocaleString("ru-RU", { timeZone: "Asia/Novosibirsk" })}`);

  if (!isCheck && !hasContext(d)) {
    lines.push(
      "",
      "⚠️ Заявка без контекста — вероятно, служебный запрос или устаревшая версия сайта.",
    );
  }
  return lines.join("\n");
}