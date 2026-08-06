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
  /** honeypot — заполняется только ботами */
  company?: string;
}

export const LEAD_ENDPOINT = "/api/lead";
const QUEUE_KEY = "offlineQueue";
const QUEUE_MAX = 20;
const TIMEOUT_MS = 8000;

/** Нормализует российский телефон к виду +7XXXXXXXXXX. */
export function normalizePhone(raw: string): string {
  let d = (raw || "").replace(/\D/g, "");
  if (d.length === 11 && (d.startsWith("8") || d.startsWith("7"))) d = d.slice(1);
  if (d.length === 10) return `+7${d}`;
  return raw.trim();
}

export function buildLeadBody(p: LeadPayload) {
  return {
    ...p,
    phone: normalizePhone(p.phone),
    company: p.company ?? "",
    source:
      p.source ?? (typeof window !== "undefined" ? window.location.pathname : ""),
    page: typeof window !== "undefined" ? window.location.href : "",
    sentAt: new Date().toISOString(),
  };
}

function readQueue(): unknown[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(QUEUE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQueue(items: unknown[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(QUEUE_KEY, JSON.stringify(items.slice(-QUEUE_MAX)));
  } catch {
    /* storage may be unavailable */
  }
}

function enqueue(body: unknown) {
  const q = readQueue();
  q.push(body);
  writeQueue(q);
}

async function post(body: unknown): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(LEAD_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) return false;
    const data = (await res.json().catch(() => null)) as { ok?: boolean } | null;
    return data?.ok !== false;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/** Отправляет заявку. Если сервер недоступен — кладёт в offline-очередь. */
export async function sendLead(p: LeadPayload): Promise<boolean> {
  const body = buildLeadBody(p);
  const ok = await post(body);
  if (!ok) enqueue(body);
  return ok;
}

/** Повторная отправка отложенных заявок. */
export async function flushLeadQueue(): Promise<void> {
  const q = readQueue();
  if (!q.length) return;
  const rest: unknown[] = [];
  for (const item of q) {
    const ok = await post(item);
    if (!ok) rest.push(item);
  }
  writeQueue(rest);
}

let started = false;
/** Подписка на восстановление сети + попытка отправки при загрузке. */
export function initLeadQueue(): void {
  if (typeof window === "undefined" || started) return;
  started = true;
  window.addEventListener("online", () => {
    void flushLeadQueue();
  });
  if (navigator.onLine) void flushLeadQueue();
}