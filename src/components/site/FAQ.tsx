import { typo } from "@/lib/typography";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface QA { q: string; a: string }

export function FAQ({ items, title = "Частые вопросы" }: { items: QA[]; title?: string }) {
  return (
    <section className="container-x py-16">
      <h2 className="text-center font-display text-3xl font-bold md:text-4xl">{typo(title)}</h2>
      <div className="mx-auto mt-8 max-w-3xl">
        <Accordion type="single" collapsible className="space-y-3">
          {items.map((item, i) => (
            <AccordionItem key={i} value={`i-${i}`} className="rounded-xl border border-border bg-card px-5 shadow-card">
              <AccordionTrigger className="py-5 text-left font-display text-base font-semibold hover:no-underline">
                {typo(item.q)}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{typo(item.a)}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
