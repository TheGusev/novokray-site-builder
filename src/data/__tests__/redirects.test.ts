import { describe, expect, it } from "vitest";
import { LEGACY_REDIRECTS } from "../redirects";
import { getAllPaths } from "@/lib/all-routes";

const norm = (p: string) => (p.length > 1 ? p.replace(/\/+$/, "") : p);
const routes = new Set(getAllPaths().map(norm));

describe("устаревшие адреса (301)", () => {
  it("не перехватывают существующие страницы", () => {
    const collisions = LEGACY_REDIRECTS.filter((r) => routes.has(norm(r.from)));
    expect(collisions).toEqual([]);
  });

  it("ведут только на существующие страницы", () => {
    const broken = LEGACY_REDIRECTS.filter((r) => !routes.has(norm(r.to)));
    expect(broken).toEqual([]);
  });

  it("не содержат дублей и цепочек редиректов", () => {
    const froms = LEGACY_REDIRECTS.map((r) => norm(r.from));
    expect(new Set(froms).size).toBe(froms.length);
    const chained = LEGACY_REDIRECTS.filter((r) => froms.includes(norm(r.to)));
    expect(chained).toEqual([]);
  });

  it("записаны абсолютными путями без слэша на конце", () => {
    for (const r of LEGACY_REDIRECTS) {
      expect(r.from).toMatch(/^\/[^\s?#]*$/);
      expect(r.to).toMatch(/^\/[^\s?#]*$/);
      expect(r.from.endsWith("/")).toBe(false);
    }
  });
});
