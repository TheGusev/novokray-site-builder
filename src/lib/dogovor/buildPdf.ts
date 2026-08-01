import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
// Шрифты лежат в public/fonts — статикой, чтобы работали на любом хостинге (nginx/shared).
const FONT_REGULAR_URL = "/fonts/PTSans-Regular.ttf";
const FONT_BOLD_URL = "/fonts/PTSans-Bold.ttf";
import { rubInWords } from "./rubInWords";
import { SITE } from "@/data/site";

export type ClientType = "person" | "company";

export interface ServiceLine {
  name: string;
  qty: number;
  price: number; // ₽ за единицу
}

export interface ContractBlock {
  pestName: string;
  level: string; // "1" | "2-3" | "4-5"
  multiplier: number; // 1 / 1.5 / 2
  warrantyDays: number;
  preparations: string[];
  methodNote: string;
  lines: ServiceLine[]; // цены УЖЕ с учётом множителя
}

export interface ContractData {
  number: string;
  date: string; // YYYY-MM-DD
  clientType: ClientType;
  // person
  personFio?: string;
  // company
  companyName?: string;
  companyInn?: string;
  companyKpp?: string;
  companyLegalAddress?: string;
  contactPerson?: string;
  // common
  phone: string;
  objectAddress: string;
  // services — сгруппированы по блокам (по вредителю)
  blocks: ContractBlock[];
  // exec
  masterFio: string;
  paymentMethod: string;
  signaturePng?: ArrayBuffer | null;
}

const PAGE_W = 595.28; // A4
const PAGE_H = 841.89;
const MARGIN = 50;
const CONTENT_W = PAGE_W - MARGIN * 2;

