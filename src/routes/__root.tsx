import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Toaster } from "@/components/ui/sonner";
import { SITE } from "@/data/site";
import { initLeadQueue } from "@/lib/leadSender";

// Короткий статичный список — чтобы 404-страница не тянула весь каталог услуг
// (68 КБ) в бандл, который грузится на каждой странице.
const TOP_SERVICES = [
  { slug: "unichtozhenie-klopov", title: "Уничтожение клопов", priceFrom: 1900 },
  { slug: "unichtozhenie-tarakanov", title: "Уничтожение тараканов", priceFrom: 1900 },
  { slug: "deratizaciya", title: "Дератизация (мыши, крысы)", priceFrom: 2500 },
  { slug: "dezinfekciya", title: "Дезинфекция помещений", priceFrom: 1500 },
];

const ORG_GRAPH = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE.domain}#organization`,
      name: SITE.name,
      alternateName: ["Дез-Федерация", "Дез Федерация", "Dez-Federation"],
      url: SITE.domain,
      logo: `${SITE.domain}/logo.png`,
      email: SITE.email,
      telephone: SITE.phone,
      foundingDate: `${SITE.founded}-01-01`,
      slogan: "Санитарная служба №1 в Новосибирске",
      description: "Профессиональная санитарная служба в Новосибирске: дезинсекция, дератизация, обработка от плесени, озонирование, сушка после потопов. Лицензия Роспотребнадзора, гарантия по договору до 24 месяцев.",
      numberOfEmployees: { "@type": "QuantitativeValue", value: 28 },
      knowsAbout: [
        "Дезинсекция", "Дератизация", "Дезинфекция",
        "Уничтожение клопов", "Уничтожение тараканов", "Уничтожение блох",
        "Обработка от плесени", "Озонирование помещений",
        "Сушка после затопления", "Обработка участков от клещей",
        "Фумигация зерна", "Уничтожение борщевика", "Дезодорация",
      ],
      sameAs: [SITE.social.telegram, SITE.social.max],
      address: {
        "@type": "PostalAddress",
        addressCountry: "RU",
        addressRegion: SITE.region,
        addressLocality: SITE.city,
        streetAddress: SITE.address,
      },
      contactPoint: [{
        "@type": "ContactPoint",
        telephone: SITE.phone,
        contactType: "customer service",
        areaServed: "RU-NVS",
        availableLanguage: ["Russian"],
        hoursAvailable: { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], opens: "07:00", closes: "23:00" },
      }],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE.domain}#website`,
      url: SITE.domain,
      name: SITE.name,
      inLanguage: "ru-RU",
      publisher: { "@id": `${SITE.domain}#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${SITE.domain}/?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "LocalBusiness",
      "@id": `${SITE.domain}#localbusiness`,
      name: SITE.name,
      image: `${SITE.domain}/og/default.jpg`,
      url: SITE.domain,
      telephone: SITE.phone,
      email: SITE.email,
      priceRange: "1500–25000 RUB",
      address: {
        "@type": "PostalAddress",
        addressCountry: "RU",
        addressRegion: SITE.region,
        addressLocality: SITE.city,
        streetAddress: SITE.address,
      },
      geo: { "@type": "GeoCoordinates", latitude: SITE.geo.lat, longitude: SITE.geo.lng },
      openingHoursSpecification: [{
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
        opens: "07:00", closes: "23:00",
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
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: SITE.rating.value,
        reviewCount: SITE.rating.count,
        bestRating: "5",
        worstRating: "1",
      },
    },
  ],
};

