import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CheckCircle2, Phone, ShieldCheck, ArrowRight, FlaskConical } from "lucide-react";
import { SITE } from "@/data/site";
import { typo } from "@/lib/typography";
import { type Service } from "@/data/services";
import { getServiceIcon } from "@/data/serviceIcons";
import { SERVICE_IMAGES, COMMON, SERVICE_IMAGE_META, COMMON_IMAGE_META, KLOPY_PHOTOS, KLOPY_PHOTO_META } from "@/data/images";
import { LeadForm } from "@/components/site/LeadForm";
import { FAQ } from "@/components/site/FAQ";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ServiceCard } from "@/components/site/ServiceCard";
import { TrustStrip } from "@/components/site/TrustStrip";
import { Reveal } from "@/components/site/Reveal";
import { AnimatedHeading } from "@/components/site/AnimatedHeading";
import { TldrBlock } from "@/components/site/TldrBlock";
import { VideoCard } from "@/components/site/VideoCard";
import { videosForService } from "@/data/videos";

const WARRANTY_BY_SLUG: Record<string, string> = {
  "unichtozhenie-klopov": "до 12 месяцев",
  "unichtozhenie-tarakanov": "до 12 месяцев",
  "unichtozhenie-blokh": "до 6 месяцев",
  "deratizaciya": "до 6 месяцев",
  "obrabotka-ot-pleseni": "до 24 месяцев",
  "obrabotka-uchastkov": "до 1,5 месяцев",
  "ozonirovanie-pomescheniy": "до 6 месяцев",
  "sushka-posle-zatopleniya": "30 дней",
  "dezinfekciya": "до 6 месяцев",
  "unichtozhenie-os": "за один выезд",
  "unichtozhenie-borschevika": "на сезон",
  "fumigaciya": "по договору",
  "dezodoraciya": "до 6 месяцев",
};

type PlainService = Omit<Service, "icon">;
const plain = ({ icon: _icon, ...rest }: Service): PlainService => rest;

