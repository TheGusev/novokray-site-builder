import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";
import { SITE } from "@/data/site";
import { POSTS, POSTS_PER_PAGE } from "@/data/blog";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";

const searchSchema = z.object({
  page: fallback(z.number().int().min(1), 1).default(1),
});

export const Route = createFileRoute("/blog/")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: `Блог санитарной службы Дез-Федерация — статьи о дезинфекции и вредителях` },
      { name: "description", content: "Полезные статьи о клопах, тараканах, плесени, озонировании и санитарной обработке в Новосибирске. Советы экспертов с 12-летним опытом." },
      { property: "og:title", content: "Блог Дез-Федерация — статьи и советы" },
      { property: "og:description", content: "Полезные статьи о санитарной обработке от экспертов из Новосибирска." },
      { property: "og:url", content: "/blog" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const { page } = Route.useSearch();
  const totalPages = Math.max(1, Math.ceil(POSTS.length / POSTS_PER_PAGE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * POSTS_PER_PAGE;
  const items = POSTS.slice(start, start + POSTS_PER_PAGE);

  return (
    <>
      <Breadcrumbs items={[{ label: "Главная", to: "/" }, { label: "Блог" }]} />
      <section className="container-x pb-6">
        <h1 className="font-display text-3xl font-extrabold md:text-5xl">Блог санитарной службы</h1>
        <p className="mt-4 max-w-3xl text-muted-foreground">
          Полезные статьи об уничтожении вредителей, плесени, дезинфекции и сушке после потопов — от экспертов Дез-Федерации с 12-летним опытом работы в Новосибирске.
        </p>
      </section>
      <section className="container-x py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <Link
              key={p.slug}
              to="/blog/$slug"
              params={{ slug: p.slug }}
              className="group flex flex-col rounded-2xl border border-border bg-card p-6 shadow-card transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant"
            >
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(p.date).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}</span>
                <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{p.readMin} мин</span>
              </div>
              <h2 className="mt-3 font-display text-lg font-bold leading-tight group-hover:text-primary">{p.title}</h2>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.excerpt}</p>
              <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
                {p.tags.map((t) => (
                  <span key={t} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">{t}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>

        {totalPages > 1 && (
          <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Пагинация">
            <Link
              to="/blog"
              search={{ page: Math.max(1, safePage - 1) }}
              disabled={safePage === 1}
              className={`inline-flex h-10 items-center gap-1 rounded-lg border border-border px-3 text-sm font-semibold ${safePage === 1 ? "pointer-events-none opacity-40" : "hover:border-primary hover:text-primary"}`}
            >
              <ChevronLeft className="h-4 w-4" /> Назад
            </Link>
            {Array.from({ length: totalPages }).map((_, i) => {
              const n = i + 1;
              const active = n === safePage;
              return (
                <Link
                  key={n}
                  to="/blog"
                  search={{ page: n }}
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-semibold ${active ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary hover:text-primary"}`}
                >{n}</Link>
              );
            })}
            <Link
              to="/blog"
              search={{ page: Math.min(totalPages, safePage + 1) }}
              disabled={safePage === totalPages}
              className={`inline-flex h-10 items-center gap-1 rounded-lg border border-border px-3 text-sm font-semibold ${safePage === totalPages ? "pointer-events-none opacity-40" : "hover:border-primary hover:text-primary"}`}
            >
              Далее <ChevronRight className="h-4 w-4" />
            </Link>
          </nav>
        )}
        <div className="mt-3 text-center text-xs text-muted-foreground">Страница {safePage} из {totalPages} · {POSTS.length} статей</div>
      </section>
    </>
  );
}
