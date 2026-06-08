import { createFileRoute } from "@tanstack/react-router";
import { SITE } from "@/data/site";
import { SERVICES } from "@/data/services";
import { FAQ } from "@/components/site/FAQ";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";

const ALL_FAQ = [
  { q: "Сколько стоит обработка?", a: "Стоимость зависит от объекта и услуги. Однокомнатная квартира — от 1 500 ₽, дом — от 3 500 ₽, участок — от 25 ₽/м². Точную цену озвучиваем по телефону." },
  { q: "Как быстро вы приедете?", a: "По Новосибирску — в течение 60 минут после заявки. По области — от 2 часов. Аварийная сушка после потопа — 24/7." },
  { q: "Безопасно ли это для детей и животных?", a: "Да. После высыхания и проветривания препараты 4 класса опасности безопасны. На время обработки уводим людей и питомцев на 3–4 часа." },
  { q: "Что входит в стоимость?", a: "Все препараты, выезд по городу, работа бригады, договор, акт, гарантия. Без скрытых платежей." },
  { q: "Какая гарантия?", a: "До 12 месяцев на клопов и тараканов, до 6 месяцев на блох и грызунов, до 24 месяцев на плесень. Условия в договоре." },
  { q: "Работаете с юрлицами?", a: "Да. Договоры с УК, ТСЖ, кафе, школами. Счёт с НДС или без, акт, сертификат дезинфекции, журнал СанПиН." },
  { q: "Можно ли остаться дома во время обработки?", a: "Нет, нужно покинуть помещение на 3–4 часа. После проветривания можно возвращаться." },
  { q: "Что делать с продуктами и посудой?", a: "Продукты в холодильник или герметичную упаковку, посуду накрыть плёнкой. После обработки помыть посуду тёплой водой." },
  ...SERVICES.slice(0, 4).flatMap((s) => s.faq.slice(0, 2).map((f) => ({ q: `${s.title}: ${f.q}`, a: f.a }))),
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: `Вопросы и ответы — ${SITE.name}` },
      { name: "description", content: "Ответы на популярные вопросы о санитарной обработке: цены, безопасность, гарантии, документы. Дез-Федерация, Новосибирск." },
      { property: "og:title", content: "Вопросы и ответы Дез-Федерация" },
      { property: "og:description", content: "Часто задаваемые вопросы о санитарной обработке в Новосибирске." },
      { property: "og:url", content: "/faq" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: ALL_FAQ.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }),
    }],
  }),
  component: FAQPage,
});

function FAQPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Главная", to: "/" }, { label: "Вопросы и ответы" }]} />
      <section className="container-x pb-6">
        <h1 className="font-display text-3xl font-extrabold md:text-5xl">Вопросы и ответы</h1>
        <p className="mt-4 max-w-3xl text-muted-foreground">
          Собрали популярные вопросы клиентов санитарной службы Дез-Федерация. Если не нашли ответ — позвоните, проконсультируем бесплатно.
        </p>
      </section>
      <FAQ items={ALL_FAQ} title="" />
    </>
  );
}
