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
 * Клиентский вызов (для статического хостинга без бэкенда).
 * Токен читается из `import.meta.env.VITE_DADATA_TOKEN`.
 * Возвращает `null`, если токен не задан, реквизиты не найдены или произошла ошибка —
 * форма продолжает работать в ручном режиме.
 */
export async function lookupInnParty(inn: string): Promise<DadataParty | null> {
  if (!/^\d{10}(\d{2})?$/u.test(inn)) return null;
  const token = (import.meta.env.VITE_DADATA_TOKEN as string | undefined) ?? "";
  if (!token) return null;
  try {
    const res = await fetch(
      "https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ query: inn, count: 1 }),
      },
    );
    if (!res.ok) return null;
    const json = await res.json();
    return pickParty(json);
  } catch {
    return null;
  }
}
