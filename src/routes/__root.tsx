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

const ORG_GRAPH = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE.domain}#organization`,
      name: SITE.name,
      url: SITE.domain,
      logo: `${SITE.domain}/logo.png`,
      email: SITE.email,
      telephone: SITE.phone,
      foundingDate: `${SITE.founded}-01-01`,
      sameAs: [SITE.social.vk, SITE.social.telegram],
      address: {
        "@type": "PostalAddress",
        addressCountry: "RU",
        addressRegion: SITE.region,
        addressLocality: SITE.city,
        streetAddress: SITE.address,
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE.domain}#website`,
      url: SITE.domain,
      name: SITE.name,
      inLanguage: "ru-RU",
      publisher: { "@id": `${SITE.domain}#organization` },
    },
    {
      "@type": "LocalBusiness",
      "@id": `${SITE.domain}#localbusiness`,
      name: SITE.name,
      image: `${SITE.domain}/og/default.jpg`,
      url: SITE.domain,
      telephone: SITE.phone,
      email: SITE.email,
      priceRange: "₽₽",
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
      areaServed: { "@type": "AdministrativeArea", name: SITE.region },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: SITE.rating.value,
        reviewCount: SITE.rating.count,
      },
    },
  ],
};

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-extrabold text-primary">404</h1>
        <h2 className="mt-4 font-display text-xl font-bold">Страница не найдена</h2>
        <p className="mt-2 text-sm text-muted-foreground">Возможно, страница была перенесена. Проверьте адрес или вернитесь на главную.</p>
        <Link to="/" className="mt-6 inline-flex items-center justify-center rounded-md bg-accent-gradient px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-accent">
          На главную
        </Link>
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
      { title: `${SITE.name} — Санитарная служба №1 в Новосибирске` },
      { name: "description", content: "Дезинфекция, дератизация, обработка от клопов, тараканов, плесени, озонирование и сушка после потопов в Новосибирске. Выезд за 60 минут, гарантия по договору, лицензия Роспотребнадзора." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: SITE.name },
      { property: "og:locale", content: "ru_RU" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@600;700;800&display=swap" },
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
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col overflow-x-hidden">
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
