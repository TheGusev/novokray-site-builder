import { describe, expect, it } from "vitest";
import { BLOG_COVERS, BLOG_IMAGE_META } from "@/data/images";
import { POSTS } from "@/data/blog";

describe("обложки блога", () => {
  it("у каждой статьи есть обложка", () => {
    const missing = POSTS.filter((p) => !BLOG_COVERS[p.slug]).map((p) => p.slug);
    expect(missing).toEqual([]);
  });

  it("одна картинка не используется дважды", () => {
    const seen = new Map<string, string>();
    const dupes: string[] = [];
    for (const [slug, src] of Object.entries(BLOG_COVERS)) {
      const prev = seen.get(src);
      if (prev) dupes.push(`${slug} = ${prev}`);
      else seen.set(src, slug);
    }
    expect(dupes).toEqual([]);
  });

  it("alt и title уникальны у статей с обложкой", () => {
    const alts = Object.keys(BLOG_COVERS)
      .map((slug) => BLOG_IMAGE_META[slug]?.alt)
      .filter(Boolean) as string[];
    expect(new Set(alts).size).toBe(alts.length);
  });
});
