import { createFileRoute } from "@tanstack/react-router";
import { SITE } from "@/data/site";
import { SERVICES } from "@/data/services";
import { COMMON } from "@/data/images";
import { FAQ } from "@/components/site/FAQ";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { LeadForm } from "@/components/site/LeadForm";
import { WaveText } from "@/components/site/WaveText";

const GENERAL = [
  { q: "Сколько стоит обработка?", a: "Стоимость зависит от объекта и услуги. Однокомнатная квартира — от 1 500 ₽, дом — от 3 500 ₽, участок — от 25 ₽/м². Точную цену озвучиваем по телефону." },
  { q: "Как быстро вы приедете?", a: "По Новосибирску — в течение 60 минут после заявки. По области — от 2 часов. Аварийная сушка после потопа — 24/7." },
  { q: "Работаете ли вы в выходные и праздники?", a: "Да. Работаем ежедневно с 07:00 до 23:00 без выходных. По заявкам аварийной службы (потоп) — круглосуточно." },
  { q: "Можно ли заказать обработку анонимно?", a: "Да. Бригада приезжает без брендинга на одежде и на нейтральном автомобиле, документы оформляем на ФИО без указания вида услуги в подъезде." },
];
const SAFETY = [
  { q: "Безопасно ли это для детей и животных?", a: "Да. После высыхания и проветривания препараты 4 класса опасности безопасны. На время обработки уводим людей и питомцев на 3–4 часа." },
  { q: "Что делать с аквариумом?", a: "Накройте плёнкой и выключите компрессор на 4 часа. Рыб не пересаживайте — стресс опаснее препаратов с закрытым доступом." },
  { q: "Что входит в стоимость?", a: "Все препараты, выезд по городу, работа бригады, договор, акт, гарантия. Без скрытых платежей." },
  { q: "Что делать с продуктами и посудой?", a: "Продукты в холодильник или герметичную упаковку, посуду накрыть плёнкой. После обработки помыть посуду тёплой водой." },
  { q: "Можно ли остаться дома во время обработки?", a: "Нет, нужно покинуть помещение на 3–4 часа. После проветривания можно возвращаться." },
  { q: "Что с астмой и аллергией?", a: "Предупредите оператора при заявке — подберём препарат без раздражающего запаха и проветрим помещение интенсивнее." },
];
const PRICE = [
  { q: "Когда оплачивать?", a: "После обработки, наличными, картой, СБП или безналом для юрлиц. Никакой предоплаты." },
  { q: "Есть ли скидки?", a: "5% — повторный заказ, 10% — пенсионерам и многодетным, 10–15% — юрлицам по договору на год, 20% — при обработке подъезда соседями." },
  { q: "Можно ли получить счёт с НДС?", a: "Да. По запросу выдаём счёт с НДС или без — на усмотрение бухгалтерии заказчика." },
  { q: "Принимаете ли вы кэшбек и бонусы банков?", a: "Да. Оплата картой проходит через стандартный POS-терминал — банковский кэшбек начисляется по правилам банка." },
];
const GUARANTEE = [
  { q: "Какая гарантия?", a: "До 12 месяцев на клопов и тараканов, до 6 месяцев на блох и грызунов, до 24 месяцев на плесень. Условия в договоре." },
  { q: "Что если проблема вернётся?", a: "Звоните — приезжаем повторно бесплатно. Главное — соблюдайте памятку из гарантийного талона." },
  { q: "Что не покрывает гарантия?", a: "Новое заражение от соседей, неустранённые источники (протечка для плесени, мусор для грызунов), нарушение рекомендаций по подготовке." },
  { q: "А если и повторка не помогла?", a: "Делаем третий выезд бесплатно. Если и он не решил проблему, возвращаем 100% стоимости услуги." },
  { q: "Работаете с юрлицами?", a: "Да. Договоры с УК, ТСЖ, кафе, школами. Счёт с НДС или без, акт, сертификат дезинфекции, журнал СанПиН." },
];
const SERVICES_FAQ = SERVICES.slice(0, 5).flatMap((s) => s.faq.slice(0, 2).map((f) => ({ q: `${s.title}: ${f.q}`, a: f.a })));
const ALL_FAQ = [...GENERAL, ...SAFETY, ...PRICE, ...GUARANTEE, ...SERVICES_FAQ];

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
      <section className="relative overflow-hidden bg-hero text-primary-foreground">
        <img src={COMMON.office} alt="Поддержка клиентов Дез-Федерация" className="absolute inset-0 h-full w-full object-cover opacity-25" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/55 via-black/20 to-transparent" />
        <div className="container-x relative py-12 md:py-16">
          <h1 className="font-display text-3xl font-extrabold md:text-5xl"><WaveText className="on-dark" text="Вопросы и ответы о санитарной обработке" duration={4} /></h1>
          <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-white/90 md:text-lg">
            Собрали 25+ популярных вопросов клиентов: о ценах, безопасности препаратов, сроках гарантии, документах для юрлиц и подготовке к обработке. Если не нашли ответ — позвоните оператору, проконсультируем бесплатно.
          </p>
        </div>
      </section>
      <FAQ items={GENERAL} title="Общие вопросы" />
      <div className="bg-surface"><FAQ items={SAFETY} title="Безопасность и подготовка" /></div>
      <FAQ items={PRICE} title="Цены и оплата" />
      <div className="bg-surface"><FAQ items={GUARANTEE} title="Гарантии" /></div>
      <FAQ items={SERVICES_FAQ} title="По конкретным услугам" />
      <section className="container-x pb-16">
        <div className="rounded-3xl bg-hero p-8 text-primary-foreground md:p-12">
          <h2 className="font-display text-2xl font-bold md:text-3xl">Не нашли ответ?</h2>
          <p className="mt-2 text-white/85">Опишите ситуацию — оператор перезвонит за 10 минут и подскажет решение.</p>
          <div className="mt-6 max-w-xl"><LeadForm variant="hero" /></div>
        </div>
      </section>
    </>
  );
}
