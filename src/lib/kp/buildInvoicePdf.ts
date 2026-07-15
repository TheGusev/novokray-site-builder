import { initPdf, drawText, hr, formatDateRu, formatRub, MARGIN, PAGE_W } from "./pdfKit";
import { rubInWords } from "@/lib/dogovor/rubInWords";
import { SITE } from "@/data/site";

export interface InvoiceLine { name: string; qty: number; unit: string; price: number; }

export interface InvoiceData {
  number: string;
  date: string;
  // покупатель
  buyerName: string;
  buyerInn?: string;
  buyerKpp?: string;
  buyerAddress?: string;
  // предмет
  lines: InvoiceLine[];
  vatIncluded: boolean;
  vatRate?: number; // 0.20 по умолчанию
  // основание
  contractNumber?: string;
  contractDate?: string;
}

export async function buildInvoicePdf(d: InvoiceData): Promise<Uint8Array> {
  const { doc, fonts, cursor } = await initPdf();
  const { reg, bold } = fonts;
  const bank = SITE.bank;
  const dash = "________________";

  // Реквизиты банка (плашка)
  const rows: Array<[string, string]> = [
    ["Банк получателя", bank.bankName || dash],
    ["БИК", bank.bik || dash],
    ["Корр. счёт", bank.correspondent || dash],
    ["Расчётный счёт", bank.account || dash],
    ["Получатель", `${SITE.legal.name}, ИНН ${SITE.legal.inn}${SITE.legal.ogrn ? `, ОГРН ${SITE.legal.ogrn}` : ""}`],
  ];
  for (const [k, v] of rows) {
    drawText(cursor, doc, `${k}: ${v}`, { font: reg, size: 9 });
  }
  hr(cursor, doc);

  drawText(cursor, doc, `Счёт на оплату № ${d.number} от ${formatDateRu(d.date)}`, { font: bold, size: 15, align: "center", gap: 8 });
  if (d.contractNumber) {
    drawText(cursor, doc, `Основание: договор № ${d.contractNumber}${d.contractDate ? ` от ${formatDateRu(d.contractDate)}` : ""}`, { font: reg, size: 9.5, align: "center", color: [0.35, 0.4, 0.5], gap: 6 });
  }

  drawText(cursor, doc, `Поставщик: ${SITE.legal.name}, ИНН ${SITE.legal.inn}, ${SITE.legal.legalAddress}`, { font: reg, size: 9 });
  drawText(cursor, doc, `Покупатель: ${d.buyerName}${d.buyerInn ? `, ИНН ${d.buyerInn}` : ""}${d.buyerKpp ? `, КПП ${d.buyerKpp}` : ""}${d.buyerAddress ? `, ${d.buyerAddress}` : ""}`, { font: reg, size: 9, gap: 8 });

  // Таблица
  const vatRate = d.vatRate ?? 0.20;
  const subtotal = d.lines.reduce((s, l) => s + l.qty * l.price, 0);
  const vat = d.vatIncluded ? Math.round(subtotal * vatRate) : 0;
  const total = subtotal + vat;

  drawText(cursor, doc, "№   Наименование                                             Кол-во   Ед.   Цена, ₽    Сумма, ₽", { font: bold, size: 9, gap: 4 });
  hr(cursor, doc, { gap: 4 });
  d.lines.forEach((l, i) => {
    const nm = l.name.length > 50 ? `${l.name.slice(0, 47)}...` : l.name;
    drawText(cursor, doc, `${String(i + 1).padEnd(3)} ${nm}`, { font: reg, size: 9.5 });
    drawText(cursor, doc, `${l.qty} ${l.unit} × ${l.price.toLocaleString("ru-RU")} ₽ = ${formatRub(l.qty * l.price)}`, { font: reg, size: 9, align: "right", gap: 2, color: [0.35, 0.4, 0.5] });
  });
  hr(cursor, doc);

  drawText(cursor, doc, `Итого:`, { font: reg, size: 10 });
  drawText(cursor, doc, formatRub(subtotal), { font: bold, size: 11, align: "right", gap: 2 });
  if (d.vatIncluded) {
    drawText(cursor, doc, `В том числе НДС 20%:`, { font: reg, size: 10 });
    drawText(cursor, doc, formatRub(vat), { font: reg, size: 10, align: "right", gap: 2 });
  } else {
    drawText(cursor, doc, `НДС не облагается (ст. 346.11 НК РФ, УСН).`, { font: reg, size: 9, color: [0.35, 0.4, 0.5], gap: 2 });
  }
  drawText(cursor, doc, `Всего к оплате:`, { font: bold, size: 11 });
  drawText(cursor, doc, formatRub(total), { font: bold, size: 14, align: "right", gap: 6 });

  drawText(cursor, doc, `Всего наименований ${d.lines.length}, на сумму ${formatRub(total)}.`, { font: reg, size: 9 });
  drawText(cursor, doc, `Сумма прописью: ${rubInWords(total)}.`, { font: reg, size: 9, gap: 20 });

  drawText(cursor, doc, `Руководитель ______________________  /___________________/`, { font: reg, size: 10 });
  cursor.y -= 4;
  drawText(cursor, doc, `Бухгалтер     ______________________  /___________________/`, { font: reg, size: 10 });

  cursor.pages.forEach((p, i) => {
    p.drawText(`${i + 1} / ${cursor.pages.length}`, { x: PAGE_W - MARGIN - 30, y: 20, size: 8, font: reg });
  });

  return doc.save();
}
