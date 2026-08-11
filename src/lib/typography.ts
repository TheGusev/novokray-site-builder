/**
 * Единая русская типографика.
 *
 * `typo()` — чистая идемпотентная функция: повторный прогон уже обработанной
 * строки ничего не меняет. Работает и на сервере, и в браузере.
 *
 * Режимы:
 *  - обычный  — кавычки, тире, многоточия + неразрывные пробелы (для вёрстки);
 *  - `plain`  — то же самое, но без неразрывных пробелов (для meta, title,
 *               JSON-LD, alt/title атрибутов и текста, уходящего во внешние
 *               системы).
 */

export const NBSP = "\u00A0";
const NDASH = "\u2013";
const MDASH = "\u2014";

export interface TypoOptions {
  /** Не расставлять неразрывные пробелы (meta, JSON-LD, PDF, аналитика). */
  plain?: boolean;
}

/** Короткие слова, которые нельзя отрывать от следующего слова. */
const SHORT_WORDS = [
  "а","в","и","к","о","с","у","я","б","ж",
  "на","за","до","по","из","от","то","не","ни","но","же","ли","бы","да","во","со","об","ко","их","её","ее","мы","вы","он",
  "для","под","при","над","без","что","как","или","они","это","эта","эти","тот","так",
];
const SHORT_WORDS_RE = new RegExp(
  `(^|[\\s(«„\\u2014-])(${SHORT_WORDS.join("|")})\\s+`,
  "gi",
);

/** Единицы измерения, которые не должны отрываться от числа. */
const UNITS = [
  "₽","руб\\.?","%","м²","м2","м","см","мм","км","кг","г","мг","л","мл",
  "°C","°","ч","мин","сек","с","дн\\.?","дня","дней","сут\\.?","суток",
  "мес\\.?","года","год","лет","раз","раза","шт\\.?","чел\\.?","балла","баллов","балл",
];
const UNITS_RE = new RegExp(`(\\d)\\s+(${UNITS.join("|")})(?![а-яё\\w])`, "gi");

/** Прямые кавычки → «ёлочки», вложенные → „лапки“. */
function fixQuotes(text: string): string {
  let depth = 0;
  let out = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"' || ch === "\u201C" || ch === "\u201D" || ch === "\u201E") {
      const prev = text[i - 1];
      const opening = depth === 0 || prev === undefined || /[\s(«„\-\u2013\u2014]/.test(prev);
      if (opening) {
        out += depth === 0 ? "«" : "„";
        depth++;
      } else {
        depth = Math.max(0, depth - 1);
        out += depth === 0 ? "»" : "“";
      }
      continue;
    }
    out += ch;
  }
  return out;
}

/** Убирает уже расставленные неразрывные пробелы — чтобы функция была идемпотентной. */
function denormalize(text: string): string {
  return text.replace(/\u00A0/g, " ").replace(/\u202F/g, " ");
}

export function typo(input: string, options: TypoOptions = {}): string {
  if (!input) return input;
  let s = denormalize(input);

  // — базовая чистка пробелов
  s = s.replace(/[ \t]{2,}/g, " ");
  s = s.replace(/ +([,;:!?…])/g, "$1");
  s = s.replace(/([«(]) +/g, "$1").replace(/ +([»)])/g, "$1");

  // — многоточие и знаки
  s = s.replace(/\.{3,}/g, "…");
  s = s.replace(/(\d)\s?[xх]\s?(?=\d)/g, `$1${NBSP === "" ? "" : ""}\u00D7`);
  s = s.replace(/\u00D7/g, "\u00D7");
  s = s.replace(/\(c\)/gi, "©").replace(/\(r\)/gi, "®");

  // — кавычки
  s = fixQuotes(s);

  // — тире: дефис/короткое тире между словами → длинное тире
  s = s.replace(new RegExp(`(^|\\s)[-${NDASH}]{1,2}(\\s)`, "g"), `$1${MDASH}$2`);
  // диапазон чисел с пробелами: «5 - 7» → «5–7»
  s = s.replace(/(\d)\s+[-\u2013]\s+(\d)/g, `$1${NDASH}$2`);

  // — минус перед числом в начале строки/после пробела не трогаем (может быть дефис списка)

  if (!options.plain) {
    // число + единица измерения
    s = s.replace(UNITS_RE, `$1${NBSP}$2`);
    // разряды числа: «1 500 ₽»
    s = s.replace(/(\d)\s(?=\d{3}(?!\d))/g, `$1${NBSP}`);
    // №, §, инициалы, сокращения
    s = s.replace(/(№|§)\s+/g, `$1${NBSP}`);
    s = s.replace(/\b(т|г|ул|д|стр|кв|руб|тыс|млн)\.\s+/g, `$1.${NBSP}`);
    s = s.replace(/\b([А-ЯЁ])\.\s?([А-ЯЁ])\.\s?(?=[А-ЯЁ][а-яё])/g, `$1.${NBSP}$2.${NBSP}`);
    // короткие слова не отрываем от следующего
    s = s.replace(SHORT_WORDS_RE, `$1$2${NBSP}`);
    // тире не должно начинать строку — неразрывный пробел перед ним
    s = s.replace(new RegExp(` ${MDASH} `, "g"), `${NBSP}${MDASH} `);
  }

  return s.trim() === s ? s : s;
}

/** Версия без неразрывных пробелов — для meta, JSON-LD, PDF и аналитики. */
export function typoPlain(input: string): string {
  return typo(input, { plain: true });
}

/** Прогон массива строк. */
export function typoAll(items: string[], options?: TypoOptions): string[] {
  return items.map((i) => typo(i, options));
}
