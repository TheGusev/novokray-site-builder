import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Phone, MapPin, Clock, ShieldCheck, Truck, CheckCircle2 } from "lucide-react";
import { SITE } from "@/data/site";
import { SERVICES } from "@/data/services";
import { DISTRICTS_BY_SLUG, DISTRICTS, type DistrictInfo } from "@/data/districts";
import { COMMON } from "@/data/images";
import { ServiceCard } from "@/components/site/ServiceCard";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { LeadForm } from "@/components/site/LeadForm";
import { FAQ } from "@/components/site/FAQ";
import { TrustStrip } from "@/components/site/TrustStrip";
import { TldrBlock } from "@/components/site/TldrBlock";
import { VideoTeaser } from "@/components/site/VideoTeaser";
import { WORK_VIDEOS_BY_SLUG, GEO_VIDEO_SLUG, videoJsonLd } from "@/data/videos";
import { geoAnchor, GEO_CROSSLINK_LIMIT } from "@/data/interlinking";

export const Route = createFileRoute("/raion/$slug")({
  loader: ({ params }): { district: DistrictInfo } => {
    const district = DISTRICTS_BY_SLUG[params.slug];
    if (!district) throw notFound();
    return { district };
  },
  head: ({ loaderData, params }) => {
    const d = loaderData?.district;
    if (!d) return { meta: [{ title: "Район не найден" }] };
    const title = `Санитарная служба ${d.prepositional} Новосибирска — дезинфекция, клопы, тараканы | ${SITE.name}`;
    const description = `Дезинфекция и уничтожение вредителей ${d.prepositional} Новосибирска: выезд за 60 минут, цена от 1 500 ₽, гарантия по договору, лицензия Роспотребнадзора. 13 направлений санитарной обработки.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: `${SITE.domain}/raion/${params.slug}` },
        { property: "og:type", content: "website" },
        { property: "og:image", content: `${SITE.domain}/og/default.jpg` },
      ],
      links: [{ rel: "canonical", href: `${SITE.domain}/raion/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "LocalBusiness",
                "@id": `${SITE.domain}/raion/${params.slug}#localbusiness`,
                name: `${SITE.name} — ${d.full}`,
                parentOrganization: { "@id": `${SITE.domain}#organization` },
                url: `${SITE.domain}/raion/${params.slug}`,
                telephone: SITE.phone,
                email: SITE.email,
                priceRange: "1500-25000",
                areaServed: {
                  "@type": "AdministrativeArea",
                  name: d.full,
                  containedInPlace: { "@type": "City", name: SITE.city },
                },
                address: {
                  "@type": "PostalAddress",
                  addressCountry: "RU",
                  addressRegion: SITE.region,
                  addressLocality: SITE.city,
                },
                openingHoursSpecification: [
                  {
                    "@type": "OpeningHoursSpecification",
                    dayOfWeek: [
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                      "Sunday",
                    ],
                    opens: "07:00",
                    closes: "23:00",
                  },
                ],
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Главная", item: SITE.domain + "/" },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "Районы Новосибирска",
                    item: `${SITE.domain}/karta-sayta`,
                  },
                  {
                    "@type": "ListItem",
                    position: 3,
                    name: d.full,
                    item: `${SITE.domain}/raion/${params.slug}`,
                  },
                ],
              },
            ],
          }),
        },
      ],
    };
  },
  component: DistrictPage,
});