function NotFoundComponent() {
  const top = TOP_SERVICES;
  return (
    <div className="container-x flex min-h-[70vh] flex-col items-center justify-center py-12 text-center">
      <div className="max-w-md">
        <h1 className="font-display text-7xl font-extrabold text-primary">404</h1>
        <h2 className="mt-4 font-display text-xl font-bold">Страница не найдена</h2>
        <p className="mt-2 text-sm text-muted-foreground">Возможно, страница была перенесена. Проверьте адрес или вернитесь на главную.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-accent-gradient px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-accent">На главную</Link>
          <Link to="/services" className="inline-flex items-center justify-center rounded-md border border-input px-5 py-2.5 text-sm font-semibold">Все услуги</Link>
          <Link to="/contacts" className="inline-flex items-center justify-center rounded-md border border-input px-5 py-2.5 text-sm font-semibold">Контакты</Link>
        </div>
      </div>
      <div className="mt-10 w-full max-w-3xl">
        <div className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Популярные услуги</div>
        <div className="grid gap-3 sm:grid-cols-2">
          {top.map((s) => (
            <Link key={s.slug} to="/services/$slug" params={{ slug: s.slug }} className="rounded-xl border border-border bg-card p-4 text-left hover:border-primary/40 hover:shadow-card">
              <div className="font-display text-sm font-bold">{s.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">от {s.priceFrom.toLocaleString("ru-RU")} ₽</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-xl font-bold">Что-то пошло не так</h1>
        <p className="mt-2 text-sm text-muted-foreground">Попробуйте обновить страницу или вернитесь на главную.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >Повторить</button>
          <a href="/" className="inline-flex items-center justify-center rounded-md border border-input px-4 py-2 text-sm font-medium">На главную</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "format-detection", content: "telephone=no" },
      { name: "robots", content: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" },
      { name: "theme-color", content: "#0F4A7A" },
      { title: `${SITE.name} — санитарная служба в Новосибирске` },
      { name: "description", content: "Дезинфекция, дератизация, обработка от клопов, тараканов, плесени, озонирование и сушка после потопов в Новосибирске. Выезд за 60 минут, гарантия по договору, лицензия Роспотребнадзора." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: SITE.name },
      { property: "og:locale", content: "ru_RU" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: `${SITE.name} — санитарная служба в Новосибирске` },
      { name: "twitter:title", content: `${SITE.name} — санитарная служба в Новосибирске` },
      { property: "og:description", content: "Дезинфекция, дератизация, обработка от клопов, тараканов, плесени, озонирование и сушка после потопов в Новосибирске. Выезд за 60 минут, гарантия по договору, лицензия Роспотребнадзора." },
      { name: "twitter:description", content: "Дезинфекция, дератизация, обработка от клопов, тараканов, плесени, озонирование и сушка после потопов в Новосибирске. Выезд за 60 минут, гарантия по договору, лицензия Роспотребнадзора." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      // Шрифты лежат на нашем сервере: первый экран не зависит от сторонних доменов.
      { rel: "preload", as: "font", type: "font/woff2", href: "/fonts/inter-400-cyrillic.woff2", crossOrigin: "anonymous" },
      { rel: "preload", as: "font", type: "font/woff2", href: "/fonts/manrope-600-cyrillic.woff2", crossOrigin: "anonymous" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
      { rel: "icon", href: "/favicon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(ORG_GRAPH) },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <HeadContent />
      </head>
      <body>
        {/* Аварийные контакты: показываются только если приложение не поднялось. */}
        <div
          id="emergency-contacts"
          style={{ display: "none", position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 2147483647, background: "#0F4A7A", color: "#fff", padding: "12px 16px", font: "16px/1.4 system-ui, sans-serif", textAlign: "center" }}
        >
          Страница загружается дольше обычного.{" "}
          <a href={SITE.phoneHref} style={{ color: "#fff", fontWeight: 700 }}>Позвонить {SITE.phone}</a>
          {" · "}
          <a href={SITE.telegramHref} style={{ color: "#fff", fontWeight: 700 }}>Telegram {SITE.telegramHandle}</a>
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html:
              'setTimeout(function(){try{var m=document.querySelector("main");if(!m||m.offsetHeight<40){var e=document.getElementById("emergency-contacts");if(e)e.style.display="block";}}catch(x){}},8000);',
          }}
        />
        {children}
        <Scripts />
        <noscript>
          <div>
            <img src="https://mc.yandex.ru/watch/110968995" style={{ position: "absolute", left: "-9999px" }} alt="" />
          </div>
        </noscript>
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useEffect(() => {
    initLeadQueue();
  }, []);
  // Метрику подключаем после отрисовки — mc.yandex.ru не влияет на первый экран.
  useEffect(() => {
    const start = () => {
      const w = window as unknown as Record<string, any>;
      if (w.__ymLoaded) return;
      w.__ymLoaded = true;
      const src = "https://mc.yandex.ru/metrika/tag.js?id=110968995";
      w.ym =
        w.ym ||
        function (...args: unknown[]) {
          (w.ym.a = w.ym.a || []).push(args);
        };
      w.ym.l = Date.now();
      const s = document.createElement("script");
      s.async = true;
      s.src = src;
      document.head.appendChild(s);
      w.ym(110968995, "init", {
        ssr: true,
        webvisor: true,
        clickmap: true,
        ecommerce: "dataLayer",
        referrer: document.referrer,
        url: location.href,
        accurateTrackBounce: true,
        trackLinks: true,
      });
    };
    const w = window as unknown as { requestIdleCallback?: (cb: () => void, o?: unknown) => number };
    if (typeof w.requestIdleCallback === "function") w.requestIdleCallback(start, { timeout: 3000 });
    else setTimeout(start, 1200);
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <Toaster richColors position="top-right" />
      </div>
    </QueryClientProvider>
  );
}
