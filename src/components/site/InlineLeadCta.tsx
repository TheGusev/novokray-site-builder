import { Check, Phone, Send } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { SITE } from "@/data/site";
import { formatRub } from "@/data/leadPricing";
import { LeadForm } from "./LeadForm";
import { GOALS, trackGoal } from "@/lib/analytics";
import type { BlogOffer } from "@/data/blogPestMap";

interface Props {
  offer: BlogOffer;
  /** Название статьи — уходит в заявку */
  context: string;
  /** Цель Метрики */
  goal: string;
  /** Имя формы для Telegram */
  formName: string;
  /** Широкий блок под статьёй */
  wide?: boolean;
}

export function InlineLeadCta({ offer, context, goal, formName, wide = false }: Props) {
  return (
    <section
      className={`not-prose rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/8 via-card to-accent/8 p-5 shadow-card md:p-6 ${wide ? "mt-12" : "my-10"}`}
    >
      <div className="@container/cta">
        <div className={wide ? "grid gap-6 @[640px]/cta:grid-cols-[1.1fr_1fr] @[640px]/cta:items-center" : ""}>
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-primary">
            Санитарная служба «Дез-Федерация» · Новосибирск и область
          </div>
          <h2 className="mt-1.5 font-display text-xl font-extrabold leading-tight text-foreground md:text-2xl">
            {offer.heading}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{offer.sub}</p>

          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {offer.bullets.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm text-foreground/90">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                {b}
              </li>
            ))}
          </ul>

          {offer.priceFrom !== null && (
            <div className="mt-3 inline-flex items-baseline gap-2 rounded-lg bg-secondary/70 px-3 py-1.5">
              <span className="text-xs font-semibold text-muted-foreground">Цена</span>
              <span className="font-display text-lg font-extrabold text-primary">от {formatRub(offer.priceFrom)}</span>
            </div>
          )}
        </div>

        <div className={wide ? "" : "mt-4"}>
          <LeadForm
            variant="compact"
            defaultService={offer.pest}
            goal={goal}
            formName={formName}
            context={context}
            submitLabel="Рассчитать и перезвонить"
          />

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <a
              href={SITE.phoneHref}
              onClick={() => trackGoal(GOALS.callClick, { place: formName, service: offer.pest })}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-semibold text-foreground hover:border-primary hover:text-primary"
            >
              <Phone className="h-4 w-4" /> {SITE.phone}
            </a>
            <a
              href={SITE.telegramHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackGoal(GOALS.telegramClick, { place: formName, service: offer.pest })}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-semibold text-foreground hover:border-primary hover:text-primary"
            >
              <Send className="h-4 w-4" /> {SITE.telegramHandle}
            </a>
            <Link
              to="/services/$slug"
              params={{ slug: offer.service }}
              className="text-sm font-semibold text-primary underline-offset-2 hover:underline"
            >
              Подробнее об услуге
            </Link>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