function DistrictPage() {
  const { district: d } = Route.useLoaderData() as { district: DistrictInfo };
  const topServices = [...SERVICES].sort((a, b) => b.priority - a.priority).slice(0, 8);

  const faq = [
    {
      q: `Вы работаете ${d.prepositional}?`,
      a: `Да. Бригада Дез-Федерация выезжает ${d.prepositional} ежедневно с 07:00 до 23:00. Время в пути — до 60 минут.`,
    },
    {
      q: `Сколько стоит обработка ${d.prepositional}?`,
      a: `Выезд бесплатный, оплачивается только обработка. Цена фиксируется до приезда — от 1 500 ₽ за квартиру.`,
    },
    {
      q: `Какие услуги доступны ${d.prepositional}?`,
      a: `Все 13 направлений: клопы, тараканы, грызуны, плесень, озонирование, сушка после потопов, обработка участков, фумигация.`,
    },
    {
      q: `Даёте ли гарантию?`,
      a: `Да, гарантия по договору — до 12 месяцев на уничтожение вредителей и до 24 месяцев на обработку от плесени.`,
    },
    {
      q: `Работаете с ТСЖ и УК ${d.prepositional}?`,
      a: `Да. Заключаем договоры с УК и ТСЖ, ведём журнал по СанПиН, обрабатываем подъезды, подвалы и придомовые территории.`,
    },
  ];

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Главная", to: "/" },
          { label: "Районы Новосибирска", to: "/karta-sayta" },
          { label: d.full },
        ]}
      />

      <section className="relative overflow-hidden bg-hero text-primary-foreground">
        <img
          src={COMMON.heroSpray}
          alt={`Санитарная обработка квартир и офисов ${d.prepositional} — Дез-Федерация`}
          title={`Выезд ${d.prepositional} за 60 минут — гарантия по договору`}
          className="absolute inset-0 h-full w-full object-cover opacity-25"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-transparent" />
        <div className="container-x relative grid gap-8 py-12 md:py-16 lg:grid-cols-[1.25fr_1fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
              <MapPin className="h-3.5 w-3.5" /> {d.full} · Новосибирск
            </div>
            <h1 className="mt-5 font-display text-3xl font-extrabold leading-tight md:text-5xl text-balance">
              Санитарная служба {d.prepositional} — дезинфекция и уничтожение вредителей
            </h1>
            <p className="speakable mt-5 max-w-2xl text-[15px] leading-relaxed text-white/90 md:text-lg">
              {d.description} Выезжаем за 60 минут, работаем по договору, цена фиксируется до
              приезда. На каждую обработку — гарантия и бесплатная повторная выездка при возврате
              проблемы.
            </p>
            <div className="mt-6 max-w-xl">
              <TldrBlock
                items={[
                  { label: "Район", value: d.full },
                  { label: "Выезд", value: "60 минут" },
                  { label: "Цена", value: "от 1 500 ₽" },
                  { label: "Гарантия", value: "до 24 месяцев по договору" },
                  { label: "Документы", value: "Договор, акт, чек/счёт" },
                  { label: "График", value: "Ежедневно 07:00–23:00" },
                ]}
              />
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                href={SITE.phoneHref}
                className="cta-shine inline-flex items-center justify-center gap-2 rounded-xl bg-cta-gradient px-5 py-4 font-bold text-accent-foreground shadow-cta"
              >
                <Phone className="h-5 w-5" /> Вызвать {d.prepositional}
              </a>
              <a
                href="#zayavka"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-4 font-semibold backdrop-blur hover:bg-white/20"
              >
                Получить расчёт
              </a>
            </div>
          </div>
          <div id="zayavka">
            <LeadForm
              variant="hero"
              title={`Заявка ${d.prepositional}`}
              subtitle="Перезвоним за 10 минут, зафиксируем цену."
            />
          </div>
        </div>
      </section>

      <TrustStrip />

      <section className="container-x py-14">
        <h2 className="font-display text-2xl font-bold md:text-3xl">
          Что обрабатываем {d.prepositional}
        </h2>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Все 13 направлений санитарной службы доступны жителям {d.genitive}. Самые востребованные —
          ниже.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {topServices.map((s) => (
            <ServiceCard key={s.slug} service={s} />
          ))}
        </div>
        <div className="mt-6">
          <Link
            to="/services"
            className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:gap-2"
          >
            Все услуги →
          </Link>
        </div>
        <div className="mt-6 rounded-2xl border border-border bg-card p-5">
          <div className="text-sm font-bold text-foreground">Частые запросы {d.prepositional}</div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {topServices.map((s) => (
              <Link
                key={s.slug}
                to="/services/$slug"
                params={{ slug: s.slug }}
                className="text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary"
              >
                {geoAnchor(s.slug, d.prepositional)}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x pb-14">
        <VideoTeaser
          compact
          video={WORK_VIDEOS_BY_SLUG[GEO_VIDEO_SLUG]}
          heading={`Как мы работаем на выездах ${d.prepositional}`}
          text="Порядок работ одинаковый на всех адресах: осмотр, обработка проблемных зон, рекомендации и гарантия по договору."
        />
      </section>

      <section className="bg-surface py-14">
        <div className="container-x">
          <h2 className="font-display text-2xl font-bold md:text-3xl">
            Где работаем {d.prepositional}
          </h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {d.landmarks.map((l) => (
              <span
                key={l}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm"
              >
                <MapPin className="h-3.5 w-3.5 text-primary" /> {l}
              </span>
            ))}
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                icon: Truck,
                t: "Выезд за 60 минут",
                d: "Бригада с оборудованием — день в день. Бесплатная диагностика на месте.",
              },
              {
                icon: ShieldCheck,
                t: "Гарантия по договору",
                d: "До 24 месяцев. При возврате проблемы — приезжаем повторно бесплатно.",
              },
              {
                icon: Clock,
                t: "Ежедневно 07:00–23:00",
                d: "Принимаем заявки в выходные и праздники. Аварийная сушка — круглосуточно.",
              },
            ].map((b, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <b.icon className="h-7 w-7 text-primary" />
                <div className="mt-3 font-display text-lg font-bold">{b.t}</div>
                <div className="mt-2 text-sm text-muted-foreground">{b.d}</div>
              </div>
            ))}
          </div>
          <ul className="mt-8 grid gap-3 md:grid-cols-2">
            {[
              `Лицензия Роспотребнадзора — работаем легально по всей области.`,
              `Препараты 4 класса опасности — безопасны для детей, аллергиков и животных.`,
              `Опытные дезинфекторы с допусками, средний стаж 6+ лет.`,
              `Без запаха после высыхания — можно сразу возвращаться в помещение.`,
            ].map((x, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <span>{x}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <FAQ items={faq} />

      <section className="container-x py-14">
        <h2 className="font-display text-xl font-bold">Другие районы Новосибирска</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {DISTRICTS.filter((x) => x.slug !== d.slug)
            .slice(0, GEO_CROSSLINK_LIMIT)
            .map((x) => (
            <Link
              key={x.slug}
              to="/raion/$slug"
              params={{ slug: x.slug }}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold hover:border-primary hover:text-primary"
            >
              {x.name}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
