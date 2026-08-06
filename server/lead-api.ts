// Приём заявок с сайта и пересылка в Telegram-группу.
// Запускается на сервере через systemd: bun run server/lead-api.ts
// Токен читается из окружения (TELEGRAM_BOT_TOKEN), в репозитории его нет.

const PORT = Number(process.env.LEAD_API_PORT ?? 8787);
const CHAT_ID = process.env.TELEGRAM_CHAT_ID ?? "-5244841627";
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60_000;
const MAX_BODY = 8192;

const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => t > now - RATE_WINDOW_MS);
  if (list.length >= RATE_LIMIT) {
    hits.set(ip, list);
    return true;
  }
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return false;
}

function clean(v: unknown, max = 200): string {
  if (typeof v !== "string" && typeof v !== "number") return "";
  return String(v).replace(/\s+/g, " ").trim().slice(0, max);
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function normalizePhone(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.length === 11 && (d.startsWith("8") || d.startsWith("7"))) d = d.slice(1);
  return d.length === 10 ? `+7${d}` : "";
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

function buildMessage(d: Record<string, unknown>, phone: string): string {
  const f = (v: unknown, max?: number) => escapeHtml(clean(v, max));
  const lines: string[] = [`<b>🔔 ${f(d.type || "Заявка с сайта", 60)}</b>`, ""];
  const add = (label: string, value: string) => { if (value) lines.push(`${label}: ${value}`); };

  // КТО
  lines.push("<b>Кто</b>");
  add("Имя", f(d.name, 60));
  lines.push(`Телефон: <a href="tel:${phone}">${phone}</a>`);
  add("Организация", f(d.org, 120));
  add("ИНН", f(d.inn, 12));

  // ЧТО
  const docs = Array.isArray(d.docs)
    ? (d.docs as unknown[]).map((x) => clean(x, 60)).filter(Boolean).slice(0, 12)
    : [];
  if (clean(d.pest) || clean(d.object) || docs.length) {
    lines.push("", "<b>Что нужно</b>");
    add("Услуга", f(d.pest, 80));
    add("Объект", f(d.object, 80));
    if (docs.length) lines.push(`Документы: ${escapeHtml(docs.join(", "))}`);
  }

  // ПОЧЕМУ такая цена
  const price = Number(d.priceFrom);
  if (Number.isFinite(price) && price > 0) {
    lines.push("", "<b>Цена</b>", `Расчёт: от ${price.toLocaleString("ru-RU")} ₽`);
    add("Основание", f(d.priceBasis, 160));
  }

  // ОТКУДА
  lines.push("", "<b>Источник</b>");
  add("Форма", f(d.formName, 80));
  add("Страница", f(d.page || d.source, 200));
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
  if (Number.isFinite(sentAt) && Date.now() - sentAt > 5 * 60_000) {
    lines.push(
      `⏳ Из офлайн-очереди, создана: ${new Date(sentAt).toLocaleString("ru-RU", { timeZone: "Asia/Novosibirsk" })}`,
    );
  }
  lines.push(`Время: ${new Date().toLocaleString("ru-RU", { timeZone: "Asia/Novosibirsk" })}`);
  return lines.join("\n");
}

async function handleLead(req: Request, ip: string): Promise<Response> {
  const raw = await req.text();
  if (raw.length > MAX_BODY) return json({ ok: false, error: "bad_request" }, 400);

  let data: Record<string, unknown>;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("shape");
    data = parsed as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  // Honeypot: заполняют только боты.
  if (clean(data.company)) return json({ ok: true });

  if (rateLimited(ip)) return json({ ok: false, error: "rate_limited" }, 429);

  const phone = normalizePhone(clean(data.phone, 40));
  if (!phone) return json({ ok: false, error: "invalid_phone" }, 422);

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error("TELEGRAM_BOT_TOKEN is not configured");
    return json({ ok: false, error: "token_not_configured" }, 500);
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: buildMessage(data, phone),
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
    signal: AbortSignal.timeout(10_000),
  }).catch((e) => {
    console.error("telegram request failed", e);
    return null;
  });

  if (!res || !res.ok) {
    const body = res ? await res.text().catch(() => "") : "network error";
    console.error(`telegram failed [${res?.status ?? 0}]: ${body}`);
    return json({ ok: false, error: "telegram_failed" }, 502);
  }

  return json({ ok: true });
}

Bun.serve({
  port: PORT,
  hostname: "127.0.0.1",
  async fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname === "/health") return json({ ok: true });
    if (url.pathname !== "/api/lead") return json({ ok: false, error: "not_found" }, 404);
    if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);

    const ip =
      req.headers.get("x-real-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      server.requestIP(req)?.address ||
      "0.0.0.0";

    try {
      return await handleLead(req, ip);
    } catch (e) {
      console.error("lead handler error", e);
      return json({ ok: false, error: "internal_error" }, 500);
    }
  },
});

console.log(`lead-api listening on 127.0.0.1:${PORT}`);
