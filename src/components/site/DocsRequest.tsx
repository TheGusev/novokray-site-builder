import { useState } from "react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { FileText, BookOpenCheck, FileCheck2, BadgeCheck, Loader2, Send, Phone, Eye } from "lucide-react";
import { SITE } from "@/data/site";
import { sendLead } from "@/lib/leadSender";
import { DOCS } from "@/data/docs";

const ICONS: Record<string, typeof FileText> = {
  dogovor: FileText,
  "zhurnal-sanpin": BookOpenCheck,
  akt: FileCheck2,
  sertifikat: BadgeCheck,
};

function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, "").replace(/^8/, "7").slice(0, 11);
  const n = d.startsWith("7") ? d.slice(1) : d;
  const p1 = n.slice(0, 3), p2 = n.slice(3, 6), p3 = n.slice(6, 8), p4 = n.slice(8, 10);
  let out = "+7";
  if (p1) out += ` (${p1}`;
  if (p1.length === 3) out += ")";
  if (p2) out += ` ${p2}`;
  if (p3) out += `-${p3}`;
  if (p4) out += `-${p4}`;
  return out;
}

export function DocsRequest() {
  const [org, setOrg] = useState("");
  const [inn, setInn] = useState("");
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState("");

  const phoneDigits = phone.replace(/\D/g, "").length;
  const canSubmit = phoneDigits >= 11 && agree;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneDigits < 11) return toast.error("Укажите телефон полностью");
    if (!agree) return toast.error("Нужно согласие с политикой");
    setLoading(true);
    const sent = await sendLead({
      type: "Запрос документов",
      org, inn, phone, company,
    });
    setLoading(false);
    toast.success(
      sent
        ? "Заявка отправлена. Договор пришлём в течение часа."
        : "Заявка сохранена — отправим автоматически, как появится связь.",
    );
    setOrg(""); setInn(""); setPhone(""); setAgree(false);
  };

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-2">
        {DOCS.map((d) => {
          const Icon = ICONS[d.slug] ?? FileText;
          return (
            <Link
              key={d.slug}
              to="/docs/$slug"
              params={{ slug: d.slug }}
              className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elegant focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-display text-sm font-bold text-foreground">{d.title}</div>
                <div className="mt-0.5 truncate text-[11px] text-muted-foreground">{d.note}</div>
              </div>
              <Eye className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-primary" />
            </Link>
          );
        })}
      </div>

      <form onSubmit={onSubmit} className="rounded-2xl border border-border bg-card p-5 shadow-card md:p-6">
        <input
          type="text"
          name="company_hp"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
        />
        <div className="font-display text-base font-bold text-foreground md:text-lg">
          Нужен договор под вашу организацию?
        </div>
        <p className="mt-1 text-xs text-muted-foreground md:text-sm">
          Заполним договор с вашими реквизитами и пришлём на e-mail или в мессенджер в течение часа.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            value={org}
            onChange={(e) => setOrg(e.target.value.slice(0, 120))}
            placeholder="Организация (необязательно)"
            className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-ring/40 focus:ring-2"
          />
          <input
            value={inn}
            onChange={(e) => setInn(e.target.value.replace(/\D/g, "").slice(0, 12))}
            placeholder="ИНН (необязательно)"
            inputMode="numeric"
            className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-ring/40 focus:ring-2"
          />
        </div>

        <input
          value={phone}
          onChange={(e) => setPhone(formatPhone(e.target.value))}
          onFocus={(e) => { if (!e.target.value) setPhone("+7 ("); }}
          placeholder="+7 (___) ___-__-__"
          inputMode="tel"
          autoComplete="tel"
          required
          className="mt-3 h-12 w-full rounded-lg border border-input bg-background px-3 text-base font-semibold tracking-wide outline-none ring-ring/40 focus:ring-2"
        />

        <label className="mt-3 flex cursor-pointer items-start gap-2 text-[11px] leading-snug text-muted-foreground">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-input accent-[color:var(--color-primary)]"
          />
          <span>
            Я согласен с{" "}
            <Link to="/privacy" target="_blank" className="text-primary underline-offset-2 hover:underline">политикой обработки персональных данных</Link>.
          </span>
        </label>

        <div className="mt-4 grid gap-2 sm:grid-cols-[1fr,auto,auto]">
          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-cta-gradient font-bold text-accent-foreground shadow-cta transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Запросить договор
          </button>
          <a
            href={SITE.phoneHref}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-semibold text-foreground hover:border-primary hover:text-primary"
          >
            <Phone className="h-4 w-4" /> {SITE.phone}
          </a>
          <a
            href={SITE.telegramHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Telegram ${SITE.telegramHandle}`}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-semibold text-foreground hover:border-primary hover:text-primary"
          >
            <Send className="h-4 w-4" /> {SITE.telegramHandle}
          </a>
        </div>
      </form>
    </div>
  );
}