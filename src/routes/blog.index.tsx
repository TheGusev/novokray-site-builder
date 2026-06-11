import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { useMemo, useState } from "react";
import { Calendar, Clock, ChevronLeft, ChevronRight, Search, Library, MapPin, Download, FileText, BookOpen } from "lucide-react";
import { SITE } from "@/data/site";
import {
  POSTS, POSTS_PER_PAGE, BLOG_CATEGORIES, POSTS_BY_CATEGORY,
  ALL_TAGS, PILLAR_SLUGS, CATEGORY_BY_SLUG,
  type BlogPost, type BlogCategory, type BlogFreq, type BlogGeo,
} from "@/data/blog";
import { BLOG_COVERS, COMMON, BLOG_IMAGE_META } from "@/data/images";
import { DOCS } from "@/data/docs";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { WaveText } from "@/components/site/WaveText";

const searchSchema = z.object({
  page: fallback(z.number().int().min(1), 1).default(1),
  cat: fallback(z.enum(["nasekomye","gryzuny","uchastok","plesen","zapahi","chs","sanpin","preparaty"]).optional(), undefined).default(undefined),
  geo: fallback(z.enum(["novosibirsk","oblast","both"]).optional(), undefined).default(undefined),
  hf: fallback(z.enum(["ВЧ","СЧ","НЧ"]).optional(), undefined).default(undefined),
  q: fallback(z.string().max(80).optional(), undefined).default(undefined),
  tag: fallback(z.string().max(40).optional(), undefined).default(undefined),
});

export const Route = createFileRoute("/blog/")({
  validateSearch: zodValidator(searchSchema),
  head: ({ match }) => {
    const search = (match as unknown as { search?: { page?: number; cat?: BlogCategory } })?.search;
    const page = Math.max(1, search?.page ?? 1);
    const hasFilter = !!(search?.cat);
    const totalPages = Math.max(1, Math.ceil(POSTS.length / POSTS_PER_PAGE));
    const base = "Библиотека санитарной службы Дез-Федерация — 50 статей о вредителях, плесени, СанПиН в Новосибирске";
    const title = page > 1 ? `${base} — стр. ${page}` : base;
    const canonical = "/blog";
    return {
      meta: [
        { title },
        { name: "description", content: "Библиотека из 50 практических статей: клопы, тараканы, грызуны, плесень, клещи, борщевик, СанПиН для бизнеса, образцы документов. Реальные данные для Новосибирска и НСО." },
        { property: "og:title", content: "Библиотека санитарной службы — 50 статей о вредителях и санобработке" },
        { property: "og:description", content: "От первой помощи при укусе клеща до журналов СанПиН для общепита. Реальные нормативы, препараты, цены 2026 для НСК и НСО." },
        { property: "og:url", content: canonical },
        ...(hasFilter ? [{ name: "robots", content: "noindex,follow" }] : []),
      ],
      links: [
        { rel: "canonical", href: canonical },
        ...(page > 1 ? [{ rel: "prev", href: page - 1 === 1 ? "/blog" : `/blog?page=${page - 1}` }] : []),
        ...(page < totalPages ? [{ rel: "next", href: `/blog?page=${page + 1}` }] : []),
      ],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Blog",
              "@id": `${SITE.domain}/blog#blog`,
              name: "Библиотека Дез-Федерация",
              description: "50 практических статей о санитарной обработке для Новосибирска и Новосибирской области",
              url: `${SITE.domain}/blog`,
              inLanguage: "ru-RU",
              publisher: { "@id": `${SITE.domain}#organization` },
              blogPost: POSTS.map((p) => ({
                "@type": "BlogPosting",
                headline: p.title,
                url: `${SITE.domain}/blog/${p.slug}`,
                datePublished: p.date,
                dateModified: p.updatedAt ?? p.date,
                description: p.excerpt,
                articleSection: CATEGORY_BY_SLUG[p.category].title,
              })),
            },
            {
              "@type": "ItemList",
              name: "Статьи блога",
              numberOfItems: POSTS.length,
              itemListElement: POSTS.map((p, i) => ({
                "@type": "ListItem", position: i + 1, url: `${SITE.domain}/blog/${p.slug}`, name: p.title,
              })),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Главная", item: SITE.domain + "/" },
                { "@type": "ListItem", position: 2, name: "Библиотека", item: `${SITE.domain}/blog` },
              ],
            },
          ],
        }),
      }],
    };
  },
  component: BlogIndex,
});

