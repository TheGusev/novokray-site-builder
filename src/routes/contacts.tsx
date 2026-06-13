import { createFileRoute } from "@tanstack/react-router";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import { SITE } from "@/data/site";
import { COMMON } from "@/data/images";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { LeadForm } from "@/components/site/LeadForm";
import { Reveal } from "@/components/site/Reveal";
import { WaveText } from "@/components/site/WaveText";

export const Route = createFileRoute("/contacts")({
  head: () => ({
    meta: [
      { title: `Контакты Дез-Федерация — телефон, адрес, реквизиты в Новосибирске` },
      { name: "description", content: `Телефон ${SITE.phone}, email ${SITE.email}, адрес: ${SITE.address}. Санитарная служба Дез-Федерация в Новосибирске — ежедневно 07:00–23:00.` },
      { property: "og:title", content: "Контакты Дез-Федерация" },
      { property: "og:description", content: `Связаться с санитарной службой в Новосибирске: ${SITE.phone}` },
      { property: "og:url", content: "/contacts" },
    ],
    links: [{ rel: "canonical", href: "/contacts" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "ContactPage",
            name: `Контакты ${SITE.name}`,
            url: `${SITE.domain}/contacts`,
            inLanguage: "ru-RU",
            mainEntity: { "@id": `${SITE.domain}#localbusiness` },
            speakable: { "@type": "SpeakableSpecification", cssSelector: [".speakable", "address"] },
          },
          {
            "@type": "LocalBusiness",
            "@id": `${SITE.domain}#localbusiness`,
            name: SITE.name,
            alternateName: SITE.shortName,
            url: `${SITE.domain}/contacts`,
            telephone: SITE.phone,
            email: SITE.email,
            image: `${SITE.domain}/logo.png`,
            logo: `${SITE.domain}/logo.png`,
            priceRange: "₽₽",
            address: {
              "@type": "PostalAddress",
              streetAddress: "Красный проспект, 28, офис 412",
              addressLocality: SITE.city,
              addressRegion: SITE.region,
              postalCode: "630099",
              addressCountry: "RU",
            },
            geo: { "@type": "GeoCoordinates", latitude: SITE.geo.lat, longitude: SITE.geo.lng },
            openingHoursSpecification: [{
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
              opens: "07:00",
              closes: "23:00",
            }],
            contactPoint: [{
              "@type": "ContactPoint",
              telephone: SITE.phone,
              contactType: "customer service",
              areaServed: "RU-NVS",
              availableLanguage: ["ru"],
            }],
            areaServed: [
              { "@type": "City", name: "Новосибирск" },
              { "@type": "AdministrativeArea", name: SITE.region },
              { "@type": "City", name: "Бердск" },
              { "@type": "City", name: "Искитим" },
              { "@type": "City", name: "Кольцово" },
              { "@type": "City", name: "Краснообск" },
              { "@type": "City", name: "Обь" },
            ],
            sameAs: [SITE.social.telegram, SITE.social.max],
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: SITE.rating.value,
              reviewCount: SITE.rating.count,
              bestRating: "5",
            },
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Главная", item: SITE.domain + "/" },
              { "@type": "ListItem", position: 2, name: "Контакты", item: SITE.domain + "/contacts" },
            ],
          },
        ],
      }),
    }],
  }),
  component: ContactsPage,
});

