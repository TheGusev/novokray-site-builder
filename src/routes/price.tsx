import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SITE } from "@/data/site";
import { SERVICES } from "@/data/services";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { LeadForm } from "@/components/site/LeadForm";

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
  }),
  component: PricePage,
});

function PricePage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Главная", to: "/" }, { label: "Цены" }]} />
      <section className="container-x pb-6">
        <h1 className="font-display text-3xl font-extrabold md:text-5xl">Прайс-лист</h1>
        <p className="mt-4 max-w-3xl text-muted-foreground">
          Стоимость санитарной обработки в Новосибирске — фиксируется до выезда. Без скрытых платежей и доплат за препараты. Для юрлиц — счёт с НДС или без, для физлиц — наличная и безналичная оплата.
        </p>
      </section>

      <section className="container-x py-8">
        <div className="space-y-10">
          {SERVICES.map((s) => (
            <div key={s.slug} className="rounded-2xl border border-border bg-card p-6 shadow-card md:p-8">
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
                        <td className="px-4 py-3">{p.label}</td>
                        <td className="px-4 py-3 text-right font-display font-bold">{p.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x py-10">
        <div className="grid items-start gap-8 rounded-3xl bg-hero p-8 text-primary-foreground md:p-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-bold md:text-3xl">Нужен точный расчёт?</h2>
            <p className="mt-3 text-white/85">Опишите объект — назовём цену по телефону и зафиксируем её в договоре.</p>
          </div>
          <LeadForm variant="hero" />
        </div>
      </section>
    </>
  );
}
