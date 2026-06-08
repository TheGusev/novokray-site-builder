import { createFileRoute } from "@tanstack/react-router";
import { SITE } from "@/data/site";
import { SERVICES } from "@/data/services";
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
    { id: "vrediteli", title: "Уничтожение вредителей", items: SERVICES.filter((s) => s.category === "vrediteli") },
    { id: "spec", title: "Спец. обработка и устранение последствий", items: SERVICES.filter((s) => s.category === "spec") },
    { id: "uchastok", title: "Обработка участков и территорий", items: SERVICES.filter((s) => s.category === "uchastok") },
    { id: "sanitarnaya", title: "Санитарная обработка", items: SERVICES.filter((s) => s.category === "sanitarnaya") },
  ];
  return (
    <>
      <Breadcrumbs items={[{ label: "Главная", to: "/" }, { label: "Услуги" }]} />
      <section className="container-x pb-6">
        <h1 className="font-display text-3xl font-extrabold md:text-5xl">Услуги санитарной службы в Новосибирске</h1>
        <p className="mt-4 max-w-3xl text-base text-muted-foreground md:text-lg">
          13 направлений санитарной обработки: от уничтожения клопов и тараканов до фумигации экспортных грузов. Выезд по Новосибирску за 60 минут, гарантия по договору до 24 месяцев, сертифицированные препараты 4 класса опасности — безопасные для людей и животных.
        </p>
      </section>

      {groups.map((g) => (
        <section key={g.id} className="container-x py-10">
          <h2 className="font-display text-2xl font-bold md:text-3xl">{g.title}</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {g.items.map((s) => (<ServiceCard key={s.slug} service={s} />))}
          </div>
        </section>
      ))}
    </>
  );
}
