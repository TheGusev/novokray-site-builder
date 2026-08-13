/** Маска российского телефона: из любого ввода делает «+7 (999) 123-45-67». */
export function formatPhoneRu(raw: string): string {
  let d = raw.replace(/\D/g, "").replace(/^8/, "7");
  if (d.startsWith("77")) d = d.slice(1);
  d = d.slice(0, 11);
  const n = d.startsWith("7") ? d.slice(1) : d;
  const p1 = n.slice(0, 3), p2 = n.slice(3, 6), p3 = n.slice(6, 8), p4 = n.slice(8, 10);
  let out = "+7";
  if (p1) out += ` (${p1}`;
  if (p1.length === 3) out += ")";
  if (p2) out += ` ${p2}`;
  if (p3) out += `-${p3}`;
  if (p4) out += `-${p4}`;
  return out;
}

/** Телефон введён полностью (11 цифр). */
export function isFullPhoneRu(raw: string): boolean {
  return raw.replace(/\D/g, "").length === 11;
}