async function loadFontBytes(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Не удалось загрузить шрифт: ${url}`);
  return res.arrayBuffer();
}

function formatDateRu(iso: string): string {
  const [y, m, d] = iso.split("-");
  const months = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
  return `«${Number(d)}» ${months[Number(m) - 1]} ${y} г.`;
}

export function blockSum(b: ContractBlock): number {
  return b.lines.reduce((s, x) => s + (x.qty || 0) * (x.price || 0), 0);
}

export function totalSum(blocks: ContractBlock[]): number {
  return blocks.reduce((s, b) => s + blockSum(b), 0);
}

// Перенос строк по ширине
function wrap(font: PDFFont, text: string, size: number, maxW: number): string[] {
  const words = (text || "").split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const candidate = cur ? cur + " " + w : w;
    const width = font.widthOfTextAtSize(candidate, size);
    if (width > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = candidate;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

interface Cursor {
  page: PDFPage;
  y: number;
  pages: PDFPage[];
}

function ensureSpace(c: Cursor, need: number, doc: PDFDocument): void {
  if (c.y - need < MARGIN + 40) {
    c.page = doc.addPage([PAGE_W, PAGE_H]);
    c.pages.push(c.page);
    c.y = PAGE_H - MARGIN;
  }
}

function drawText(c: Cursor, doc: PDFDocument, text: string, opts: { font: PDFFont; size: number; bold?: boolean; align?: "left" | "center" | "right"; gap?: number; x?: number }): void {
  const size = opts.size;
  const lineH = size * 1.35;
  const maxW = CONTENT_W - ((opts.x ?? MARGIN) - MARGIN);
  const lines = wrap(opts.font, text, size, maxW);
  ensureSpace(c, lines.length * lineH + (opts.gap ?? 0), doc);
  for (const line of lines) {
    const w = opts.font.widthOfTextAtSize(line, size);
    let x = opts.x ?? MARGIN;
    if (opts.align === "center") x = (PAGE_W - w) / 2;
    if (opts.align === "right") x = PAGE_W - MARGIN - w;
    c.page.drawText(line, { x, y: c.y - size, size, font: opts.font, color: rgb(0.05, 0.07, 0.12) });
    c.y -= lineH;
  }
  c.y -= opts.gap ?? 0;
}

function drawHr(c: Cursor, doc: PDFDocument): void {
  ensureSpace(c, 10, doc);
  c.page.drawLine({ start: { x: MARGIN, y: c.y }, end: { x: PAGE_W - MARGIN, y: c.y }, thickness: 0.6, color: rgb(0.75, 0.78, 0.85) });
  c.y -= 10;
}

function drawServicesTable(c: Cursor, doc: PDFDocument, services: ServiceLine[], font: PDFFont, bold: PDFFont, startIdx = 1): void {
  const colX = [MARGIN, MARGIN + 30, MARGIN + 330, MARGIN + 400, MARGIN + 470];
  const colW = [30, 300, 70, 70, CONTENT_W - 470];
  const headers = ["№", "Наименование услуги", "Кол-во", "Цена, ₽", "Сумма, ₽"];
  const size = 9.5;
  const rowPad = 6;

  ensureSpace(c, 30, doc);
  // header bg
  c.page.drawRectangle({ x: MARGIN, y: c.y - 18, width: CONTENT_W, height: 18, color: rgb(0.93, 0.95, 0.99) });
  headers.forEach((h, i) => {
    c.page.drawText(h, { x: colX[i] + 4, y: c.y - 13, size, font: bold, color: rgb(0.1, 0.13, 0.2) });
  });
  c.y -= 18;

  services.forEach((s, idx) => {
    const nameLines = wrap(font, s.name, size, colW[1] - 8);
    const rowH = Math.max(nameLines.length * (size * 1.3), 16) + rowPad * 0.5;
    ensureSpace(c, rowH + 4, doc);
    // bottom border
    c.page.drawLine({ start: { x: MARGIN, y: c.y - rowH }, end: { x: PAGE_W - MARGIN, y: c.y - rowH }, thickness: 0.4, color: rgb(0.82, 0.85, 0.9) });
    // cells
    c.page.drawText(String(startIdx + idx), { x: colX[0] + 6, y: c.y - 12, size, font });
    let ny = c.y - 12;
    for (const ln of nameLines) {
      c.page.drawText(ln, { x: colX[1] + 4, y: ny, size, font });
      ny -= size * 1.3;
    }
    c.page.drawText(String(s.qty), { x: colX[2] + 6, y: c.y - 12, size, font });
    c.page.drawText(s.price.toLocaleString("ru-RU"), { x: colX[3] + 4, y: c.y - 12, size, font });
    const sum = s.qty * s.price;
    c.page.drawText(sum.toLocaleString("ru-RU"), { x: colX[4] + 4, y: c.y - 12, size, font: bold });
    c.y -= rowH;
  });
}

export async function buildContractPdf(data: ContractData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);

  const [regBytes, boldBytes] = await Promise.all([
    loadFontBytes(FONT_REGULAR_URL),
    loadFontBytes(FONT_BOLD_URL),
  ]);
  const font = await doc.embedFont(regBytes, { subset: true });
  const bold = await doc.embedFont(boldBytes, { subset: true });

  const firstPage = doc.addPage([PAGE_W, PAGE_H]);
  const c: Cursor = { page: firstPage, y: PAGE_H - MARGIN, pages: [firstPage] };

  // Шапка
  drawText(c, doc, SITE.shortName, { font: bold, size: 14, align: "center" });
  drawText(c, doc, `${SITE.address} · ${SITE.phone} · ${SITE.email}`, { font, size: 9, align: "center", gap: 14 });

  // Заголовок
  drawText(c, doc, `ДОГОВОР № ${data.number}`, { font: bold, size: 16, align: "center", gap: 4 });
  drawText(c, doc, `на оказание дезинсекционных / дератизационных услуг`, { font, size: 10, align: "center", gap: 4 });
  drawText(c, doc, `г. ${SITE.city}                                                                                            ${formatDateRu(data.date)}`, { font, size: 10, gap: 14 });

  // Преамбула
  const clientBlock = data.clientType === "company"
    ? `${data.companyName ?? ""}, ИНН ${data.companyInn ?? ""}${data.companyKpp ? `, КПП ${data.companyKpp}` : ""}, юр. адрес: ${data.companyLegalAddress ?? ""}, в лице ${data.contactPerson ?? "уполномоченного представителя"}`
    : `${data.personFio ?? ""}, тел. ${data.phone}`;

  drawText(c, doc, `${SITE.legal.fullName} (ИНН ${SITE.legal.inn}, ОГРН ${SITE.legal.ogrn}), бренд «${SITE.shortName}», именуемое в дальнейшем «Исполнитель», в лице руководителя, действующего на основании Устава, с одной стороны, и ${clientBlock}, именуемый(ая) в дальнейшем «Заказчик», с другой стороны, заключили настоящий Договор о нижеследующем:`, { font, size: 10, gap: 10 });

  // 1. Предмет договора
  drawText(c, doc, "1. Предмет договора", { font: bold, size: 11, gap: 4 });
  drawText(c, doc, `1.1. Исполнитель обязуется оказать услуги по санитарной обработке (дезинсекция, дератизация, дезинфекция) по адресу: ${data.objectAddress}.`, { font, size: 10, gap: 2 });
  drawText(c, doc, `1.2. Перечень и стоимость услуг согласованы Сторонами в таблице ниже.`, { font, size: 10, gap: 2 });
  drawText(c, doc, `1.3. Услуги оказываются с применением препаратов, имеющих государственную регистрацию, в соответствии с СанПиН 3.3686-21 и СанПиН 3.5.2.3472-17. Лицензия Исполнителя: № ${SITE.legal.licenseNo} от ${SITE.legal.licenseDate}, выдана Управлением Роспотребнадзора по Новосибирской области (ЕРУЛ № ${SITE.legal.licenseErul}).`, { font, size: 10, gap: 10 });

  // 2. Перечень услуг
  drawText(c, doc, "2. Перечень услуг и стоимость", { font: bold, size: 11, gap: 6 });
  let runningIdx = 1;
  data.blocks.forEach((b, bi) => {
    drawText(c, doc, `Блок ${bi + 1}. ${b.pestName} · степень заражения ${b.level} (коэффициент ×${b.multiplier})`, { font: bold, size: 10.5, gap: 2 });
    if (b.preparations.length) {
      drawText(c, doc, `Препараты: ${b.preparations.join(", ")}.`, { font, size: 9.5, gap: 2 });
    }
    if (b.methodNote) {
      drawText(c, doc, `Методика: ${b.methodNote}`, { font, size: 9.5, gap: 4 });
    }
    drawServicesTable(c, doc, b.lines, font, bold, runningIdx);
    runningIdx += b.lines.length;
    const bSum = blockSum(b);
    drawText(c, doc, `Итого по блоку: ${bSum.toLocaleString("ru-RU")} ₽ · гарантия ${b.warrantyDays} дн.`, { font: bold, size: 10, gap: 10 });
  });

  const sum = totalSum(data.blocks);
  ensureSpace(c, 24, doc);
  c.page.drawRectangle({ x: MARGIN, y: c.y - 20, width: CONTENT_W, height: 20, color: rgb(0.96, 0.97, 1) });
  c.page.drawText("ИТОГО ПО ДОГОВОРУ", { x: MARGIN + 8, y: c.y - 14, size: 10.5, font: bold });
  const totalStr = sum.toLocaleString("ru-RU") + " ₽";
  c.page.drawText(totalStr, { x: PAGE_W - MARGIN - 8 - bold.widthOfTextAtSize(totalStr, 10.5), y: c.y - 14, size: 10.5, font: bold, color: rgb(0.1, 0.2, 0.55) });
  c.y -= 24;
  drawText(c, doc, `Общая стоимость работ: ${sum.toLocaleString("ru-RU")} ₽ (${rubInWords(sum)}). НДС не облагается (УСН).`, { font, size: 10, gap: 10 });

  // 3. Гарантия
  drawText(c, doc, "3. Гарантийные обязательства", { font: bold, size: 11, gap: 4 });
  const minWar = data.blocks.length ? Math.min(...data.blocks.map((b) => b.warrantyDays)) : 30;
  drawText(c, doc, `3.1. Гарантия предоставляется по каждому виду обработки с даты подписания акта:`, { font, size: 10, gap: 2 });
  data.blocks.forEach((b) => {
    drawText(c, doc, `    — ${b.pestName} (степень ${b.level}): ${b.warrantyDays} календарных дней.`, { font, size: 10, gap: 1 });
  });
  drawText(c, doc, `Минимальный срок гарантии по договору: ${minWar} дн.`, { font, size: 10, gap: 4 });
  drawText(c, doc, `3.2. В период гарантии при появлении вредителей того же вида Исполнитель производит повторную обработку бесплатно в течение 3 рабочих дней с момента обращения.`, { font, size: 10, gap: 2 });
  drawText(c, doc, `3.3. Гарантия не распространяется на случаи нарушения Заказчиком рекомендаций (Приложение к памятке клиента), а также на повторное заражение из соседних помещений.`, { font, size: 10, gap: 10 });

  // 4. Порядок расчётов
  drawText(c, doc, "4. Порядок расчётов", { font: bold, size: 11, gap: 4 });
  drawText(c, doc, `4.1. Способ оплаты: ${data.paymentMethod}.`, { font, size: 10, gap: 2 });
  drawText(c, doc, `4.2. Оплата производится в день оказания услуги по факту выполнения работ и подписания акта.`, { font, size: 10, gap: 10 });

  // 5. Ответственность
  drawText(c, doc, "5. Ответственность сторон", { font: bold, size: 11, gap: 4 });
  drawText(c, doc, `5.1. Стороны несут ответственность в соответствии с действующим законодательством РФ.`, { font, size: 10, gap: 2 });
  drawText(c, doc, `5.2. Договор составлен в двух экземплярах, имеющих равную юридическую силу, по одному для каждой из Сторон.`, { font, size: 10, gap: 14 });

  // 6. Реквизиты и подписи
  drawHr(c, doc);
  drawText(c, doc, "Реквизиты и подписи сторон", { font: bold, size: 11, align: "center", gap: 8 });

  // Двухколоночный блок
  ensureSpace(c, 140, doc);
  const colY = c.y;
  const colW = (CONTENT_W - 20) / 2;
  const leftX = MARGIN;
  const rightX = MARGIN + colW + 20;

  const drawBlock = (x: number, lines: Array<{ t: string; bold?: boolean; size?: number }>) => {
    let y = colY;
    for (const ln of lines) {
      const f = ln.bold ? bold : font;
      const s = ln.size ?? 9.5;
      const ws = wrap(f, ln.t, s, colW);
      for (const w of ws) {
        c.page.drawText(w, { x, y: y - s, size: s, font: f });
        y -= s * 1.35;
      }
    }
    return y;
  };

  const leftEnd = drawBlock(leftX, [
    { t: "ИСПОЛНИТЕЛЬ", bold: true, size: 10 },
    { t: SITE.legal.name, bold: true },
    { t: `ИНН ${SITE.legal.inn}, ОГРН ${SITE.legal.ogrn}` },
    { t: SITE.legal.legalAddress },
    { t: `Лицензия № ${SITE.legal.licenseNo} от ${SITE.legal.licenseDate}` },
    { t: `Тел.: ${SITE.phone}` },
    { t: `Email: ${SITE.email}` },
    { t: SITE.domain },
  ]);

  const rightLines = data.clientType === "company"
    ? [
        { t: "ЗАКАЗЧИК", bold: true, size: 10 },
        { t: data.companyName ?? "—", bold: true },
        { t: `ИНН ${data.companyInn ?? "—"}${data.companyKpp ? `, КПП ${data.companyKpp}` : ""}` },
        { t: data.companyLegalAddress ?? "—" },
        { t: `Контакт: ${data.contactPerson ?? "—"}` },
        { t: `Тел.: ${data.phone}` },
      ]
    : [
        { t: "ЗАКАЗЧИК", bold: true, size: 10 },
        { t: data.personFio ?? "—", bold: true },
        { t: `Тел.: ${data.phone}` },
        { t: `Адрес: ${data.objectAddress}` },
      ].filter((l) => l.t);

  const rightEnd = drawBlock(rightX, rightLines as Array<{ t: string; bold?: boolean; size?: number }>);

  c.y = Math.min(leftEnd, rightEnd) - 30;

  // Подпись + ФИО мастера
  ensureSpace(c, 80, doc);
  // линии для подписи
  c.page.drawLine({ start: { x: leftX, y: c.y }, end: { x: leftX + colW, y: c.y }, thickness: 0.6, color: rgb(0.6, 0.65, 0.75) });
  c.page.drawLine({ start: { x: rightX, y: c.y }, end: { x: rightX + colW, y: c.y }, thickness: 0.6, color: rgb(0.6, 0.65, 0.75) });

  // подпись мастера (если есть)
  if (data.signaturePng) {
    try {
      const png = await doc.embedPng(data.signaturePng);
      const dims = png.scaleToFit(150, 50);
      c.page.drawImage(png, { x: leftX + 10, y: c.y + 5, width: dims.width, height: dims.height });
    } catch {
      // ignore — не PNG или повреждено
    }
  }

  c.page.drawText("/ " + (data.masterFio || "_______________________") + " /", { x: leftX, y: c.y - 12, size: 9, font });
  c.page.drawText("Исполнитель / подпись, ФИО", { x: leftX, y: c.y - 26, size: 8, font, color: rgb(0.4, 0.45, 0.55) });
  c.page.drawText("/ ______________________ /", { x: rightX, y: c.y - 12, size: 9, font });
  c.page.drawText("Заказчик / подпись, ФИО", { x: rightX, y: c.y - 26, size: 8, font, color: rgb(0.4, 0.45, 0.55) });

  // Футер на всех страницах
  doc.getPages().forEach((p, i, arr) => {
    p.drawText(`Стр. ${i + 1} из ${arr.length} · Договор № ${data.number} от ${formatDateRu(data.date)}`, {
      x: MARGIN,
      y: 22,
      size: 7.5,
      font,
      color: rgb(0.5, 0.55, 0.65),
    });
  });

  return doc.save();
}

export function downloadPdf(bytes: Uint8Array, filename: string): void {
  const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
