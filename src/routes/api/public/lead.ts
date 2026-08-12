// Резервный приём заявок: работает независимо от сервера сайта.
// Если nginx/сервис на боевом сервере недоступен, форма отправляет заявку сюда.
import { createFileRoute } from "@tanstack/react-router";
import { buildMessage, clean } from "@/lib/leadMessage";

const MAX_BODY = 8192;
const RATE_LIMIT = 8;
const RATE_WINDOW_MS = 60_000;
const DEDUP_TTL_MS = 10 * 60_000;

const hits = new Map<string, number[]>();
const seen = new Map<string, number>();

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
} as const;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...CORS },
  });
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => t > now - RATE_WINDOW_MS);
  if (list.length >= RATE_LIMIT) {
    hits.set(ip, list);
    return true;
  }
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 2000) hits.clear();
  return false;
}

/** Повтор той же заявки (основной канал мог её уже доставить) — второй раз не шлём. */
function duplicate(id: string): boolean {
  if (!id) return false;
  const now = Date.now();
  for (const [key, t] of seen) if (t < now - DEDUP_TTL_MS) seen.delete(key);
  if (seen.has(id)) return true;
  seen.set(id, now);
  return false;
}

function normalizePhone(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.length === 11 && (d.startsWith("8") || d.startsWith("7"))) d = d.slice(1);
  return d.length === 10 ? `+7${d}` : "";
}

export const Route = createFileRoute("/api/public/lead")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        const raw = await request.text();
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

        const ip =
          request.headers.get("cf-connecting-ip") ||
          request.headers.get("x-real-ip") ||
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          "0.0.0.0";
        if (rateLimited(ip)) return json({ ok: false, error: "rate_limited" }, 429);

        const phone = normalizePhone(clean(data.phone, 40));
        if (!phone) return json({ ok: false, error: "invalid_phone" }, 422);

        if (duplicate(clean(data.leadId, 60))) return json({ ok: true, duplicate: true });

        const token = process.env["TELEGRAM_BOT_TOKEN"];
        const chatId = process.env["TELEGRAM_CHAT_ID"] || "-5244841627";
        if (!token) {
          console.error("TELEGRAM_BOT_TOKEN не задан");
          return json({ ok: false, error: "token_not_configured" }, 503);
        }

        const text = buildMessage(data, phone);
        const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text,
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

        return json({ ok: true, via: "backup" });
      },
    },
  },
});
