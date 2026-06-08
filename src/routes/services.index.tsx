import { createFileRoute } from "@tanstack/react-router";
import { SITE } from "@/data/site";
import { SERVICES } from "@/data/services";
import { COMMON } from "@/data/images";
import { ServiceCard } from "@/components/site/ServiceCard";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: `Услуги в Новосибирске — все 13 направлений | ${SITE.name}` },
      { name: "description", content: "Полный каталог санитарной обработки в Новосибирске: клопы, тараканы, грызуны, плесень, озонирование, сушка после потопов, фумигация. Цены, гарантии, выезд за 60 минут." },
      { property: "og:title", content: "Услуги санитарной обработки в Новосибирске" },
      { property: "og:description", content: "13 направлений санитарной обработки. Цены, гарантии, выезд за 60 минут." },
      { property: "og:url", content: "/services" },
    ],
    links: [{ rel: "canonical", href: "/services" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Главная", item: SITE.domain + "/" },
          { "@type": "ListItem", position: 2, name: "Услуги", item: SITE.domain + "/services" },
        ],
      }),
    }],
  }),
  component: ServicesHub,
});

function ServicesHub() {
  const groups = [
    { id: "vrediteli", title: "Уничтожение вредителей", desc: "Клопы, тараканы, блохи, муравьи, осы, грызуны — всё, что мешает жить в квартире, кафе или на складе. Работаем горячим и холодным туманом, гелями и барьерными препаратами длительного действия.", items: SERVICES.filter((s) => s.category === "vrediteli") },
    { id: "spec", title: "Спец. обработка и устранение последствий", desc: "Удаление плесени и грибка, озонирование от запахов, аварийная сушка квартир после потопов, фумигация экспортных грузов. Работаем по СанПиН и стандартам ISPM 15.", items: SERVICES.filter((s) => s.category === "spec") },
    { id: "uchastok", title: "Обработка участков и территорий", desc: "Акарицидная обработка от клещей, борьба с комарами, мошкой, уничтожение борщевика. Для дач, коттеджных посёлков, баз отдыха и коммерческих территорий.", items: SERVICES.filter((s) => s.category === "uchastok") },
    { id: "sanitarnaya", title: "Санитарная обработка", desc: "Полная санитарная обработка квартир, офисов и общественных пространств. Дезинфекция, дезодорация, антибактериальная обработка поверхностей.", items: SERVICES.filter((s) => s.category === "sanitarnaya") },
  ];
  return (
    <>
      <Breadcrumbs items={[{ label: "Главная", to: "/" }, { label: "Услуги" }]} />
      <section className="relative overflow-hidden bg-hero text-primary-foreground">
        <img src={COMMON.equipment} alt="Услуги санитарной службы" className="absolute inset-0 h-full w-full object-cover opacity-25" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/55 via-black/20 to-transparent" />
        <div className="container-x relative py-12 md:py-16">
          <h1 className="font-display text-3xl font-extrabold md:text-5xl">Услуги санитарной службы в Новосибирске</h1>
          <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-white/90 md:text-lg">
            13 направлений санитарной обработки: от уничтожения клопов и тараканов до фумигации экспортных грузов. Выезд по Новосибирску за 60 минут, гарантия по договору до 24 месяцев, сертифицированные препараты 4 класса опасности — безопасные для людей и животных.
          </p>
        </div>
      </section>

      {groups.map((g) => (
        <section key={g.id} className="container-x py-10">
          <h2 className="font-display text-2xl font-bold md:text-3xl">{g.title}</h2>
          <p className="mt-3 max-w-3xl text-muted-foreground">{g.desc}</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {g.items.map((s) => (<ServiceCard key={s.slug} service={s} />))}
          </div>
        </section>
      ))}
    </>
  );
}
