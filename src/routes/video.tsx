import { createFileRoute, Link } from "@tanstack/react-router";
import { Phone, ArrowRight, Video as VideoIcon, ShieldCheck } from "lucide-react";
import { SITE } from "@/data/site";
import { WORK_VIDEOS, UCHASTOK_PHOTO, videoJsonLd } from "@/data/videos";
import { SERVICES_INDEX } from "@/data/servicesIndex";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { VideoCard } from "@/components/site/VideoCard";
import { LeadForm } from "@/components/site/LeadForm";
import { Reveal } from "@/components/site/Reveal";
import { GOALS } from "@/lib/analytics";

const TITLE = "Видео наших работ — обработка от клопов, тараканов и на участке";
const DESC =
  "Реальные видео с выездов «Дез-Федерации» в Новосибирске: горячий туман по спальным местам, обработка кухни от тараканов, участок от клещей и комаров, результат после обработки.";

export const Route = createFileRoute("/video")({
  head: () => ({
    meta: [
      { title: `${TITLE} — ${SITE.shortName}` },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE.domain}/video` },
    ],
    links: [{ rel: "canonical", href: `${SITE.domain}/video` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Главная", item: `${SITE.domain}/` },
                { "@type": "ListItem", position: 2, name: "Видео работ", item: `${SITE.domain}/video` },
              ],
            },
            ...WORK_VIDEOS.map((v) => videoJsonLd(v, SITE.domain)),
          ],
        }),
      },
    ],
  }),
  component: VideoPage,
});

function VideoPage() {
  const related = SERVICES_INDEX.filter((s) =>
    ["unichtozhenie-klopov", "unichtozhenie-tarakanov", "obrabotka-uchastkov", "unichtozhenie-os"].includes(s.slug),
  );

  return (
    <>
      <Breadcrumbs items={[{ label: "Главная", to: "/" }, { label: "Видео работ" }]} />

      <section className="container-x py-8 md:py-12">
        <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
          <VideoIcon className="h-3.5 w-3.5" /> Видео с объектов
        </div>
        <h1 className="mt-3 max-w-3xl font-display text-3xl font-extrabold leading-tight md:text-5xl">
          Как мы работаем: видео обработок в Новосибирске и области
        </h1>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {WORK_VIDEOS.map((v, i) => (
            <Reveal key={v.slug} delay={i * 60}>
              <VideoCard video={v} eager={i === 0} schema={false} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-surface py-14">
        <div className="container-x grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div className="overflow-hidden rounded-2xl border border-border shadow-card">
            <img
              src={UCHASTOK_PHOTO.url}
              alt={UCHASTOK_PHOTO.alt}
              title={UCHASTOK_PHOTO.title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold md:text-3xl">Обработка участка: как это выглядит вживую</h2>
            <p className="mt-3 text-muted-foreground">
              Моторный опрыскиватель проходит траву, кустарник, зоны отдыха и периметр забора. Отдельно
              обрабатываем места, где чаще всего цепляются клещи, и гнёзда ос рядом с домом и бассейном.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-foreground/90">
              <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 text-success" /> Акарициды и инсектициды 4 класса опасности</li>
              <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 text-success" /> Гарантия на сезон, повторный выезд по договору</li>
              <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 text-success" /> Выезд по Новосибирску и области</li>
            </ul>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/services/$slug"
                params={{ slug: "obrabotka-uchastkov" }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-cta-gradient px-6 py-3.5 font-bold text-accent-foreground shadow-cta transition hover:scale-[1.02]"
              >
                Обработка участка <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={SITE.phoneHref}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 font-semibold hover:bg-secondary"
              >
                <Phone className="h-5 w-5" /> {SITE.phone}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="container-x grid gap-8 py-14 lg:grid-cols-[1fr_380px]">
        <div>
          <h2 className="font-display text-2xl font-bold md:text-3xl">Услуги с видео</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {related.map((s) => (
              <Link
                key={s.slug}
                to="/services/$slug"
                params={{ slug: s.slug }}
                className="group rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elegant"
              >
                <div className="font-display text-lg font-bold group-hover:text-primary">{s.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">от {s.priceFrom.toLocaleString("ru-RU")} ₽</div>
              </Link>
            ))}
          </div>
        </div>
        <LeadForm
          title="Покажем результат на вашем объекте"
          subtitle="Перезвоним за 10 минут, назовём точную цену и время выезда."
          goal={GOALS.videoLead}
          formName="Форма на странице видео"
          context="Страница видео работ"
        />
      </section>
    </>
  );
}