import { useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { LeadForm } from "./LeadForm";

interface Props {
  trigger: ReactNode;
  title?: string;
  subtitle?: string;
  defaultService?: string;
}

export function LeadFormModal({ trigger, title = "Бесплатный расчёт за 5 сек", subtitle = "Перезвоним за 10 минут и зафиксируем цену до выезда.", defaultService }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md gap-0 border-0 bg-transparent p-0 shadow-none [&>button]:top-3 [&>button]:right-3 [&>button]:z-10">
        <VisuallyHidden>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{subtitle}</DialogDescription>
        </VisuallyHidden>
        <LeadForm
          variant="card"
          goal="lead_modal"
          title={title}
          subtitle={subtitle}
          defaultService={defaultService}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}