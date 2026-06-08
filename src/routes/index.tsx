import { createFileRoute, Link } from "@tanstack/react-router";
import { Phone, ShieldCheck, Zap, CheckCircle2, Quote, Star, ArrowRight } from "lucide-react";
import { SITE } from "@/data/site";
import { PRIORITY_SERVICES, SERVICES } from "@/data/services";
import { LeadForm } from "@/components/site/LeadForm";
import { ServiceCard } from "@/components/site/ServiceCard";
import { TrustStrip } from "@/components/site/TrustStrip";
import { FAQ } from "@/components/site/FAQ";

const HOME_FAQ = [
  { q: "Сколько стоит обработка квартиры?", a: "Однокомнатная квартира от 1 900 ₽, двухкомнатная от 2 400 ₽, трёхкомнатная от 2 900 ₽. Цена фиксируется до выезда и включает все препараты и гарантию." },
  { q: "Как быстро вы приедете?", a: "По Новосибирску — в течение 60 минут после заявки. Работаем ежедневно с 07:00 до 23:00, аварийная сушка после потопа — круглосуточно." },
  { q: "Безопасны ли препараты для детей и животных?", a: "Да. Используем сертифицированные средства 4 класса опасности (малоопасные). После высыхания и проветривания препараты безопасны." },
  { q: "Какая у вас гарантия?", a: "По договору до 12 месяцев на клопов и тараканов, до 6 месяцев на блох и грызунов, до 24 месяцев на плесень. При возврате проблемы — повторная обработка бесплатно." },
  { q: "Работаете с юрлицами?", a: "Да. Заключаем договоры с кафе, магазинами, офисами, школами и УК. Выдаём акт, счёт, сертификат дезинфекции и журнал по СанПиН." },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `Санитарная служба №1 в Новосибирске — ${SITE.name}` },
      { name: "description", content: `Уничтожение клопов и тараканов, обработка от плесени, озонирование, сушка после потопов в Новосибирске. Выезд за 60 минут. Гарантия до 24 мес. ⭐ ${SITE.rating.value} / ${SITE.rating.count} отзывов.` },
      { property: "og:title", content: `${SITE.name} — санитарная служба №1 в Новосибирске` },
      { property: "og:description", content: "13 направлений санитарной обработки. Выезд за 60 минут, гарантия по договору, лицензия Роспотребнадзора." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: HOME_FAQ.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }),
    }],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-hero text-primary-foreground">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, oklch(0.7 0.18 215) 0%, transparent 50%), radial-gradient(circle at 80% 60%, oklch(0.6 0.20 38 / 0.3) 0%, transparent 50%)" }} />
        <div className="container-x relative grid gap-10 py-16 lg:grid-cols-[1.2fr,1fr] lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
              <Zap className="h-3.5 w-3.5 text-accent" /> Выезд за 60 минут по Новосибирску
            </div>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] md:text-5xl lg:text-6xl">
              Санитарная служба №1<br />в Новосибирске
            </h1>
            <p className="mt-5 max-w-xl text-base text-white/85 md:text-lg">
              Уничтожение клопов и тараканов, обработка участков от клещей, удаление плесени, озонирование и сушка после потопов. Работаем с 2014 года, гарантия по договору до 24 месяцев, безопасные для людей и животных препараты.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a href={SITE.phoneHref} className="inline-flex items-center gap-2 rounded-lg bg-accent-gradient px-5 py-3 font-semibold text-accent-foreground shadow-accent">
                <Phone className="h-4 w-4" /> {SITE.phone}
              </a>
              <Link to="/services" className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-5 py-3 font-semibold text-white backdrop-blur hover:bg-white/20">
                Все направления <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 grid max-w-md grid-cols-3 gap-4 border-t border-white/15 pt-6 text-sm">
              <div>
                <div className="font-display text-2xl font-extrabold">38 000+</div>
                <div className="text-xs text-white/70">обработок с 2014</div>
              </div>
              <div>
                <div className="font-display text-2xl font-extrabold">{SITE.rating.value} ★</div>
                <div className="text-xs text-white/70">{SITE.rating.count} отзывов</div>
              </div>
              <div>
                <div className="font-display text-2xl font-extrabold">24 мес.</div>
                <div className="text-xs text-white/70">гарантия по договору</div>
              </div>
            </div>
          </div>
          <div className="lg:pl-6">
            <LeadForm variant="hero" title="Бесплатный расчёт за 5 минут" subtitle="Перезвоним в течение 10 минут и зафиксируем цену до выезда." />
          </div>
        </div>
      </section>

      <TrustStrip />

      {/* Priority services */}
      <section className="container-x py-16 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">Приоритетные направления</div>
            <h2 className="mt-2 max-w-2xl font-display text-3xl font-bold md:text-4xl">Чаще всего вызывают по этим причинам</h2>
          </div>
          <Link to="/services" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2">
            Все {SERVICES.length} услуг <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PRIORITY_SERVICES.map((s) => (
            <ServiceCard key={s.slug} service={s} />
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="bg-surface py-16 md:py-20">
        <div className="container-x">
          <div className="text-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">Как мы работаем</div>
            <h2 className="mx-auto mt-2 max-w-2xl font-display text-3xl font-bold md:text-4xl">Четыре шага от заявки до гарантии</h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-4">
            {[
              { n: "01", t: "Заявка", s: "Звонок или форма. Фиксируем цену до выезда." },
              { n: "02", t: "Выезд", s: "Бригада в форме за 60 минут, бесплатный осмотр." },
              { n: "03", t: "Обработка", s: "Сертифицированные препараты, без запаха и следов." },
              { n: "04", t: "Гарантия", s: "Договор, акт, бесплатная повторка по условиям." },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <div className="font-display text-3xl font-extrabold text-primary/30">{s.n}</div>
                <div className="mt-1 font-display text-lg font-bold">{s.t}</div>
                <div className="mt-1 text-sm text-muted-foreground">{s.s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All services list */}
      <section className="container-x py-16 md:py-20">
        <div className="text-center">
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">Каталог</div>
          <h2 className="mx-auto mt-2 max-w-2xl font-display text-3xl font-bold md:text-4xl">13 направлений санитарной обработки</h2>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <Link
              key={s.slug}
              to="/services/$slug"
              params={{ slug: s.slug }}
              className="group flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 transition hover:border-primary/40 hover:bg-secondary"
            >
              <span className="flex items-center gap-3">
                <s.icon className="h-5 w-5 text-primary" />
                <span className="font-medium">{s.title}</span>
              </span>
              <span className="text-xs text-muted-foreground">от {s.priceFrom.toLocaleString("ru-RU")} ₽</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section className="bg-surface py-16 md:py-20">
        <div className="container-x">
          <div className="text-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">Отзывы клиентов</div>
            <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Что говорят жители Новосибирска</h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              { n: "Анна, Академгородок", t: "Клопы в съёмной квартире. Приехали за час, обработали всё за 40 минут. Через неделю — ноль укусов. Сейчас уже 4 месяца — пусто. Спасибо!", r: 5 },
              { n: "Дмитрий, Кировский р-н", t: "Заказал озонирование машины после прошлого владельца — курил жёстко. Через 3 часа в салоне как с завода. Запах ушёл полностью.", r: 5 },
              { n: "ТСЖ «Маяк», Заельцовский", t: "Регулярно работают с подвалом и подъездом — мыши, тараканы. Документы все, журнал ведут. Роспотреб ходил — без замечаний.", r: 5 },
            ].map((r) => (
              <div key={r.n} className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <div className="flex gap-1 text-accent">{Array.from({ length: r.r }).map((_, i) => (<Star key={i} className="h-4 w-4 fill-current" />))}</div>
                <Quote className="mt-3 h-5 w-5 text-primary/30" />
                <p className="mt-2 text-sm text-foreground/90">{r.t}</p>
                <div className="mt-4 text-xs font-semibold text-muted-foreground">{r.n}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + LeadForm */}
      <section className="container-x py-16 md:py-20">
        <div className="grid items-center gap-10 rounded-3xl bg-hero p-8 text-primary-foreground md:p-14 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold md:text-4xl">Закажите выезд бесплатно — оплата после обработки</h2>
            <p className="mt-3 text-white/85">Фиксируем цену до выезда. Если обработка не помогла — приезжаем повторно бесплатно по условиям договора.</p>
            <ul className="mt-5 space-y-2 text-sm text-white/90">
              {["Договор и чек на месте","Безопасно для детей и животных","Работаем с физлицами и юрлицами","Принимаем оплату наличными, картой, СБП, безналом"].map((t) => (
                <li key={t} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-accent" />{t}</li>
              ))}
            </ul>
          </div>
          <LeadForm variant="hero" />
        </div>
      </section>

      <FAQ items={HOME_FAQ} />
    </>
  );
}
