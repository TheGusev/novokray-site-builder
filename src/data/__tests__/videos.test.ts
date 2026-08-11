import { describe, it, expect } from "vitest";
import { WORK_VIDEOS, WORK_VIDEOS_BY_SLUG, videosForService, UCHASTOK_PHOTO, videoJsonLd } from "../videos";
import { SERVICES_INDEX } from "../servicesIndex";

const PEST_IDS = ["Клопы", "Тараканы", "Клещи / комары", "Другое"];

describe("видео работ", () => {
  it("слаги уникальны", () => {
    expect(new Set(WORK_VIDEOS.map((v) => v.slug)).size).toBe(WORK_VIDEOS.length);
  });

  it("у каждого видео есть локальный файл, постер и описание", () => {
    for (const v of WORK_VIDEOS) {
      expect(v.src, v.slug).toMatch(/^\/media\/[\w-]+\.mp4$/);
      expect(v.poster, v.slug).toMatch(/^\/media\/[\w-]+\.webp$/);
      expect(v.title.length).toBeGreaterThan(10);
      expect(v.description.length).toBeGreaterThan(30);
      expect(v.durationSec).toBeGreaterThan(0);
      expect(["portrait", "landscape"]).toContain(v.orientation);
      expect(PEST_IDS).toContain(v.pest);
    }
  });

  it("все связанные услуги существуют", () => {
    for (const v of WORK_VIDEOS) {
      expect(v.services.length).toBeGreaterThan(0);
      for (const slug of v.services) {
        expect(SERVICES_INDEX.some((s) => s.slug === slug), `${v.slug} → ${slug}`).toBe(true);
      }
    }
  });

  it("videosForService возвращает только релевантные ролики", () => {
    expect(videosForService("unichtozhenie-klopov").length).toBeGreaterThan(0);
    expect(videosForService("nesuschestvuyuschaya-usluga")).toHaveLength(0);
  });

  it("индекс по слагу совпадает со списком", () => {
    expect(Object.keys(WORK_VIDEOS_BY_SLUG)).toHaveLength(WORK_VIDEOS.length);
  });

  it("фото участка подписано", () => {
    expect(UCHASTOK_PHOTO.url).toMatch(/^\/media\//);
    expect(UCHASTOK_PHOTO.alt.length).toBeGreaterThan(10);
  });

  it("VideoObject собирается с абсолютными ссылками", () => {
    for (const v of WORK_VIDEOS) {
      const ld = videoJsonLd(v, "https://dez-federation.ru");
      expect(ld["@type"]).toBe("VideoObject");
      expect(ld.contentUrl.startsWith("https://dez-federation.ru/")).toBe(true);
      expect(ld.thumbnailUrl[0].startsWith("https://dez-federation.ru/")).toBe(true);
      expect(ld.duration).toMatch(/^PT\d+S$/);
      expect(ld.uploadDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(ld.width * ld.height).toBeGreaterThan(0);
    }
  });
});