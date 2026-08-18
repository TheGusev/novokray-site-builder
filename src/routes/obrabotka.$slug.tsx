import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CheckCircle2, Phone, ShieldCheck, ClipboardList, AlertTriangle } from "lucide-react";
import { SITE } from "@/data/site";
import { typo } from "@/lib/typography";
import {
  LANDINGS_BY_SLUG,
  LANDINGS,
  PESTS,
  OBJECTS,
  landingPrices,
  landingPriceFrom,
  LANDING_POST_TITLES,
  type Landing,
} from "@/data/landings";
import { SERVICES_INDEX } from "@/data/servicesIndex";
import { SERVICE_IMAGES, COMMON } from "@/data/images";
import { LeadForm } from "@/components/site/LeadForm";
import { FAQ } from "@/components/site/FAQ";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { TrustStrip } from "@/components/site/TrustStrip";
import { TldrBlock } from "@/components/site/TldrBlock";
import { Reveal } from "@/components/site/Reveal";
import { faqPageNode, webPageNode } from "@/lib/orgSchema";
import { orderActionNode, offerNode, DEFAULT_AREA } from "@/lib/serviceSchema";


export const Route = createFileRoute("/obrabotka/$slug")({
  loader: ({ params }): { landing: Landing } => {
    const landing = LANDINGS_BY_SLUG[params.slug];
    if (!landing) throw notFound();
    return { landing };
  },
  head: ({ loaderData, params }) => {
    const l = loaderData?.landing;
    if (!l) return { meta: [{ title: "Страница не найдена" }, { name: "robots", content: "noindex" }] };
    const pest = PESTS[l.pest];
    const pageUrl = `${SITE.domain}/obrabotka/${params.slug}`;
    const priceFrom = landingPriceFrom(l);
    const ogImage = `${SITE.domain}${SERVICE_IMAGES[pest.serviceSlug] ?? "/og/default.jpg"}`;
    const serviceId = `${pageUrl}#service`;
    const faqItems = landingFaq(l);

    return {
      meta: [
        { title: l.title },
        { name: "description", content: l.description },
        { property: "og:title", content: l.title },
        { property: "og:description", content: l.description },
        { property: "og:url", content: pageUrl },
        { property: "og:type", content: "website" },
        { property: "og:image", content: ogImage },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: ogImage },
      ],
      links: [{ rel: "canonical", href: pageUrl }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              webPageNode({
                url: pageUrl,
                name: l.title,
                description: l.description,
                primaryEntityId: serviceId,
              }),
              {
                "@type": "Service",
                "@id": serviceId,
                name: l.h1,
                serviceType: `Обработка ${pest.genitive} ${OBJECTS[l.object].prepositional}`,
                description: l.description,
                url: pageUrl,
                mainEntityOfPage: { "@id": `${pageUrl}#webpage` },
                provider: { "@id": `${SITE.domain}/#organization` },
                areaServed: DEFAULT_AREA.map((a) => ({
                  "@type": a.kind === "city" ? "City" : "AdministrativeArea",
                  name: a.name,
                })),
                offers: offerNode(
                  { slug: params.slug, title: l.h1, priceFrom },
                  { url: pageUrl },
                ),
                potentialAction: orderActionNode(pageUrl, l.h1),
              },
              {
                "@type": "BreadcrumbList",
                "@id": `${pageUrl}#breadcrumb`,
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Главная", item: `${SITE.domain}/` },
                  { "@type": "ListItem", position: 2, name: "Услуги", item: `${SITE.domain}/services` },
                  { "@type": "ListItem", position: 3, name: l.h1, item: pageUrl },
                ],
              },
              faqPageNode(faqItems, pageUrl, { aboutId: serviceId }),
            ],
          }),
        },
      ],
    };
  },
  component: LandingPage,
});

