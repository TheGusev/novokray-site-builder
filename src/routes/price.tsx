import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, CreditCard, Percent, Calculator, Phone } from "lucide-react";
import { SITE } from "@/data/site";
import { SERVICES } from "@/data/services";
import { COMMON, SERVICE_IMAGES } from "@/data/images";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { LeadForm } from "@/components/site/LeadForm";
import { Reveal } from "@/components/site/Reveal";
import { WaveText } from "@/components/site/WaveText";

export const Route = createFileRoute("/price")({
  head: () => ({
    meta: [
      { title: `Цены на санитарную обработку в Новосибирске — прайс-лист | ${SITE.name}` },
      { name: "description", content: "Полный прайс-лист санитарной службы Дез-Федерация в Новосибирске: уничтожение клопов, тараканов, грызунов, обработка от плесени, озонирование. Цены от 1 500 ₽." },
      { property: "og:title", content: "Цены санитарной службы в Новосибирске" },
      { property: "og:description", content: "Прайс-лист на 13 направлений санитарной обработки." },
      { property: "og:url", content: "/price" },
    ],
    links: [{ rel: "canonical", href: "/price" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "OfferCatalog",
            name: `Прайс-лист санитарной службы ${SITE.name}`,
            url: `${SITE.domain}/price`,
            provider: { "@id": `${SITE.domain}#organization` },
            itemListElement: SERVICES.map((s, i) => ({
              "@type": "Offer",
              position: i + 1,
              name: s.title,
              description: s.metaDescription,
              price: s.priceFrom,
              priceCurrency: "RUB",
              availability: "https://schema.org/InStock",
              url: `${SITE.domain}/services/${s.slug}`,
              itemOffered: { "@type": "Service", name: s.h1 },
            })),
          },
          {
            "@type": "AggregateOffer",
            offerCount: SERVICES.length,
            lowPrice: Math.min(...SERVICES.map((s) => s.priceFrom)),
            highPrice: 25000,
            priceCurrency: "RUB",
            url: `${SITE.domain}/price`,
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Главная", item: SITE.domain + "/" },
              { "@type": "ListItem", position: 2, name: "Цены", item: SITE.domain + "/price" },
            ],
          },
        ],
      }),
    }],
  }),
  component: PricePage,
});

