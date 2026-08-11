import { it } from "vitest";
import { POSTS } from "@/data/blog";
import { SERVICES_INDEX } from "@/data/servicesIndex";
import { typoPlain } from "@/lib/typography";
it("list", () => {
  const seen = new Set<string>();
  for (const p of POSTS) {
    for (const line of p.body.split("\n")) {
      const l = line.trim();
      if (!l || /^[#>|]/.test(l) || /^[-*]\s/.test(l) || /^\d+\.\s/.test(l)) continue;
      const fixed = typoPlain(l);
      if (fixed !== l) console.log("DIFF", p.slug, "\n  было: " + l + "\n  надо: " + fixed);
    }
    const texts = [p.title, p.excerpt, ...(p.faq ?? []).flatMap(f => [f.q, f.a])];
    for (const t of texts) for (const line of t.split("\n")) {
      if (/^\s*[-*|]/.test(line)) continue;
      const m = line.match(/[А-Яа-яЁё]\s[-–]\s/);
      if (m) console.log("DASH", p.slug, line.slice(0, 100));
    }
  }
  for (const s of SERVICES_INDEX) for (const t of [s.h1, s.metaDescription]) {
    if (/[А-Яа-яЁё]\s[-–]\s/.test(t)) console.log("DASH svc", s.slug, t);
  }
  void seen;
});