/** Вопросы страницы: общий блок + 2 уникальных для связки. Один источник для UI и FAQPage. */
export function landingFaq(l: Landing) {
  const pest = PESTS[l.pest];
  const obj = OBJECTS[l.object];
  const priceFrom = landingPriceFrom(l);
  return [
    ...l.faq,
    {
      q: `Сколько стоит обработка ${obj.genitive} от ${pest.genitive} в Новосибирске?`,
      a: `От ${priceFrom.toLocaleString("ru-RU")} ₽. Выезд и осмотр бесплатные, итоговую цену специалист называет до начала работ и фиксирует в договоре — доплат «по факту» у нас нет.`,
    },
    {
      q: `Какая гарантия на обработку ${obj.genitive}?`,
      a: `Гарантия ${pest.warranty} по договору. Если проблема вернётся в течение срока — специалист приезжает и обрабатывает повторно бесплатно.`,
    },
    {
      q: "Как быстро приедет специалист?",
      a: `Выезд по Новосибирску — от 60 минут, ежедневно с 07:00 до 23:00. В область (Бердск, Искитим, Кольцово, Обь, Краснообск и другие) выезжаем в день обращения по согласованному времени.`,
    },
  ];
}

function LandingPage() {
  const { landing: l } = Route.useLoaderData() as { landing: Landing };
  const pest = PESTS[l.pest];
  const obj = OBJECTS[l.object];
  const prices = landingPrices(l);
  const faq = landingFaq(l);
  const service = SERVICES_INDEX.find((s) => s.slug === pest.serviceSlug);
  const siblings = LANDINGS.filter(
    (x) => x.slug !== l.slug && (x.pest === l.pest || x.object === l.object),
  ).slice(0, 6);

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Главная", to: "/" },
          { label: "Услуги", to: "/services" },
          { label: l.h1 },
        ]}
      />

      <section className="relative overflow-hidden bg-hero text-primary-foreground">
        <img
          src={SERVICE_IMAGES[pest.serviceSlug] ?? COMMON.heroSpray}
          alt={`${l.h1} — специалист Дез-Федерация`}
          title={l.h1}
          className="absolute inset-0 h-full w-full object-cover opacity-25"
          loading="eager"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />
        <div className="container-x relative grid gap-8 py-12 md:py-16 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <h1 className="font-display text-3xl font-extrabold leading-tight md:text-5xl text-balance">
              {typo(l.h1)}
            </h1>
            <p className="speakable mt-5 max-w-2xl text-[15px] leading-relaxed text-white/90 md:text-lg">
              {typo(l.angle)}
            </p>
            <div className="mt-6 max-w-xl">
              <TldrBlock
                items={[
                  { label: "Цена", value: `от ${landingPriceFrom(l).toLocaleString("ru-RU")} ₽` },
                  { label: "Гарантия", value: pest.warranty },
                  { label: "Выезд", value: "от 60 минут, 07:00–23:00" },
                  { label: "Метод", value: pest.method },
                ]}
              />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={SITE.phoneHref}
                className="inline-flex items-center gap-2 rounded-xl bg-cta-gradient px-5 py-3 font-semibold text-accent-foreground shadow-cta"
              >
                <Phone className="h-4 w-4" /> {SITE.phone}
              </a>
              {service && (
                <Link
                  to="/services/$slug"
                  params={{ slug: service.slug }}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 font-semibold backdrop-blur"
                >
                  Всё об услуге: {service.title.toLowerCase()}
                </Link>
              )}
            </div>
          </div>
          <div className="lg:pl-4">
            <LeadForm
              variant="card"
              title="Рассчитать стоимость"
              subtitle="Ответим в течение 5 минут и назовём точную цену"
              formName={`landing:${l.slug}`}
              context={l.h1}
              goal="lead"
            />
          </div>
        </div>
      </section>

      <TrustStrip />

      <section className="container-x py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-2">
          <Reveal>
            <h2 className="font-display text-2xl font-bold md:text-3xl">
              {typo(`Признаки: как понять, что ${pest.nominative} уже здесь`)}
            </h2>
            <ul className="mt-5 space-y-3">
              {pest.signs.map((s) => (
                <li key={s} className="flex gap-3 text-[15px] leading-relaxed">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <span>{typo(s)}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal>
            <h2 className="font-display text-2xl font-bold md:text-3xl">
              {typo(`Особенности объекта: ${obj.prepositional}`)}
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground">
              {typo(obj.specifics)}
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              <strong className="text-foreground">Препараты. </strong>
              {typo(pest.prep)}.
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              <strong className="text-foreground">Документы. </strong>
              {typo(obj.docs)}
            </p>
          </Reveal>
        </div>
      </section>

      {prices.length > 0 && (
        <section className="bg-secondary/40 py-12 md:py-16">
          <div className="container-x">
            <h2 className="font-display text-2xl font-bold md:text-3xl">
              {typo(`Цены на обработку ${obj.genitive} от ${pest.genitive} в Новосибирске`)}
            </h2>
            <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
              <table className="w-full text-left text-[15px]">
                <thead className="bg-secondary/60 text-sm">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Объект</th>
                    <th className="px-4 py-3 font-semibold">Стоимость</th>
                  </tr>
                </thead>
                <tbody>
                  {prices.map((p) => (
                    <tr key={p.label} className="border-t border-border">
                      <td className="px-4 py-3">{typo(p.label)}</td>
                      <td className="px-4 py-3 font-semibold text-primary">{p.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Цена фиксируется до начала работ и вносится в договор. Полный прайс —{" "}
              <Link to="/price" className="text-primary underline underline-offset-4">
                на странице цен
              </Link>
              .
            </p>
          </div>
        </section>
      )}

      <section className="container-x py-12 md:py-16">
        <h2 className="font-display text-2xl font-bold md:text-3xl">
          {typo("Как проходит обработка")}
        </h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            { t: "Заявка и расчёт", d: "Уточняем объект и степень заражения, называем цену до выезда." },
            { t: "Подготовка", d: obj.prep },
            { t: "Обработка", d: `${pest.method}. Специалист работает в СИЗ, время — 40–90 минут.` },
            { t: "Договор и гарантия", d: `Выдаём договор и акт. Гарантия ${pest.warranty}, повторный выезд бесплатный.` },
          ].map((s, i) => (
            <div key={s.t} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                {i + 1}
              </div>
              <h3 className="mt-3 font-semibold">{typo(s.t)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{typo(s.d)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x pb-4">
        <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/8 via-card to-accent/8 p-6 shadow-card">
          <div className="flex flex-wrap items-center gap-4">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <div className="min-w-[240px] flex-1">
              <p className="font-display text-lg font-bold">
                {typo(`Гарантия ${pest.warranty} по договору`)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {typo(
                  `Работаем по лицензии № ${SITE.legal.licenseNo}. ${SITE.legal.name}, ИНН ${SITE.legal.inn}.`,
                )}
              </p>
            </div>
            <a
              href={SITE.phoneHref}
              className="inline-flex items-center gap-2 rounded-xl bg-cta-gradient px-5 py-3 font-semibold text-accent-foreground shadow-cta"
            >
              <Phone className="h-4 w-4" /> Вызвать специалиста
            </a>
          </div>
        </div>
      </section>

      <FAQ items={faq} title={`Вопросы: обработка ${obj.genitive} от ${pest.genitive}`} />

      <section className="container-x pb-16">
        <h2 className="font-display text-2xl font-bold md:text-3xl">
          {typo("Смежные ситуации")}
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {siblings.map((s) => (
            <Link
              key={s.slug}
              to="/obrabotka/$slug"
              params={{ slug: s.slug }}
              className="group rounded-2xl border border-border bg-card p-5 shadow-card transition hover:border-primary/40"
            >
              <span className="font-semibold group-hover:text-primary">{typo(s.h1)}</span>
              <span className="mt-2 block text-sm text-muted-foreground">
                от {landingPriceFrom(s).toLocaleString("ru-RU")} ₽ · гарантия {PESTS[s.pest].warranty}
              </span>
            </Link>
          ))}
        </div>

        {l.posts && l.posts.length > 0 && (
          <div className="mt-8">
            <h3 className="flex items-center gap-2 font-semibold">
              <ClipboardList className="h-4 w-4 text-primary" /> Полезное по теме
            </h3>
            <ul className="mt-3 space-y-2">
              {l.posts.map((slug) => (
                <li key={slug} className="flex gap-2 text-[15px]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <Link
                    to="/blog/$slug"
                    params={{ slug }}
                    className="text-primary underline underline-offset-4"
                  >
                    {LANDING_POST_TITLES[slug] ?? slug}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </>
  );
}