function PricePage() {
  const factors = [
    { i: Calculator, t: "Площадь объекта", s: "Цена пропорциональна квадратуре. Чем больше м² — тем ниже цена за м²." },
    { i: Percent, t: "Степень заражения", s: "Лёгкое — стандарт. Сильное — повторная обработка, тогда обе со скидкой 30%." },
    { i: BadgeCheck, t: "Тип помещения", s: "Квартира, кафе, склад, подвал, участок — разные нормы расхода препаратов." },
    { i: CreditCard, t: "Срочность", s: "Стандарт — выезд за 60 мин. Ночной выезд — +20% к чеку. Аварийная сушка 24/7 — без наценки." },
  ];
  const discounts = [
    "5% при повторном заказе в течение года",
    "10% пенсионерам и многодетным семьям (по запросу)",
    "10–15% юрлицам при договоре на год",
    "20% при обработке всего подъезда (квартир-соседей)",
  ];
  return (
    <>
      <Breadcrumbs items={[{ label: "Главная", to: "/" }, { label: "Цены" }]} />
      <section className="relative overflow-hidden bg-hero text-primary-foreground">
        <img src={COMMON.equipment} alt="Прайс на санитарную обработку" className="absolute inset-0 h-full w-full object-cover opacity-20" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/55 via-black/20 to-transparent" />
        <div className="container-x relative py-12 md:py-16">
          <h1 className="font-display text-3xl font-extrabold md:text-5xl"><WaveText className="on-dark" text="Цены санитарной службы — Новосибирск" duration={4} /></h1>
          <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-white/90 md:text-lg">
            Полный прайс-лист на 13 направлений санитарной обработки. Цена фиксируется до выезда, никаких скрытых платежей и доплат «за препараты». Принимаем наличные, карты, СБП, безналичный расчёт с НДС или без — для физлиц и юрлиц.
          </p>
        </div>
      </section>

      <section className="container-x py-14">
        <div className="space-y-10">
          {SERVICES.map((s, idx) => (
            <Reveal key={s.slug} delay={(idx % 3) * 80} className="overflow-hidden rounded-2xl border border-border bg-card shadow-card md:p-0">
              <div className="grid gap-0 md:grid-cols-[260px,1fr]">
                {SERVICE_IMAGES[s.slug] && (
                  <div className="relative aspect-[16/10] md:aspect-auto">
                    <img src={SERVICE_IMAGES[s.slug]} alt={s.title} loading="lazy" className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="p-6 md:p-8">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="flex items-center gap-3">
                  <s.icon className="h-7 w-7 text-primary" />
                  <h2 className="font-display text-xl font-bold md:text-2xl">{s.title}</h2>
                </div>
                <Link to="/services/$slug" params={{ slug: s.slug }} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2">
                  Подробнее <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-5 overflow-hidden rounded-xl border border-border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold">Объект</th>
                      <th className="px-4 py-2.5 text-right font-semibold">Цена</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {s.prices.map((p, i) => (
                      <tr key={i}>
                        <td className="px-3 py-3 md:px-4">{p.label}</td>
                        <td className="whitespace-nowrap px-3 py-3 text-right font-display font-bold md:px-4">{p.price.replace(/\s/g, "\u00a0")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* What affects price */}
      <section className="bg-surface py-14 md:py-20">
        <div className="container-x">
          <Reveal>
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">Прозрачное ценообразование</div>
            <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">От чего зависит итоговая цена</h2>
          </Reveal>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {factors.map((f, i) => (
              <Reveal key={f.t} delay={i * 80} className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary"><f.i className="h-5 w-5" /></div>
                <div className="mt-4 font-display text-base font-bold">{f.t}</div>
                <div className="mt-2 text-sm text-muted-foreground">{f.s}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Discounts + payment */}
      <section className="container-x py-14 md:py-20">
        <div className="grid gap-8 lg:grid-cols-2">
          <Reveal className="rounded-3xl border border-border bg-card p-8 shadow-card">
            <Percent className="h-8 w-8 text-accent" />
            <h2 className="mt-3 font-display text-2xl font-bold">Скидки и бонусы</h2>
            <ul className="mt-5 space-y-2 text-sm">
              {discounts.map((d) => (<li key={d} className="flex items-start gap-2"><BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />{d}</li>))}
            </ul>
          </Reveal>
          <Reveal delay={120} className="rounded-3xl border border-border bg-card p-8 shadow-card">
            <CreditCard className="h-8 w-8 text-primary" />
            <h2 className="mt-3 font-display text-2xl font-bold">Способы оплаты</h2>
            <ul className="mt-5 space-y-2 text-sm">
              <li className="flex items-start gap-2"><BadgeCheck className="mt-0.5 h-4 w-4 text-success" /> Наличные с выдачей чека</li>
              <li className="flex items-start gap-2"><BadgeCheck className="mt-0.5 h-4 w-4 text-success" /> Карты Visa, Mastercard, МИР</li>
              <li className="flex items-start gap-2"><BadgeCheck className="mt-0.5 h-4 w-4 text-success" /> СБП по QR-коду</li>
              <li className="flex items-start gap-2"><BadgeCheck className="mt-0.5 h-4 w-4 text-success" /> Безналичный расчёт для юрлиц, счёт с НДС или без</li>
              <li className="flex items-start gap-2"><BadgeCheck className="mt-0.5 h-4 w-4 text-success" /> Оплата после обработки — на месте</li>
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="container-x pb-16">
        <div className="grid items-start gap-8 rounded-3xl bg-hero p-8 text-primary-foreground md:p-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-bold md:text-3xl">Нужен точный расчёт по объекту?</h2>
            <p className="mt-3 text-white/85">Опишите объект — назовём цену по телефону и зафиксируем её в договоре.</p>
            <a href={SITE.phoneHref} className="cta-shine mt-5 inline-flex items-center gap-2 rounded-xl bg-cta-gradient px-5 py-3.5 font-bold text-accent-foreground shadow-cta"><Phone className="h-5 w-5" /> {SITE.phone}</a>
          </div>
          <LeadForm variant="hero" />
        </div>
      </section>
    </>
  );
}
