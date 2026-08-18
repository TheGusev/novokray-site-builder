import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Download, Loader2, FileText, Search, ArrowLeft, Phone, Send, ShieldCheck } from "lucide-react";
import { SITE } from "@/data/site";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import {
  OBJECT_KINDS,
  PEST_OPTIONS,
  PERIODICITY_LABEL,
  calcQuickPrice,
  type ObjectKind,
  type Periodicity,
} from "@/data/b2bPricing";
import { lookupInnParty } from "@/lib/dadata.functions";
import { isActiveParty } from "@/lib/dadata.parse";
import type { ContractBlock } from "@/lib/dogovor/buildPdf";
import { GOALS, trackGoal } from "@/lib/analytics";
import { sendLead } from "@/lib/leadSender";
import { formatPhoneRu, isFullPhoneRu } from "@/lib/phone";

export const Route = createFileRoute("/kp")({
  head: () => ({
    meta: [
      { title: `Коммерческое предложение для организаций · ${SITE.shortName}` },
      { name: "description", content: "Заполните ИНН и параметры объекта — получите готовый пакет документов: коммерческое предложение, счёт и договор в PDF." },
      { name: "robots", content: "index,follow" },
      { property: "og:title", content: `КП для организаций · ${SITE.shortName}` },
      { property: "og:description", content: "Пакет документов для юрлиц: КП, счёт, договор. Автозаполнение по ИНН. Дезинфекция, дезинсекция, дератизация в Новосибирске и НСО." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE.domain}/kp` },
    ],
    links: [{ rel: "canonical", href: `${SITE.domain}/kp` }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Главная", item: `${SITE.domain}/` },
          { "@type": "ListItem", position: 2, name: "Коммерческое предложение для организаций", item: `${SITE.domain}/kp` },
        ],
      }),
    }],
  }),
  component: KpPage,
});

function todayIso() { return new Date().toISOString().slice(0, 10); }
function genNumber(prefix: string) {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${stamp}-${rand}`;
}

const inputCls = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20";

function KpPage() {
  // Реквизиты
  const [kpNumber, setKpNumber] = useState(() => genNumber("КП"));
  const [invNumber, setInvNumber] = useState(() => genNumber("СЧ"));
  const [contractNumber, setContractNumber] = useState(() => genNumber("ДФ"));
  const [date, setDate] = useState(todayIso);
  const notifiedRef = useRef<string | null>(null);

  // Клиент
  const [inn, setInn] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyKpp, setCompanyKpp] = useState("");
  const [companyOgrn, setCompanyOgrn] = useState("");
  const [legalAddress, setLegalAddress] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Объект
  const [objectAddress, setObjectAddress] = useState("");
  const [objectKind, setObjectKind] = useState<ObjectKind>("office");
  const [areaM2, setAreaM2] = useState(150);
  const [pests, setPests] = useState<string[]>(["tarakany"]);
  const [periodicity, setPeriodicity] = useState<Periodicity>("once");
  const [withBarrier, setWithBarrier] = useState(false);
  const [vatIncluded, setVatIncluded] = useState(false);

  // UI
  const [lookupState, setLookupState] = useState<
    "idle" | "loading" | "not_found" | "no_key" | "ok" | "inactive" | "unavailable" | "error"
  >("idle");
  const [busy, setBusy] = useState<null | "kp" | "invoice" | "contract" | "all">(null);
  const [err, setErr] = useState<string | null>(null);

  const price = useMemo(() => calcQuickPrice({
    objectKind, areaM2, pests, withBarrier, vatIncluded, periodicity,
  }), [objectKind, areaM2, pests, withBarrier, vatIncluded, periodicity]);

  const pestsLabels = pests.map((k) => PEST_OPTIONS.find((p) => p.key === k)?.label ?? k);
  const objectKindDef = OBJECT_KINDS.find((k) => k.key === objectKind)!;

  const canGenerate = companyName.trim().length > 0 && objectAddress.trim().length > 0 && areaM2 > 0 && pests.length > 0;

  async function handleLookup() {
    if (!/^\d{10}$|^\d{12}$/.test(inn)) {
      setLookupState("error");
      return;
    }
    setLookupState("loading");
    const result = await lookupInnParty(inn);
    if (!result.ok) {
      setLookupState(
        result.reason === "not_found"
          ? "not_found"
          : result.reason === "not_configured"
            ? "no_key"
            : result.reason === "invalid_inn"
              ? "error"
              : "unavailable",
      );
      return;
    }
    const p = result.party;
    setCompanyName(p.name || companyName);
    if (p.kpp) setCompanyKpp(p.kpp);
    if (p.ogrn) setCompanyOgrn(p.ogrn);
    if (p.address) setLegalAddress(p.address);
    if (p.managementName) setContactPerson(`${p.managementName}${p.managementPost ? `, ${p.managementPost}` : ""}`);
    setLookupState(isActiveParty(p) ? "ok" : "inactive");
  }

  function togglePest(key: string) {
    setPests((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);
  }

  async function makeKp() {
    setBusy("kp"); setErr(null);
    try {
      const { buildKpPdf } = await import("@/lib/kp/buildKpPdf");
      const { downloadPdf } = await import("@/lib/kp/pdfKit");
      const bytes = await buildKpPdf({
        number: kpNumber, date,
        companyName, companyInn: inn || undefined, companyKpp: companyKpp || undefined,
        legalAddress: legalAddress || undefined, contactPerson: contactPerson || undefined,
        phone: phone || undefined, email: email || undefined,
        objectAddress, objectKindLabel: objectKindDef.label, areaM2,
        pestsLabels, periodicity, withBarrier, vatIncluded,
        price,
      });
      downloadPdf(bytes, `КП_${kpNumber}.pdf`);
      trackGoal(GOALS.kpPdf, { company: companyName, inn, area: areaM2, price: price.perVisitTotal, pests: pestsLabels.join(", ") });
      trackGoal(GOALS.kpSubmit, { company: companyName, inn, doc: "kp" });
      void notifyB2b("Заявка B2B (КП)", "КП для организации");
    } catch (e) { setErr((e as Error).message); } finally { setBusy(null); }
  }

  /** Уведомление менеджера в Telegram: КП/счёт сформированы на сайте. */
  async function notifyB2b(type: string, formName: string) {
    if (!isFullPhoneRu(phone)) return;
    // Кнопка «Все документы» вызывает генерацию трижды — уведомляем один раз на комплект.
    const key = `${phone}|${companyName}`;
    if (notifiedRef.current === key) return;
    notifiedRef.current = key;
    await sendLead({
      type: type as "Заявка на обработку",
      name: contactPerson,
      phone,
      org: companyName,
      inn,
      pest: pestsLabels.join(", ") || "Санитарная обработка",
      object: `${objectKindDef.label}, ${areaM2} м²`,
      priceFrom: price.perVisitTotal,
      priceBasis: `${PERIODICITY_LABEL[periodicity]}${withBarrier ? ", с барьерной защитой" : ""}${objectAddress ? ` · ${objectAddress}` : ""}`,
      formName,
    });
  }

  async function makeInvoice() {
    setBusy("invoice"); setErr(null);
    try {
      const { buildInvoicePdf } = await import("@/lib/kp/buildInvoicePdf");
      const { downloadPdf } = await import("@/lib/kp/pdfKit");
      const lines = price.lines
        .filter((l) => l.sum > 0 && !l.name.startsWith("Минимальный выезд"))
        .map((l) => ({ name: l.name, qty: 1, unit: "усл.", price: l.sum }));
      if (lines.length === 0) lines.push({ name: `Услуги по обработке объекта, ${areaM2} м²`, qty: 1, unit: "усл.", price: price.perVisit });
      if (price.visitsPerYear > 1) {
        lines.forEach((l) => { l.qty = price.visitsPerYear; l.unit = "выезд"; });
      }
      const bytes = await buildInvoicePdf({
        number: invNumber, date,
        buyerName: companyName, buyerInn: inn || undefined, buyerKpp: companyKpp || undefined,
        buyerAddress: legalAddress || undefined,
        lines, vatIncluded,
        contractNumber, contractDate: date,
      });
      downloadPdf(bytes, `Счёт_${invNumber}.pdf`);
      trackGoal(GOALS.invoicePdf, { company: companyName, inn, price: price.perVisitTotal });
      void notifyB2b("Заявка B2B (счёт)", "Счёт для организации");
    } catch (e) { setErr((e as Error).message); } finally { setBusy(null); }
  }

  async function makeContract() {
    setBusy("contract"); setErr(null);
    try {
      const { buildContractPdf } = await import("@/lib/dogovor/buildPdf");
      const { downloadPdf } = await import("@/lib/kp/pdfKit");
      // Формируем один блок из расчёта
      const contractLines = price.lines
        .filter((l) => l.sum > 0)
        .map((l) => ({ name: l.name, qty: 1, price: l.sum }));
      if (contractLines.length === 0) contractLines.push({ name: `Обработка объекта, ${areaM2} м²`, qty: 1, price: price.perVisit });
      const block: ContractBlock = {
        pestName: pestsLabels.join(" + ") || "Санитарная обработка",
        level: "1",
        multiplier: 1,
        warrantyDays: periodicity === "monthly" ? 30 : periodicity === "quarterly" ? 90 : 60,
        preparations: [],
        methodNote: `Тип объекта: ${objectKindDef.label}. Площадь: ${areaM2} м². Периодичность: ${PERIODICITY_LABEL[periodicity]}.`,
        lines: contractLines,
      };
      const bytes = await buildContractPdf({
        number: contractNumber, date,
        clientType: "company",
        companyName, companyInn: inn, companyKpp,
        companyLegalAddress: legalAddress,
        contactPerson,
        phone: phone || SITE.phone,
        objectAddress,
        blocks: [block],
        masterFio: "",
        paymentMethod: "Безналичный расчёт по счёту",
      });
      downloadPdf(bytes, `Договор_${contractNumber}.pdf`);
      trackGoal(GOALS.dogovorPdf, { source: "kp", company: companyName, inn });
    } catch (e) { setErr((e as Error).message); } finally { setBusy(null); }
  }

  async function makeAll() {
    setBusy("all"); setErr(null);
    try {
      await makeKp(); await makeInvoice(); await makeContract();
    } finally { setBusy(null); }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <Breadcrumbs items={[{ label: "Главная", to: "/" }, { label: "КП для организаций" }]} />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground">Пакет документов для организаций</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Введите ИНН — подтянем реквизиты автоматически. Укажите объект и виды работ — сформируем коммерческое предложение,
            счёт на оплату и договор в PDF. Работает и без DaData: можно заполнить вручную.
          </p>
        </div>
        <Link to="/garantii" className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-semibold text-foreground hover:border-primary hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> К гарантиям
        </Link>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Клиент */}
          <section className="rounded-2xl border border-border bg-card p-4 md:p-5">
            <h2 className="text-base font-bold text-foreground">1. Организация-заказчик</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">ИНН</label>
                <div className="mt-1 flex gap-2">
                  <input className={inputCls} value={inn} onChange={(e) => { setInn(e.target.value.replace(/\D/g, "")); setLookupState("idle"); }} placeholder="10 или 12 цифр" inputMode="numeric" maxLength={12} />
                  <button
                    type="button"
                    onClick={handleLookup}
                    disabled={lookupState === "loading"}
                    className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-primary bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-95 disabled:opacity-60"
                  >
                    {lookupState === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    Найти по ИНН
                  </button>
                </div>
                {lookupState === "ok" && <p className="mt-1 text-xs text-emerald-600">Реквизиты подтянуты, проверьте поля ниже.</p>}
                {lookupState === "not_found" && <p className="mt-1 text-xs text-amber-600">По этому ИНН ничего не нашли — заполните вручную.</p>}
                {lookupState === "inactive" && <p className="mt-1 text-xs text-amber-600">Реквизиты подтянуты, но по данным ЕГРЮЛ организация не действующая — проверьте перед отправкой документов.</p>}
                {lookupState === "no_key" && <p className="mt-1 text-xs text-muted-foreground">Автозаполнение по ИНН пока не подключено — заполните поля вручную, документы сформируются корректно.</p>}
                {lookupState === "unavailable" && <p className="mt-1 text-xs text-amber-600">Сервис реквизитов временно недоступен — заполните поля вручную.</p>}
                {lookupState === "error" && <p className="mt-1 text-xs text-destructive">Проверьте ИНН: 10 или 12 цифр.</p>}
              </div>
              <label className="md:col-span-2 block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Наименование организации *</span>
                <input className={inputCls} value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder='ООО "Ромашка"' />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">КПП</span>
                <input className={inputCls} value={companyKpp} onChange={(e) => setCompanyKpp(e.target.value)} placeholder="540401001" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">ОГРН</span>
                <input className={inputCls} value={companyOgrn} onChange={(e) => setCompanyOgrn(e.target.value)} />
              </label>
              <label className="md:col-span-2 block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Юридический адрес</span>
                <input className={inputCls} value={legalAddress} onChange={(e) => setLegalAddress(e.target.value)} />
              </label>
              <label className="md:col-span-2 block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Контактное лицо</span>
                <input className={inputCls} value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} placeholder="Петров П.П., директор" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Телефон</span>
                <input
                  className={inputCls}
                  value={phone}
                  onChange={(e) => setPhone(formatPhoneRu(e.target.value))}
                  onFocus={(e) => { if (!e.target.value) setPhone("+7 ("); }}
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+7 (___) ___-__-__"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">E-mail</span>
                <input className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="buh@company.ru" />
              </label>
            </div>
          </section>

          {/* Объект */}
          <section className="rounded-2xl border border-border bg-card p-4 md:p-5">
            <h2 className="text-base font-bold text-foreground">2. Объект и виды работ</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="md:col-span-2 block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Адрес объекта *</span>
                <input className={inputCls} value={objectAddress} onChange={(e) => setObjectAddress(e.target.value)} placeholder="г. Новосибирск, ул. Ленина, д. 1" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Тип объекта</span>
                <select className={inputCls} value={objectKind} onChange={(e) => setObjectKind(e.target.value as ObjectKind)}>
                  {OBJECT_KINDS.map((k) => <option key={k.key} value={k.key}>{k.label} · {k.ratePerM2} ₽/м²</option>)}
                </select>
                {objectKindDef.hint && <p className="mt-1 text-[11px] text-muted-foreground">{objectKindDef.hint}</p>}
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Площадь, м²</span>
                <input type="number" min={1} className={inputCls} value={areaM2} onChange={(e) => setAreaM2(Math.max(0, Number(e.target.value) || 0))} />
              </label>
              <div className="md:col-span-2">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Виды работ (выберите один или несколько)</span>
                <div className="flex flex-wrap gap-2">
                  {PEST_OPTIONS.map((p) => {
                    const on = pests.includes(p.key);
                    return (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => togglePest(p.key)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:border-primary hover:text-primary"}`}
                      >
                        {on ? "✓ " : ""}{p.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Периодичность</span>
                <select className={inputCls} value={periodicity} onChange={(e) => setPeriodicity(e.target.value as Periodicity)}>
                  {(Object.keys(PERIODICITY_LABEL) as Periodicity[]).map((k) => (
                    <option key={k} value={k}>{PERIODICITY_LABEL[k]}</option>
                  ))}
                </select>
              </label>
              <div className="flex items-end gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input type="checkbox" checked={withBarrier} onChange={(e) => setWithBarrier(e.target.checked)} />
                  <span>Барьерная защита периметра</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input type="checkbox" checked={vatIncluded} onChange={(e) => setVatIncluded(e.target.checked)} />
                  <span>С НДС 20%</span>
                </label>
              </div>
            </div>
          </section>

          {/* Номера документов */}
          <section className="rounded-2xl border border-border bg-card p-4 md:p-5">
            <h2 className="text-base font-bold text-foreground">3. Номера документов</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-4">
              <label className="block md:col-span-1">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Дата</span>
                <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">№ КП</span>
                <input className={inputCls} value={kpNumber} onChange={(e) => setKpNumber(e.target.value)} />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">№ счёта</span>
                <input className={inputCls} value={invNumber} onChange={(e) => setInvNumber(e.target.value)} />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">№ договора</span>
                <input className={inputCls} value={contractNumber} onChange={(e) => setContractNumber(e.target.value)} />
              </label>
            </div>
          </section>
        </div>

        {/* Сайдбар: расчёт + кнопки */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Итоговая стоимость</div>
            <div className="mt-2 space-y-1 text-xs">
              {price.lines.map((l, i) => (
                <div key={i} className="flex items-start justify-between gap-2 text-muted-foreground">
                  <span className="flex-1">{l.name}</span>
                  <span className="whitespace-nowrap font-semibold text-foreground">{l.sum.toLocaleString("ru-RU")} ₽</span>
                </div>
              ))}
              {price.lines.length === 0 && <div className="text-muted-foreground">Выберите виды работ и укажите площадь.</div>}
            </div>
            <div className="mt-3 flex items-baseline justify-between border-t border-border pt-2">
              <span className="text-sm text-muted-foreground">За один выезд{vatIncluded ? " с НДС" : ""}:</span>
              <span className="text-xl font-black text-primary">{price.perVisitTotal.toLocaleString("ru-RU")} ₽</span>
            </div>
            {price.visitsPerYear > 1 && (
              <div className="mt-1 flex items-baseline justify-between text-xs">
                <span className="text-muted-foreground">За год ({price.visitsPerYear} визитов):</span>
                <span className="font-bold text-foreground">{price.perYearTotal.toLocaleString("ru-RU")} ₽</span>
              </div>
            )}
            {price.minTicketApplied && <p className="mt-2 text-[11px] text-muted-foreground">Применён минимальный выезд.</p>}
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
            {err && <div className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">{err}</div>}
            <button
              type="button"
              disabled={!canGenerate || busy !== null}
              onClick={makeAll}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-95 disabled:opacity-50"
            >
              {busy === "all" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Скачать весь пакет (3 PDF)
            </button>
            <div className="grid grid-cols-1 gap-2">
              <button type="button" disabled={!canGenerate || busy !== null} onClick={makeKp} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-semibold text-foreground hover:border-primary hover:text-primary disabled:opacity-50">
                {busy === "kp" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />} Только КП
              </button>
              <button type="button" disabled={!canGenerate || busy !== null} onClick={makeInvoice} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-semibold text-foreground hover:border-primary hover:text-primary disabled:opacity-50">
                {busy === "invoice" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />} Только счёт
              </button>
              <button type="button" disabled={!canGenerate || busy !== null} onClick={makeContract} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-semibold text-foreground hover:border-primary hover:text-primary disabled:opacity-50">
                {busy === "contract" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />} Только договор
              </button>
            </div>
            <div className="mt-2 border-t border-border pt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> Лицензия № {SITE.legal.licenseNo}</div>
              <a href={`tel:${SITE.phone.replace(/\D/g, "")}`} className="mt-2 inline-flex items-center gap-1 text-foreground hover:text-primary">
                <Phone className="h-3.5 w-3.5" /> {SITE.phone}
              </a>
              <a href={SITE.telegramHref} target="_blank" rel="noreferrer" className="ml-3 inline-flex items-center gap-1 text-foreground hover:text-primary">
                <Send className="h-3.5 w-3.5" /> {SITE.telegramHandle}
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
