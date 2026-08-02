import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SITE } from "@/data/site";
import { SERVICES } from "@/data/services";
import { SERVICES_INDEX } from "@/data/servicesIndex";
import { COMMON } from "@/data/images";
import { ServiceCard } from "@/components/site/ServiceCard";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { LeadForm } from "@/components/site/LeadForm";
import { WaveText } from "@/components/site/WaveText";

export const Route = createFileRoute("/category/dezinfekciya-novosibirsk")({
  head: () => ({
    meta: [
      { title: `Дезинфекция в Новосибирске — все виды санитарной обработки | ${SITE.name}` },
      { name: "description", content: "Дезинфекция в Новосибирске и области: уничтожение вредителей, обработка от плесени, озонирование, дератизация. 13 направлений, выезд за 60 минут, лицензия." },
      { property: "og:title", content: "Дезинфекция в Новосибирске" },
      { property: "og:description", content: "Все виды санитарной обработки в Новосибирске и области." },
      { property: "og:url", content: `${SITE.domain}/category/dezinfekciya-novosibirsk` },
    ],
    links: [{ rel: "canonical", href: `${SITE.domain}/category/dezinfekciya-novosibirsk` }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "CollectionPage",
            name: `Дезинфекция в Новосибирске — ${SITE.name}`,
            url: `${SITE.domain}/category/dezinfekciya-novosibirsk`,
            inLanguage: "ru-RU",
            isPartOf: { "@id": `${SITE.domain}#website` },
            about: { "@id": `${SITE.domain}#localbusiness` },
            speakable: { "@type": "SpeakableSpecification", cssSelector: [".speakable"] },
          },
          {
            "@type": "ItemList",
            name: "Услуги дезинфекции в Новосибирске",
            numberOfItems: SERVICES_INDEX.length,
            itemListElement: SERVICES_INDEX.map((s, i) => ({
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
              { "@type": "ListItem", position: 2, name: "Дезинфекция в Новосибирске", item: `${SITE.domain}/category/dezinfekciya-novosibirsk` },
            ],
          },
        ],
      }),
    }],
  }),
  component: CategoryPage,
});

function CategoryPage() {
  return (
    <>
      <Breadcrumbs items={[
        { label: "Главная", to: "/" },
        { label: "Дезинфекция в Новосибирске" },
      ]} />
      <section className="relative overflow-hidden bg-hero text-primary-foreground">
        <img src={COMMON.heroSpray} alt="Дезинфекция помещений в Новосибирске — обработка квартир, офисов и общепита" title="Дезинфекция по СанПиН с актом и сертификатом — Дез-Федерация" className="absolute inset-0 h-full w-full object-cover opacity-25" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-transparent" />
        <div className="container-x relative py-12 md:py-16">
          <h1 className="font-display text-3xl font-extrabold md:text-5xl"><WaveText className="on-dark" text="Дезинфекция в Новосибирске" duration={4} /></h1>
          <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-white/90 md:text-lg">
            Дезинфекция в Новосибирске под ключ — санитарная служба Дез-Федерация выполняет 13 видов обработки: уничтожение клопов, тараканов, грызунов, обработка от плесени, озонирование, сушка после потопов, фумигация и дезодорация. Выезд по городу за 60 минут, обслуживаем физлиц и юрлиц по всей Новосибирской области.
          </p>
          <p className="mt-3 max-w-3xl text-[14px] leading-relaxed text-white/80">
            Используем сертифицированные средства 4 класса опасности (малоопасные), без запаха после высыхания и безопасные для детей, аллергиков, домашних животных и аквариумов. На каждую обработку — договор, акт, гарантия по договору до 24 месяцев и бесплатная повторная обработка при возврате проблемы.
          </p>
        </div>
      </section>

      <section className="container-x py-14">
        <h2 className="font-display text-2xl font-bold md:text-3xl">13 направлений санитарной обработки</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (<ServiceCard key={s.slug} service={s} />))}
        </div>
      </section>

      <section className="bg-surface py-14 md:py-20">
        <div className="container-x">
          <h2 className="font-display text-2xl font-bold md:text-3xl">Дезинфекция по районам Новосибирска</h2>
          <p className="mt-3 max-w-3xl text-muted-foreground">Бригады выезжают во все 10 районов города. Время прибытия — до 60 минут, оплата после обработки.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {["Центральный","Заельцовский","Калининский","Кировский","Ленинский","Октябрьский","Первомайский","Советский (Академгородок)","Дзержинский","Железнодорожный"].map((d) => (
              <div key={d} className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold shadow-card">{d}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-10">
        <div className="grid items-start gap-8 rounded-3xl bg-surface p-8 md:p-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-bold md:text-3xl">Гео обслуживания</h2>
            <p className="mt-3 text-muted-foreground">Выезжаем по всему Новосибирску и в города Новосибирской области: Бердск, Искитим, Кольцово, Краснообск, Обь, Мочище, Криводановка, Толмачёво, Линёво, Барышево, Каменка, Сузун.</p>
            <Link to="/services" className="mt-4 inline-flex items-center gap-1 font-semibold text-primary hover:gap-2">Все услуги <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <LeadForm title="Узнать цену по объекту" />
        </div>
      </section>
    </>
  );
}
