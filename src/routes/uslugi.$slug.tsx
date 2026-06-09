import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SITE } from "@/data/site";
import { SERVICES, type Service } from "@/data/services";
import { COMMON } from "@/data/images";
import { ServiceCard } from "@/components/site/ServiceCard";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { LeadForm } from "@/components/site/LeadForm";
import { TrustStrip } from "@/components/site/TrustStrip";
import { WaveText } from "@/components/site/WaveText";

interface Hub {
  slug: string;
  category: Service["category"];
  title: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  intro2: string;
}

const HUBS: Hub[] = [
  {
    slug: "unichtozhenie-vrediteley",
    category: "vrediteli",
    title: "Уничтожение вредителей",
    h1: "Уничтожение вредителей в Новосибирске",
    metaTitle: "Уничтожение вредителей в Новосибирске — клопы, тараканы, грызуны | Дез-Федерация",
    metaDescription: "Профессиональное уничтожение клопов, тараканов, блох, муравьёв, ос и грызунов в Новосибирске. Горячий и холодный туман, гарантия до 12 мес., выезд за 60 минут.",
    intro: "Уничтожение вредителей в Новосибирске под ключ: бригада Дез-Федерация выводит клопов, тараканов, блох, муравьёв, ос и грызунов в квартирах, частных домах, кафе, офисах и складах. Цена от 1 500 ₽, гарантия по договору до 12 месяцев, выезд день в день.",
    intro2: "Работаем горячим и холодным туманом, гелями и барьерными препаратами длительного действия. Препараты 4 класса опасности — безопасны для детей, аллергиков и животных. После высыхания нет запаха и следов.",
  },
  {
    slug: "sanitarnaya-obrabotka",
    category: "sanitarnaya",
    title: "Санитарная обработка",
    h1: "Санитарная обработка помещений в Новосибирске",
    metaTitle: "Санитарная обработка в Новосибирске — дезинфекция и плесень | Дез-Федерация",
    metaDescription: "Санитарная обработка квартир, офисов и заведений в Новосибирске: дезинфекция, удаление плесени, обработка после жильцов. Лицензия Роспотребнадзора, гарантия по договору.",
    intro: "Санитарная обработка помещений в Новосибирске — комплексная дезинфекция, уничтожение плесени и грибка, обработка после арендаторов и больных. Для квартир, офисов, клиник, заведений общепита и производств.",
    intro2: "Применяем сертифицированные дезинфектанты Минздрава, работаем по СанПиН. На все услуги — договор, акт и гарантия по договору до 24 месяцев.",
  },
  {
    slug: "obrabotka-uchastkov",
    category: "uchastok",
    title: "Обработка участков",
    h1: "Обработка участков от клещей, комаров и борщевика в Новосибирске",
    metaTitle: "Обработка участка в Новосибирске — клещи, комары, борщевик | Дез-Федерация",
    metaDescription: "Акарицидная обработка от клещей, уничтожение комаров и борщевика на участке. Безопасные препараты, гарантия на сезон, выезд по Новосибирску и области.",
    intro: "Обработка участков в Новосибирске и области — акарицидная защита от клещей, истребление комаров и мошки, уничтожение борщевика Сосновского. Для частных домов, баз отдыха, детских лагерей и СНТ.",
    intro2: "Используем препараты, безопасные для пчёл, домашних животных и людей после высыхания. Обработка действует до 1,5 месяцев — на весь активный сезон.",
  },
  {
    slug: "spec-uslugi",
    category: "spec",
    title: "Спец. услуги",
    h1: "Специальная санитарная обработка в Новосибирске",
    metaTitle: "Озонирование, сушка после потопа, фумигация в Новосибирске | Дез-Федерация",
    metaDescription: "Специальные услуги санитарной службы в Новосибирске: озонирование от запахов, аварийная сушка квартиры после потопа, фумигация зерна, дезодорация. Выезд за 60 минут.",
    intro: "Спец. услуги Дез-Федерации в Новосибирске: озонирование от запахов гари, табака и животных, аварийная сушка помещений после потопов, фумигация экспортных грузов по ISPM 15, дезодорация автомобилей и помещений.",
    intro2: "Работаем с физлицами, страховыми компаниями, логистическими операторами и УК. Выдаём официальные документы для возмещения ущерба и таможенного оформления.",
  },
];

