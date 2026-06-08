import { Phone, MessageCircle } from "lucide-react";
import { SITE } from "@/data/site";

export function StickyMobileCTA() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-border bg-background/95 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
      <a
        href={SITE.phoneHref}
        className="cta-shine flex flex-[2] items-center justify-center gap-2 rounded-xl bg-cta-gradient py-3.5 text-sm font-bold text-accent-foreground shadow-cta"
      >
        <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
          <span className="pulse-ring absolute inset-0 rounded-full" />
          <Phone className="h-4 w-4" />
        </span>
        Позвонить · бесплатно
      </a>
      <a
        href={SITE.whatsappHref}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card py-3.5 text-sm font-semibold text-foreground"
        aria-label="WhatsApp"
      >
        <MessageCircle className="h-5 w-5 text-success" />
        <span>WhatsApp</span>
      </a>
    </div>
  );
}
