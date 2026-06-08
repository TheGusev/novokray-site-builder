import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SITE } from "@/data/site";
import { SERVICES } from "@/data/services";
import { ServiceCard } from "@/components/site/ServiceCard";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { LeadForm } from "@/components/site/LeadForm";

export const Route = createFileRoute("/category/dezinfekciya-novosibirsk")({
  head: () => ({
    meta: [
      { title: `Дезинфекция в Новосибирске — все виды санитарной обработки | ${SITE.name}` },
      { name: "description", content: "Дезинфекция в Новосибирске и области: уничтожение вредителей, обработка от плесени, озонирование, дератизация. 13 направлений, выезд за 60 минут, лицензия." },
      { property: "og:title", content: "Дезинфекция в Новосибирске" },
      { property: "og:description", content: "Все виды санитарной обработки в Новосибирске и области." },
      { property: "og:url", content: "/category/dezinfekciya-novosibirsk" },
    ],
    links: [{ rel: "canonical", href: "/category/dezinfekciya-novosibirsk" }],
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
      <section className="container-x pb-6">
        <h1 className="font-display text-3xl font-extrabold md:text-5xl">Дезинфекция в Новосибирске</h1>
        <p className="mt-4 max-w-3xl text-base text-muted-foreground md:text-lg">
          Дезинфекция в Новосибирске под ключ — санитарная служба Дез-Федерация выполняет 13 видов обработки: уничтожение клопов, тараканов, грызунов, обработка от плесени, озонирование, сушка после потопов, фумигация и дезодорация. Выезд по городу за 60 минут, обслуживаем физлиц и юрлиц по всей Новосибирской области.
        </p>
      </section>

      <section className="container-x py-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (<ServiceCard key={s.slug} service={s} />))}
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
