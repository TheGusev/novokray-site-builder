import { ShieldCheck, Clock4, Award, BadgeCheck } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

export function TrustStrip() {
  const items = [
    { icon: Clock4, t: "Выезд за 60 мин", s: "по Новосибирску, 07:00–23:00" },
    { icon: ShieldCheck, t: "Гарантия до 24 мес.", s: "по договору, бесплатная повторка" },
    { icon: Award, t: "7 лет на рынке", s: "38 000+ заявок по РФ, с 2019" },
    { icon: BadgeCheck, t: "Лицензия и СЭС", s: "сертифицированные препараты" },
  ];
  return (
    <section className="border-y border-border bg-surface">
      <div className="container-x grid gap-5 py-8 sm:grid-cols-2 md:grid-cols-4 md:py-10">
        {items.map((i, k) => (
          <Reveal key={k} delay={k * 80} className="flex items-start gap-3">
            <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-card text-primary shadow-card">
              <i.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-sm font-bold">{i.t}</div>
              <div className="text-xs text-muted-foreground">{i.s}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
