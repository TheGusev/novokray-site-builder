import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Calendar, Clock, ArrowLeft, MapPin, Download, FileText, ExternalLink, ListTree } from "lucide-react";
import { SITE } from "@/data/site";
import { POSTS, CATEGORY_BY_SLUG, type BlogPost, type BlogCategory } from "@/data/blog";
import { SERVICES_BY_SLUG } from "@/data/services";
import { BLOG_COVERS, BLOG_IMAGE_META } from "@/data/images";
import { DOCS } from "@/data/docs";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { LeadForm } from "@/components/site/LeadForm";
import { ServiceCard } from "@/components/site/ServiceCard";
import { renderBodyBlocks, extractToc } from "@/lib/mdx-lite";
import { getBlogOffer } from "@/data/blogPestMap";
import { InlineLeadCta } from "@/components/site/InlineLeadCta";
import { BlogStickyCta } from "@/components/site/BlogStickyCta";
import { GOALS } from "@/lib/analytics";

export const Route = createFileRoute("/blog/$slug")({
  // Статьи грузятся отдельным чанком — они не нужны на остальных страницах.
  loader: async ({ params }): Promise<{ post: BlogPost; section: string; words: number }> => {
    const [{ POSTS_BY_SLUG, CATEGORY_BY_SLUG: cats }, { wordCount }] = await Promise.all([
      import("@/data/blog"),
      import("@/lib/mdx-lite"),
    ]);
    const post = POSTS_BY_SLUG[params.slug];
    if (!post) throw notFound();
    return { post, section: cats[post.category].title, words: wordCount(post.body) };
  },
  notFoundComponent: () => (
    <div className="container-x py-16 text-center">
      <h1 className="font-display text-2xl font-bold">Статья не найдена</h1>
      <Link to="/blog" className="mt-4 inline-block text-primary underline">Вернуться в библиотеку</Link>
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div className="container-x py-16 text-center">
      <h1 className="font-display text-2xl font-bold">Не удалось открыть статью</h1>
      <button onClick={reset} className="mt-4 text-primary underline">Повторить</button>
    </div>
  ),
  head: ({ loaderData, params }) => {
    const p = loaderData?.post;
    if (!p) return { meta: [{ title: "Статья не найдена" }] };
    const section = loaderData.section;
    const wc = loaderData.words;
    const cover = BLOG_COVERS[p.slug];
    const ogImage = typeof cover === "string" ? `${SITE.domain}${cover}` : `${SITE.domain}/og/default.jpg`;
    const graph: unknown[] = [
      {
        "@type": "Article",
        headline: p.title,
        description: p.excerpt,
        image: ogImage,
        datePublished: p.date,
        dateModified: p.updatedAt ?? p.date,
        author: { "@type": "Person", name: "Алексей Дроздов", jobTitle: "Главный дезинфектор, Дез-Федерация", worksFor: { "@id": `${SITE.domain}#organization` } },
        publisher: { "@type": "Organization", "@id": `${SITE.domain}#organization`, name: SITE.name, logo: { "@type": "ImageObject", url: `${SITE.domain}/logo.png` } },
        mainEntityOfPage: `${SITE.domain}/blog/${params.slug}`,
        articleSection: section,
        keywords: p.tags.join(", "),
        wordCount: wc,
        inLanguage: "ru-RU",
        speakable: { "@type": "SpeakableSpecification", cssSelector: [".speakable", ".prose-content p:first-of-type"] },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Главная", item: SITE.domain + "/" },
          { "@type": "ListItem", position: 2, name: "Библиотека", item: SITE.domain + "/blog" },
          { "@type": "ListItem", position: 3, name: section, item: `${SITE.domain}/blog?cat=${p.category}` },
          { "@type": "ListItem", position: 4, name: p.title, item: `${SITE.domain}/blog/${params.slug}` },
        ],
      },
    ];
    if (p.faq?.length) {
      graph.push({
        "@type": "FAQPage",
        mainEntity: p.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      });
    }
    if (p.howto) {
      graph.push({
        "@type": "HowTo",
        name: p.howto.name,
        step: p.howto.steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.name, text: s.text })),
      });
    }
    return {
      meta: [
        { title: `${p.title} — Библиотека ${SITE.shortName}` },
        { name: "description", content: p.excerpt },
        { property: "og:title", content: p.title },
        { property: "og:description", content: p.excerpt },
        { property: "og:url", content: `${SITE.domain}/blog/${params.slug}` },
        { property: "og:type", content: "article" },
        { property: "og:image", content: ogImage },
        { property: "article:published_time", content: p.date },
        { property: "article:modified_time", content: p.updatedAt ?? p.date },
        { property: "article:section", content: section },
      ],
      links: [{ rel: "canonical", href: `${SITE.domain}/blog/${params.slug}` }],
      scripts: [{ type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }) }],
    };
  },
  component: PostPage,
});

