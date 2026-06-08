import { useState } from "react";
import { toast } from "sonner";
import {
  Send, Phone, Loader2, ChevronLeft, Check, Bug, Rat, SprayCan, Bird,
  Skull, Sprout, Droplets, Wind, Waves, Sparkles, Home, Building2,
  Trees, Car, Store, Briefcase, ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SITE } from "@/data/site";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";

interface Props {
  defaultService?: string;
  variant?: "card" | "hero" | "inline";
  title?: string;
  subtitle?: string;
  onSuccess?: () => void;
}

interface Tile { id: string; label: string; icon: LucideIcon }

const PESTS: Tile[] = [
  { id: "Клопы", label: "Клопы", icon: Bug },
  { id: "Тараканы", label: "Тараканы", icon: Bug },
  { id: "Грызуны", label: "Грызуны", icon: Rat },
  { id: "Блохи", label: "Блохи", icon: Bug },
  { id: "Муравьи", label: "Муравьи", icon: Bug },
  { id: "Осы", label: "Осы", icon: Bird },
  { id: "Клещи / комары", label: "Клещи, комары", icon: Bug },
  { id: "Плесень", label: "Плесень", icon: Droplets },
  { id: "Озонирование", label: "Озонирование", icon: Wind },
  { id: "Сушка после потопа", label: "Сушка", icon: Waves },
  { id: "Борщевик", label: "Борщевик", icon: Sprout },
  { id: "Другое", label: "Другое", icon: Sparkles },
];

const OBJECTS: Tile[] = [
  { id: "Студия", label: "Студия", icon: Home },
  { id: "1-комн. квартира", label: "1-комн.", icon: Home },
  { id: "2-комн. квартира", label: "2-комн.", icon: Home },
  { id: "3-комн. квартира", label: "3-комн.", icon: Home },
  { id: "4+ комн. квартира", label: "4+ комн.", icon: Home },
  { id: "Частный дом", label: "Дом", icon: Building2 },
  { id: "Дача", label: "Дача", icon: Trees },
  { id: "Участок", label: "Участок", icon: Trees },
  { id: "Кафе / ресторан", label: "Кафе", icon: Store },
  { id: "Магазин / склад", label: "Магазин", icon: Store },
  { id: "Офис", label: "Офис", icon: Briefcase },
  { id: "Авто / салон", label: "Авто", icon: Car },
];

function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, "").replace(/^8/, "7").slice(0, 11);
  const n = d.startsWith("7") ? d.slice(1) : d;
  const p1 = n.slice(0, 3);
  const p2 = n.slice(3, 6);
  const p3 = n.slice(6, 8);
  const p4 = n.slice(8, 10);
  let out = "+7";
  if (p1) out += ` (${p1}`;
  if (p1.length === 3) out += ")";
  if (p2) out += ` ${p2}`;
  if (p3) out += `-${p3}`;
  if (p4) out += `-${p4}`;
  return out;
}

