import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Phone, ShieldCheck, CheckCircle2, Quote, Star, ArrowRight, MapPin,
  BadgeCheck, FileText, Award, Building2, Sparkles, ClipboardCheck, HandCoins,
  CalendarClock, Clock4, MessageCircle, MessageSquare, Send,
} from "lucide-react";
import { SITE } from "@/data/site";
import { PRIORITY_SERVICES, SERVICES } from "@/data/services";
import { SERVICES_INDEX } from "@/data/servicesIndex";
import { CITIES } from "@/data/cities";
import { DISTRICTS } from "@/data/districts";
import { COMMON, GALLERY, GALLERY_META } from "@/data/images";
import heroBg from "@/assets/hero-bg.jpg";
import { LeadFormModal } from "@/components/site/LeadFormModal";
import { LeadForm } from "@/components/site/LeadForm";
import { ServiceCard } from "@/components/site/ServiceCard";
import { TrustStrip } from "@/components/site/TrustStrip";
import { FAQ } from "@/components/site/FAQ";
import { Reveal } from "@/components/site/Reveal";
import { AnimatedHeading } from "@/components/site/AnimatedHeading";
import { WaveSentences } from "@/components/site/WaveSentences";
import { WaveText } from "@/components/site/WaveText";
import { StatsRow } from "@/components/site/StatsRow";
import { VideoCard } from "@/components/site/VideoCard";
import { WORK_VIDEOS } from "@/data/videos";
import { GOALS, trackGoal } from "@/lib/analytics";

const HOME_FAQ = [
  { q: "Сколько стоит обработка квартиры?", a: "Однокомнатная квартира от 1 900 ₽, двухкомнатная от 2 400 ₽, трёхкомнатная от 2 900 ₽. Цена фиксируется до выезда и включает все препараты и гарантию." },
  { q: "Как быстро вы приедете?", a: "По Новосибирску — в течение 60 минут после заявки. Работаем ежедневно с 07:00 до 23:00, аварийная сушка после потопа — круглосуточно." },
  { q: "Безопасны ли препараты для детей и животных?", a: "Да. Используем сертифицированные средства 4 класса опасности (малоопасные). После высыхания и проветривания препараты безопасны." },
  { q: "Какая у вас гарантия?", a: "По договору до 12 месяцев на клопов и тараканов, до 6 месяцев на блох и грызунов, до 24 месяцев на плесень. При возврате проблемы — повторная обработка бесплатно." },
  { q: "Работаете с юрлицами?", a: "Да. Заключаем договоры с кафе, магазинами, офисами, школами и УК. Выдаём акт, счёт, сертификат дезинфекции и журнал по СанПиН." },
];

const WHY_US = [
  { icon: BadgeCheck, t: "Лицензия Роспотребнадзора", s: "Работаем по 152-ФЗ и СанПиН, документы выдаём в день обработки." },
  { icon: ShieldCheck, t: "Гарантия по договору", s: "До 24 месяцев. Если проблема вернётся — приедем повторно бесплатно." },
  { icon: Sparkles, t: "Безопасно для детей и животных", s: "Сертифицированные препараты 4 класса опасности без запаха." },
  { icon: HandCoins, t: "Фикс цена до выезда", s: "Никаких доплат за препараты и время. Оплата после обработки." },
  { icon: Clock4, t: "Выезд за 60 минут", s: "Специалист в форме, оборудование и препараты уже в машине." },
  { icon: FileText, t: "Договор, акт, чек", s: "Принимаем оплату наличными, картой, СБП и безналом." },
  { icon: Award, t: "7 лет опыта", s: "38 000+ заявок обработано по РФ, с 2019 года работаем в Новосибирске и области." },
];

const TIMELINE = [
  { icon: Phone, t: "Заявка", s: "Звонок или форма", min: "0 мин" },
  { icon: ClipboardCheck, t: "Цена заранее", s: "Фиксируем до выезда", min: "5 мин" },
  { icon: CalendarClock, t: "Приезд специалиста", s: "Без опозданий", min: "60 мин" },
  { icon: ShieldCheck, t: "Обработка и гарантия", s: "Договор и гарантия", min: "2 ч" },
];

