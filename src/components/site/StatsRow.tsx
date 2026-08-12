import { useState } from "react";
import { Star, Info } from "lucide-react";
import { SITE } from "@/data/site";
import { Reveal } from "@/components/site/Reveal";
import { CountUp } from "@/components/site/CountUp";
import { GOALS, trackGoal } from "@/lib/analytics";

export function StatsRow() {
  const [open, setOpen] = useState(false);

  const toggle = () => {
    setOpen((v) => {
      if (!v) trackGoal(GOALS.statsInfoOpen);
      return !v;
    });
  };

  return (
    <>
      <div className="mt-8 grid max-w-md grid-cols-3 gap-4 border-t border-white/15 pt-6 text-sm">
        <Reveal delay={400}>
          <div className="font-display text-2xl font-extrabold md:text-3xl">
            <CountUp value={38000} suffix="+" />
          </div>
          <div className="text-[11px] uppercase tracking-wider text-white/70">заявок по РФ · с 2019</div>
        </Reveal>
        <Reveal delay={500}>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-2xl font-extrabold md:text-3xl">
              <CountUp value={4.9} decimals={1} />
            </span>
            <Star className="h-4 w-4 fill-accent text-accent" />
          </div>
          <div className="text-[11px] uppercase tracking-wider text-white/70">{SITE.rating.count} отзывов</div>
        </Reveal>
        <Reveal delay={600}>
          <div className="font-display text-2xl font-extrabold md:text-3xl">
            <CountUp value={24} suffix=" мес" />
          </div>
          <div className="text-[11px] uppercase tracking-wider text-white/70">гарантия по договору</div>
        </Reveal>
      </div>

      <Reveal delay={650}>
        <div className="mt-3 max-w-md">
          <button
            type="button"
            onClick={toggle}
            aria-expanded={open}
            className="inline-flex items-center gap-1.5 text-[12px] leading-snug text-white/70 underline-offset-4 transition hover:text-white hover:underline"
          >
            <Info className="h-3.5 w-3.5 shrink-0" />
            Считаем заявки по всей России с 2019 года
          </button>
          <p
            className={`overflow-hidden text-[12px] leading-snug text-white/60 transition-all duration-500 ease-out ${
              open ? "mt-2 max-h-40 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            38 000+ — общее число заявок, обработанных федерацией по России с 2019 года. В Новосибирске и области
            работают наши специалисты: выезд за 60 минут, договор и гарантия до 24 месяцев.
          </p>
        </div>
      </Reveal>
    </>
  );
}
