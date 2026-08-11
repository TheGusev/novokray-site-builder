import { isValidInn, type DadataParty } from "./dadata.parse";

export type { DadataParty };
export { isValidInn };

export type LookupReason = "invalid_inn" | "not_found" | "not_configured" | "unavailable";

export type LookupResult =
  | { ok: true; party: DadataParty }
  | { ok: false; reason: LookupReason };

/**
 * Реквизиты по ИНН. Ключ DaData живёт только на сервере
 * (`DADATA_API_KEY` в /etc/dez-federation/lead.env), браузер ходит через прокси.
 * `/api/dadata` — боевой Bun-сервис за nginx, `/api/public/dadata` — SSR-роут (превью/дев).
 */
const ENDPOINTS = ["/api/dadata", "/api/public/dadata"];

export async function lookupInnParty(inn: string): Promise<LookupResult> {
  if (!isValidInn(inn)) return { ok: false, reason: "invalid_inn" };

  let lastReason: LookupReason = "unavailable";
  for (const url of ENDPOINTS) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inn }),
        signal: AbortSignal.timeout(8000),
      });
      const json = (await res.json().catch(() => null)) as
        | { ok?: boolean; party?: DadataParty; error?: string }
        | null;
      if (json?.ok && json.party) return { ok: true, party: json.party };
      if (json?.error === "not_found") return { ok: false, reason: "not_found" };
      if (json?.error === "key_not_configured") return { ok: false, reason: "not_configured" };
      // Ответа от нашего сервиса нет (статика без nginx-прокси) — пробуем следующий адрес.
      lastReason = "unavailable";
    } catch {
      lastReason = "unavailable";
    }
  }
  return { ok: false, reason: lastReason };
}
