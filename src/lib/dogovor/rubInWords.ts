// Число в рубли прописью (поддерживает копейки). Без внешних зависимостей.

const u0 = ["", "один", "два", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять"];
const u0f = ["", "одна", "две", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять"];
const u1 = ["десять", "одиннадцать", "двенадцать", "тринадцать", "четырнадцать", "пятнадцать", "шестнадцать", "семнадцать", "восемнадцать", "девятнадцать"];
const tens = ["", "", "двадцать", "тридцать", "сорок", "пятьдесят", "шестьдесят", "семьдесят", "восемьдесят", "девяносто"];
const hundreds = ["", "сто", "двести", "триста", "четыреста", "пятьсот", "шестьсот", "семьсот", "восемьсот", "девятьсот"];

function triadToWords(n: number, female: boolean): string {
  const out: string[] = [];
  const h = Math.floor(n / 100);
  const t = Math.floor((n % 100) / 10);
  const o = n % 10;
  if (h) out.push(hundreds[h]);
  if (t === 1) {
    out.push(u1[o]);
  } else {
    if (t) out.push(tens[t]);
    if (o) out.push(female ? u0f[o] : u0[o]);
  }
  return out.join(" ");
}

function plural(n: number, forms: [string, string, string]): string {
  const m100 = n % 100;
  if (m100 >= 11 && m100 <= 14) return forms[2];
  const m10 = n % 10;
  if (m10 === 1) return forms[0];
  if (m10 >= 2 && m10 <= 4) return forms[1];
  return forms[2];
}

export function rubInWords(amount: number): string {
  const rub = Math.floor(amount);
  const kop = Math.round((amount - rub) * 100);

  const billions = Math.floor(rub / 1_000_000_000);
  const millions = Math.floor((rub % 1_000_000_000) / 1_000_000);
  const thousands = Math.floor((rub % 1_000_000) / 1_000);
  const ones = rub % 1_000;

  const parts: string[] = [];
  if (billions) parts.push(triadToWords(billions, false), plural(billions, ["миллиард", "миллиарда", "миллиардов"]));
  if (millions) parts.push(triadToWords(millions, false), plural(millions, ["миллион", "миллиона", "миллионов"]));
  if (thousands) parts.push(triadToWords(thousands, true), plural(thousands, ["тысяча", "тысячи", "тысяч"]));
  if (ones || rub === 0) parts.push(triadToWords(ones, false));

  const rubStr = parts.join(" ").replace(/\s+/g, " ").trim() || "ноль";
  const rubLabel = plural(rub, ["рубль", "рубля", "рублей"]);
  const kopStr = String(kop).padStart(2, "0");
  const kopLabel = plural(kop, ["копейка", "копейки", "копеек"]);

  const capital = rubStr.charAt(0).toUpperCase() + rubStr.slice(1);
  return `${capital} ${rubLabel} ${kopStr} ${kopLabel}`;
}
