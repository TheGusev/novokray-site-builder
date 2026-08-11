import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Users, Wrench, ShieldCheck, Phone, MapPin, Building2, CheckCircle2, Calendar } from "lucide-react";
import { SITE } from "@/data/site";
import { COMMON } from "@/data/images";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { LeadForm } from "@/components/site/LeadForm";
import { Reveal } from "@/components/site/Reveal";
import { CountUp } from "@/components/site/CountUp";
import { WaveText } from "@/components/site/WaveText";

export const Route = createFileRoute("/o-kompanii")({
  head: () => ({
    meta: [
      { title: `О компании Дез-Федерация — санитарная служба Новосибирска с 2019 года` },
      { name: "description", content: "Дез-Федерация — санитарная служба №1 в Новосибирске. 7 лет на рынке, 38 000+ обработанных заявок по России, лицензия Роспотребнадзора, гарантия по договору." },
      { property: "og:title", content: "О компании Дез-Федерация" },
      { property: "og:description", content: "Санитарная служба №1 в Новосибирске с 2019 года. Лицензия, гарантия, 38 000+ заявок по РФ." },
      { property: "og:url", content: `${SITE.domain}/o-kompanii` },
    ],
    links: [{ rel: "canonical", href: `${SITE.domain}/o-kompanii` }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "AboutPage",
            name: `О компании ${SITE.name}`,
            url: `${SITE.domain}/o-kompanii`,
            inLanguage: "ru-RU",
            mainEntity: { "@id": `${SITE.domain}#organization` },
            speakable: { "@type": "SpeakableSpecification", cssSelector: [".speakable"] },
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Главная", item: SITE.domain + "/" },
              { "@type": "ListItem", position: 2, name: "О компании", item: SITE.domain + "/o-kompanii" },
            ],
          },
        ],
      }),
    }],
  }),
  component: AboutPage,
});

