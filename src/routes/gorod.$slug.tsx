import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Phone, MapPin, Clock, ShieldCheck, Truck, CheckCircle2 } from "lucide-react";
import { SITE } from "@/data/site";
import { SERVICES } from "@/data/services";
import { CITIES_BY_SLUG, CITIES, type CityInfo } from "@/data/cities";
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
import {
  serviceNode,
  serviceListNode,
  makesOfferNode,
  aggregateOfferNode,
  geoServices,
  type AreaServed,
  offerCatalogNode,
} from "@/lib/serviceSchema";
import { localBusinessNode } from "@/lib/orgSchema";

export const Route = createFileRoute("/gorod/$slug")({
  loader: ({ params }): { city: CityInfo } => {
    const city = CITIES_BY_SLUG[params.slug];
    if (!city) throw notFound();
    return { city };
  },
  head: ({ loaderData, params }) => {
    const c = loaderData?.city;
    if (!c) return { meta: [{ title: "Город не найден" }] };
    const title = `Санитарная служба ${c.prepositional} — дезинфекция, дезинсекция, дератизация | ${SITE.name}`;
    const description = `Дезинфекция и уничтожение вредителей ${c.prepositional}: выезд из Новосибирска за ${c.travelMin} минут, цена от 1 500 ₽, гарантия по договору, лицензия Роспотребнадзора. 13 направлений санитарной обработки.`;
    const pageUrl = `${SITE.domain}/gorod/${params.slug}`;
    const areas: AreaServed[] = [{ kind: "city", name: c.name }];
    const geoItems = geoServices();
    const schemaOpts = { pageUrl, areas, nameSuffix: c.prepositional };
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: `${SITE.domain}/gorod/${params.slug}` },
        { property: "og:type", content: "website" },
        { property: "og:image", content: `${SITE.domain}/og/default.jpg` },
      ],
      links: [
        { rel: "canonical", href: `${SITE.domain}/gorod/${params.slug}` },
        { rel: "alternate", hrefLang: "ru-RU", href: `${SITE.domain}/gorod/${params.slug}` },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              localBusinessNode({
                id: `${pageUrl}#localbusiness`,
                name: `${SITE.name} — ${c.name}`,
                url: pageUrl,
                parent: true,
                areaServed: {
                  "@type": "City",
                  name: c.name,
                  containedInPlace: { "@type": "AdministrativeArea", name: SITE.region },
                },
                extra: {
                  makesOffer: geoItems.map((s) => makesOfferNode(s, areas)),
                  hasOfferCatalog: { "@id": `${pageUrl}#catalog` },
                },
              }),
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Главная", item: SITE.domain + "/" },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "Зона выезда",
                    item: `${SITE.domain}/#region`,
                  },
                  {
                    "@type": "ListItem",
                    position: 3,
                    name: c.name,
                    item: `${SITE.domain}/gorod/${params.slug}`,
                  },
                ],
              },
              ...geoItems.map((s) => serviceNode(s, schemaOpts)),
              serviceListNode(geoItems, {
                ...schemaOpts,
                listName: `Санитарная обработка ${c.prepositional}`,
                useRefs: true,
              }),
              aggregateOfferNode(geoItems, pageUrl),
              offerCatalogNode(geoItems, {
                id: `${pageUrl}#catalog`,
                name: `Услуги санитарной обработки ${c.prepositional}`,
                url: pageUrl,
                areas,
              }),
              {
                "@type": "FAQPage",
                mainEntity: [
                  {
                    "@type": "Question",
                    name: `Вы работаете ${c.prepositional}?`,
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: `Да. Специалист Дез-Федерация выезжает ${c.prepositional} из Новосибирска ежедневно с 07:00 до 23:00. Время в пути — около ${c.travelMin} минут.`,
                    },
                  },
                  {
                    "@type": "Question",
                    name: `Сколько стоит выезд ${c.prepositional}?`,
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: `Выезд бесплатный — оплачивается только сама обработка. Стоимость рассчитывается по типу объекта, цена фиксируется до приезда.`,
                    },
                  },
                  {
                    "@type": "Question",
                    name: `Какие услуги доступны ${c.prepositional}?`,
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: `Все 13 направлений санитарной обработки: уничтожение клопов, тараканов, грызунов, обработка от плесени, озонирование, сушка после потопов, обработка участков от клещей и комаров, фумигация, дезодорация.`,
                    },
                  },
                  {
                    "@type": "Question",
                    name: `Даёте ли гарантию ${c.prepositional}?`,
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: `Да, гарантия по договору такая же, как в Новосибирске — до 12 месяцев на уничтожение вредителей и до 24 месяцев на обработку от плесени.`,
                    },
                  },
                ],
                speakable: { "@type": "SpeakableSpecification", cssSelector: [".speakable"] },
              },
              videoJsonLd(
                WORK_VIDEOS_BY_SLUG[GEO_VIDEO_SLUG],
                SITE.domain,
                `${SITE.domain}/gorod/${params.slug}`,
              ),
            ],
          }),
        },
      ],
    };
  },
  component: CityPage,
});

