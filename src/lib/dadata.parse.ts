/** Разбор ответа DaData Suggestions (findById/party) — общий для клиента, Bun-сервиса и SSR-роута. */

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
  /** ACTIVE | LIQUIDATING | LIQUIDATED | BANKRUPT | REORGANIZING */
  status?: string;
}

/** ИНН: 10 цифр (юрлицо) или 12 (ИП). */
export function isValidInn(inn: string): boolean {
  return /^\d{10}$|^\d{12}$/u.test(inn);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function pickParty(raw: any): DadataParty | null {
  const s = raw?.suggestions?.[0];
  if (!s) return null;
  const d = s.data ?? {};
  const party: DadataParty = {
    name: d.name?.short_with_opf ?? d.name?.short ?? s.value ?? "",
    fullName: d.name?.full_with_opf ?? d.name?.full ?? s.value ?? "",
    inn: d.inn ?? "",
    kpp: d.kpp || undefined,
    ogrn: d.ogrn || undefined,
    address: d.address?.value || undefined,
    managementName: d.management?.name || undefined,
    managementPost: d.management?.post || undefined,
    branchType: d.branch_type || undefined,
    status: d.state?.status || undefined,
  };
  if (!party.name && !party.inn) return null;
  return party;
}

/** Действующая ли организация (для предупреждения в форме). */
export function isActiveParty(p: DadataParty): boolean {
  return !p.status || p.status === "ACTIVE";
}
