import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, FileCheck2, RefreshCw, Award } from "lucide-react";
import { SITE } from "@/data/site";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { LeadForm } from "@/components/site/LeadForm";

export const Route = createFileRoute("/garantii")({
  head: () => ({
    meta: [
      { title: `Гарантии и сертификаты — ${SITE.name}` },
      { name: "description", content: "Гарантия на санитарную обработку до 24 месяцев. Договор, акт, лицензия Роспотребнадзора, сертификаты препаратов. Бесплатная повторная обработка." },
      { property: "og:title", content: "Гарантии Дез-Федерация" },
      { property: "og:description", content: "Гарантия до 24 месяцев, договор, сертификаты препаратов." },
      { property: "og:url", content: "/garantii" },
    ],
    links: [{ rel: "canonical", href: "/garantii" }],
  }),
  component: GuaranteesPage,
});

function GuaranteesPage() {
  const blocks = [
    { i: ShieldCheck, t: "Гарантия по договору до 24 месяцев", s: "В зависимости от вида обработки: клопы и тараканы — до 12 мес., плесень — до 24 мес., грызуны — до 6 мес. Условия фиксируются в договоре." },
    { i: RefreshCw, t: "Бесплатная повторная обработка", s: "Если проблема вернётся в течение срока гарантии — приезжаем повторно бесплатно. Без скрытых условий." },
    { i: FileCheck2, t: "Полный пакет документов", s: "Договор, акт выполненных работ, чек или счёт, сертификат дезинфекции для юрлиц, журнал по СанПиН." },
    { i: Award, t: "Сертифицированные препараты", s: "Только средства с действующей регистрацией Роспотребнадзора, 4 класс опасности (малоопасные)." },
  ];
  return (
    <>
      <Breadcrumbs items={[{ label: "Главная", to: "/" }, { label: "Гарантии" }]} />
      <section className="container-x pb-6">
        <h1 className="font-display text-3xl font-extrabold md:text-5xl">Гарантии и сертификаты</h1>
        <p className="mt-4 max-w-3xl text-muted-foreground">
          Каждая обработка оформляется договором с прописанными сроками гарантии и условиями повторного выезда. Работаем по 152-ФЗ, имеем лицензию Роспотребнадзора и сертификаты на все используемые препараты.
        </p>
      </section>
      <section className="container-x py-8">
        <div className="grid gap-5 md:grid-cols-2">
          {blocks.map((b) => (
            <div key={b.t} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary">
                <b.i className="h-6 w-6" />
              </div>
              <div className="mt-3 font-display text-lg font-bold">{b.t}</div>
              <div className="mt-2 text-muted-foreground">{b.s}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="container-x py-10">
        <div className="grid items-start gap-8 rounded-3xl bg-surface p-8 md:p-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-bold md:text-3xl">Образец договора и журнал СанПиН</h2>
            <p className="mt-3 text-muted-foreground">Высылаем образец договора и комплект документов по запросу — особенно актуально для юрлиц и УК.</p>
          </div>
          <LeadForm title="Запросить документы" subtitle="Укажите номер — вышлем образцы в WhatsApp." />
        </div>
      </section>
    </>
  );
}
