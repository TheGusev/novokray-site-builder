import { degrees, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { SITE } from "@/data/site";

const INK = rgb(0.13, 0.24, 0.62);

/** Текст по дуге: посимвольно, центрируется относительно angleCenter (градусы). */
function drawArcText(
  page: PDFPage,
  text: string,
  opts: {
    cx: number;
    cy: number;
    radius: number;
    size: number;
    font: PDFFont;
    angleCenter: number; // 90 — верх, 270 — низ
    clockwise: boolean;
    opacity: number;
  },
): void {
  const { cx, cy, radius, size, font, angleCenter, clockwise, opacity } = opts;
  const chars = [...text];
  const widths = chars.map((ch) => font.widthOfTextAtSize(ch, size));
  const totalW = widths.reduce((s, w) => s + w, 0) + size * 0.18 * (chars.length - 1);
  const totalAngle = (totalW / radius) * (180 / Math.PI);
  // clockwise: угол убывает (верхняя дуга читается слева направо)
  const dir = clockwise ? -1 : 1;
  let angle = angleCenter - (dir * totalAngle) / 2;

  chars.forEach((ch, i) => {
    const w = widths[i]!;
    const step = ((w + size * 0.18) / radius) * (180 / Math.PI);
    const mid = angle + (dir * step) / 2;
    const rad = (mid * Math.PI) / 180;
    // буквы верхней дуги «стоят» наружу, нижней — внутрь
    const rotation = clockwise ? mid - 90 : mid + 90;
    const rotRad = (rotation * Math.PI) / 180;
    const px = cx + Math.cos(rad) * radius - (Math.cos(rotRad) * w) / 2;
    const py = cy + Math.sin(rad) * radius - (Math.sin(rotRad) * w) / 2;
    page.drawText(ch, {
      x: px,
      y: py,
      size,
      font,
      color: INK,
      opacity,
      rotate: degrees(rotation),
    });
    angle += dir * step;
  });
}

export interface StampOptions {
  cx: number;
  cy: number;
  radius?: number;
  opacity?: number;
}

/** Круглая печать организации: реквизиты берутся из SITE.legal. */
export function drawStamp(page: PDFPage, font: PDFFont, bold: PDFFont, o: StampOptions): void {
  const r = o.radius ?? 52;
  const op = o.opacity ?? 0.82;
  const { cx, cy } = o;

  page.drawCircle({ x: cx, y: cy, size: r, borderColor: INK, borderWidth: 2, opacity: 0, borderOpacity: op });
  page.drawCircle({ x: cx, y: cy, size: r - 5, borderColor: INK, borderWidth: 0.8, opacity: 0, borderOpacity: op });
  page.drawCircle({ x: cx, y: cy, size: r - 21, borderColor: INK, borderWidth: 0.8, opacity: 0, borderOpacity: op });

  drawArcText(page, "ООО «САНИТАРНЫЕ РЕШЕНИЯ»", {
    cx, cy, radius: r - 12, size: 6.2, font: bold, angleCenter: 90, clockwise: true, opacity: op,
  });
  drawArcText(page, `ИНН ${SITE.legal.inn} · ОГРН ${SITE.legal.ogrn}`, {
    cx, cy, radius: r - 13, size: 5, font, angleCenter: 270, clockwise: false, opacity: op,
  });

  const lic = SITE.legal.licenseNo.replace(/^№\s*/, "").split(".").slice(0, 4).join(".");
  const center: Array<{ t: string; f: PDFFont; s: number }> = [
    { t: "РОССИЯ", f: font, s: 4.6 },
    { t: SITE.city.toUpperCase(), f: bold, s: 6.2 },
    { t: "лицензия", f: font, s: 3.8 },
    { t: lic, f: font, s: 3.8 },
  ].filter((l) => l.t.length > 0);
  let y = cy + 9.5;
  for (const line of center) {
    const w = line.f.widthOfTextAtSize(line.t, line.s);
    page.drawText(line.t, { x: cx - w / 2, y, size: line.s, font: line.f, color: INK, opacity: op });
    y -= line.s * 1.75;
  }
}