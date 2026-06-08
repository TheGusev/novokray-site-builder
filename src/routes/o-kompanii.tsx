import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Users, Wrench, ShieldCheck } from "lucide-react";
import { SITE } from "@/data/site";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { LeadForm } from "@/components/site/LeadForm";

export const Route = createFileRoute("/o-kompanii")({
  head: () => ({
    meta: [
      { title: `О компании Дез-Федерация — санитарная служба Новосибирска с 2014 года` },
      { name: "description", content: "Дез-Федерация — санитарная служба №1 в Новосибирске. 12 лет на рынке, 38 000+ обработанных объектов, лицензия Роспотребнадзора, гарантия по договору." },
      { property: "og:title", content: "О компании Дез-Федерация" },
      { property: "og:description", content: "Санитарная служба №1 в Новосибирске с 2014 года. Лицензия, гарантия, 38 000+ объектов." },
      { property: "og:url", content: "/o-kompanii" },
    ],
    links: [{ rel: "canonical", href: "/o-kompanii" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Главная", to: "/" }, { label: "О компании" }]} />
      <section className="container-x pb-6">
        <h1 className="font-display text-3xl font-extrabold md:text-5xl">О компании Дез-Федерация</h1>
        <p className="mt-5 max-w-3xl text-base text-muted-foreground md:text-lg">
          Санитарная служба «Дез-Федерация» работает в Новосибирске и области с {SITE.founded} года. За 12 лет провели более 38 000 обработок: от квартир и офисов до элеваторов и экспортных грузов. Лицензия Роспотребнадзора, договоры с управляющими компаниями, ТСЖ, школами и сетевыми ресторанами.
        </p>
      </section>

      <section className="container-x py-10">
        <div className="grid gap-5 md:grid-cols-4">
          {[
            { i: Award, t: "Лицензия Роспотребнадзора", s: "На дезинфекционную деятельность" },
            { i: Users, t: "Штат в 28 специалистов", s: "Дезинфекторы, фумигаторы, операторы" },
            { i: Wrench, t: "Профоборудование", s: "Trotec, Hailea, ULV-генераторы" },
            { i: ShieldCheck, t: "Договор и гарантия", s: "С каждым клиентом — физлицом и юрлицом" },
          ].map((c) => (
            <div key={c.t} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <c.i className="h-7 w-7 text-primary" />
              <div className="mt-3 font-display text-base font-bold">{c.t}</div>
              <div className="mt-1 text-sm text-muted-foreground">{c.s}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x py-10">
        <h2 className="font-display text-2xl font-bold md:text-3xl">Чем мы отличаемся</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {[
            { t: "Цена фиксируется до выезда", s: "Озвучиваем стоимость по телефону по площади и виду обработки. Никаких «доплат за препараты» на месте." },
            { t: "Безопасные препараты 4 класса", s: "Используем сертифицированные средства, безопасные после высыхания. Работаем в семьях с детьми, аллергиками и животными." },
            { t: "Документы и СЭС-журнал для юрлиц", s: "Договор, акт, сертификат дезинфекции, журнал по СанПиН — всё, что требует Роспотребнадзор." },
            { t: "Гарантия с бесплатной повторкой", s: "До 24 месяцев по договору в зависимости от услуги. Если проблема вернётся — приезжаем ещё раз бесплатно." },
          ].map((b) => (
            <div key={b.t} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="font-display text-lg font-bold text-primary">{b.t}</div>
              <div className="mt-2 text-muted-foreground">{b.s}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x py-10">
        <div className="grid items-start gap-8 rounded-3xl bg-surface p-8 md:p-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-bold md:text-3xl">Готовы помочь сегодня</h2>
            <p className="mt-3 text-muted-foreground">Оставьте заявку — перезвоним за 10 минут, согласуем время и зафиксируем цену.</p>
            <Link to="/contacts" className="mt-4 inline-flex font-semibold text-primary hover:underline">Адрес и реквизиты →</Link>
          </div>
          <LeadForm title="Записаться на обработку" />
        </div>
      </section>
    </>
  );
}