function ContactsPage() {
  const cities = ["Новосибирск", "Бердск", "Искитим", "Кольцово", "Краснообск", "Обь", "Мочище", "Криводановка", "Толмачёво", "Барышево", "Линёво", "Каменка", "Сузун"];
  return (
    <>
      <Breadcrumbs items={[{ label: "Главная", to: "/" }, { label: "Контакты" }]} />
      <section className="relative overflow-hidden bg-hero text-primary-foreground">
        <img src={COMMON.office} alt="Контакты Дез-Федерация — офис и диспетчерская в Новосибирске" title="Связаться с Дез-Федерация: телефон, мессенджеры, форма заявки" className="absolute inset-0 h-full w-full object-cover opacity-25" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/55 via-black/20 to-transparent" />
        <div className="container-x relative py-12 md:py-16">
          <h1 className="font-display text-3xl font-extrabold md:text-5xl"><WaveText className="on-dark" text="Контакты санитарной службы" duration={4} /></h1>
          <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-white/90 md:text-lg">
            Связаться с Дез-Федерацией в Новосибирске можно по телефону, в WhatsApp или Telegram, по email или через форму ниже. Работаем ежедневно с 07:00 до 23:00, аварийные службы — сушка после потопов — круглосуточно. По юрлицам — отдельный менеджер на договорное обслуживание.
          </p>
        </div>
      </section>

      <section className="container-x py-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr,1fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            <Reveal>
              <a href={SITE.phoneHref} className="flex gap-4 rounded-2xl border border-border bg-card p-6 shadow-card transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant">
                <Phone className="mt-1 h-6 w-6 text-primary" />
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Телефон</div>
                  <div className="font-display text-lg font-bold">{SITE.phone}</div>
                  <div className="text-xs text-muted-foreground">{SITE.hours}</div>
                </div>
              </a>
            </Reveal>
            <Reveal delay={80}>
              <a href={SITE.whatsappHref} className="flex gap-4 rounded-2xl border border-border bg-card p-6 shadow-card transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant">
                <MessageCircle className="mt-1 h-6 w-6 text-success" />
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">WhatsApp / Telegram</div>
                  <div className="font-display text-lg font-bold">{SITE.whatsapp}</div>
                  <div className="text-xs text-muted-foreground">Отвечаем в течение 15 минут</div>
                </div>
              </a>
            </Reveal>
            <Reveal delay={160}>
              <a href={SITE.emailHref} className="flex gap-4 rounded-2xl border border-border bg-card p-6 shadow-card transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant">
                <Mail className="mt-1 h-6 w-6 text-primary" />
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Email</div>
                  <div className="font-display text-lg font-bold">{SITE.email}</div>
                  <div className="text-xs text-muted-foreground">Договоры, счета, документы</div>
                </div>
              </a>
            </Reveal>
            <Reveal delay={240} className="flex gap-4 rounded-2xl border border-border bg-card p-6 shadow-card">
              <MapPin className="mt-1 h-6 w-6 text-primary" />
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Офис</div>
                <div className="font-display text-base font-bold">{SITE.address}</div>
                <div className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5" />{SITE.hours}</div>
              </div>
            </Reveal>
            <Reveal delay={320} className="sm:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="font-display text-lg font-bold">Реквизиты</div>
              <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                <div><dt className="text-muted-foreground">Наименование</dt><dd className="font-medium">{SITE.legal.name}</dd></div>
                <div><dt className="text-muted-foreground">ИНН</dt><dd className="font-medium">{SITE.legal.inn}</dd></div>
                <div><dt className="text-muted-foreground">ОГРН</dt><dd className="font-medium">{SITE.legal.ogrn}</dd></div>
                <div><dt className="text-muted-foreground">Юридический адрес</dt><dd className="font-medium">{SITE.legal.legalAddress}</dd></div>
                <div className="sm:col-span-2"><dt className="text-muted-foreground">Лицензия Роспотребнадзора</dt><dd className="font-medium">№ {SITE.legal.licenseNo} от {SITE.legal.licenseDate} · ЕРУЛ № {SITE.legal.licenseErul}</dd></div>
                <div className="sm:col-span-2"><dt className="text-muted-foreground">Орган, выдавший лицензию</dt><dd className="font-medium">{SITE.legal.licenseAuthority}</dd></div>
              </dl>
            </Reveal>
          </div>
          <div>
            <LeadForm title="Написать в офис" subtitle="Опишите задачу — ответим с расчётом и сроками." />
          </div>
        </div>
      </section>

      <section className="container-x py-14">
        <Reveal>
          <h2 className="font-display text-2xl font-bold md:text-3xl">География выезда</h2>
          <p className="mt-3 max-w-3xl text-muted-foreground">Выезжаем по Новосибирску бесплатно и по всей Новосибирской области с минимальной доплатой за расстояние. По заказам от 6 000 ₽ выезд по области — также бесплатно.</p>
        </Reveal>
        <div className="mt-6 flex flex-wrap gap-2">
          {cities.map((c, i) => (
            <Reveal key={c} delay={i * 30} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm shadow-card">
              <MapPin className="h-3.5 w-3.5 text-primary" /> {c}
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
