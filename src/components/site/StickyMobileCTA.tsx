import { Phone, MessageCircle } from "lucide-react";
import { SITE } from "@/data/site";

export function StickyMobileCTA() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-border bg-background/95 p-2 backdrop-blur md:hidden">
      <a href={SITE.phoneHref} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-accent-gradient py-3 text-sm font-semibold text-accent-foreground shadow-accent">
        <Phone className="h-4 w-4" /> Позвонить
      </a>
      <a href={SITE.whatsappHref} className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-card py-3 text-sm font-semibold text-foreground">
        <MessageCircle className="h-4 w-4 text-success" /> WhatsApp
      </a>
    </div>
  );
}