const GEO_AREA_SLUGS = ["berdsk", "iskitim", "koltsovo", "krasnoobsk", "ob", "mochische", "krivodanovka", "tolmachevo", "baryshevo"] as const;

const B2B = [
  { t: "Кафе и рестораны", s: "Журнал по СанПиН, выезд ночью без остановки работы." },
  { t: "Магазины и склады", s: "Дератизация, барьерная защита, фумигация контейнеров." },
  { t: "ТСЖ и УК", s: "Подвалы, подъезды, мусорокамеры. Договор на год." },
  { t: "Школы и сады", s: "Дезинфекция и обработка участков по графику." },
  { t: "Офисы и БЦ", s: "Дезинфекция вечером, без эвакуации сотрудников." },
  { t: "Медучреждения", s: "Сертификат дезинфекции и отметки в журнале." },
];

const DOCS = [
  { t: "Лицензия Роспотребнадзора", s: `№ ${SITE.legal.licenseNo} от ${SITE.legal.licenseDate}` },
  { t: "Сертификаты препаратов", s: "Все средства 4 класса опасности (малоопасные)." },
  { t: "Договор и акт", s: "На каждый выезд, для физлиц и юрлиц." },
  { t: "Гарантия по договору", s: "До 24 месяцев с условиями повторной обработки." },
];

const REVIEWS = [
  { n: "Анна, Академгородок", t: "Клопы в съёмной квартире. Приехали за час, обработали всё за 40 минут. Через неделю — ноль укусов. Сейчас уже 4 месяца — пусто. Спасибо!", tag: "Клопы" },
  { n: "Дмитрий, Кировский р-н", t: "Заказал озонирование машины после прошлого владельца — курил жёстко. Через 3 часа в салоне как с завода. Запах ушёл полностью.", tag: "Озонирование" },
  { n: "ТСЖ «Маяк», Заельцовский", t: "Регулярно работают с подвалом и подъездом — мыши, тараканы. Документы все, журнал ведут. Роспотреб ходил — без замечаний.", tag: "Дератизация" },
  { n: "Елена, Бердск", t: "Затопили соседи, приехали ночью с осушителями. За 4 дня всё высушили, плесень не пошла. Акт для страховой сделали на месте.", tag: "Сушка" },
  { n: "Олег, ИП кафе", t: "Травили тараканов в кухне — сделали ночью за 2 часа, утром открылись. Уже год чисто, журнал ведут идеально.", tag: "Тараканы" },
];

const CATEGORY_LABEL: Record<string, string> = {
  vrediteli: "Вредители",
  sanitarnaya: "Санитарная",
  uchastok: "Участок",
  spec: "Спец. услуги",
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `Санитарная служба №1 в Новосибирске — ${SITE.name}` },
      { name: "description", content: `Уничтожение клопов и тараканов, обработка от плесени, озонирование, сушка после потопов в Новосибирске. Выезд за 60 минут. Гарантия до 24 мес. Рейтинг ${SITE.rating.value} из 5 (${SITE.rating.count} отзывов).` },
      { property: "og:title", content: `${SITE.name} — санитарная служба №1 в Новосибирске` },
      { property: "og:description", content: "13 направлений санитарной обработки. Выезд за 60 минут, гарантия по договору, лицензия Роспотребнадзора." },
      { property: "og:url", content: `${SITE.domain}/` },
    ],
    links: [
      { rel: "canonical", href: `${SITE.domain}/` },
      { rel: "preload", as: "image", href: heroBg, fetchPriority: "high" },
    ],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebPage",
            "@id": `${SITE.domain}/#webpage`,
            url: `${SITE.domain}/`,
            name: `Санитарная служба №1 в Новосибирске — ${SITE.name}`,
            inLanguage: "ru-RU",
            isPartOf: { "@id": `${SITE.domain}#website` },
            about: { "@id": `${SITE.domain}#organization` },
            author: { "@id": `${SITE.domain}#organization` },
            publisher: { "@id": `${SITE.domain}#organization` },
            datePublished: `${SITE.founded}-01-01`,
            dateModified: SITE.contentUpdated,
            primaryImageOfPage: `${SITE.domain}/og/default.jpg`,
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Главная", item: `${SITE.domain}/` },
              { "@type": "ListItem", position: 2, name: "Услуги", item: `${SITE.domain}/services` },
              { "@type": "ListItem", position: 3, name: "Цены", item: `${SITE.domain}/price` },
            ],
          },
          ...SERVICES_INDEX.map((s) => ({
            "@type": "Service",
            "@id": `${SITE.domain}/services/${s.slug}#service`,
            name: s.title,
            serviceType: s.title,
            description: s.metaDescription,
            url: `${SITE.domain}/services/${s.slug}`,
            provider: { "@id": `${SITE.domain}#organization` },
            areaServed: [
              { "@type": "City", name: SITE.city },
              { "@type": "AdministrativeArea", name: SITE.region },
            ],
            offers: {
              "@type": "Offer",
              price: s.priceFrom,
              priceCurrency: "RUB",
              url: `${SITE.domain}/services/${s.slug}`,
              availability: "https://schema.org/InStock",
            },
          })),
          {
            "@type": "FAQPage",
            speakable: { "@type": "SpeakableSpecification", cssSelector: [".speakable"] },
            mainEntity: HOME_FAQ.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
          {
            "@type": "ItemList",
            name: "Услуги санитарной службы Дез-Федерация",
            itemListElement: SERVICES_INDEX.map((s, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${SITE.domain}/services/${s.slug}`,
              name: s.title,
            })),
          },
          {
            "@type": "LocalBusiness",
            "@id": `${SITE.domain}#localbusiness`,
            review: REVIEWS.slice(0, 5).map((r) => ({
              "@type": "Review",
              author: { "@type": "Person", name: r.n },
              reviewBody: r.t,
              reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
              itemReviewed: { "@id": `${SITE.domain}#organization` },
            })),
          },
        ],
      }),
    }],
  }),
  component: HomePage,
});

