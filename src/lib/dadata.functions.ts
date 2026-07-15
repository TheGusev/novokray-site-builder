import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export interface DadataParty {
  name: string;
  fullName: string;
  inn: string;
  kpp?: string;
  ogrn?: string;
  address?: string;
  managementName?: string;
  managementPost?: string;
  branchType?: string;
  status?: string;
}

const InnSchema = z.object({ inn: z.string().regex(/^\d{10}(\d{2})?$/u, "ИНН должен содержать 10 или 12 цифр.") });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pickParty(raw: any): DadataParty | null {
  const s = raw?.suggestions?.[0];
  if (!s) return null;
  const d = s.data ?? {};
  return {
    name: d.name?.short_with_opf ?? d.name?.short ?? s.value ?? "",
    fullName: d.name?.full_with_opf ?? s.value ?? "",
    inn: d.inn ?? "",
    kpp: d.kpp ?? undefined,
    ogrn: d.ogrn ?? undefined,
    address: d.address?.value ?? undefined,
    managementName: d.management?.name ?? undefined,
    managementPost: d.management?.post ?? undefined,
    branchType: d.branch_type ?? undefined,
    status: d.state?.status ?? undefined,
  };
}

/**
 * Автоподстановка реквизитов по ИНН через DaData Suggestions API.
 * Возвращает `null`, если реквизиты не найдены или ключ не настроен —
 * форма продолжает работать в ручном режиме.
 */
export const lookupInnParty = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InnSchema.parse(data))
  .handler(async ({ data }): Promise<DadataParty | null> => {
    const token = process.env.DADATA_API_KEY;
    if (!token) return null;

    try {
      const res = await fetch("https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ query: data.inn, count: 1 }),
      });
      if (!res.ok) return null;
      const json = await res.json();
      return pickParty(json);
    } catch {
      return null;
    }
  });
