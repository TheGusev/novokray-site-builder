import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CheckCircle2, Phone, ShieldCheck, ArrowRight, FlaskConical } from "lucide-react";
import { SITE } from "@/data/site";
import { SERVICES_BY_SLUG, SERVICES } from "@/data/services";
import { LeadForm } from "@/components/site/LeadForm";
import { FAQ } from "@/components/site/FAQ";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ServiceCard } from "@/components/site/ServiceCard";
import { TrustStrip } from "@/components/site/TrustStrip";

export const Route = createFileRoute("/services/$slug")({
  loader: ({ params }) => {
    const service = SERVICES_BY_SLUG[params.slug];
    if (!service) throw notFound();
    return { service };
  },
  head: ({ loaderData, params }) => {
    const s = loaderData?.service;
    if (!s) return { meta: [{ title: "Не найдено" }] };
    return {
      meta: [
        { title: s.metaTitle },
        { name: "description", content: s.metaDescription },
        { name: "keywords", content: s.keywords.join(", ") },
        { property: "og:title", content: s.metaTitle },
        { property: "og:description", content: s.metaDescription },
        { property: "og:url", content: `/services/${params.slug}` },
        { property: "og:type", content: "website" },
      ],
      links: [
        { rel: "canonical", href: `/services/${params.slug}` },
        { rel: "alternate", hrefLang: "ru", href: `/services/${params.slug}` },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Service",
                "@id": `${SITE.domain}/services/${params.slug}#service`,
                name: s.h1,
                serviceType: s.title,
                provider: { "@id": `${SITE.domain}#organization` },
                areaServed: { "@type": "City", name: SITE.city },
                description: s.metaDescription,
                offers: {
                  "@type": "Offer",
                  price: s.priceFrom,
                  priceCurrency: "RUB",
                  availability: "https://schema.org/InStock",
                  url: `${SITE.domain}/services/${params.slug}`,
                },
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Главная", item: SITE.domain + "/" },
                  { "@type": "ListItem", position: 2, name: "Услуги", item: SITE.domain + "/services" },
                  { "@type": "ListItem", position: 3, name: s.title, item: `${SITE.domain}/services/${params.slug}` },
                ],
              },
              {
                "@type": "FAQPage",
                mainEntity: s.faq.map((f) => ({
                  "@type": "Question",
                  name: f.q,
                  acceptedAnswer: { "@type": "Answer", text: f.a },
                })),
              },
            ],
          }),
        },
      ],
    };
  },
  component: ServicePage,
});

function ServicePage() {
  const { service: s } = Route.useLoaderData();
  const Icon = s.icon;
  const related = s.related.map((slug) => SERVICES_BY_SLUG[slug]).filter(Boolean);

  return (
    <>
      <Breadcrumbs items={[
        { label: "Главная", to: "/" },
        { label: "Услуги", to: "/services" },
        { label: s.title },
      ]} />

      {/* HERO */}
      <section className="relative overflow-hidden bg-hero text-primary-foreground">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 80% 30%, oklch(0.7 0.20 38 / 0.3), transparent 60%)" }} />
        <div className="container-x relative grid gap-10 py-14 lg:grid-cols-[1.25fr,1fr] lg:py-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold">
              <Icon className="h-3.5 w-3.5" /> {SITE.city} и область
            </div>
            <h1 className="mt-5 font-display text-3xl font-extrabold leading-tight md:text-5xl">{s.h1}</h1>
            <p className="mt-5 max-w-2xl text-base text-white/90 md:text-lg">{s.lead}</p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a href={SITE.phoneHref} className="inline-flex items-center gap-2 rounded-lg bg-accent-gradient px-5 py-3 font-semibold text-accent-foreground shadow-accent">
                <Phone className="h-4 w-4" /> Вызвать за {s.priceFrom.toLocaleString("ru-RU")} ₽
              </a>
              <a href="#zayavka" className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-5 py-3 font-semibold backdrop-blur hover:bg-white/20">
                Получить расчёт <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
          <div id="zayavka" className="lg:pl-6">
            <LeadForm variant="hero" title="Заказать выезд" subtitle="Перезвоним в течение 10 минут и зафиксируем цену." defaultService={s.title} />
          </div>
        </div>
      </section>

      <TrustStrip />

      {/* Problems */}
      <section className="container-x py-16">
        <h2 className="font-display text-3xl font-bold md:text-4xl">Когда нужна {s.title.toLowerCase()}</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {s.problems.map((p, i) => (
            <div key={i} className="flex gap-3 rounded-xl border border-border bg-card p-5 shadow-card">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <span className="text-foreground/90">{p}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="bg-surface py-16">
        <div className="container-x">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Как проходит обработка</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {s.steps.map((st, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <div className="font-display text-3xl font-extrabold text-primary/30">{String(i + 1).padStart(2, "0")}</div>
                <div className="mt-1 font-display text-lg font-bold">{st.title}</div>
                <div className="mt-2 text-sm text-muted-foreground">{st.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech */}
      <section className="container-x py-16">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
          <FlaskConical className="h-3.5 w-3.5" /> Препараты и технологии
        </div>
        <h2 className="font-display text-3xl font-bold md:text-4xl">Профессиональное оборудование и сертифицированные препараты</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {s.tech.map((t, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="font-display text-lg font-bold text-primary">{t.title}</div>
              <div className="mt-2 text-sm text-muted-foreground">{t.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Prices */}
      <section className="bg-surface py-16">
        <div className="container-x">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Цены</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">Стоимость фиксируется до выезда. Без скрытых платежей и доплат за препараты.</p>
          <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            <table className="w-full text-left">
              <thead className="bg-secondary text-sm text-secondary-foreground">
                <tr>
                  <th className="px-5 py-3 font-display font-semibold">Объект</th>
                  <th className="px-5 py-3 font-display font-semibold text-right">Стоимость</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {s.prices.map((p, i) => (
                  <tr key={i} className="text-sm">
                    <td className="px-5 py-4">{p.label}{p.note && <span className="ml-2 text-xs text-muted-foreground">({p.note})</span>}</td>
                    <td className="px-5 py-4 text-right font-display font-bold text-foreground">{p.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link to="/price" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2">
            Полный прайс-лист <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Guarantee */}
      <section className="container-x py-16">
        <div className="grid gap-8 rounded-3xl border border-border bg-card p-8 shadow-card md:grid-cols-2 md:p-12">
          <div>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-success/15 text-success">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="mt-4 font-display text-3xl font-bold">Гарантия по договору</h2>
            <p className="mt-3 text-muted-foreground">
              Выдаём договор и акт выполненных работ. Если проблема вернётся в течение срока гарантии — приезжаем повторно бесплатно. Работаем по 152-ФЗ, лицензия Роспотребнадзора.
            </p>
            <Link to="/garantii" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2">
              Подробнее о гарантиях <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <LeadForm title="Записаться на обработку" subtitle="Заявка ни к чему не обязывает. Сначала озвучим цену." defaultService={s.title} />
        </div>
      </section>

      <FAQ items={s.faq} />

      {/* Related */}
      {related.length > 0 && (
        <section className="container-x pb-16">
          <h2 className="font-display text-2xl font-bold md:text-3xl">Смежные услуги</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => (<ServiceCard key={r.slug} service={r} />))}
          </div>
        </section>
      )}
    </>
  );
}
