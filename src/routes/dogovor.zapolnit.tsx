import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, Plus, Trash2, ArrowLeft, FileText, Loader2 } from "lucide-react";
import { SITE } from "@/data/site";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PRICING, formatRub } from "@/data/leadPricing";
import { buildContractPdf, downloadPdf, totalSum, type ContractData, type ServiceLine, type ClientType } from "@/lib/dogovor/buildPdf";
import { rubInWords } from "@/lib/dogovor/rubInWords";

export const Route = createFileRoute("/dogovor/zapolnit")({
  head: () => ({
    meta: [
      { title: `Заполнить договор · ${SITE.shortName}` },
      { name: "description", content: "Конструктор договора на санитарную обработку: внесите данные клиента и услуги — получите готовый PDF." },
      { name: "robots", content: "noindex,nofollow" },
    ],
    links: [{ rel: "canonical", href: "/dogovor/zapolnit" }],
  }),
  component: DogovorBuilderPage,
});

function genNumber(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ДФ-${y}${m}${day}-${rand}`;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

const PESTS = Object.keys(PRICING);

interface UiServiceLine extends ServiceLine {
  id: string;
  pest?: string;
  object?: string;
}

function uid() { return Math.random().toString(36).slice(2, 9); }

function DogovorBuilderPage() {
  const [clientType, setClientType] = useState<ClientType>("person");
  const [num, setNum] = useState(genNumber);
  const [date, setDate] = useState(todayIso);

  const [personFio, setPersonFio] = useState("");
  const [personPassport, setPersonPassport] = useState("");
  const [personIssuedBy, setPersonIssuedBy] = useState("");
  const [personIssuedDate, setPersonIssuedDate] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [companyInn, setCompanyInn] = useState("");
  const [companyKpp, setCompanyKpp] = useState("");
  const [companyLegalAddress, setCompanyLegalAddress] = useState("");
  const [contactPerson, setContactPerson] = useState("");

  const [phone, setPhone] = useState("");
  const [objectAddress, setObjectAddress] = useState("");

  const [masterFio, setMasterFio] = useState("");
  const [warrantyDays, setWarrantyDays] = useState(30);
  const [paymentMethod, setPaymentMethod] = useState("Наличные");
  const [signature, setSignature] = useState<ArrayBuffer | null>(null);
  const [signatureName, setSignatureName] = useState<string>("");

  const [services, setServices] = useState<UiServiceLine[]>([
    { id: uid(), name: "", qty: 1, price: 0 },
  ]);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = useMemo(() => totalSum(services), [services]);

  const updateService = (id: string, patch: Partial<UiServiceLine>) => {
    setServices((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const addService = () => setServices((r) => [...r, { id: uid(), name: "", qty: 1, price: 0 }]);
  const removeService = (id: string) => setServices((r) => r.filter((x) => x.id !== id));

  const setPest = (id: string, pest: string) => {
    const objects = pest ? Object.keys(PRICING[pest] ?? {}) : [];
    const firstObj = objects[0];
    const price = firstObj ? PRICING[pest][firstObj] : 0;
    updateService(id, {
      pest,
      object: firstObj,
      price,
      name: pest && firstObj ? `${pest} · ${firstObj}` : "",
    });
  };

  const setObject = (id: string, object: string) => {
    const row = services.find((s) => s.id === id);
    if (!row?.pest) return;
    const price = PRICING[row.pest][object] ?? 0;
    updateService(id, { object, price, name: `${row.pest} · ${object}` });
  };

  const onSignature = async (file: File | null) => {
    if (!file) { setSignature(null); setSignatureName(""); return; }
    if (file.size > 1_000_000) { setError("Подпись больше 1 МБ — выберите файл поменьше."); return; }
    if (!/png|jpe?g/i.test(file.type)) { setError("Подпись должна быть PNG или JPG."); return; }
    const buf = await file.arrayBuffer();
    setSignature(buf);
    setSignatureName(file.name);
    setError(null);
  };

  const onGenerate = async () => {
    setError(null);
    // лёгкая валидация
    const validServices = services.filter((s) => s.name.trim() && s.qty > 0 && s.price > 0);
    if (!validServices.length) { setError("Добавьте хотя бы одну услугу с ценой и количеством."); return; }
    if (clientType === "person" && !personFio.trim()) { setError("Укажите ФИО заказчика."); return; }
    if (clientType === "company" && (!companyName.trim() || !companyInn.trim())) { setError("Укажите наименование и ИНН организации."); return; }
    if (!objectAddress.trim()) { setError("Укажите адрес объекта обработки."); return; }
    if (!phone.trim()) { setError("Укажите телефон заказчика."); return; }
    if (!masterFio.trim()) { setError("Укажите ФИО мастера."); return; }

    const data: ContractData = {
      number: num.trim() || genNumber(),
      date,
      clientType,
      personFio: clientType === "person" ? personFio.trim() : undefined,
      personPassport: clientType === "person" ? personPassport.trim() || undefined : undefined,
      personIssuedBy: clientType === "person" ? personIssuedBy.trim() || undefined : undefined,
      personIssuedDate: clientType === "person" ? personIssuedDate || undefined : undefined,
      companyName: clientType === "company" ? companyName.trim() : undefined,
      companyInn: clientType === "company" ? companyInn.trim() : undefined,
      companyKpp: clientType === "company" ? companyKpp.trim() || undefined : undefined,
      companyLegalAddress: clientType === "company" ? companyLegalAddress.trim() || undefined : undefined,
      contactPerson: clientType === "company" ? contactPerson.trim() || undefined : undefined,
      phone: phone.trim(),
      objectAddress: objectAddress.trim(),
      services: validServices.map(({ name, qty, price }) => ({ name, qty, price })),
      masterFio: masterFio.trim(),
      warrantyDays,
      paymentMethod,
      signaturePng: signature,
    };

    try {
      setBusy(true);
      const bytes = await buildContractPdf(data);
      downloadPdf(bytes, `Договор-${data.number}.pdf`);
    } catch (e) {
      setError((e as Error).message || "Не удалось собрать PDF");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Breadcrumbs items={[{ label: "Главная", to: "/" }, { label: "Гарантии", to: "/garantii" }, { label: "Заполнить договор" }]} />

      <section className="container-x py-6 md:py-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-extrabold md:text-3xl">Конструктор договора</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
              Заполните данные клиента, услуги и реквизиты мастера — получите готовый PDF договора. Данные обрабатываются только в браузере, на сервер ничего не отправляется.
            </p>
          </div>
          <Link to="/garantii" className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-semibold text-foreground hover:border-primary hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> К гарантиям
          </Link>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* FORM */}
          <div className="space-y-6">
            <Block title="1. Договор">
              <Field label="№ договора">
                <input className={inputCls} value={num} onChange={(e) => setNum(e.target.value)} />
              </Field>
              <Field label="Дата">
                <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
              </Field>
            </Block>

            <Block title="2. Заказчик">
              <div className="col-span-full">
                <div className="inline-flex rounded-lg border border-border p-1">
                  {(["person", "company"] as ClientType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setClientType(t)}
                      className={`rounded-md px-4 py-1.5 text-sm font-semibold ${clientType === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {t === "person" ? "Физлицо" : "Юрлицо"}
                    </button>
                  ))}
                </div>
              </div>

              {clientType === "person" ? (
                <>
                  <Field label="ФИО заказчика" full>
                    <input className={inputCls} value={personFio} onChange={(e) => setPersonFio(e.target.value)} placeholder="Иванов Иван Иванович" />
                  </Field>
                  <Field label="Паспорт (серия, номер)">
                    <input className={inputCls} value={personPassport} onChange={(e) => setPersonPassport(e.target.value)} placeholder="50 14 123456" />
                  </Field>
                  <Field label="Кем выдан">
                    <input className={inputCls} value={personIssuedBy} onChange={(e) => setPersonIssuedBy(e.target.value)} placeholder="ОУФМС России по НСО…" />
                  </Field>
                  <Field label="Дата выдачи">
                    <input type="date" className={inputCls} value={personIssuedDate} onChange={(e) => setPersonIssuedDate(e.target.value)} />
                  </Field>
                </>
              ) : (
                <>
                  <Field label="Наименование организации" full>
                    <input className={inputCls} value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder='ООО "Ромашка"' />
                  </Field>
                  <Field label="ИНН"><input className={inputCls} value={companyInn} onChange={(e) => setCompanyInn(e.target.value)} placeholder="5404123456" /></Field>
                  <Field label="КПП"><input className={inputCls} value={companyKpp} onChange={(e) => setCompanyKpp(e.target.value)} placeholder="540401001" /></Field>
                  <Field label="Юридический адрес" full>
                    <input className={inputCls} value={companyLegalAddress} onChange={(e) => setCompanyLegalAddress(e.target.value)} />
                  </Field>
                  <Field label="Контактное лицо" full>
                    <input className={inputCls} value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} placeholder="Петров П.П., директор" />
                  </Field>
                </>
              )}

              <Field label="Телефон">
                <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 (993) 000-00-00" />
              </Field>
              <Field label="Адрес объекта обработки" full>
                <input className={inputCls} value={objectAddress} onChange={(e) => setObjectAddress(e.target.value)} placeholder="г. Новосибирск, ул. Ленина, д. 1, кв. 1" />
              </Field>
            </Block>

            <Block title="3. Услуги">
              <div className="col-span-full space-y-3">
                {services.map((s, i) => {
                  const objects = s.pest ? Object.keys(PRICING[s.pest] ?? {}) : [];
                  return (
                    <div key={s.id} className="rounded-xl border border-border bg-card p-3">
                      <div className="flex items-start gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary text-sm font-bold text-primary">{i + 1}</div>
                        <div className="grid flex-1 grid-cols-1 gap-2 md:grid-cols-12">
                          <select className={`${inputCls} md:col-span-3`} value={s.pest ?? ""} onChange={(e) => setPest(s.id, e.target.value)}>
                            <option value="">— Вредитель —</option>
                            {PESTS.map((p) => <option key={p} value={p}>{p}</option>)}
                          </select>
                          <select className={`${inputCls} md:col-span-3`} value={s.object ?? ""} onChange={(e) => setObject(s.id, e.target.value)} disabled={!s.pest}>
                            <option value="">— Объект —</option>
                            {objects.map((o) => <option key={o} value={o}>{o}</option>)}
                          </select>
                          <input className={`${inputCls} md:col-span-3`} value={s.name} onChange={(e) => updateService(s.id, { name: e.target.value })} placeholder="Наименование (можно править)" />
                          <input type="number" min={1} className={`${inputCls} md:col-span-1`} value={s.qty} onChange={(e) => updateService(s.id, { qty: Number(e.target.value) || 0 })} />
                          <input type="number" min={0} className={`${inputCls} md:col-span-2`} value={s.price} onChange={(e) => updateService(s.id, { price: Number(e.target.value) || 0 })} placeholder="Цена, ₽" />
                        </div>
                        <button type="button" onClick={() => removeService(s.id)} className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Удалить строку">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-2 pl-10 text-xs text-muted-foreground">
                        Сумма строки: <span className="font-semibold text-foreground">{formatRub(s.qty * s.price)}</span>
                      </div>
                    </div>
                  );
                })}
                <button type="button" onClick={addService} className="inline-flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm font-semibold text-primary hover:bg-secondary">
                  <Plus className="h-4 w-4" /> Добавить услугу
                </button>
              </div>
            </Block>

            <Block title="4. Исполнитель и условия">
              <Field label="ФИО мастера" full>
                <input className={inputCls} value={masterFio} onChange={(e) => setMasterFio(e.target.value)} placeholder="Сидоров С.С." />
              </Field>
              <Field label="Гарантия (дней)">
                <select className={inputCls} value={warrantyDays} onChange={(e) => setWarrantyDays(Number(e.target.value))}>
                  {[30, 60, 90, 180, 365].map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="Способ оплаты">
                <select className={inputCls} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  {["Наличные", "Перевод на карту", "Безналичный расчёт", "СБП"].map((p) => <option key={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="Подпись мастера (PNG/JPG, до 1 МБ)" full>
                <label className="flex h-9 cursor-pointer items-center justify-between rounded-md border border-input bg-transparent px-3 text-sm text-muted-foreground hover:border-primary">
                  <span>{signatureName || "Выбрать файл…"}</span>
                  <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={(e) => onSignature(e.target.files?.[0] ?? null)} />
                </label>
              </Field>
            </Block>
          </div>

          {/* SUMMARY / ACTION */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary">
                <FileText className="h-4 w-4" /> Итог
              </div>
              <div className="mt-3 text-xs text-muted-foreground">№ {num} от {date}</div>
              <div className="mt-4 text-3xl font-display font-extrabold text-primary">{formatRub(total)}</div>
              <div className="mt-1 text-xs text-muted-foreground">{total > 0 ? rubInWords(total) : "Добавьте услуги"}</div>

              <div className="mt-5 space-y-1.5 text-sm">
                {services.filter((s) => s.name && s.price > 0).map((s) => (
                  <div key={s.id} className="flex justify-between gap-3">
                    <span className="truncate text-muted-foreground">{s.name} × {s.qty}</span>
                    <span className="shrink-0 font-semibold">{formatRub(s.qty * s.price)}</span>
                  </div>
                ))}
              </div>

              {error && (
                <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">{error}</div>
              )}

              <button
                type="button"
                onClick={onGenerate}
                disabled={busy}
                className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-cta-gradient font-bold text-accent-foreground shadow-cta hover:scale-[1.01] disabled:opacity-60 disabled:hover:scale-100"
              >
                {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Готовлю PDF…</> : <><Download className="h-4 w-4" /> Сформировать PDF</>}
              </button>

              <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
                PDF собирается у вас в браузере. Шрифт — PT Sans, формат А4, страницы добавляются автоматически.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

const inputCls = "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <h2 className="font-display text-base font-bold">{title}</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({ label, children, full = false }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`block ${full ? "md:col-span-2" : ""}`}>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
