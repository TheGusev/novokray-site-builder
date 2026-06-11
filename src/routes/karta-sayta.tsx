import { createFileRoute, Link } from "@tanstack/react-router";
import { SERVICES } from "@/data/services";
import { POSTS } from "@/data/blog";
import { SITE } from "@/data/site";
import { CITIES } from "@/data/cities";
import { DISTRICTS } from "@/data/districts";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";

const HUBS = [
  { slug: "unichtozhenie-vrediteley", label: "Уничтожение вредителей" },
  { slug: "sanitarnaya-obrabotka", label: "Санитарная обработка" },
  { slug: "obrabotka-uchastkov", label: "Обработка участков" },
  { slug: "spec-uslugi", label: "Спец. услуги" },
];

const MAIN_SECTIONS: { to: string; label: string; desc: string }[] = [
  { to: "/", label: "Главная", desc: "Санитарная служба №1 в Новосибирске" },
  { to: "/services", label: "Все услуги", desc: "Полный каталог из 13 услуг" },
  { to: "/price", label: "Цены", desc: "Прайс-лист и калькулятор" },
  { to: "/o-kompanii", label: "О компании", desc: "О нас, лицензии, команда" },
  { to: "/garantii", label: "Гарантии", desc: "Договор, гарантия и сертификаты" },
  { to: "/contacts", label: "Контакты", desc: "Адрес, телефон, реквизиты" },
  { to: "/faq", label: "Вопросы и ответы", desc: "Часто задаваемые вопросы" },
  { to: "/blog", label: "Блог", desc: "Полезные статьи о дезинфекции" },
  { to: "/category/dezinfekciya-novosibirsk", label: "Дезинфекция в Новосибирске", desc: "Категория услуг по городу" },
  { to: "/privacy", label: "Политика конфиденциальности", desc: "Обработка персональных данных" },
  { to: "/terms", label: "Пользовательское соглашение", desc: "Условия использования сайта" },
];

export const Route = createFileRoute("/karta-sayta")({
  component: SiteMapPage,
  head: () => ({
    meta: [
      { title: "Карта сайта — Дез-Федерация.ру" },
      { name: "description", content: "Полный список разделов сайта Дез-Федерация.ру: услуги, цены, блог, контакты и информация о компании." },
      { property: "og:title", content: "Карта сайта — Дез-Федерация.ру" },
      { property: "og:description", content: "Все страницы и разделы сайта в одном месте." },
      { property: "og:url", content: "/karta-sayta" },
    ],
    links: [{ rel: "canonical", href: "/karta-sayta" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Главная", item: SITE.domain + "/" },
              { "@type": "ListItem", position: 2, name: "Карта сайта", item: `${SITE.domain}/karta-sayta` },
            ],
          },
          {
            "@type": "SiteNavigationElement",
            name: MAIN_SECTIONS.map((s) => s.label),
            url: MAIN_SECTIONS.map((s) => `${SITE.domain}${s.to}`),
          },
        ],
      }),
    }],
  }),
});

function SiteMapPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Главная", to: "/" }, { label: "Карта сайта" }]} />
      <main className="container-x pb-20">
        <header className="mb-10">
          <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">Карта сайта</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Полный список разделов и страниц Дез-Федерация.ру. Если что-то не нашли — позвоните{" "}
            <a href={SITE.phoneHref} className="text-primary hover:underline">{SITE.phone}</a>.
          </p>
        </header>

        <div className="grid gap-10 md:grid-cols-2">
          <section aria-labelledby="sm-main">
            <h2 id="sm-main" className="mb-4 font-display text-xl font-bold">Основные разделы</h2>
            <ul className="space-y-3">
              {MAIN_SECTIONS.map((s) => (
                <li key={s.to} className="rounded-lg border border-border bg-card p-3">
                  <Link to={s.to} className="font-medium text-foreground hover:text-primary">{s.label}</Link>
                  <div className="mt-0.5 text-sm text-muted-foreground">{s.desc}</div>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="sm-services">
            <h2 id="sm-services" className="mb-4 font-display text-xl font-bold">Услуги ({SERVICES.length})</h2>
            <div className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Категории</div>
            <ul className="mb-4 grid grid-cols-2 gap-2">
              {HUBS.map((h) => (
                <li key={h.slug}>
                  <Link to="/uslugi/$slug" params={{ slug: h.slug }} className="text-primary hover:underline">{h.label}</Link>
                </li>
              ))}
            </ul>
            <ul className="space-y-2">
              {SERVICES.map((s) => (
                <li key={s.slug} className="flex items-baseline justify-between gap-3 border-b border-border/60 py-2">
                  <Link to="/services/$slug" params={{ slug: s.slug }} className="text-foreground hover:text-primary">
                    {s.title}
                  </Link>
                  <span className="shrink-0 text-xs text-muted-foreground">от&nbsp;{s.priceFrom.toLocaleString("ru-RU")}&nbsp;₽</span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="sm-cities" className="md:col-span-2">
            <h2 id="sm-cities" className="mb-4 font-display text-xl font-bold">Города области ({CITIES.length})</h2>
            <ul className="grid gap-2 md:grid-cols-2">
              {CITIES.map((c) => (
                <li key={c.slug} className="flex items-baseline justify-between gap-3 border-b border-border/60 py-2">
                  <Link to="/gorod/$slug" params={{ slug: c.slug }} className="text-foreground hover:text-primary">
                    Санитарная служба {c.prepositional}
                  </Link>
                  <span className="shrink-0 text-xs text-muted-foreground">{c.distanceKm} км</span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="sm-districts" className="md:col-span-2">
            <h2 id="sm-districts" className="mb-4 font-display text-xl font-bold">Районы Новосибирска ({DISTRICTS.length})</h2>
            <ul className="grid gap-2 md:grid-cols-2">
              {DISTRICTS.map((d) => (
                <li key={d.slug} className="flex items-baseline justify-between gap-3 border-b border-border/60 py-2">
                  <Link to="/raion/$slug" params={{ slug: d.slug }} className="text-foreground hover:text-primary">
                    Санитарная служба {d.prepositional}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="sm-blog" className="md:col-span-2">
            <h2 id="sm-blog" className="mb-4 font-display text-xl font-bold">Блог ({POSTS.length} статей)</h2>
            <ul className="grid gap-2 md:grid-cols-2">
              {POSTS.map((p) => (
                <li key={p.slug} className="flex items-baseline justify-between gap-3 border-b border-border/60 py-2">
                  <Link to="/blog/$slug" params={{ slug: p.slug }} className="text-foreground hover:text-primary">
                    {p.title}
                  </Link>
                  <time dateTime={p.date} className="shrink-0 text-xs text-muted-foreground">{p.date}</time>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="sm-tech" className="md:col-span-2">
            <h2 id="sm-tech" className="mb-4 font-display text-xl font-bold">Для роботов и AI</h2>
            <ul className="space-y-2 text-sm">
              <li><a href="/sitemap.xml" className="text-primary hover:underline">/sitemap.xml</a> — XML-карта для поисковых систем</li>
              <li><a href="/robots.txt" className="text-primary hover:underline">/robots.txt</a> — правила индексации</li>
              <li><a href="/llms.txt" className="text-primary hover:underline">/llms.txt</a> — краткая выжимка для ИИ</li>
              <li><a href="/llms-full.txt" className="text-primary hover:underline">/llms-full.txt</a> — полная база знаний для ИИ</li>
            </ul>
          </section>
        </div>
      </main>
    </>
  );
}