function AboutPage() {
  const timeline = [
    { y: "2019", t: "Старт компании", s: "Первая бригада, 2 объекта в день, лицензия Роспотребнадзора." },
    { y: "2021", t: "5 000 обработок", s: "Запуск направления для юрлиц — кафе, ТСЖ, школы." },
    { y: "2020", t: "Антиковидная дезинфекция", s: "Озонирование и обработка больниц, офисов, ТЦ." },
    { y: "2023", t: "20 000 обработок", s: "Открыли направление сушки после потопов 24/7." },
    { y: "2026", t: "38 000+ заявок по РФ", s: "Команда из 28 человек, 6 бригад, выезд за 60 минут." },
  ];
  const values = [
    { t: "Честность", s: "Цена фиксируется до выезда. Если на месте что-то меняется — пересогласовываем заранее." },
    { t: "Безопасность", s: "Препараты 4 класса опасности. Работаем в семьях с детьми, аллергиками и животными." },
    { t: "Ответственность", s: "Договор и гарантия с условиями повторной обработки. Возврат денег — если не помогло." },
    { t: "Скорость", s: "Выезд за 60 минут по городу. Аварийные службы — круглосуточно." },
  ];
  return (
    <>
      <Breadcrumbs items={[{ label: "Главная", to: "/" }, { label: "О компании" }]} />
      <section className="relative overflow-hidden bg-hero text-primary-foreground">
        <img src={COMMON.heroTeam} alt="Команда из 28 специалистов санитарной службы Дез-Федерация на выезде в Новосибирске" title="Дез-Федерация — с 2019 года в Новосибирске и области" className="absolute inset-0 h-full w-full object-cover opacity-100" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/55 via-black/20 to-transparent" />
        <div className="container-x relative grid gap-8 py-12 md:py-20 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur">
                <Building2 className="h-3.5 w-3.5" /> На рынке с {SITE.founded} года
              </span>
            </Reveal>
            <h1 className="mt-5 font-display text-3xl font-extrabold leading-tight md:text-5xl"><WaveText className="on-dark" text="О санитарной службе «Дез-Федерация»" duration={4} /></h1>
            <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-white/90 md:text-lg">
              Мы — команда из 28 специалистов, работаем в Новосибирске и области с {SITE.founded} года. За это время по России выполнено более 38 000 заявок: от однокомнатных квартир до промышленных складов, кафе, школ и экспортных грузов. Лицензия Роспотребнадзора, договоры с УК, ТСЖ, сетевыми ресторанами и образовательными учреждениями.
            </p>
            <div className="mt-8 grid max-w-lg grid-cols-3 gap-4 border-t border-white/15 pt-6">
              <div><div className="font-display text-2xl font-extrabold md:text-3xl"><CountUp value={38000} suffix="+" /></div><div className="text-[11px] uppercase tracking-wider text-white/70">заявок по РФ</div></div>
              <div><div className="font-display text-2xl font-extrabold md:text-3xl"><CountUp value={12} suffix=" лет" /></div><div className="text-[11px] uppercase tracking-wider text-white/70">на рынке</div></div>
              <div><div className="font-display text-2xl font-extrabold md:text-3xl"><CountUp value={28} /></div><div className="text-[11px] uppercase tracking-wider text-white/70">в штате</div></div>
            </div>
            <a href={SITE.phoneHref} className="cta-shine mt-8 inline-flex items-center gap-2 rounded-xl bg-cta-gradient px-5 py-3.5 font-bold text-accent-foreground shadow-cta">
              <Phone className="h-5 w-5" /> {SITE.phone}
            </a>
          </div>
          <Reveal variant="scale" delay={120} className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/20 shadow-elegant">
            <img src={COMMON.office} alt="Диспетчерская санитарной службы Дез-Федерация: приём заявок круглосуточно" title="Круглосуточный приём заявок по Новосибирску" loading="lazy" className="h-full w-full object-cover" />
          </Reveal>
        </div>
      </section>

      {/* Cards */}
      <section className="container-x py-14 md:py-20">
        <div className="grid gap-5 md:grid-cols-4">
          {[
            { i: Award, t: "Лицензия Роспотребнадзора", s: "На дезинфекционную деятельность" },
            { i: Users, t: "Штат в 28 специалистов", s: "Дезинфекторы, фумигаторы, операторы" },
            { i: Wrench, t: "Профоборудование", s: "Trotec, Hailea, ULV-генераторы" },
            { i: ShieldCheck, t: "Договор и гарантия", s: "С каждым клиентом — физлицом и юрлицом" },
          ].map((c, i) => (
            <Reveal key={c.t} delay={i * 80} className="rounded-2xl border border-border bg-card p-6 shadow-card transition hover:-translate-y-1 hover:shadow-elegant">
              <c.i className="h-7 w-7 text-primary" />
              <div className="mt-3 font-display text-base font-bold">{c.t}</div>
              <div className="mt-1 text-sm text-muted-foreground">{c.s}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Equipment / Team photos */}
      <section className="bg-surface py-14 md:py-20">
        <div className="container-x">
          <Reveal>
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">Команда и оборудование</div>
            <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Профессиональная техника и подготовленные специалисты</h2>
            <p className="mt-3 max-w-3xl text-muted-foreground">
              В арсенале — генераторы горячего и холодного тумана, моторизованные ранцевые опрыскиватели, промышленные осушители Trotec, озонаторы 60 г/ч. Каждый специалист проходит обучение по работе с препаратами и СИЗ, регулярную аттестацию и медицинские осмотры.
            </p>
          </Reveal>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Reveal className="overflow-hidden rounded-2xl aspect-[4/3] md:col-span-2"><img src={COMMON.heroTeam} alt="Аттестованные дезинфекторы Дез-Федерация в СИЗ перед выездом" title="28 специалистов в штате — аттестация и медосмотры" loading="lazy" className="h-full w-full object-cover" /></Reveal>
            <div className="grid gap-4">
              <Reveal delay={120} className="overflow-hidden rounded-2xl aspect-[4/3]"><img src={COMMON.equipment} alt="ULV-генераторы Trotec, осушители и ранцевые опрыскиватели Дез-Федерация" title="Профессиональная техника для дезинсекции и дезинфекции" loading="lazy" className="h-full w-full object-cover" /></Reveal>
              <Reveal delay={200} className="overflow-hidden rounded-2xl aspect-[4/3]"><img src={COMMON.documents} alt="Лицензия Роспотребнадзора и сертификаты дезинфекции Дез-Федерация" title="Полный пакет документов для УК, ТСЖ и юрлиц" loading="lazy" className="h-full w-full object-cover" /></Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="container-x py-14 md:py-20">
        <Reveal>
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">История</div>
          <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Путь от первой бригады до санитарной службы №1</h2>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-5">
          {timeline.map((t, i) => (
            <Reveal key={t.y} delay={i * 100} className="relative rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-cta-gradient px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent-foreground shadow-cta">
                <Calendar className="h-3 w-3" /> {t.y}
              </div>
              <div className="mt-3 font-display text-base font-bold">{t.t}</div>
              <div className="mt-2 text-sm text-muted-foreground">{t.s}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="bg-surface py-14 md:py-20">
        <div className="container-x">
          <Reveal>
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">Принципы работы</div>
            <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Чем мы отличаемся</h2>
          </Reveal>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <Reveal key={v.t} delay={i * 80} className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <CheckCircle2 className="h-7 w-7 text-success" />
                <div className="mt-3 font-display text-lg font-bold">{v.t}</div>
                <div className="mt-2 text-sm text-muted-foreground">{v.s}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Differences (legacy block kept, enriched) */}
      <section className="container-x py-14 md:py-20">
        <h2 className="font-display text-2xl font-bold md:text-3xl">Что вы получаете при работе с нами</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {[
            { t: "Цена фиксируется до выезда", s: "Озвучиваем стоимость по телефону по площади и виду обработки. Никаких «доплат за препараты» на месте." },
            { t: "Безопасные препараты 4 класса", s: "Используем сертифицированные средства, безопасные после высыхания. Работаем в семьях с детьми, аллергиками и животными." },
            { t: "Документы и СЭС-журнал для юрлиц", s: "Договор, акт, сертификат дезинфекции, журнал по СанПиН — всё, что требует Роспотребнадзор." },
            { t: "Гарантия с бесплатной повторкой", s: "До 24 месяцев по договору в зависимости от услуги. Если проблема вернётся — приезжаем ещё раз бесплатно." },
          ].map((b, i) => (
            <Reveal key={b.t} delay={i * 80} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="font-display text-lg font-bold text-primary">{b.t}</div>
              <div className="mt-2 text-muted-foreground">{b.s}</div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-x py-10">
        <div className="grid items-start gap-8 rounded-3xl bg-surface p-8 md:p-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-bold md:text-3xl">Готовы помочь сегодня</h2>
            <p className="mt-3 text-muted-foreground">Оставьте заявку — перезвоним за 10 минут, согласуем время и зафиксируем цену.</p>
            <Link to="/contacts" className="mt-4 inline-flex items-center gap-1 font-semibold text-primary hover:gap-2"><MapPin className="h-4 w-4" /> Адрес и реквизиты</Link>
          </div>
          <LeadForm title="Записаться на обработку" />
        </div>
      </section>
    </>
  );
}