function HomePage() {
  const [cat, setCat] = useState<string>("vrediteli");
  const grouped = SERVICES.reduce<Record<string, typeof SERVICES>>((acc, s) => {
    (acc[s.category] ||= []).push(s);
    return acc;
  }, {});

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[42rem] overflow-hidden bg-hero text-primary-foreground sm:min-h-[38rem] lg:min-h-[43rem]">
        <div className="absolute inset-0 overflow-hidden">
          <div className="hero-room-tour-frame">
            <img src={heroBg} alt="Современная квартира в Новосибирске после санитарной обработки — Дез-Федерация" title="Дез-Федерация — санитарная служба №1 в Новосибирске с 2019 года" className="hero-room-tour-media h-full w-full object-cover" loading="eager" fetchPriority="high" decoding="async" width={1920} height={1080} />
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-black/72 via-black/42 to-black/18" />
        <div className="hero-ambient-glow absolute inset-0 opacity-55" style={{ backgroundImage: "radial-gradient(circle at 14% 12%, oklch(0.72 0.16 32 / 0.24) 0%, transparent 36%), radial-gradient(circle at 78% 80%, oklch(0.62 0.18 228 / 0.26) 0%, transparent 44%), radial-gradient(circle at 58% 48%, rgba(255, 255, 255, 0.06) 0%, transparent 38%)" }} />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="container-x relative py-10 md:py-16 lg:py-20">
          <div className="flex max-w-3xl flex-col">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider backdrop-blur">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                </span>
                Бригады свободны · выезд за 60 минут
              </div>
            </Reveal>

            <WaveText
              as="h1"
              text="Санитарная служба №1 в Новосибирске"
              whole
              duration={5.2}
              className="on-dark mt-5 max-w-3xl font-display text-[34px] font-extrabold leading-[1.02] text-balance md:text-5xl lg:text-6xl"
            />

            <WaveSentences
              text="Уничтожаем клопов и тараканов, обрабатываем участки от клещей и комаров, удаляем плесень, делаем озонирование и срочную сушку после потопов. Работаем с 2019 года, лицензия Роспотребнадзора, гарантия по договору до 24 месяцев, безопасные для детей и животных препараты."
              className="mt-5 min-h-[9.5rem] max-w-xl text-[15px] font-medium leading-[1.75] md:min-h-[7rem] md:text-lg"
              startDelay={420}
              wordStep={195}
              sentencePause={720}
              highlights={{
                "озонирование": "ozone",
                "сушку": "ozone",
                "плесень": "nature",
                "безопасные": "nature",
                "детей": "nature",
                "животных": "nature",
                "гарантия": "warm",
                "лицензия": "warm",
              }}
            />

            <Reveal delay={350} className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <a
                href={SITE.phoneHref}
                onClick={() => trackGoal(GOALS.heroCallClick)}
                className="cta-shine inline-flex items-center justify-center gap-2 rounded-xl bg-cta-gradient px-5 py-4 font-bold text-accent-foreground shadow-cta transition hover:scale-[1.02]"
              >
                <Phone className="h-5 w-5" /> Позвонить · бесплатный осмотр
              </a>
              <LeadFormModal
                trigger={
                  <button
                    type="button"
                    onClick={() => trackGoal(GOALS.heroCalcClick)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-4 font-semibold backdrop-blur transition hover:bg-white/20"
                  >
                    Расчёт за 5 сек <ArrowRight className="h-4 w-4" />
                  </button>
                }
              />
            </Reveal>

            {/* Форма прямо на странице — без модального окна */}
            <div className="mt-6 max-w-xl rounded-2xl border border-white/15 bg-white/95 p-4 text-foreground shadow-elegant backdrop-blur md:p-5">
              <div className="font-display text-base font-bold">Рассчитать стоимость за 5 секунд</div>
              <p className="mt-1 text-xs text-muted-foreground">Оставьте телефон — перезвоним за 10 минут и назовём точную цену до выезда. Без спама, конфиденциально.</p>
              <div className="mt-3">
                <LeadForm variant="compact" goal="lead_hero_inline" formName="Главная — форма в первом экране" submitLabel="Узнать цену" />
              </div>
            </div>

            {/* Каналы связи */}
            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
              <a href={SITE.phoneHref} className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-2 font-semibold backdrop-blur hover:bg-white/20">
                <Phone className="h-4 w-4" /> {SITE.phone}
              </a>
              <a href={SITE.whatsappHref} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-2 font-semibold backdrop-blur hover:bg-white/20">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
              <a href={SITE.telegramHref} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-2 font-semibold backdrop-blur hover:bg-white/20">
                <Send className="h-4 w-4" /> Telegram {SITE.telegramHandle}
              </a>
              <a href={SITE.maxHref} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-2 font-semibold backdrop-blur hover:bg-white/20">
                <MessageSquare className="h-4 w-4" /> MAX
              </a>
            </div>

            <StatsRow />
          </div>
        </div>

        {/* ticker */}
        <div className="relative overflow-hidden border-t border-white/10 bg-black/15 py-2.5 mask-edge-r">
          <div className="animate-ticker flex shrink-0 gap-10 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
            {[...Array(2)].map((_, k) => (
              <span key={k} className="flex shrink-0 gap-10">
                <span>· Клопы за 1 визит</span>
                <span>· Тараканы — гарантия 12 мес.</span>
                <span>· Сушка после потопа 24/7</span>
                <span>· Озонирование без химии</span>
                <span>· Плесень — гарантия 24 мес.</span>
                <span>· Обработка участка от клещей</span>
                <span>· Лицензия Роспотребнадзора</span>
                <span>· Договор и акт на месте</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      <TrustStrip />

      {/* Priority services */}
      <section className="container-x py-14 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Reveal>
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">Приоритетные направления</div>
            <AnimatedHeading
              as="h2"
              text="Чаще всего вызывают по этим причинам"
              className="mt-2 max-w-2xl font-display text-3xl font-bold md:text-4xl text-balance"
            />
          </Reveal>
          <Link to="/services" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2">
            Все {SERVICES.length} услуг <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Mobile: horizontal scroll. Desktop: grid */}
        <div className="mt-8 -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 scroll-snap-x sm:hidden">
          {PRIORITY_SERVICES.map((s) => (
            <div key={s.slug} className="snap-card w-[78%] shrink-0">
              <ServiceCard service={s} />
            </div>
          ))}
        </div>
        <div className="mt-8 hidden gap-5 sm:grid sm:grid-cols-2 lg:grid-cols-3">
          {PRIORITY_SERVICES.map((s, i) => (
            <Reveal key={s.slug} delay={i * 80}>
              <ServiceCard service={s} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Why us */}
      <section className="bg-surface py-14 md:py-20">
        <div className="container-x">
          <Reveal className="max-w-3xl">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">Почему нас выбирают</div>
            <AnimatedHeading
              as="h2"
              text="7 причин довериться Дез-Федерации"
              highlight="Дез-Федерации"
              className="mt-2 font-display text-3xl font-bold md:text-4xl text-balance"
            />
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_US.map((w, i) => (
              <Reveal
                key={w.t}
                delay={i * 70}
                className={`group rounded-2xl border border-border bg-card p-5 shadow-card transition hover:-translate-y-1 hover:shadow-elegant ${
                  i === WHY_US.length - 1 ? "lg:col-span-3 lg:bg-secondary" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary transition group-hover:bg-cta-gradient group-hover:text-accent-foreground">
                    <w.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-display text-base font-bold">{w.t}</div>
                    <p className="mt-1 text-sm text-muted-foreground">{w.s}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="container-x py-14 md:py-20">
        <Reveal className="text-center">
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">Как мы работаем</div>
          <AnimatedHeading
            as="h2"
            text="От заявки до гарантии за 60 минут"
            highlight="60"
            className="mx-auto mt-2 max-w-2xl font-display text-3xl font-bold md:text-4xl text-balance"
          />
        </Reveal>

        <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {TIMELINE.map((st, i) => (
            <Reveal key={st.t} delay={i * 90}>
              <div className="h-full rounded-xl border border-border bg-card p-3.5 shadow-card md:p-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cta-gradient text-accent-foreground">
                    <st.icon className="h-4 w-4" />
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary">{st.min}</span>
                </div>
                <div className="mt-2.5 font-display text-sm font-bold leading-tight md:text-base">{st.t}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{st.s}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Видео работ */}
      <section className="container-x py-14 md:py-20">
        <Reveal>
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">Видео с объектов</div>
          <AnimatedHeading
            as="h2"
            text="Смотрите, как проходит обработка"
            highlight="обработка"
            className="mt-2 max-w-2xl font-display text-3xl font-bold md:text-4xl text-balance"
          />
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Реальные съёмки с выездов: горячий туман по спальным местам, кухня от тараканов, участок от клещей и комаров.
          </p>
        </Reveal>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {WORK_VIDEOS.slice(0, 3).map((v, i) => (
            <Reveal key={v.slug} delay={i * 80}>
              <VideoCard video={v} />
            </Reveal>
          ))}
        </div>
        <Link to="/video" className="mt-8 inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 font-semibold hover:bg-secondary">
          Все видео работ <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* Photo gallery */}
      <section className="bg-surface py-14 md:py-20">
        <div className="container-x">
          <Reveal>
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">Как это выглядит</div>
            <AnimatedHeading
              as="h2"
              text="Реальные фото с объектов в Новосибирске"
              highlight="Реальные"
              className="mt-2 max-w-2xl font-display text-3xl font-bold md:text-4xl text-balance"
            />
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {GALLERY.map((g, i) => (
              <Reveal key={i} delay={i * 70} variant="scale" className={`relative overflow-hidden rounded-2xl ${i === 0 ? "col-span-2 row-span-2 aspect-square md:aspect-[4/3]" : "aspect-square"} group`}>
                <img src={g} alt={GALLERY_META[i]?.alt ?? `Работа санитарной службы Дез-Федерация — кадр ${i + 1}`} title={GALLERY_META[i]?.title ?? "Дез-Федерация — выезд день в день по Новосибирску"} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* All services list */}
      <section className="bg-surface py-14 md:py-20">
        <div className="container-x">
          <Reveal className="text-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">Каталог</div>
            <AnimatedHeading
              as="h2"
              text={`${SERVICES.length} направлений санитарной обработки`}
              highlight={String(SERVICES.length)}
              className="mx-auto mt-2 max-w-2xl font-display text-3xl font-bold md:text-4xl text-balance"
            />
          </Reveal>

          <div className="mt-8 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-center">
            {Object.keys(grouped).map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`inline-flex items-center justify-center rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                  cat === c
                    ? "border-primary bg-primary text-primary-foreground shadow-card"
                    : "border-border bg-card text-foreground/70 hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {CATEGORY_LABEL[c]} <span className={cat === c ? "opacity-70" : "text-muted-foreground"}>· {grouped[c].length}</span>
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {grouped[cat]?.map((s, i) => (
              <Reveal key={s.slug} delay={i * 50}>
                <Link
                  to="/services/$slug"
                  params={{ slug: s.slug }}
                  className="group flex h-full items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3.5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card"
                >
                  <span className="flex items-center gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-primary transition group-hover:bg-cta-gradient group-hover:text-accent-foreground">
                      <s.icon className="h-4 w-4" />
                    </span>
                    <span className="font-medium text-sm">{s.title}</span>
                  </span>
                  <span className="text-xs font-bold text-muted-foreground group-hover:text-primary">от {s.priceFrom.toLocaleString("ru-RU")} ₽</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* GEO */}
      <section className="container-x py-14 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <Reveal>
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">География выездов</div>
            <AnimatedHeading
              as="h2"
              text="Работаем по всему Новосибирску и области"
              highlight="всему"
              className="mt-2 font-display text-3xl font-bold md:text-4xl text-balance"
            />
            <p className="mt-4 text-muted-foreground">
              Выезжаем в любой район города и пригороды — бесплатно, в течение 60 минут. По области — в день обращения.
            </p>
            <a href={SITE.phoneHref} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-elegant transition hover:scale-[1.02]">
              <Phone className="h-4 w-4" /> Уточнить выезд
            </a>
          </Reveal>

          <div>
            <Reveal delay={120}>
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Районы Новосибирска</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {DISTRICTS.map((d, i) => (
                  <Link
                    key={d.slug}
                    to="/raion/$slug"
                    params={{ slug: d.slug }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <MapPin className="h-3.5 w-3.5 text-primary" /> {d.name}
                  </Link>
                ))}
              </div>
            </Reveal>
            <Reveal delay={200} className="mt-6">
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Область</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {GEO_AREA_SLUGS.map((slug) => {
                  const c = CITIES.find((x) => x.slug === slug);
                  if (!c) return null;
                  return (
                    <Link
                      key={c.slug}
                      to="/gorod/$slug"
                      params={{ slug: c.slug }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-sm transition hover:-translate-y-0.5 hover:border-accent hover:text-accent"
                    >
                      <MapPin className="h-3.5 w-3.5 text-accent" /> {c.name}
                    </Link>
                  );
                })}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="bg-surface py-14 md:py-20">
        <div className="container-x">
          <Reveal className="text-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">Отзывы клиентов</div>
            <AnimatedHeading
              as="h2"
              text="Что говорят жители Новосибирска"
              className="mt-2 font-display text-3xl font-bold md:text-4xl text-balance"
            />
            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span className="flex gap-0.5 text-accent">
                {Array.from({ length: 5 }).map((_, i) => (<Star key={i} className="h-4 w-4 fill-current" />))}
              </span>
              {SITE.rating.value} из 5 · {SITE.rating.count} отзывов
            </div>
          </Reveal>

          {/* Mobile carousel / desktop grid */}
          <div className="mt-8 -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 scroll-snap-x md:hidden">
            {REVIEWS.map((r) => (
              <div key={r.n} className="snap-card w-[85%] shrink-0 rounded-2xl border border-border bg-card p-5 shadow-card">
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5 text-accent">{Array.from({ length: 5 }).map((_, i) => (<Star key={i} className="h-3.5 w-3.5 fill-current" />))}</div>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">{r.tag}</span>
                </div>
                <Quote className="mt-3 h-5 w-5 text-primary/30" />
                <p className="mt-2 text-sm text-foreground/90">{r.t}</p>
                <div className="mt-4 text-xs font-semibold text-muted-foreground">{r.n}</div>
              </div>
            ))}
          </div>
          <div className="mt-8 hidden gap-5 md:grid md:grid-cols-3">
            {REVIEWS.slice(0, 3).map((r, i) => (
              <Reveal key={r.n} delay={i * 100} className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5 text-accent">{Array.from({ length: 5 }).map((_, i2) => (<Star key={i2} className="h-4 w-4 fill-current" />))}</div>
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">{r.tag}</span>
                </div>
                <Quote className="mt-3 h-5 w-5 text-primary/30" />
                <p className="mt-2 text-sm text-foreground/90">{r.t}</p>
                <div className="mt-4 text-xs font-semibold text-muted-foreground">{r.n}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Documents */}
      <section className="container-x py-14 md:py-20">
        <Reveal>
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">Документы и допуски</div>
          <AnimatedHeading
            as="h2"
            text="Работаем официально и прозрачно"
            highlight="официально"
            className="mt-2 max-w-2xl font-display text-3xl font-bold md:text-4xl text-balance"
          />
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DOCS.map((d, i) => (
            <Reveal key={d.t} delay={i * 90} className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-primary/5" />
              <Award className="h-7 w-7 text-primary" />
              <div className="mt-3 font-display text-base font-bold">{d.t}</div>
              <div className="mt-1 text-sm text-muted-foreground">{d.s}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* B2B */}
      <section className="bg-surface py-14 md:py-20">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <Building2 className="h-3.5 w-3.5" /> Для юрлиц
            </div>
            <AnimatedHeading
              as="h2"
              text="Заключаем договоры с бизнесом"
              highlight="договоры"
              className="mt-3 font-display text-3xl font-bold md:text-4xl text-balance"
            />
            <p className="mt-4 text-muted-foreground">
              Работаем с кафе, школами, магазинами, ТСЖ и УК по СанПиН: журнал, счёт-фактура, акт и сертификат на каждый выезд. По договору — фиксированная цена на год и приоритетный выезд.
            </p>
            <Link to="/contacts" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-elegant hover:scale-[1.02] transition">
              Заключить договор <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>

          <div className="grid gap-3 sm:grid-cols-2">
            {B2B.map((b, i) => (
              <Reveal key={b.t} delay={i * 70} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                  <div>
                    <div className="font-display font-bold">{b.t}</div>
                    <div className="mt-0.5 text-sm text-muted-foreground">{b.s}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-x py-14 md:py-20">
        <div className="relative overflow-hidden rounded-3xl bg-hero p-6 text-primary-foreground md:p-14">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute -left-10 bottom-0 h-72 w-72 rounded-full bg-primary-glow/30 blur-3xl" />
          <div className="relative max-w-2xl">
            <AnimatedHeading
              as="h2"
              text="Закажите выезд бесплатно — оплата после обработки"
              highlight="бесплатно"
              className="font-display text-3xl font-bold md:text-4xl text-balance"
            />
            <p className="mt-3 text-white/85">Фиксируем цену до выезда. Если обработка не помогла — приезжаем повторно бесплатно по условиям договора.</p>
            <ul className="mt-5 space-y-2 text-sm text-white/90">
              {["Договор и чек на месте","Безопасно для детей и животных","Работаем с физлицами и юрлицами","Оплата наличными, картой, СБП или безналом"].map((t, i) => (
                <Reveal key={t} delay={i * 80} as="li" className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-accent" />{t}
                </Reveal>
              ))}
            </ul>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <LeadFormModal
                trigger={
                  <button
                    type="button"
                    className="cta-shine inline-flex items-center justify-center gap-2 rounded-xl bg-cta-gradient px-6 py-4 font-bold text-accent-foreground shadow-cta transition hover:scale-[1.02]"
                  >
                    Получить расчёт за 5 сек <ArrowRight className="h-4 w-4" />
                  </button>
                }
              />
              <a
                href={SITE.phoneHref}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-4 font-semibold backdrop-blur hover:bg-white/20"
              >
                <Phone className="h-5 w-5" /> {SITE.phone}
              </a>
            </div>
          </div>
        </div>
      </section>

      <FAQ items={HOME_FAQ} />

      <section className="bg-surface py-14">
        <div className="container-x">
          <h2 className="font-display text-2xl font-bold md:text-3xl">Работаем по всей Новосибирской области</h2>
          <p className="mt-3 max-w-3xl text-muted-foreground">Выезжаем из Новосибирска ежедневно — специалисты с оборудованием обслуживают города-спутники и районы области. Цены и гарантии — как в Новосибирске.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {CITIES.map((c) => (
              <Link key={c.slug} to="/gorod/$slug" params={{ slug: c.slug }} className="group rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elegant">
                <div className="font-display text-lg font-bold group-hover:text-primary">{c.name}</div>
                <div className="mt-1 text-xs text-muted-foreground">{c.distanceKm} км · ~{c.travelMin} мин</div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
