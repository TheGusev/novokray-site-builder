// Приём заявок с сайта и пересылка в Telegram-группу.
// Запускается на сервере через systemd: bun run server/lead-api.ts
// Токен читается из окружения (TELEGRAM_BOT_TOKEN), в репозитории его нет.

import { buildMessage, clean } from "./leadMessage";
import { isValidInn, pickParty } from "../src/lib/dadata.parse";

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

/** Расшифровка типовых ошибок Telegram — чтобы причина была видна в journalctl. */
export function explainTelegramError(status: number, body: string): string {
  const b = body.toLowerCase();
  if (b.includes("chat not found"))
    return "бот не добавлен в группу или неверный TELEGRAM_CHAT_ID";
  if (b.includes("bot was kicked") || b.includes("bot was blocked"))
    return "бота удалили из группы или заблокировали";
  if (status === 401 || b.includes("unauthorized"))
    return "неверный TELEGRAM_BOT_TOKEN в /etc/dez-federation/lead.env";
  if (status === 403)
    return "у бота нет права писать в эту группу";
  if (status === 429) return "лимит Telegram, повторить позже";
  if (b.includes("can't parse entities"))
    return "Telegram не принял разметку сообщения";
  return "см. текст ответа Telegram выше";
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
    console.error("TELEGRAM_BOT_TOKEN не задан в /etc/dez-federation/lead.env");
    return json({ ok: false, error: "token_not_configured" }, 503);
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
    console.error(`причина: ${explainTelegramError(res?.status ?? 0, body)}`);
    return json({ ok: false, error: "telegram_failed" }, 502);
  }

  return json({ ok: true });
}

/** Прокси к DaData: ключ остаётся на сервере, браузер получает только реквизиты. */
async function handleDadata(req: Request, ip: string): Promise<Response> {
  if (rateLimited(ip)) return json({ ok: false, error: "rate_limited" }, 429);

  const raw = await req.text();
  if (raw.length > 512) return json({ ok: false, error: "bad_request" }, 400);

  let inn = "";
  try {
    const parsed = JSON.parse(raw) as { inn?: unknown };
    inn = typeof parsed?.inn === "string" ? parsed.inn.replace(/\D/g, "") : "";
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }
  if (!isValidInn(inn)) return json({ ok: false, error: "invalid_inn" }, 422);

  const key = process.env.DADATA_API_KEY;
  if (!key) {
    console.error("DADATA_API_KEY не задан в /etc/dez-federation/lead.env");
    return json({ ok: false, error: "key_not_configured" }, 503);
  }

  const res = await fetch(
    "https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Token ${key}`,
      },
      body: JSON.stringify({ query: inn, count: 1 }),
      signal: AbortSignal.timeout(6000),
    },
  ).catch((e) => {
    console.error("dadata request failed", e);
    return null;
  });

  if (!res || !res.ok) {
    const body = res ? await res.text().catch(() => "") : "network error";
    console.error(`dadata failed [${res?.status ?? 0}]: ${body}`);
    if (res?.status === 401 || res?.status === 403)
      console.error("причина: неверный DADATA_API_KEY в /etc/dez-federation/lead.env");
    return json({ ok: false, error: "upstream_failed" }, 502);
  }

  const party = pickParty(await res.json().catch(() => null));
  if (!party) return json({ ok: false, error: "not_found" }, 404);
  return json({ ok: true, party });
}

Bun.serve({
  port: PORT,
  hostname: "127.0.0.1",
  async fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname === "/health")
      return json({
        ok: true,
        token: Boolean(process.env.TELEGRAM_BOT_TOKEN),
        dadata: Boolean(process.env.DADATA_API_KEY),
        chatId: CHAT_ID,
      });
    const route = url.pathname;
    if (route !== "/api/lead" && route !== "/api/dadata")
      return json({ ok: false, error: "not_found" }, 404);
    if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);

    const ip =
      req.headers.get("x-real-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      server.requestIP(req)?.address ||
      "0.0.0.0";

    try {
      return route === "/api/dadata" ? await handleDadata(req, ip) : await handleLead(req, ip);
    } catch (e) {
      console.error(`${route} handler error`, e);
      return json({ ok: false, error: "internal_error" }, 500);
    }
  },
});

console.log(`lead-api listening on 127.0.0.1:${PORT}`);