function CompactSelect({
  items, value, onChange, placeholder,
}: {
  items: Tile[]; value: string; onChange: (id: string) => void; placeholder: string;
}) {
  const current = items.find((i) => i.id === value);
  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger className="h-12 rounded-lg border-input bg-background text-sm font-semibold">
        {current ? (
          <span className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-secondary text-primary">
              <current.icon className="h-3.5 w-3.5" />
            </span>
            {current.label}
          </span>
        ) : (
          <SelectValue placeholder={placeholder} />
        )}
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {items.map((t) => (
          <SelectItem key={t.id} value={t.id}>
            <span className="flex items-center gap-2">
              <t.icon className="h-4 w-4 text-primary" />
              {t.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function Progress({ step }: { step: 1 | 2 | 3 }) {
  const labels = ["Вредитель", "Объект", "Контакты"];
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        <span>Шаг {step} из 3</span>
        <span className="text-primary">{labels[step - 1]}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-cta-gradient transition-all duration-500"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>
    </div>
  );
}

export function LeadForm({ defaultService = "", variant = "card", title, subtitle, onSuccess }: Props) {
  const initialPest = PESTS.find((p) => p.id === defaultService)?.id ?? "";
  const [step, setStep] = useState<1 | 2 | 3>(initialPest ? 2 : 1);
  const [pest, setPest] = useState<string>(initialPest);
  const [object, setObject] = useState<string>("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  const phoneDigits = phone.replace(/\D/g, "").length;
  const canSubmit = phoneDigits >= 11 && agree && pest && object;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pest) return toast.error("Выберите, что обрабатываем");
    if (!object) return toast.error("Выберите объект");
    if (phoneDigits < 11) return toast.error("Укажите телефон полностью");
    if (!agree) return toast.error("Нужно согласие с политикой");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    toast.success("Заявка принята! Перезвоним в течение 10 минут.");
    setStep(1); setPest(""); setObject(""); setName(""); setPhone(""); setAgree(false);
    onSuccess?.();
  };

  const heroStyle = variant === "hero";

  return (
    <form
      onSubmit={onSubmit}
      className={
        heroStyle
          ? "rounded-2xl border border-white/10 bg-white/97 p-5 shadow-elegant backdrop-blur md:p-6"
          : "rounded-2xl border border-border bg-card p-5 shadow-card md:p-6"
      }
    >
      {title && <div className="font-display text-lg font-bold text-foreground md:text-xl">{title}</div>}
      {subtitle && <p className="mt-1 text-xs text-muted-foreground md:text-sm">{subtitle}</p>}

      <div className={`${title ? "mt-4" : ""}`}>
        <Progress step={step} />
      </div>

      {step > 1 && (
        <button
          type="button"
          onClick={() => setStep((s) => (s === 3 ? 2 : 1))}
          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Назад
        </button>
      )}

      {/* STEP 1 */}
      {step === 1 && (
        <div className="mt-4 grid gap-3 animate-fade-in">
          <div className="font-display text-sm font-bold text-foreground">Что обрабатываем?</div>
          <CompactSelect
            items={PESTS}
            value={pest}
            onChange={(id) => setPest(id)}
            placeholder="Выберите вредителя или услугу"
          />
          <button
            type="button"
            disabled={!pest}
            onClick={() => setStep(2)}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-cta-gradient font-bold text-accent-foreground shadow-cta transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Далее <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="mt-4 grid gap-3 animate-fade-in">
          <div className="font-display text-sm font-bold text-foreground">
            Где обработать? <span className="text-muted-foreground">· {pest}</span>
          </div>
          <CompactSelect
            items={OBJECTS}
            value={object}
            onChange={(id) => setObject(id)}
            placeholder="Выберите объект"
          />
          <button
            type="button"
            disabled={!object}
            onClick={() => setStep(3)}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-cta-gradient font-bold text-accent-foreground shadow-cta transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Далее <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="mt-3 grid gap-3 animate-fade-in">
          <div className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Ваш выбор</div>
                <div className="mt-0.5 font-semibold text-foreground">{pest} · {object}</div>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Изменить
              </button>
            </div>
          </div>

          <input
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 60))}
            placeholder="Имя (необязательно)"
            className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-ring/40 focus:ring-2"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            onFocus={(e) => { if (!e.target.value) setPhone("+7 ("); }}
            placeholder="+7 (___) ___-__-__"
            inputMode="tel"
            autoComplete="tel"
            required
            className="h-12 rounded-lg border border-input bg-background px-3 text-base font-semibold tracking-wide outline-none ring-ring/40 focus:ring-2"
          />

          <div className="rounded-lg bg-secondary/60 px-3 py-2.5">
            <div className="font-display text-sm font-bold text-foreground">Перезвоним за 10 минут</div>
            <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
              Точная цена — после бесплатного осмотра. Без обязательств.
            </div>
          </div>

          <label className="flex cursor-pointer items-start gap-2 text-[11px] leading-snug text-muted-foreground">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-input accent-[color:var(--color-primary)]"
            />
            <span>
              Я согласен с{" "}
              <a href="#" className="text-primary underline-offset-2 hover:underline">политикой обработки персональных данных</a>{" "}
              и{" "}
              <a href="#" className="text-primary underline-offset-2 hover:underline">пользовательским соглашением</a>.
            </span>
          </label>

          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-cta-gradient font-bold text-accent-foreground shadow-cta transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Отправить заявку
          </button>

          <a
            href={SITE.phoneHref}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background text-sm font-semibold text-foreground hover:border-primary hover:text-primary"
          >
            <Phone className="h-4 w-4" /> Позвонить: {SITE.phone}
          </a>

          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Check className="h-3 w-3 text-success" /> Без спама. Звонок только по вашей заявке.
          </div>
        </div>
      )}
    </form>
  );
}
