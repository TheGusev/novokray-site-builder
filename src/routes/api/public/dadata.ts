import { createFileRoute } from "@tanstack/react-router";
import { isValidInn, pickParty } from "@/lib/dadata.parse";

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

/** Прокси к DaData для дев-сервера и SSR: ключ читается только на сервере. */
async function handlePost({ request }: { request: Request }): Promise<Response> {
  let inn = "";
  try {
    const body = (await request.json()) as { inn?: unknown };
    inn = typeof body?.inn === "string" ? body.inn.replace(/\D/g, "") : "";
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }
  if (!isValidInn(inn)) return json({ ok: false, error: "invalid_inn" }, 422);

  const key = process.env["DADATA_API_KEY"];
  if (!key) return json({ ok: false, error: "key_not_configured" }, 503);

  try {
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
    );
    if (!res.ok) return json({ ok: false, error: "upstream_failed" }, 502);
    const party = pickParty(await res.json());
    if (!party) return json({ ok: false, error: "not_found" }, 404);
    return json({ ok: true, party });
  } catch {
    return json({ ok: false, error: "upstream_failed" }, 502);
  }
}

// Типы server-обработчиков в текущей версии роутера ещё не описаны, runtime их поддерживает.
export const Route = createFileRoute("/api/public/dadata")(
  { server: { handlers: { POST: handlePost } } } as unknown as Parameters<
    ReturnType<typeof createFileRoute<"/api/public/dadata">>
  >[0],
);