const HUBS_BY_SLUG: Record<string, Hub> = Object.fromEntries(HUBS.map((h) => [h.slug, h]));

export const Route = createFileRoute("/uslugi/$slug")({
  loader: ({ params }): { hub: Hub } => {
    const hub = HUBS_BY_SLUG[params.slug];
    if (!hub) throw notFound();
    return { hub };
  },
  head: ({ loaderData, params }) => {
    const h = loaderData?.hub;
    if (!h) return { meta: [{ title: "Раздел не найден" }] };
    const items = SERVICES.filter((s) => s.category === h.category);
    return {
      meta: [
        { title: h.metaTitle },
        { name: "description", content: h.metaDescription },
        { property: "og:title", content: h.metaTitle },
        { property: "og:description", content: h.metaDescription },
        { property: "og:url", content: `/uslugi/${params.slug}` },
        { property: "og:type", content: "website" },
      ],
      links: [
        { rel: "canonical", href: `/uslugi/${params.slug}` },
        { rel: "alternate", hrefLang: "ru-RU", href: `/uslugi/${params.slug}` },
      ],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollectionPage",
              "@id": `${SITE.domain}/uslugi/${params.slug}#page`,
              name: h.h1,
              description: h.metaDescription,
              url: `${SITE.domain}/uslugi/${params.slug}`,
              isPartOf: { "@id": `${SITE.domain}#website` },
              about: { "@id": `${SITE.domain}#organization` },
            },
            {
              "@type": "ItemList",
              numberOfItems: items.length,
              itemListElement: items.map((s, i) => ({
                "@type": "ListItem",
                position: i + 1,
                url: `${SITE.domain}/services/${s.slug}`,
                name: s.title,
              })),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Главная", item: SITE.domain + "/" },
                { "@type": "ListItem", position: 2, name: "Услуги", item: SITE.domain + "/services" },
                { "@type": "ListItem", position: 3, name: h.title, item: `${SITE.domain}/uslugi/${params.slug}` },
              ],
            },
          ],
        }),
      }],
    };
  },
  component: HubPage,
});

function HubPage() {
  const { hub: h } = Route.useLoaderData() as { hub: Hub };
  const items = SERVICES.filter((s) => s.category === h.category);
  const otherHubs = HUBS.filter((x) => x.slug !== h.slug);

  return (
    <>
      <Breadcrumbs items={[
        { label: "Главная", to: "/" },
        { label: "Услуги", to: "/services" },
        { label: h.title },
      ]} />

      <section className="relative overflow-hidden bg-hero text-primary-foreground">
        <img src={COMMON.heroSpray} alt={h.h1} className="absolute inset-0 h-full w-full object-cover opacity-25" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-transparent" />
        <div className="container-x relative py-12 md:py-16">
          <h1 className="font-display text-3xl font-extrabold md:text-5xl"><WaveText className="on-dark" text={h.h1} duration={4} /></h1>
          <p className="speakable mt-5 max-w-3xl text-[15px] leading-relaxed text-white/90 md:text-lg">{h.intro}</p>
          <p className="mt-3 max-w-3xl text-[14px] leading-relaxed text-white/80">{h.intro2}</p>
        </div>
      </section>

      <TrustStrip />

      <section className="container-x py-14">
        <h2 className="font-display text-2xl font-bold md:text-3xl">{items.length} направлений в разделе</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((s) => (<ServiceCard key={s.slug} service={s} />))}
        </div>
      </section>

      <section className="bg-surface py-14">
        <div className="container-x grid gap-8 md:grid-cols-[1.2fr,1fr]">
          <div>
            <h2 className="font-display text-2xl font-bold md:text-3xl">Заказать обработку</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">Оставьте заявку — перезвоним за 10 минут, уточним детали и зафиксируем цену. Выезд по Новосибирску и области ежедневно с 07:00 до 23:00.</p>
            <div className="mt-6 grid gap-2">
              {otherHubs.map((x) => (
                <Link key={x.slug} to="/uslugi/$slug" params={{ slug: x.slug }} className="inline-flex items-center justify-between gap-2 rounded-xl border border-border bg-card p-4 text-sm font-semibold hover:border-primary hover:text-primary">
                  {x.title} <ArrowRight className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>
          <LeadForm title="Заявка на обработку" subtitle="Перезвоним в течение 10 минут." />
        </div>
      </section>
    </>
  );
}