export const Route = createFileRoute("/services/$slug")({
  // Каталог услуг (68 КБ) грузится отдельным чанком, а не в общем бандле сайта.
  loader: async ({ params }): Promise<{ service: PlainService; related: PlainService[] }> => {
    const { SERVICES_BY_SLUG } = await import("@/data/services");
    const service = SERVICES_BY_SLUG[params.slug];
    if (!service) throw notFound();
    // без дублей и без ссылки страницы на саму себя
    const related = [...new Set(service.related)]
      .filter((slug) => slug !== service.slug)
      .map((slug) => SERVICES_BY_SLUG[slug])
      .filter(Boolean);
    // icon — React-компонент, он не сериализуется при передаче лоадера в браузер
    return { service: plain(service), related: related.map(plain) };
  },
  head: ({ loaderData, params }) => {
    const s = loaderData?.service;
    if (!s) return { meta: [{ title: "Не найдено" }] };
    const warranty = WARRANTY_BY_SLUG[s.slug] ?? "по договору";
    const url = `${SITE.domain}/services/${params.slug}`;
    const ogImage = `${SITE.domain}${SERVICE_IMAGES[s.slug] ?? "/og/default.jpg"}`;
    // В meta уходит обычный пробел: toLocaleString("ru-RU") вставляет неразрывный,
    // а внешние парсеры (соцсети, превью) показывают его как служебный символ.
    const ogTitle = `${s.h1} — от ${s.priceFrom.toLocaleString("ru-RU").replace(/[\u00A0\u202F]/g, " ")} ₽`;
    const ogDescription = s.metaDescription;
    return {
      meta: [
        { title: s.metaTitle },
        { name: "description", content: s.metaDescription },
        { name: "keywords", content: s.keywords.join(", ") },
        { property: "og:title", content: ogTitle },
        { property: "og:description", content: ogDescription },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { property: "og:image", content: ogImage },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: ogTitle },
        { name: "twitter:description", content: ogDescription },
        { name: "twitter:image", content: ogImage },
      ],
      links: [
        { rel: "canonical", href: url },
        { rel: "alternate", hrefLang: "ru", href: url },
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
                areaServed: [
                  { "@type": "City", name: SITE.city },
                  { "@type": "AdministrativeArea", name: SITE.region },
                ],
                serviceOutput: "Уничтожение/обработка с договором, актом и гарантией " + warranty,
                category: s.category,
                description: s.metaDescription,
                hasOfferCatalog: {
                  "@type": "OfferCatalog",
                  name: `Прайс: ${s.title}`,
                  itemListElement: s.prices.map((p, i) => ({
                    "@type": "Offer",
                    position: i + 1,
                    name: p.label,
                    priceSpecification: {
                      "@type": "PriceSpecification",
                      price: s.priceFrom,
                      priceCurrency: "RUB",
                      valueAddedTaxIncluded: true,
                      description: p.price,
                    },
                    availability: "https://schema.org/InStock",
                    url: `${SITE.domain}/services/${params.slug}`,
                    warranty: { "@type": "WarrantyPromise", durationOfWarranty: { "@type": "QuantitativeValue", value: warranty } },
                  })),
                },
              },
              {
                "@type": "HowTo",
                name: `Этапы работ: ${s.title.toLowerCase()} — пошагово`,
                description: s.lead,
                totalTime: "PT2H",
                estimatedCost: { "@type": "MonetaryAmount", currency: "RUB", value: s.priceFrom },
                supply: s.tech.map((t) => ({ "@type": "HowToSupply", name: t.title })),
                step: s.steps.map((st, i) => ({
                  "@type": "HowToStep",
                  position: i + 1,
                  name: st.title,
                  text: st.text,
                  url: `${SITE.domain}/services/${params.slug}#step-${i + 1}`,
                })),
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
                speakable: { "@type": "SpeakableSpecification", cssSelector: [".speakable"] },
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
  const data = Route.useLoaderData() as { service: PlainService; related: PlainService[] };
  const s = data.service;
  const Icon = getServiceIcon(s.slug);
  const related = data.related;
  const hero = SERVICE_IMAGES[s.slug];
  const warranty = WARRANTY_BY_SLUG[s.slug] ?? "по договору";
  const imgMeta = SERVICE_IMAGE_META[s.slug];

  return (
    <>
      <Breadcrumbs items={[
        { label: "Главная", to: "/" },
        { label: "Услуги", to: "/services" },
        { label: s.title },
      ]} />

      {/* HERO */}
      <section className="relative overflow-hidden bg-hero text-primary-foreground">
        {hero && (
          <>
            <img src={hero} alt={imgMeta?.heroAlt ?? s.h1} title={imgMeta?.heroTitle ?? s.title} className="absolute inset-0 h-full w-full object-cover opacity-25" loading="eager" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-transparent" />
          </>
        )}
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 80% 30%, oklch(0.7 0.20 38 / 0.3), transparent 60%)" }} />
        <div className="container-x relative grid gap-8 py-10 md:py-14 lg:grid-cols-[1.25fr_1fr] lg:py-20">
          <div>
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
                <Icon className="h-3.5 w-3.5" /> {SITE.city} и область
              </div>
            </Reveal>
            <AnimatedHeading as="h1" text={s.h1} highlight="Новосибирске" className="mt-5 font-display text-[30px] font-extrabold leading-tight text-balance md:text-5xl" />
            <Reveal delay={250}>
              <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-white/90 md:text-lg">{typo(s.lead)}</p>
            </Reveal>
            <Reveal delay={300}>
              <div className="mt-5 max-w-xl">
                <TldrBlock
                  items={[
                    { label: "Цена", value: `от ${s.priceFrom.toLocaleString("ru-RU")} ₽` },
                    { label: "Выезд", value: "60 минут по городу" },
                    { label: "Гарантия", value: warranty },
                    { label: "Безопасность", value: "4 класс, безопасно для детей и животных" },
                    { label: "Документы", value: "Договор, акт, чек/счёт" },
                    { label: "Оплата", value: "После обработки — наличные, карта, СБП" },
                  ]}
                />
              </div>
            </Reveal>
            <Reveal delay={350} className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a href={SITE.phoneHref} className="cta-shine inline-flex items-center justify-center gap-2 rounded-xl bg-cta-gradient px-5 py-4 font-bold text-accent-foreground shadow-cta hover:scale-[1.02] transition">
                <Phone className="h-5 w-5" /> Вызвать от {s.priceFrom.toLocaleString("ru-RU")} ₽
              </a>
              <a href="#zayavka" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-4 font-semibold backdrop-blur hover:bg-white/20">
                Получить расчёт <ArrowRight className="h-4 w-4" />
              </a>
            </Reveal>
          </div>
          <div id="zayavka" className="lg:pl-6">
            <Reveal variant="scale" delay={120}>
              <LeadForm variant="hero" title="Заказать выезд" subtitle="Перезвоним в течение 10 минут и зафиксируем цену." defaultService={s.title} />
            </Reveal>
          </div>
        </div>
      </section>

      <TrustStrip />

      {/* Photo strip */}
      {hero && (
        <section className="container-x pt-12">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative overflow-hidden rounded-2xl md:col-span-2 aspect-[16/10]">
              <img src={hero} alt={imgMeta?.cardAlt ?? `${s.title} — фото работ`} title={imgMeta?.cardTitle ?? `${s.title} — пример работы Дез-Федерация`} loading="lazy" className="h-full w-full object-cover" />
            </div>
            <div className="grid gap-4">
              <div className="relative overflow-hidden rounded-2xl aspect-[4/3]">
                <img src={COMMON.equipment} alt={`Оборудование для услуги «${s.title}» — ULV-генератор и СИЗ`} title={COMMON_IMAGE_META.equipment.title} loading="lazy" className="h-full w-full object-cover" />
              </div>
              <div className="relative overflow-hidden rounded-2xl aspect-[4/3]">
                <img src={COMMON.documents} alt={`Договор и акт по услуге «${s.title}» — закрывающие документы`} title={COMMON_IMAGE_META.documents.title} loading="lazy" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Problems */}
      <section className="container-x py-16">
        <AnimatedHeading as="h2" text={s.slug === "unichtozhenie-klopov" ? "Признаки клопов в квартире" : `Когда заказывать: ${s.title.toLowerCase()}`} className="font-display text-3xl font-bold md:text-4xl text-balance" />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {s.problems.map((p, i) => (
            <Reveal key={i} delay={i * 70} className="flex gap-3 rounded-xl border border-border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-elegant">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <span className="text-foreground/90">{p}</span>
            </Reveal>
          ))}
        </div>
        {s.slug === "unichtozhenie-klopov" && (
          <Reveal className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            <img
              src={KLOPY_PHOTOS.naMatrase}
              alt={KLOPY_PHOTO_META.naMatrase.alt}
              title={KLOPY_PHOTO_META.naMatrase.title}
              loading="lazy"
              decoding="async"
              width={1440}
              height={1920}
              className="max-h-[460px] w-full object-cover"
            />
            <div className="px-5 py-4 text-sm text-muted-foreground">{KLOPY_PHOTO_META.naMatrase.caption}</div>
          </Reveal>
        )}
        {s.slug === "unichtozhenie-klopov" && (
          <Reveal className="mt-8 max-w-3xl text-[15px] leading-relaxed text-muted-foreground">
            <p>
              Клопы редко приходят одни: если в доме заодно завелись кухонные насекомые, вместе с обработкой спальных мест
              имеет смысл заказать{" "}
              <Link to="/services/$slug" params={{ slug: "unichtozhenie-tarakanov" }} className="font-semibold text-primary underline-offset-4 hover:underline">
                травлю тараканов
              </Link>
              . После залива соседей сначала нужна{" "}
              <Link to="/services/$slug" params={{ slug: "sushka-posle-zatopleniya" }} className="font-semibold text-primary underline-offset-4 hover:underline">
                аварийная сушка квартиры
              </Link>
              , иначе в сырых стенах через несколько дней появится{" "}
              <Link to="/services/$slug" params={{ slug: "obrabotka-ot-pleseni" }} className="font-semibold text-primary underline-offset-4 hover:underline">
                плесень и грибок
              </Link>
              , а влажные плинтусы мешают барьерному препарату держаться.
            </p>
          </Reveal>
        )}
      </section>

      {/* Steps */}
      <section className="bg-surface py-16">
        <div className="container-x">
          <AnimatedHeading as="h2" text={s.slug === "unichtozhenie-klopov" ? "Как проходит обработка от клопов" : "Как проходит обработка"} className="font-display text-3xl font-bold md:text-4xl" />
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {s.steps.map((st, i) => (
              <Reveal key={i} delay={i * 100} className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <div className="font-display text-3xl font-extrabold text-primary/30">{String(i + 1).padStart(2, "0")}</div>
                <h3 className="mt-1 font-display text-lg font-bold">{st.title}</h3>
                <div className="mt-2 text-sm text-muted-foreground">{typo(st.text)}</div>
              </Reveal>
            ))}
          </div>
          {s.slug === "unichtozhenie-klopov" && (
            <div className="mt-10 grid items-stretch gap-6 lg:grid-cols-2">
              <Reveal className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
                <img
                  src={KLOPY_PHOTOS.razborKrovati}
                  alt={KLOPY_PHOTO_META.razborKrovati.alt}
                  title={KLOPY_PHOTO_META.razborKrovati.title}
                  loading="lazy"
                  decoding="async"
                  width={1600}
                  height={1200}
                  className="h-full max-h-[420px] w-full object-cover"
                />
                <div className="px-5 py-4 text-sm text-muted-foreground">{KLOPY_PHOTO_META.razborKrovati.caption}</div>
              </Reveal>
              <div className="grid gap-5 sm:grid-cols-1">
                <Reveal delay={80} className="rounded-2xl border border-border bg-card p-6 shadow-card">
                  <div className="font-display text-lg font-bold text-primary">Препараты без запаха, эффект с первых минут</div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Работаем составами без резкого запаха: гибель клопов начинается уже во время обработки, а вернуться в квартиру
                    можно в тот же день — после 3–4 часов проветривания. Мебель, техника и текстиль не портятся, следов на
                    поверхностях не остаётся.
                  </p>
                </Reveal>
                <Reveal delay={160} className="rounded-2xl border border-border bg-card p-6 shadow-card">
                  <div className="font-display text-lg font-bold text-primary">Точечная обработка спальных мест</div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Кровать и диван разбираем: проливаем ламели, короб, изнанку основания, стыки каркаса и ножки. Матрас
                    обрабатываем по швам и кантам, отдельно проходим изголовье, плинтусы и дверные коробки — именно там держится
                    гнездо, а не на открытых поверхностях.
                  </p>
                </Reveal>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Tech */}
      <section className="container-x py-16">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
          <FlaskConical className="h-3.5 w-3.5" /> Препараты и технологии
        </div>
        <AnimatedHeading as="h2" text={s.slug === "unichtozhenie-klopov" ? "Технологии и препараты против клопов" : "Профессиональное оборудование и сертифицированные препараты"} highlight="препараты" className="font-display text-3xl font-bold md:text-4xl text-balance" />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {s.tech.map((t, i) => (
            <Reveal key={i} delay={i * 90} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <h3 className="font-display text-lg font-bold text-primary">{t.title}</h3>
              <div className="mt-2 text-sm text-muted-foreground">{typo(t.text)}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Видео работ по услуге */}
      {videosForService(s.slug).length > 0 && (
        <section className="container-x pb-4">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Видео с наших выездов</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Ролики подгружаются только по клику — страница остаётся быстрой.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videosForService(s.slug).map((v, i) => (
              <Reveal key={v.slug} delay={i * 80}>
                <VideoCard video={v} />
              </Reveal>
            ))}
          </div>
          <Link to="/video" className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2">
            Все видео работ <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      )}

      {/* Prices */}
      <section className="bg-surface py-16">
        <div className="container-x">
          <h2 className="font-display text-3xl font-bold md:text-4xl">{`Цены: ${s.title.toLowerCase()} в ${SITE.city === "Новосибирск" ? "Новосибирске" : SITE.city}`}</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">Стоимость фиксируется до выезда. Без скрытых платежей и доплат за препараты.</p>
          <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            <table className="w-full text-left">
              <thead className="bg-secondary text-sm text-secondary-foreground">
                <tr>
                  <th className="px-3 py-3 font-display font-semibold md:px-5">Объект</th>
                  <th className="px-3 py-3 text-right font-display font-semibold md:px-5">Цена</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {s.prices.map((p, i) => (
                  <tr key={i} className="text-sm">
                    <td className="px-3 py-3 md:px-5 md:py-4">{p.label}{p.note && <span className="ml-2 text-xs text-muted-foreground">({p.note})</span>}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-right font-display font-bold text-foreground md:px-5 md:py-4">{p.price.replace(/\s/g, "\u00a0")}</td>
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

      <FAQ items={s.faq} title={s.slug === "unichtozhenie-klopov" ? "Частые вопросы про обработку от клопов" : `Частые вопросы: ${s.title.toLowerCase()}`} />

      {/* Related */}
      {related.length > 0 && (
        <section className="container-x pb-16">
          <h2 className="font-display text-2xl font-bold md:text-3xl">Смежные услуги</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => (<ServiceCard key={r.slug} service={{ ...r, icon: getServiceIcon(r.slug) }} />))}
          </div>
        </section>
      )}
    </>
  );
}