function FreqBadge({ hf }: { hf: BlogFreq }) {
  const cls = hf === "ВЧ" ? "bg-[--hf-vch] text-[--hf-vch-fg]" : hf === "СЧ" ? "bg-[--hf-sch] text-[--hf-sch-fg]" : "bg-[--hf-nch] text-[--hf-nch-fg]";
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cls}`} title="Частотность поискового запроса">{hf}</span>;
}

function GeoBadge({ geo }: { geo: BlogGeo }) {
  const label = geo === "novosibirsk" ? "НСК" : geo === "oblast" ? "НСО" : "НСК · НСО";
  return <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-0.5 text-[10px] font-semibold text-muted-foreground"><MapPin className="h-2.5 w-2.5" />{label}</span>;
}

function PostCard({ p }: { p: BlogPost }) {
  const cat = CATEGORY_BY_SLUG[p.category];
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: p.slug }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elegant"
    >
      {BLOG_COVERS[p.slug] && (
        <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
          <img src={BLOG_COVERS[p.slug]} alt={BLOG_IMAGE_META[p.slug]?.alt ?? p.title} title={BLOG_IMAGE_META[p.slug]?.title ?? p.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${cat.color} shadow-sm`}>{cat.short}</span>
            <FreqBadge hf={p.hf} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(p.date).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })}</span>
          <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{p.readMin} мин</span>
          <GeoBadge geo={p.geo} />
        </div>
        <h3 className="mt-3 font-display text-base font-bold leading-snug text-foreground group-hover:text-primary md:text-lg">{p.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.excerpt}</p>
        <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
          {p.tags.slice(0, 3).map((t) => (
            <span key={t} className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground">#{t}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}

function BlogIndex() {
  const search = Route.useSearch();
  const [q, setQ] = useState(search.q ?? "");

  const filtered = useMemo(() => {
    let list: BlogPost[] = POSTS;
    if (search.cat) list = list.filter((p) => p.category === search.cat);
    if (search.geo) list = list.filter((p) => p.geo === search.geo || p.geo === "both" || search.geo === "both");
    if (search.hf) list = list.filter((p) => p.hf === search.hf);
    if (search.tag) list = list.filter((p) => p.tags.includes(search.tag!));
    const query = (search.q ?? q).trim().toLowerCase();
    if (query) {
      list = list.filter((p) =>
        p.title.toLowerCase().includes(query) ||
        p.excerpt.toLowerCase().includes(query) ||
        p.tags.some((t) => t.toLowerCase().includes(query))
      );
    }
    return list;
  }, [search.cat, search.geo, search.hf, search.tag, search.q, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / POSTS_PER_PAGE));
  const safePage = Math.min(Math.max(1, search.page), totalPages);
  const start = (safePage - 1) * POSTS_PER_PAGE;
  const items = filtered.slice(start, start + POSTS_PER_PAGE);

  const pillars = PILLAR_SLUGS.map((s) => POSTS.find((p) => p.slug === s)).filter(Boolean) as BlogPost[];
  const hasAnyFilter = !!(search.cat || search.geo || search.hf || search.tag || search.q);

  return (
    <>
      <Breadcrumbs items={[{ label: "Главная", to: "/" }, { label: "Библиотека" }]} />

      {/* HERO */}
      <section className="relative overflow-hidden bg-hero text-primary-foreground">
        <img src={COMMON.heroSpray} alt="Библиотека санитарной службы Дез-Федерация — статьи и инструкции" title="Библиотека: 50 статей о вредителях, плесени, СанПиН" className="absolute inset-0 h-full w-full object-cover opacity-25" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/55 via-black/20 to-transparent" />
        <div className="container-x relative py-10 md:py-14">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/80">
            <Library className="h-4 w-4" /> Библиотека · Новосибирск и область
          </div>
          <h1 className="mt-3 font-display text-3xl font-extrabold md:text-5xl">
            <WaveText className="on-dark" text="Библиотека санитарной службы" duration={4} />
          </h1>
          <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-white/90 md:text-lg">
            <strong>{POSTS.length} практических статей</strong> о клопах, тараканах, плесени, клещах, СанПиН для бизнеса, препаратах и реальных случаях в Новосибирске и области. С образцами документов, нормативами и ценами 2026.
          </p>

          {/* Поиск */}
          <form
            onSubmit={(e) => { e.preventDefault(); window.history.replaceState(null, "", `/blog${q ? `?q=${encodeURIComponent(q)}` : ""}`); window.location.reload(); }}
            className="mt-6 flex max-w-2xl items-center gap-2 rounded-2xl border border-white/20 bg-white/10 p-2 backdrop-blur"
          >
            <Search className="ml-2 h-5 w-5 text-white/80" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Поиск: клопы, СанПиН, плесень, клещи…"
              className="flex-1 bg-transparent px-2 py-2 text-base text-white placeholder:text-white/60 focus:outline-none"
              aria-label="Поиск по библиотеке"
            />
            <button type="submit" className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-foreground hover:bg-white/90">Найти</button>
          </form>

          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            <Link to="/blog" search={{ page: 1 }} className={`rounded-full px-3 py-1 font-semibold transition ${!hasAnyFilter ? "bg-white text-foreground" : "border border-white/30 bg-white/10 text-white hover:bg-white/20"}`}>Все 50</Link>
            {BLOG_CATEGORIES.map((c) => (
              <Link key={c.slug} to="/blog" search={{ cat: c.slug, page: 1 }} className={`rounded-full px-3 py-1 font-semibold transition ${search.cat === c.slug ? "bg-white text-foreground" : "border border-white/30 bg-white/10 text-white hover:bg-white/20"}`}>
                {c.short} · {POSTS_BY_CATEGORY[c.slug].length}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pillar / выбор редакции */}
      {!hasAnyFilter && safePage === 1 && (
        <section className="container-x mt-10">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl font-bold md:text-3xl">Выбор редакции</h2>
            <span className="text-xs text-muted-foreground">3 ключевые статьи библиотеки</span>
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-3">
            {pillars.map((p) => <PostCard key={p.slug} p={p} />)}
          </div>
        </section>
      )}

      {/* Двухколоночная компоновка: сайдбар + контент */}
      <section className="container-x mt-10 grid gap-8 pb-16 lg:grid-cols-[260px,1fr]">
        {/* Сайдбар-«стеллажи» */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-[--shelf-line] bg-[--paper] p-5 text-[--paper-foreground] shadow-card">
            <div className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider">
              <BookOpen className="h-4 w-4" /> Стеллажи
            </div>
            <nav className="mt-3 space-y-1">
              <Link to="/blog" search={{ page: 1 }} className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold transition ${!search.cat ? "bg-primary/10 text-primary" : "hover:bg-black/5"}`}>
                <span>Все статьи</span><span className="text-xs opacity-60">{POSTS.length}</span>
              </Link>
              {BLOG_CATEGORIES.map((c) => (
                <Link key={c.slug} to="/blog" search={{ cat: c.slug, page: 1 }} className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition ${search.cat === c.slug ? "bg-primary/10 font-semibold text-primary" : "hover:bg-black/5"}`}>
                  <span className="flex items-center gap-2"><span className={`inline-block h-2 w-2 rounded-full ${c.color}`} />{c.title}</span>
                  <span className="text-xs opacity-60">{POSTS_BY_CATEGORY[c.slug].length}</span>
                </Link>
              ))}
            </nav>

            <div className="mt-5 border-t border-[--shelf-line] pt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">География</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(["novosibirsk","oblast","both"] as BlogGeo[]).map((g) => (
                <Link key={g} to="/blog" search={{ geo: g, page: 1 }} className={`rounded-md border px-2 py-1 text-[11px] font-semibold ${search.geo === g ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:border-primary"}`}>
                  {g === "novosibirsk" ? "НСК" : g === "oblast" ? "НСО" : "НСК + НСО"}
                </Link>
              ))}
            </div>

            <div className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Частота запроса</div>
            <div className="mt-2 flex gap-1.5">
              {(["ВЧ","СЧ","НЧ"] as BlogFreq[]).map((h) => (
                <Link key={h} to="/blog" search={{ hf: h, page: 1 }} className={`rounded-md border px-2 py-1 text-[11px] font-bold ${search.hf === h ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:border-primary"}`}>{h}</Link>
              ))}
            </div>
          </div>

          {/* Документы к скачиванию */}
          <div className="mt-5 rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
              <FileText className="h-4 w-4" /> Скачать документы
            </div>
            <div className="mt-3 space-y-2">
              {DOCS.map((d) => (
                <a key={d.slug} href={d.url} download={d.file} className="flex items-center gap-3 rounded-lg border border-border bg-background p-2.5 transition hover:border-primary hover:bg-secondary">
                  <Download className="h-4 w-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-foreground">{d.title}</div>
                    <div className="truncate text-[11px] text-muted-foreground">{d.note}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Облако тегов */}
          <div className="mt-5 rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">Темы</div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {ALL_TAGS.map((t) => (
                <Link key={t} to="/blog" search={{ tag: t, page: 1 }} className={`rounded-full px-2.5 py-1 text-[11px] transition ${search.tag === t ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary"}`}>#{t}</Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Лента */}
        <div>
          {/* Активный фильтр */}
          {hasAnyFilter && (
            <div className="mb-5 flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-3 text-sm">
              <span className="text-muted-foreground">Фильтр:</span>
              {search.cat && <span className="rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">{CATEGORY_BY_SLUG[search.cat].title}</span>}
              {search.geo && <span className="rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">{search.geo === "novosibirsk" ? "НСК" : search.geo === "oblast" ? "НСО" : "НСК + НСО"}</span>}
              {search.hf && <span className="rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">Запрос {search.hf}</span>}
              {search.tag && <span className="rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">#{search.tag}</span>}
              {search.q && <span className="rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">«{search.q}»</span>}
              <Link to="/blog" search={{ page: 1 }} className="ml-auto text-xs font-semibold text-muted-foreground hover:text-primary">Сбросить ×</Link>
            </div>
          )}

          <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
            <div>Найдено <strong className="text-foreground">{filtered.length}</strong> из {POSTS.length}</div>
            {totalPages > 1 && <div>Страница {safePage} из {totalPages}</div>}
          </div>

          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
              <div className="text-3xl">🔍</div>
              <p className="mt-3 text-base font-semibold">Ничего не найдено</p>
              <p className="mt-1 text-sm text-muted-foreground">Попробуйте другой запрос или сбросьте фильтры.</p>
              <Link to="/blog" search={{ page: 1 }} className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Показать все статьи</Link>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {items.map((p) => <PostCard key={p.slug} p={p} />)}
            </div>
          )}

          {totalPages > 1 && (
            <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Пагинация">
              <Link to="/blog" search={{ ...search, page: Math.max(1, safePage - 1) }} disabled={safePage === 1} className={`inline-flex h-10 items-center gap-1 rounded-lg border border-border px-3 text-sm font-semibold ${safePage === 1 ? "pointer-events-none opacity-40" : "hover:border-primary hover:text-primary"}`}>
                <ChevronLeft className="h-4 w-4" /> Назад
              </Link>
              {Array.from({ length: totalPages }).map((_, i) => {
                const n = i + 1; const active = n === safePage;
                return (
                  <Link key={n} to="/blog" search={{ ...search, page: n }} className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-semibold ${active ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary hover:text-primary"}`}>{n}</Link>
                );
              })}
              <Link to="/blog" search={{ ...search, page: Math.min(totalPages, safePage + 1) }} disabled={safePage === totalPages} className={`inline-flex h-10 items-center gap-1 rounded-lg border border-border px-3 text-sm font-semibold ${safePage === totalPages ? "pointer-events-none opacity-40" : "hover:border-primary hover:text-primary"}`}>
                Далее <ChevronRight className="h-4 w-4" />
              </Link>
            </nav>
          )}
        </div>
      </section>
    </>
  );
}