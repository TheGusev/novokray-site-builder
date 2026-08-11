import { useEffect, useRef, useState } from "react";
import { Phone, X } from "lucide-react";
import { SITE } from "@/data/site";
import { GOALS, trackGoal } from "@/lib/analytics";
import { LeadFormModal } from "./LeadFormModal";
import type { BlogOffer } from "@/data/blogPestMap";
import { typo } from "@/lib/typography";

const DISMISS_KEY = "blogCtaDismissed";

interface Props {
  offer: BlogOffer;
  context: string;
}

/** Липкая панель внизу экрана на мобильных: появляется после 25% прокрутки статьи. */
export function BlogStickyCta({ offer, context }: Props) {
  const [visible, setVisible] = useState(false);
  const [closed, setClosed] = useState(true);
  const shown = useRef(false);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = window.sessionStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      /* storage may be unavailable */
    }
    if (dismissed) return;
    setClosed(false);

    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      const next = progress > 0.25;
      setVisible(next);
      if (next && !shown.current) {
        shown.current = true;
        trackGoal(GOALS.blogStickyShow, { service: offer.pest, context });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [offer.pest, context]);

  const dismiss = () => {
    setClosed(true);
    try {
      window.sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* storage may be unavailable */
    }
  };

  if (closed) return null;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-3 py-2.5 shadow-elegant backdrop-blur transition-transform duration-300 lg:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      role="complementary"
      aria-label="Быстрая заявка"
    >
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-[13px] font-bold leading-tight text-foreground">
            {typo(offer.heading)}
          </div>
          <div className="truncate text-[11px] text-muted-foreground">
            {offer.priceFrom ? `от ${offer.priceFrom.toLocaleString("ru-RU")} ₽ · ` : ""}выезд сегодня, гарантия
          </div>
        </div>
        <a
          href={SITE.phoneHref}
          onClick={() => trackGoal(GOALS.blogStickyCall, { service: offer.pest, context })}
          aria-label="Позвонить"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-primary"
        >
          <Phone className="h-4 w-4" />
        </a>
        <LeadFormModal
          defaultService={offer.pest}
          title={offer.heading}
          subtitle={offer.sub}
          trigger={
            <button
              type="button"
              onClick={() => trackGoal(GOALS.blogStickyLead, { service: offer.pest, context })}
              className="inline-flex h-10 shrink-0 items-center rounded-lg bg-cta-gradient px-4 text-sm font-bold text-accent-foreground shadow-cta"
            >
              Заявка
            </button>
          }
        />
        <button
          type="button"
          onClick={dismiss}
          aria-label="Скрыть"
          className="inline-flex h-10 w-8 shrink-0 items-center justify-center text-muted-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
