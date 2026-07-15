import { initPdf, drawText, hr, formatDateRu, formatRub, MARGIN, PAGE_W, CONTENT_W } from "./pdfKit";
import { rubInWords } from "@/lib/dogovor/rubInWords";
import { SITE } from "@/data/site";
import type { QuickPriceResult, Periodicity } from "@/data/b2bPricing";
import { PERIODICITY_LABEL } from "@/data/b2bPricing";

export interface KpData {
  number: string;
  date: string;
  // клиент
  companyName: string;
  companyInn?: string;
  companyKpp?: string;
  legalAddress?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  // объект
  objectAddress: string;
  objectKindLabel: string;
  areaM2: number;
  pestsLabels: string[];
  periodicity: Periodicity;
  withBarrier: boolean;
  vatIncluded: boolean;
  // расчёт
  price: QuickPriceResult;
  // мастер
  masterFio?: string;
}

export async function buildKpPdf(d: KpData): Promise<Uint8Array> {
  const { doc, fonts, cursor } = await initPdf();
  const { reg, bold } = fonts;

  // Шапка исполнителя
  drawText(cursor, doc, SITE.legal.name, { font: bold, size: 12 });
  drawText(cursor, doc, `ИНН ${SITE.legal.inn} · ОГРН ${SITE.legal.ogrn}`, { font: reg, size: 9 });
  drawText(cursor, doc, SITE.legal.legalAddress, { font: reg, size: 9 });
  drawText(cursor, doc, `Лицензия ЕРУЛ ${SITE.legal.licenseErul} · Роспотребнадзор № ${SITE.legal.licenseNo} от ${SITE.legal.licenseDate}`, { font: reg, size: 9, color: [0.3, 0.35, 0.45] });
  drawText(cursor, doc, `Тел.: ${SITE.phone} · Telegram: ${SITE.telegramHandle}`, { font: reg, size: 9, gap: 6 });
  hr(cursor, doc);

  // Заголовок
  drawText(cursor, doc, `Коммерческое предложение № ${d.number} от ${formatDateRu(d.date)}`, { font: bold, size: 16, align: "center", gap: 6 });
  drawText(cursor, doc, `на оказание услуг по дезинфекции, дезинсекции и дератизации`, { font: reg, size: 10, align: "center", color: [0.35, 0.4, 0.5], gap: 12 });

  // Кому
  drawText(cursor, doc, "Кому:", { font: bold, size: 10 });
  const clientLines = [
    d.companyName,
    d.companyInn ? `ИНН ${d.companyInn}${d.companyKpp ? ` · КПП ${d.companyKpp}` : ""}` : null,
    d.legalAddress || null,
    d.contactPerson ? `Контакт: ${d.contactPerson}` : null,
    d.phone || d.email ? [d.phone, d.email].filter(Boolean).join(" · ") : null,
  ].filter(Boolean) as string[];
  for (const line of clientLines) drawText(cursor, doc, line, { font: reg, size: 10 });
  cursor.y -= 8;

  // Объект
  drawText(cursor, doc, "Объект и параметры:", { font: bold, size: 10 });
  drawText(cursor, doc, `Адрес: ${d.objectAddress}`, { font: reg, size: 10 });
  drawText(cursor, doc, `Тип объекта: ${d.objectKindLabel}`, { font: reg, size: 10 });
  drawText(cursor, doc, `Площадь: ${d.areaM2} м²`, { font: reg, size: 10 });
  drawText(cursor, doc, `Виды работ: ${d.pestsLabels.join(", ")}`, { font: reg, size: 10 });
  drawText(cursor, doc, `Периодичность: ${PERIODICITY_LABEL[d.periodicity]}`, { font: reg, size: 10 });
  if (d.withBarrier) drawText(cursor, doc, "Дополнительно: барьерная защита периметра", { font: reg, size: 10 });
  cursor.y -= 8;

  // Расчёт
  hr(cursor, doc);
  drawText(cursor, doc, "Расчёт стоимости", { font: bold, size: 12, gap: 4 });

  for (const line of d.price.lines) {
    drawText(cursor, doc, line.name, { font: reg, size: 9.5 });
    drawText(cursor, doc, formatRub(line.sum), { font: bold, size: 9.5, align: "right", gap: 2 });
  }
  hr(cursor, doc);

  drawText(cursor, doc, `Стоимость выезда, без НДС:`, { font: reg, size: 10 });
  drawText(cursor, doc, formatRub(d.price.perVisit), { font: bold, size: 11, align: "right", gap: 2 });
  if (d.vatIncluded) {
    drawText(cursor, doc, `НДС 20%:`, { font: reg, size: 10 });
    drawText(cursor, doc, formatRub(d.price.perVisitVat), { font: reg, size: 10, align: "right", gap: 2 });
  }
  drawText(cursor, doc, `Итого за один выезд${d.vatIncluded ? " с НДС" : ""}:`, { font: bold, size: 11 });
  drawText(cursor, doc, formatRub(d.price.perVisitTotal), { font: bold, size: 13, align: "right", gap: 4 });

  if (d.price.visitsPerYear > 1) {
    drawText(cursor, doc, `Итого за год (${d.price.visitsPerYear} визитов):`, { font: bold, size: 11 });
    drawText(cursor, doc, formatRub(d.price.perYearTotal), { font: bold, size: 13, align: "right", gap: 6 });
  }
  drawText(cursor, doc, `Сумма прописью: ${rubInWords(d.price.perVisitTotal)}`, { font: reg, size: 9, color: [0.35, 0.4, 0.5], gap: 8 });

  // Что входит
  hr(cursor, doc);
  drawText(cursor, doc, "Что входит в стоимость", { font: bold, size: 11, gap: 4 });
  const included = [
    "Выезд аттестованного мастера в согласованное время (в т.ч. в нерабочие часы).",
    "Обработка сертифицированными препаратами класса безопасности 3–4.",
    "Составление акта выполненных работ и оформление санитарного паспорта.",
    "Гарантия результата с бесплатной повторной обработкой в течение срока договора.",
    "Соблюдение СанПиН 3.3686-21, СанПиН 2.3/2.4.3590-20, СП 3.5.1378-03.",
  ];
  for (const s of included) drawText(cursor, doc, `• ${s}`, { font: reg, size: 9.5 });
  cursor.y -= 4;

  // Порядок и оплата
  hr(cursor, doc);
  drawText(cursor, doc, "Порядок работы и оплата", { font: bold, size: 11, gap: 4 });
  const flow = [
    "1. Подписание договора и счёта (безналичный расчёт, счёт прилагается).",
    "2. Согласование графика выездов и режима работы объекта.",
    "3. Выполнение работ с оформлением закрывающих документов (акт, счёт-фактура при НДС).",
    "4. Оплата в течение 5 (пяти) рабочих дней после подписания акта.",
  ];
  for (const s of flow) drawText(cursor, doc, s, { font: reg, size: 9.5 });
  cursor.y -= 6;

  drawText(cursor, doc, "Предложение действительно 14 календарных дней с даты выпуска.", { font: reg, size: 9, color: [0.35, 0.4, 0.5] });

  // Подпись
  hr(cursor, doc, { gap: 20 });
  drawText(cursor, doc, `От исполнителя: ${d.masterFio || "________________________"}`, { font: reg, size: 10 });
  drawText(cursor, doc, `${SITE.legal.name}`, { font: reg, size: 9, color: [0.35, 0.4, 0.5] });

  // Нумерация страниц
  cursor.pages.forEach((p, i) => {
    p.drawText(`${i + 1} / ${cursor.pages.length}`, { x: PAGE_W - MARGIN - 30, y: 20, size: 8, font: reg });
    p.drawText(`КП № ${d.number} · ${SITE.legal.name}`, { x: MARGIN, y: 20, size: 8, font: reg });
  });
  // используем CONTENT_W чтобы не было ворнинга о неиспользованном импорте
  void CONTENT_W;

  return doc.save();
}