function CityPage() {
  const { city: c } = Route.useLoaderData() as { city: CityInfo };
  const topServices = [...SERVICES].sort((a, b) => b.priority - a.priority).slice(0, 8);

  const faq = [
    {
      q: `Вы работаете ${c.prepositional}?`,
      a: `Да. Специалист Дез-Федерация выезжает ${c.prepositional} из Новосибирска ежедневно с 07:00 до 23:00. Время в пути — около ${c.travelMin} минут.`,
    },
    {
      q: `Сколько стоит выезд ${c.prepositional}?`,
      a: `Выезд бесплатный — оплачивается только обработка. Цена фиксируется по телефону до приезда, без скрытых платежей.`,
    },
    {
      q: `Какие услуги доступны ${c.prepositional}?`,
      a: `Все 13 направлений: клопы, тараканы, грызуны, плесень, озонирование, сушка после потопов, обработка участков от клещей и комаров, фумигация, дезодорация.`,
    },
    {
      q: `Даёте ли гарантию ${c.prepositional}?`,
      a: `Да, гарантия по договору такая же, как в Новосибирске — до 12 месяцев на уничтожение вредителей и до 24 месяцев на обработку от плесени.`,
    },
    {
      q: `За сколько приедет специалист ${c.prepositional}?`,
      a: `Стандартное время выезда — ${c.travelMin}–${c.travelMin + 20} минут с момента подтверждения заявки. В пиковые часы возможны задержки до 1,5 часов.`,
    },
  ];

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Главная", to: "/" },
          { label: "Города области", to: "/karta-sayta" },
          { label: c.name },
        ]}
      />

      <section className="relative overflow-hidden bg-hero text-primary-foreground">
        <img
          src={COMMON.heroSpray}
          alt={`Санитарная служба ${c.prepositional} — дезинсекция, дератизация и озонирование`}
          title={`Выезд специалиста ${c.prepositional} день в день — Дез-Федерация`}
          className="absolute inset-0 h-full w-full object-cover opacity-25"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-transparent" />
        <div className="container-x relative grid gap-8 py-12 md:py-16 lg:grid-cols-[1.25fr_1fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
              <MapPin className="h-3.5 w-3.5" /> {c.name} · {c.distanceKm} км от Новосибирска
            </div>
            <h1 className="mt-5 font-display text-3xl font-extrabold leading-tight md:text-5xl text-balance">
              Санитарная служба {c.prepositional} — дезинфекция и уничтожение вредителей
            </h1>
            <p className="speakable mt-5 max-w-2xl text-[15px] leading-relaxed text-white/90 md:text-lg">
              {c.description} Выезжаем из Новосибирска за {c.travelMin} минут, работаем по договору,
              цена фиксируется до приезда. На каждую обработку — гарантия и бесплатная повторная
              выездка при возврате проблемы.
            </p>
            <div className="mt-6 max-w-xl">
              <TldrBlock
                items={[
                  { label: "Город", value: c.name },
                  { label: "Выезд", value: `~${c.travelMin} мин из Новосибирска` },
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
                <Phone className="h-5 w-5" /> Вызвать {c.prepositional}
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
              title={`Заявка ${c.prepositional}`}
              subtitle={`Перезвоним за 10 минут, зафиксируем цену.`}
            />
          </div>
        </div>
      </section>

      <TrustStrip />

      <section className="container-x py-14">
        <h2 className="font-display text-2xl font-bold md:text-3xl">
          Что обрабатываем {c.prepositional}
        </h2>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Все 13 направлений санитарной службы доступны жителям {c.name} и района. Самые
          востребованные — ниже.
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
          <div className="text-sm font-bold text-foreground">Частые запросы {c.prepositional}</div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {topServices.map((s) => (
              <Link
                key={s.slug}
                to="/services/$slug"
                params={{ slug: s.slug }}
                className="text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary"
              >
                {geoAnchor(s.slug, c.prepositional)}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x pb-14">
        <VideoTeaser
          compact
          video={WORK_VIDEOS_BY_SLUG[GEO_VIDEO_SLUG]}
          heading={`Как мы работаем на выездах ${c.prepositional}`}
          text="Один и тот же порядок работ на всех объектах: осмотр, обработка проблемных зон, рекомендации и гарантия по договору."
        />
      </section>

      <section className="bg-surface py-14">
        <div className="container-x">
          <h2 className="font-display text-2xl font-bold md:text-3xl">
            Почему жители {c.genitive} выбирают Дез-Федерацию
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              {
                icon: Truck,
                t: `Выезд ${c.prepositional} за ${c.travelMin} мин`,
                d: `Специалист с оборудованием выезжает день в день. Бесплатная диагностика на месте.`,
              },
              {
                icon: ShieldCheck,
                t: "Гарантия по договору",
                d: "До 24 месяцев. При возврате проблемы — приезжаем повторно бесплатно.",
              },
              {
                icon: Clock,
                t: "Работаем 7 дней в неделю",
                d: `${SITE.hours}. Принимаем заявки в выходные и праздники.`,
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
              `Лицензия Роспотребнадзора № ${SITE.legal.licenseNo} — работаем легально по всей области.`,
              `Препараты 4 класса опасности — безопасны для детей, аллергиков, кошек, собак и аквариумов.`,
              `Опытные дезинфекторы с допусками — стаж в среднем 6+ лет.`,
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
        <h2 className="font-display text-xl font-bold">Другие города области</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {CITIES.filter((x) => x.slug !== c.slug)
            .slice(0, GEO_CROSSLINK_LIMIT)
            .map((x) => (
            <Link
              key={x.slug}
              to="/gorod/$slug"
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
