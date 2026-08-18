import { describe, it, expect } from "vitest";
import { INTENT_MAP, SERVICE_ANCHOR, geoAnchor, infoAnchor } from "../interlinking";
import { SERVICES_INDEX } from "../servicesIndex";
import { CITIES } from "../cities";
import { DISTRICTS } from "../districts";
import { primaryVideoForService } from "../videos";

describe("перелинковка без каннибализации", () => {
  it("коммерческий анкор задан для каждой услуги и уникален", () => {
    for (const s of SERVICES_INDEX) expect(SERVICE_ANCHOR[s.slug], s.slug).toBeTruthy();
    const anchors = Object.values(SERVICE_ANCHOR);
    expect(new Set(anchors).size).toBe(anchors.length);
  });

  it("каждый анкор ведёт ровно на одну страницу", () => {
    const byKeyword = new Map<string, string[]>();
    for (const e of INTENT_MAP) {
      byKeyword.set(e.keyword, [...(byKeyword.get(e.keyword) ?? []), e.path]);
    }
    for (const [kw, paths] of byKeyword) expect(paths.length, kw).toBe(1);
  });

  it("гео-анкор всегда содержит геопривязку", () => {
    for (const c of CITIES) {
      const a = geoAnchor("unichtozhenie-klopov", c.prepositional);
      expect(a).toContain(c.prepositional);
    }
    for (const d of DISTRICTS) {
      const a = geoAnchor("unichtozhenie-tarakanov", d.prepositional);
      expect(a).toContain(d.prepositional);
    }
  });

  it("информационный анкор не содержит коммерческих слов", () => {
    expect(infoAnchor("Признаки заражения клопами — цена обработки")).toBe(
      "Признаки заражения клопами",
    );
  });

  it("страницы услуг помечены как коммерческие", () => {
    for (const s of SERVICES_INDEX) {
      const e = INTENT_MAP.find((x) => x.path === `/services/${s.slug}`);
      expect(e?.intent, s.slug).toBe("commercial");
    }
  });

  it("у клопов и тараканов есть ровно один главный ролик для посадочной", () => {
    for (const slug of ["unichtozhenie-klopov", "unichtozhenie-tarakanov"]) {
      const v = primaryVideoForService(slug);
      expect(v, slug).toBeTruthy();
      expect(v!.primary).toBe(true);
    }
  });
});
