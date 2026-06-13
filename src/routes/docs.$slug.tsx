import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Download, Phone, FileSignature } from "lucide-react";
import { SITE } from "@/data/site";
import { DOCS, getDoc } from "@/data/docs";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";

export const Route = createFileRoute("/docs/$slug")({
  loader: ({ params }) => {
    const doc = getDoc(params.slug);
    if (!doc) throw notFound();
    return { doc };
  },
  head: ({ loaderData }) => {
    const d = loaderData?.doc;
    const title = d ? `${d.title} — образец PDF · ${SITE.shortName}` : `Документ — ${SITE.shortName}`;
    const description = d?.description ?? "Образцы договоров и документов Дез-Федерация.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { name: "robots", content: "noindex,follow" },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="container-x py-16 text-center">
      <h1 className="font-display text-2xl font-bold">Документ не найден</h1>
      <Link to="/garantii" className="mt-4 inline-block text-primary underline">Вернуться к гарантиям</Link>
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div className="container-x py-16 text-center">
      <h1 className="font-display text-2xl font-bold">Не удалось открыть документ</h1>
      <button onClick={reset} className="mt-4 text-primary underline">Повторить</button>
    </div>
  ),
  component: DocViewerPage,
});

function DocViewerPage() {
  const { doc } = Route.useLoaderData();
  const router = useRouter();

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.history.back();
    } else {
      router.navigate({ to: "/garantii" });
    }
  };

  return (
    <>
      <Breadcrumbs items={[{ label: "Главная", to: "/" }, { label: "Гарантии", to: "/garantii" }, { label: doc.title }]} />

      {/* Sticky toolbar — always visible */}
      <div className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container-x flex flex-wrap items-center gap-2 py-3">
          <button
            onClick={goBack}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-semibold text-foreground hover:border-primary hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Назад на сайт
          </button>
          <Link
            to="/garantii"
            className="inline-flex h-10 items-center rounded-lg px-3 text-sm font-semibold text-muted-foreground hover:text-primary"
          >
            К гарантиям
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <a
              href={doc.url}
              download={doc.file}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-cta-gradient px-4 text-sm font-bold text-accent-foreground shadow-cta hover:scale-[1.01]"
            >
              <Download className="h-4 w-4" /> Скачать PDF
            </a>
            {doc.slug === "dogovor" && (
              <Link
                to="/dogovor/zapolnit"
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-primary bg-secondary px-4 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <FileSignature className="h-4 w-4" /> Заполнить и скачать
              </Link>
            )}
            <a
              href={SITE.phoneHref}
              aria-label="Позвонить"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-foreground hover:border-primary hover:text-primary"
            >
              <Phone className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      <section className="container-x py-6 md:py-10">
        <h1 className="font-display text-2xl font-extrabold md:text-3xl">{doc.title}</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">{doc.description}</p>

        {/* PDF embed */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <object data={doc.url} type="application/pdf" className="h-[70vh] w-full md:h-[80vh]">
            <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Ваш браузер не отображает PDF встроенно. Скачайте файл, чтобы посмотреть.
              </p>
              <a
                href={doc.url}
                download={doc.file}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-cta-gradient px-5 font-bold text-accent-foreground shadow-cta"
              >
                <Download className="h-4 w-4" /> Скачать PDF
              </a>
            </div>
          </object>
        </div>

        {/* Bottom back row — duplicate for convenience on mobile */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={goBack}
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-semibold text-foreground hover:border-primary hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Назад на сайт
          </button>
          <Link to="/garantii" className="text-sm font-semibold text-primary underline-offset-2 hover:underline">
            Все документы
          </Link>
        </div>

        {/* Other docs */}
        <div className="mt-10">
          <h2 className="font-display text-lg font-bold">Другие образцы</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {DOCS.filter((d) => d.slug !== doc.slug).map((d) => (
              <Link
                key={d.slug}
                to="/docs/$slug"
                params={{ slug: d.slug }}
                className="rounded-2xl border border-border bg-card p-4 shadow-card transition hover:-translate-y-0.5 hover:border-primary/40"
              >
                <div className="font-display text-sm font-bold">{d.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">{d.note}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}