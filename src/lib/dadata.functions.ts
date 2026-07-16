// Клиентский вызов DaData Suggestions через PHP-прокси на Beget (public/api/dadata.php).
// Токен DaData хранится ТОЛЬКО на сервере (public/api/config.php), в клиент не попадает.
// В dev-режиме прокси нет — функция мягко возвращает null, форма работает в ручном режиме.

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
 * Автоподстановка реквизитов по ИНН.
 * Возвращает `null`, если прокси недоступен или ИНН не найден — форма работает вручную.
 * Сигнатура сохранена под ранее использовавшийся серверный вызов: lookupInnParty({ data: { inn } }).
 */
export async function lookupInnParty(args: { data: { inn: string } }): Promise<DadataParty | null> {
  const inn = String(args?.data?.inn ?? "").trim();
  if (!/^\d{10}(\d{2})?$/.test(inn)) return null;
  try {
    const res = await fetch("/api/dadata.php", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ inn }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return pickParty(json);
  } catch {
    return null;
  }
}