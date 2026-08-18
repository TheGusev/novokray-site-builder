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
import { FAQ } from "@/components/site/FAQ";
import { serviceListNode, aggregateOfferNode, groupedOfferCatalogNode } from "@/lib/serviceSchema";
import { faqPageNode, localBusinessNode, type QaItem } from "@/lib/orgSchema";

const PAGE_URL = `${SITE.domain}/category/dezinfekciya-novosibirsk`;

/** Один источник вопросов: видимый блок FAQ и разметка FAQPage. */
const CATEGORY_FAQ: QaItem[] = [
  {
    q: "Чем дезинфекция отличается от дезинсекции и дератизации?",
    a: "Дезинфекция уничтожает микробы, вирусы, грибок и плесень. Дезинсекция направлена на насекомых — клопов, тараканов, блох, муравьёв. Дератизация — на грызунов. При комплексном заражении работы совмещают в один выезд.",
  },
  {
    q: "Что входит в услугу дезинфекции помещения?",
    a: "Осмотр объекта, подбор дезинфицирующего средства, обработка поверхностей и воздуха генератором тумана, контроль экспозиции, рекомендации по уборке, договор и акт выполненных работ.",
  },
  {
    q: "Выдаёте ли документы по СанПиН для проверок?",
    a: "Да. Организациям выдаём договор, акт выполненных работ, копию лицензии Роспотребнадзора и сертификаты на применённые средства — этого комплекта достаточно для проверки и для журнала санитарных мероприятий.",
  },
  {
    q: "Сколько занимает дезинфекция и когда можно вернуться в помещение?",
    a: "Обработка квартиры или офиса до 60 м² занимает 40–90 минут. Возвращаться можно через 2–3 часа после проветривания и влажной уборки контактных поверхностей.",
  },
  {
    q: "Безопасны ли средства для детей и животных?",
    a: "Применяем сертифицированные средства 4 класса опасности — малоопасные для человека. После высыхания они не оставляют запаха и следов, помещение безопасно для детей, аллергиков и питомцев.",
  },
];

export const Route = createFileRoute("/category/dezinfekciya-novosibirsk")({
  head: () => ({
    meta: [
      { title: `Какая обработка нужна: путеводитель по услугам | ${SITE.name}` },
      { name: "description", content: "Путеводитель по санитарным обработкам: чем отличаются дезинфекция, дезинсекция и дератизация, что назначают при клопах, тараканах, плесени и запахах, куда переходить за заявкой." },
      { property: "og:title", content: "Какая обработка нужна: путеводитель по услугам" },
      { property: "og:description", content: "Сравнение направлений санитарной обработки и переход на страницу нужной услуги." },
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
          serviceListNode(SERVICES_INDEX, {
            pageUrl: PAGE_URL,
            listName: "Услуги дезинфекции в Новосибирске",
          }),
          groupedOfferCatalogNode(PAGE_URL, `${PAGE_URL}#catalog`),
          faqPageNode(CATEGORY_FAQ, PAGE_URL),
          localBusinessNode({
            id: `${PAGE_URL}#localbusiness`,
            url: PAGE_URL,
            parent: true,
            extra: { hasOfferCatalog: { "@id": `${PAGE_URL}#catalog` } },
          }),
          aggregateOfferNode(
            SERVICES_INDEX,
            `${SITE.domain}/category/dezinfekciya-novosibirsk`,
          ),
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
          <h1 className="font-display text-3xl font-extrabold md:text-5xl"><WaveText className="on-dark" text="Какая обработка нужна: путеводитель по услугам" duration={4} /></h1>
          <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-white/90 md:text-lg">
            Страница-навигатор: помогает понять, какая именно обработка нужна в вашей ситуации, и перейти на страницу услуги, где указаны цена, порядок работ и форма заявки. Дезинфекция — против микробов и вирусов, дезинсекция — против насекомых, дератизация — против грызунов.
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
          <p className="mt-3 max-w-3xl text-muted-foreground">Специалисты выезжают во все 10 районов города. Время прибытия — до 60 минут, оплата после обработки.</p>
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

      <FAQ items={CATEGORY_FAQ} title="Частые вопросы о дезинфекции" />
    </>
  );
}
