// Общий низкоуровневый набор функций для КП/Счёта на базе pdf-lib.
// Дублирует логику из buildPdf.ts (шрифты, перенос строк), чтобы не тянуть
// весь модуль договора в клиентский бандл КП.

import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import regAsset from "@/assets/fonts/PTSans-Regular.ttf.asset.json";
import boldAsset from "@/assets/fonts/PTSans-Bold.ttf.asset.json";

export const PAGE_W = 595.28;
export const PAGE_H = 841.89;
export const MARGIN = 46;
export const CONTENT_W = PAGE_W - MARGIN * 2;

export interface Cursor { page: PDFPage; y: number; pages: PDFPage[]; }
export interface Fonts { reg: PDFFont; bold: PDFFont; }

async function loadFontBytes(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Не удалось загрузить шрифт: ${url}`);
  return res.arrayBuffer();
}

export async function initPdf(): Promise<{ doc: PDFDocument; fonts: Fonts; cursor: Cursor }> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const [regBytes, boldBytes] = await Promise.all([
    loadFontBytes((regAsset as { src: string }).src),
    loadFontBytes((boldAsset as { src: string }).src),
  ]);
  const reg = await doc.embedFont(regBytes, { subset: true });
  const bold = await doc.embedFont(boldBytes, { subset: true });
  const page = doc.addPage([PAGE_W, PAGE_H]);
  const cursor: Cursor = { page, y: PAGE_H - MARGIN, pages: [page] };
  return { doc, fonts: { reg, bold }, cursor };
}

export function wrap(font: PDFFont, text: string, size: number, maxW: number): string[] {
  const words = (text || "").split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const candidate = cur ? cur + " " + w : w;
    if (font.widthOfTextAtSize(candidate, size) > maxW && cur) {
      lines.push(cur); cur = w;
    } else cur = candidate;
  }
  if (cur) lines.push(cur);
  return lines;
}

export function ensureSpace(c: Cursor, need: number, doc: PDFDocument): void {
  if (c.y - need < MARGIN + 30) {
    c.page = doc.addPage([PAGE_W, PAGE_H]);
    c.pages.push(c.page);
    c.y = PAGE_H - MARGIN;
  }
}

export interface DrawOpts { font: PDFFont; size: number; align?: "left" | "center" | "right"; gap?: number; x?: number; color?: [number, number, number] }

export function drawText(c: Cursor, doc: PDFDocument, text: string, opts: DrawOpts): void {
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
    const [r, g, b] = opts.color ?? [0.05, 0.07, 0.12];
    c.page.drawText(line, { x, y: c.y - size, size, font: opts.font, color: rgb(r, g, b) });
    c.y -= lineH;
  }
  if (opts.gap) c.y -= opts.gap;
}

export function hr(c: Cursor, doc: PDFDocument, opts: { thickness?: number; color?: [number, number, number]; gap?: number } = {}): void {
  ensureSpace(c, 8, doc);
  const [r, g, bl] = opts.color ?? [0.85, 0.87, 0.92];
  c.page.drawLine({
    start: { x: MARGIN, y: c.y - 2 },
    end: { x: PAGE_W - MARGIN, y: c.y - 2 },
    thickness: opts.thickness ?? 0.6,
    color: rgb(r, g, bl),
  });
  c.y -= (opts.gap ?? 8);
}

export function formatDateRu(iso: string): string {
  const [y, m, d] = iso.split("-");
  const months = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
  return `«${Number(d)}» ${months[Number(m) - 1]} ${y} г.`;
}

export function formatRub(n: number): string {
  return `${Math.round(n).toLocaleString("ru-RU")} ₽`;
}

export async function finalizePdf(doc: PDFDocument): Promise<Uint8Array> {
  return doc.save();
}

export function downloadPdf(bytes: Uint8Array, filename: string): void {
  // pdf-lib returns Uint8Array; wrap in a fresh ArrayBuffer for maximal Blob compatibility.
  const buf = new Uint8Array(bytes);
  const blob = new Blob([buf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
