/** Русское склонение для числительных: 1 месяц, 2 месяца, 5 месяцев. */
export function plural(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(Math.trunc(n));
  const mod10 = abs % 10;
  const mod100 = abs % 100;
  if (mod100 >= 11 && mod100 <= 14) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

export function monthsRu(n: number): string {
  return `${n} ${plural(n, "месяц", "месяца", "месяцев")}`;
}