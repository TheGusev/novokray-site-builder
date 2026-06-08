import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, FileCheck2, RefreshCw, Award, CheckCircle2, AlertTriangle } from "lucide-react";
import { SITE } from "@/data/site";
import { COMMON } from "@/data/images";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { LeadForm } from "@/components/site/LeadForm";
import { Reveal } from "@/components/site/Reveal";
import { FAQ } from "@/components/site/FAQ";

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
  const guarTable = [
    { svc: "Клопы", term: "до 12 мес.", cond: "при соблюдении рекомендаций по подготовке и стирке белья" },
    { svc: "Тараканы", term: "до 12 мес.", cond: "при отсутствии новой миграции из соседних квартир" },
    { svc: "Грызуны (мыши, крысы)", term: "до 6 мес.", cond: "договор обслуживания, периодическая замена приманок" },
    { svc: "Блохи", term: "до 6 мес.", cond: "при отсутствии нового источника заражения" },
    { svc: "Плесень и грибок", term: "до 24 мес.", cond: "при устранении причины сырости (вентиляция, протечка)" },
    { svc: "Обработка участка от клещей", term: "до 1,5 мес.", cond: "бесплатная повторка при дожде в первые 4 часа" },
    { svc: "Озонирование", term: "до 6 мес.", cond: "без рецидива источника запаха" },
    { svc: "Сушка после потопа", term: "30 дней", cond: "контрольный замер влажности после высыхания" },
  ];
  const beforeList = [
    "Убрать продукты в холодильник или герметичную упаковку",
    "Снять постельное бельё, постирать при 60 °C",
    "Отодвинуть мебель от стен на 10–15 см",
    "Накрыть аквариум плёнкой, выключить компрессор",
    "Увести из квартиры детей, аллергиков и животных на 3–4 часа",
  ];
  const afterList = [
    "Проветрить помещение 2 часа после возвращения",
    "Влажную уборку — только по плинтусам, основную обработку не трогать 7–10 дней",
    "Постельное бельё и одежду из шкафов — постирать при 60 °C",
    "Соблюдать рекомендации в гарантийном талоне",
    "При появлении единичных особей — сразу звонить, повторка по гарантии бесплатно",
  ];
  const faqGuar = [
    { q: "Что нужно для активации гарантии?", a: "Сохраните договор, акт и чек. Они подтверждают факт обработки. Гарантия активируется автоматически в день обработки." },
    { q: "Что считается «возвратом проблемы»?", a: "Появление живых особей того же вида через 7+ дней после обработки. Единичная находка может быть остаточной — мы консультируем, но повторку делаем бесплатно." },
    { q: "Сколько раз можно вызвать по гарантии?", a: "Без ограничений в течение срока гарантии. Главное — соблюдение рекомендаций из памятки." },
    { q: "Что не покрывает гарантия?", a: "Новое заражение из соседних квартир, не устранённые источники (протечка для плесени, мусор для грызунов), нарушение рекомендаций по подготовке." },
    { q: "Что с гарантией для юрлиц?", a: "Юрлицам выдаём дополнительно сертификат дезинфекции и заполняем журнал по СанПиН. Условия — те же или расширенные по договору." },
    { q: "Можно ли вернуть деньги?", a: "Да. Если за 2 повторные обработки проблема не решена и причина не во внешних факторах — возвращаем 100% стоимости услуги." },
  ];
  return (
    <>
      <Breadcrumbs items={[{ label: "Главная", to: "/" }, { label: "Гарантии" }]} />
      <section className="relative overflow-hidden bg-hero text-primary-foreground">
        <img src={COMMON.documents} alt="Лицензия и сертификаты Дез-Федерация" className="absolute inset-0 h-full w-full object-cover opacity-25" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-primary/90" />
        <div className="container-x relative py-12 md:py-16">
          <h1 className="font-display text-3xl font-extrabold md:text-5xl">Гарантии и сертификаты</h1>
          <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-white/90 md:text-lg">
            Каждая обработка оформляется договором с прописанными сроками гарантии и условиями повторного выезда. Работаем по 152-ФЗ, имеем лицензию Роспотребнадзора и сертификаты на все используемые препараты. Если проблема вернётся — приезжаем повторно бесплатно, при невозможности устранения — возвращаем деньги.
          </p>
        </div>
      </section>

      <section className="container-x py-14">
        <div className="grid gap-5 md:grid-cols-2">
          {blocks.map((b, i) => (
            <Reveal key={b.t} delay={i * 80} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary">
                <b.i className="h-6 w-6" />
              </div>
              <div className="mt-3 font-display text-lg font-bold">{b.t}</div>
              <div className="mt-2 text-muted-foreground">{b.s}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Guarantee table */}
      <section className="bg-surface py-14 md:py-20">
        <div className="container-x">
          <Reveal>
            <h2 className="font-display text-2xl font-bold md:text-3xl">Сроки гарантии по услугам</h2>
            <p className="mt-3 max-w-3xl text-muted-foreground">Условия прописаны в договоре. Сроки указаны при соблюдении памятки клиента — её получаете после обработки.</p>
          </Reveal>
          <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary text-secondary-foreground">
                <tr>
                  <th className="px-5 py-3 font-display font-semibold">Услуга</th>
                  <th className="px-5 py-3 font-display font-semibold">Срок</th>
                  <th className="hidden px-5 py-3 font-display font-semibold md:table-cell">Условия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {guarTable.map((g) => (
                  <tr key={g.svc}>
                    <td className="px-5 py-3 font-semibold">{g.svc}</td>
                    <td className="px-5 py-3 font-display font-bold text-primary">{g.term}</td>
                    <td className="hidden px-5 py-3 text-muted-foreground md:table-cell">{g.cond}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Memo */}
      <section className="container-x py-14">
        <div className="grid gap-6 md:grid-cols-2">
          <Reveal className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
              <AlertTriangle className="h-3.5 w-3.5" /> До обработки
            </div>
            <h3 className="mt-3 font-display text-xl font-bold">Подготовьте помещение</h3>
            <ul className="mt-4 space-y-2 text-sm">
              {beforeList.map((b) => (<li key={b} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-success" />{b}</li>))}
            </ul>
          </Reveal>
          <Reveal delay={120} className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
              <ShieldCheck className="h-3.5 w-3.5" /> После обработки
            </div>
            <h3 className="mt-3 font-display text-xl font-bold">Что делать дальше</h3>
            <ul className="mt-4 space-y-2 text-sm">
              {afterList.map((a) => (<li key={a} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-success" />{a}</li>))}
            </ul>
          </Reveal>
        </div>
      </section>

      <FAQ items={faqGuar} title="Вопросы по гарантии" />

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