function PostPage() {
  const data = Route.useLoaderData() as { post: BlogPost };
  const p = data.post;
  const cat = CATEGORY_BY_SLUG[p.category as BlogCategory];
  const related = p.relatedServices.map((s: string) => SERVICES_BY_SLUG[s]).filter(Boolean);
  const others = POSTS.filter((x) => x.slug !== p.slug && x.category === p.category).slice(0, 3);
  const otherPosts = others.length >= 3 ? others : POSTS.filter((x) => x.slug !== p.slug).slice(0, 3);
  const cover = BLOG_COVERS[p.slug];
  const toc = extractToc(p.body);
  const docs = (p.relatedDocs ?? []).map((s: string) => DOCS.find((d) => d.slug === s)).filter(Boolean) as typeof DOCS;
  const offer = getBlogOffer(p.category, p.relatedServices);
  const blocks = renderBodyBlocks(p.body);
  const cutIndex = Math.max(1, Math.round(blocks.length * 0.4));

  return (
    <>
      <Breadcrumbs items={[
        { label: "Главная", to: "/" },
        { label: "Библиотека", to: "/blog" },
        { label: cat.title },
        { label: p.title },
      ]} />

      <article className="container-x py-6">
        <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Вся библиотека
        </Link>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Link to="/blog" search={{ cat: p.category, page: 1 }} className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${cat.color}`}>{cat.title}</Link>
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-semibold text-muted-foreground">
            <MapPin className="h-3 w-3" />{p.geo === "novosibirsk" ? "Новосибирск" : p.geo === "oblast" ? "Новосибирская область" : "НСК и область"}
          </span>
        </div>

        <h1 className="mt-4 max-w-4xl font-display text-3xl font-extrabold leading-tight md:text-5xl">{p.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" />{new Date(p.date).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}</span>
          {p.updatedAt && <span className="text-xs">обновлено {new Date(p.updatedAt).toLocaleDateString("ru-RU")}</span>}
          <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" />{p.readMin} мин чтения</span>
          {p.tags.map((t) => <Link key={t} to="/blog" search={{ tag: t, page: 1 }} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs hover:bg-primary/10 hover:text-primary">#{t}</Link>)}
        </div>

        {cover && (
          <div className="mt-6 overflow-hidden rounded-2xl">
            <img src={cover} alt={BLOG_IMAGE_META[p.slug]?.alt ?? p.title} title={BLOG_IMAGE_META[p.slug]?.title ?? p.title} className="h-auto w-full object-cover" loading="eager" />
          </div>
        )}

        <div className="mt-10 grid gap-10 lg:grid-cols-[220px,1fr,320px]">
          {/* TOC */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-[--shelf-line] bg-[--paper] p-4 text-[--paper-foreground]">
              <div className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <ListTree className="h-3.5 w-3.5" /> В этой статье
              </div>
              <nav className="mt-3 space-y-1.5 text-sm">
                {toc.filter((t: { level: number }) => t.level === 2).map((t: { id: string; title: string }) => (
                  <a key={t.id} href={`#${t.id}`} className="block rounded px-2 py-1 leading-tight transition hover:bg-primary/10 hover:text-primary">{t.title}</a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Контент */}
          <div className="prose-content min-w-0">
            <div className="speakable rounded-2xl border border-primary/20 bg-secondary/50 p-5 text-base font-medium leading-relaxed text-foreground">
              {p.excerpt}
            </div>
            <div className="mt-2">
              {blocks.slice(0, cutIndex)}
              <InlineLeadCta
                offer={offer}
                context={p.title}
                goal={GOALS.blogInlineLead}
                formName={`Врезка в статье: ${p.title}`}
              />
              {blocks.slice(cutIndex)}
            </div>

            <InlineLeadCta
              offer={offer}
              context={p.title}
              goal={GOALS.blogBottomLead}
              formName={`Блок под статьёй: ${p.title}`}
              wide
            />

            {/* Документы */}
            {docs.length > 0 && (
              <section className="mt-10 rounded-2xl border border-border bg-card p-5">
                <h2 className="m-0 flex items-center gap-2 font-display text-xl font-bold"><FileText className="h-5 w-5 text-primary" /> Документы по теме</h2>
                <p className="mt-2 text-sm text-muted-foreground">Образцы для скачивания — заполните реквизиты и используйте в работе.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {docs.map((d) => (
                    <a key={d.slug} href={d.url} download={d.file} className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 transition hover:border-primary hover:bg-secondary">
                      <Download className="h-5 w-5 shrink-0 text-primary" />
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-foreground">{d.title}</div>
                        <div className="truncate text-xs text-muted-foreground">{d.note}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* FAQ */}
            {p.faq && p.faq.length > 0 && (
              <section className="mt-10">
                <h2 className="font-display text-2xl font-bold md:text-3xl">Частые вопросы</h2>
                <div className="mt-4 divide-y divide-border rounded-2xl border border-border bg-card">
                  {p.faq.map((f: { q: string; a: string }, i: number) => (
                    <details key={i} className="group p-5">
                      <summary className="cursor-pointer list-none text-base font-bold text-foreground transition hover:text-primary">
                        {f.q}
                      </summary>
                      <p className="mt-3 text-[15px] leading-relaxed text-foreground/90">{f.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {/* Источники */}
            {p.sources && p.sources.length > 0 && (
              <section className="mt-10 rounded-2xl border border-border bg-secondary/40 p-5">
                <h2 className="m-0 font-display text-lg font-bold">Источники и нормативы</h2>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {p.sources.map((s: { label: string; url: string }, i: number) => (
                    <li key={i}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 text-primary underline decoration-primary/40 hover:decoration-primary">
                        {s.label} <ExternalLink className="h-3 w-3" />
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Правый сайдбар */}
          <aside className="space-y-6">
            <div className="lg:sticky lg:top-24">
              <LeadForm
                title={offer.heading}
                subtitle={offer.sub}
                defaultService={offer.pest}
                goal={GOALS.blogSidebarLead}
                formName={`Сайдбар статьи: ${p.title}`}
              />
            </div>
            {related.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <div className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">По теме статьи</div>
                <div className="mt-3 space-y-2">
                  {related.map((r: typeof related[number]) => (
                    <Link key={r.slug} to="/services/$slug" params={{ slug: r.slug }} className="flex items-center gap-3 rounded-lg p-2 hover:bg-secondary">
                      <r.icon className="h-5 w-5 text-primary" />
                      <div>
                        <div className="text-sm font-semibold">{r.title}</div>
                        <div className="text-xs text-muted-foreground">от {r.priceFrom.toLocaleString("ru-RU")} ₽</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </article>

      <section className="container-x py-16">
        <h2 className="font-display text-2xl font-bold md:text-3xl">Читайте также в рубрике «{cat.title}»</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {otherPosts.map((o) => (
            <Link key={o.slug} to="/blog/$slug" params={{ slug: o.slug }} className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant">
              {BLOG_COVERS[o.slug] && (
                <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
                  <img src={BLOG_COVERS[o.slug]} alt={BLOG_IMAGE_META[o.slug]?.alt ?? o.title} title={BLOG_IMAGE_META[o.slug]?.title ?? o.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                </div>
              )}
              <div className="flex flex-1 flex-col p-6">
                <div className="text-xs text-muted-foreground">{new Date(o.date).toLocaleDateString("ru-RU")}</div>
                <h3 className="mt-2 font-display text-lg font-bold group-hover:text-primary">{o.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{o.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {related.length > 0 && (
        <section className="container-x pb-16">
          <h2 className="font-display text-2xl font-bold md:text-3xl">Услуги по теме</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r: typeof related[number]) => (<ServiceCard key={r.slug} service={r} />))}
          </div>
        </section>
      )}

      <BlogStickyCta offer={offer} context={p.title} />
    </>
  );
}