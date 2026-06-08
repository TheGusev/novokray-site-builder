import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import { SITE } from "@/data/site";
import { POSTS_BY_SLUG, POSTS } from "@/data/blog";
import { SERVICES_BY_SLUG } from "@/data/services";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { LeadForm } from "@/components/site/LeadForm";
import { ServiceCard } from "@/components/site/ServiceCard";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = POSTS_BY_SLUG[params.slug];
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData, params }) => {
    const p = loaderData?.post;
    if (!p) return { meta: [{ title: "Статья не найдена" }] };
    return {
      meta: [
        { title: `${p.title} — Блог ${SITE.name}` },
        { name: "description", content: p.excerpt },
        { property: "og:title", content: p.title },
        { property: "og:description", content: p.excerpt },
        { property: "og:url", content: `/blog/${params.slug}` },
        { property: "og:type", content: "article" },
        { property: "article:published_time", content: p.date },
      ],
      links: [{ rel: "canonical", href: `/blog/${params.slug}` }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Article",
              headline: p.title,
              description: p.excerpt,
              datePublished: p.date,
              author: { "@type": "Organization", name: SITE.name },
              publisher: { "@id": `${SITE.domain}#organization` },
              mainEntityOfPage: `${SITE.domain}/blog/${params.slug}`,
              inLanguage: "ru-RU",
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Главная", item: SITE.domain + "/" },
                { "@type": "ListItem", position: 2, name: "Блог", item: SITE.domain + "/blog" },
                { "@type": "ListItem", position: 3, name: p.title, item: `${SITE.domain}/blog/${params.slug}` },
              ],
            },
          ],
        }),
      }],
    };
  },
  component: PostPage,
});

function PostPage() {
  const { post: p } = Route.useLoaderData();
  const related = p.relatedServices.map((s) => SERVICES_BY_SLUG[s]).filter(Boolean);
  const otherPosts = POSTS.filter((x) => x.slug !== p.slug).slice(0, 3);

  return (
    <>
      <Breadcrumbs items={[
        { label: "Главная", to: "/" },
        { label: "Блог", to: "/blog" },
        { label: p.title },
      ]} />
      <article className="container-x py-6">
        <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Все статьи
        </Link>
        <h1 className="mt-4 max-w-4xl font-display text-3xl font-extrabold leading-tight md:text-5xl">{p.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" />{new Date(p.date).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}</span>
          <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" />{p.readMin} мин чтения</span>
          {p.tags.map((t) => <span key={t} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs">{t}</span>)}
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr,360px]">
          <div className="prose-content">
            <div className="rounded-2xl border border-primary/20 bg-secondary/50 p-5 text-base font-medium text-foreground">
              {p.excerpt}
            </div>
            {p.body.split("\n\n").map((par, i) => (
              <p key={i} className="mt-5 text-base leading-relaxed text-foreground/90">{par}</p>
            ))}
          </div>
          <aside className="space-y-6">
            <LeadForm title="Нужна помощь?" subtitle="Расскажите о проблеме — подскажем решение и цену." />
            {related.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <div className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">По теме статьи</div>
                <div className="mt-3 space-y-2">
                  {related.map((r) => (
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
        <h2 className="font-display text-2xl font-bold md:text-3xl">Читайте также</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {otherPosts.map((o) => (
            <Link key={o.slug} to="/blog/$slug" params={{ slug: o.slug }} className="group rounded-2xl border border-border bg-card p-6 shadow-card hover:border-primary/40 hover:shadow-elegant">
              <div className="text-xs text-muted-foreground">{new Date(o.date).toLocaleDateString("ru-RU")}</div>
              <h3 className="mt-2 font-display text-lg font-bold group-hover:text-primary">{o.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{o.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>

      {related.length > 0 && (
        <section className="container-x pb-16">
          <h2 className="font-display text-2xl font-bold md:text-3xl">Услуги по теме</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => (<ServiceCard key={r.slug} service={r} />))}
          </div>
        </section>
      )}
    </>
  );
}
