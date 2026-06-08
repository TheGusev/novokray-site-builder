import { useState } from "react";
import { toast } from "sonner";
import { Send, Phone, Loader2 } from "lucide-react";
import { SITE } from "@/data/site";

interface Props {
  defaultService?: string;
  variant?: "card" | "hero" | "inline";
  title?: string;
  subtitle?: string;
}

export function LeadForm({ defaultService = "", variant = "card", title, subtitle }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [object, setObject] = useState(defaultService || "");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.replace(/\D/g, "").length < 10) {
      toast.error("Укажите номер телефона");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    toast.success("Заявка принята! Перезвоним в течение 10 минут.");
    setName("");
    setPhone("");
  };

  const heroStyle = variant === "hero";

  return (
    <form
      onSubmit={onSubmit}
      className={
        heroStyle
          ? "rounded-2xl border border-white/10 bg-white/95 p-6 shadow-elegant backdrop-blur"
          : "rounded-2xl border border-border bg-card p-6 shadow-card"
      }
    >
      {title && <div className="font-display text-xl font-bold text-foreground">{title}</div>}
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}

      <div className={`grid gap-3 ${title ? "mt-4" : ""}`}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ваше имя"
          className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-ring/40 focus:ring-2"
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+7 (___) ___-__-__"
          inputMode="tel"
          required
          className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-ring/40 focus:ring-2"
        />
        <input
          value={object}
          onChange={(e) => setObject(e.target.value)}
          placeholder="Объект и услуга (например: 2-комн. квартира, клопы)"
          className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-ring/40 focus:ring-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-accent-gradient font-semibold text-accent-foreground shadow-accent transition hover:opacity-95 disabled:opacity-70"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Получить расчёт
        </button>
        <a href={SITE.phoneHref} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background text-sm font-semibold text-foreground hover:border-primary hover:text-primary">
          <Phone className="h-4 w-4" /> Позвонить: {SITE.phone}
        </a>
        <p className="text-xs text-muted-foreground">
          Нажимая кнопку, вы соглашаетесь с обработкой персональных данных. Перезвоним в течение 10 минут.
        </p>
      </div>
    </form>
  );
}
