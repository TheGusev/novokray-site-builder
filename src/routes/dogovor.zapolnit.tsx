import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, Plus, Trash2, ArrowLeft, FileText, Loader2, Send } from "lucide-react";
import { SITE } from "@/data/site";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { formatRub } from "@/data/leadPricing";
import {
  CATALOG,
  getPest,
  LEVEL_MULTIPLIER,
  LEVEL_WARRANTY_DAYS,
  LEVEL_LABEL,
  getElementLimits,
  clampQty,
  type InfestationLevel,
  type TreatmentElement,
} from "@/data/treatmentCatalog";
import {
  buildContractPdf,
  downloadPdf,
  totalSum,
  blockSum,
  type ContractBlock,
  type ContractData,
  type ClientType,
} from "@/lib/dogovor/buildPdf";
import { rubInWords } from "@/lib/dogovor/rubInWords";

export const Route = createFileRoute("/dogovor/zapolnit")({
  head: () => ({
    meta: [
      { title: `Заполнить договор · ${SITE.shortName}` },
      { name: "description", content: "Конструктор договора на санитарную обработку: внесите данные клиента и услуги — получите готовый PDF." },
      { name: "robots", content: "noindex,nofollow" },
    ],
    links: [{ rel: "canonical", href: `${SITE.domain}/dogovor/zapolnit` }],
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

function uid() { return Math.random().toString(36).slice(2, 9); }

interface UiElementPick {
  rowId: string;
  elementId: string; // или "custom"
  name: string;
  unit: string;
  qty: number;
  basePrice: number; // цена при степени 1
  manual?: boolean; // если true — цена не умножается на коэффициент степени
}

interface UiBlock {
  id: string;
  pestKey: string;
  level: InfestationLevel;
  warrantyDays: number;
  preparations: string[]; // выбранные
  customPrep: string; // ввод нового
  withBarrier: boolean;
  barrierPriceOverride?: number; // ручная цена барьера, если задана
  picks: UiElementPick[];
}

function makeBlock(pestKey = CATALOG[0].key): UiBlock {
  const p = getPest(pestKey)!;
  const level: InfestationLevel = "1";
  return {
    id: uid(),
    pestKey,
    level,
    warrantyDays: LEVEL_WARRANTY_DAYS[level],
    preparations: p.preparations.slice(0, 1),
    customPrep: "",
    withBarrier: false,
    picks: [],
  };
}

function buildBlockLines(b: UiBlock) {
  const p = getPest(b.pestKey);
  if (!p) return [];
  const m = LEVEL_MULTIPLIER[b.level];
  const lines = b.picks
    .filter((x) => x.qty > 0 && x.basePrice > 0 && x.name.trim())
    .map((x) => ({
      name: `${x.name} (${x.unit})`,
      qty: x.qty,
      price: x.manual ? Math.round(x.basePrice) : Math.round(x.basePrice * m),
    }));
  if (b.withBarrier && p.barrier) {
    const barPrice = b.barrierPriceOverride != null
      ? Math.round(b.barrierPriceOverride)
      : Math.round(p.barrier.basePrice * m);
    lines.push({
      name: p.barrier.name,
      qty: 1,
      price: barPrice,
    });
  }
  return lines;
}

// === Валидация блока: ошибки блокируют PDF, предупреждения — мягкие ===
function validateBlock(b: UiBlock): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const p = getPest(b.pestKey);
  if (!p) return { errors: ["Не выбран вредитель"], warnings };

  if (b.picks.length === 0 && !b.withBarrier) {
    errors.push("Выберите хотя бы одну работу или барьерную защиту");
  }
  if (b.preparations.length === 0) {
    warnings.push("Не выбран ни один препарат");
  }
  if (b.preparations.length > 5) {
    warnings.push("Слишком много препаратов (рекомендуем не более 5)");
  }
  if (b.warrantyDays < 1 || b.warrantyDays > 365) {
    errors.push("Срок гарантии должен быть от 1 до 365 дней");
  }

  // Проверка работ
  for (const pick of b.picks) {
    const isCustom = pick.elementId.startsWith("custom-");
    if (isCustom) {
      if (!pick.name.trim()) errors.push("Заполните название своей работы");
      if (!pick.unit.trim()) errors.push(`«${pick.name || "Своя работа"}»: укажите единицу измерения`);
      if (pick.qty <= 0) errors.push(`«${pick.name || "Своя работа"}»: количество должно быть больше 0`);
      if (pick.basePrice <= 0) errors.push(`«${pick.name || "Своя работа"}»: укажите цену больше 0`);
      if (pick.basePrice > 1_000_000) errors.push(`«${pick.name || "Своя работа"}»: цена слишком большая (макс. 1 000 000 ₽)`);
      continue;
    }
    const el = p.elements.find((e) => e.id === pick.elementId);
    if (!el) continue;
    const { min, max } = getElementLimits(el);
    if (pick.qty < min || pick.qty > max) {
      errors.push(`«${el.name}»: укажите количество ${min}-${max} ${el.unit}`);
    }
    if (pick.basePrice <= 0) {
      errors.push(`«${el.name}»: цена должна быть больше 0`);
    }
    if (pick.basePrice > 1_000_000) {
      errors.push(`«${el.name}»: цена слишком большая (макс. 1 000 000 ₽)`);
    }
    if (el.levelLock && !el.levelLock.includes(b.level)) {
      const okLevels = el.levelLock.join("/");
      warnings.push(`«${el.name}» обычно применяется при степени ${okLevels} — проверьте необходимость`);
    }
  }

  // Степень 4-5: рекомендуем барьер
  if (b.level === "4-5" && p.barrier && !b.withBarrier) {
    warnings.push("При сильном заражении (4-5) рекомендуем добавить барьерную защиту");
  }

  // Уличные виды — должны иметь хотя бы одну позицию по площади участка
  if (p.outdoor && b.picks.length > 0) {
    const hasAreaUnit = b.picks.some((pk) => ["сотка", "м²", "м.п."].includes(pk.unit));
    if (!hasAreaUnit) {
      warnings.push("Для участка обычно указывают площадь (сотки/м²) или периметр (м.п.)");
    }
  }

  return { errors, warnings };
}

function toContractBlock(b: UiBlock): ContractBlock {
  const p = getPest(b.pestKey)!;
  return {
    pestName: p.name,
    level: b.level,
    multiplier: LEVEL_MULTIPLIER[b.level],
    warrantyDays: b.warrantyDays,
    preparations: b.preparations,
    methodNote: p.methodNote,
    lines: buildBlockLines(b),
  };
}

function DogovorBuilderPage() {
  const [clientType, setClientType] = useState<ClientType>("person");
  const [num, setNum] = useState(genNumber);
  const [date, setDate] = useState(todayIso);

  const [personFio, setPersonFio] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [companyInn, setCompanyInn] = useState("");
  const [companyKpp, setCompanyKpp] = useState("");
  const [companyLegalAddress, setCompanyLegalAddress] = useState("");
  const [contactPerson, setContactPerson] = useState("");

  const [phone, setPhone] = useState("");
  const [objectAddress, setObjectAddress] = useState("");

  const [masterFio, setMasterFio] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Наличные");
  const [signature, setSignature] = useState<ArrayBuffer | null>(null);
  const [signatureName, setSignatureName] = useState<string>("");

  const [blocks, setBlocks] = useState<UiBlock[]>(() => [makeBlock()]);
  const selectedPests = useMemo(() => new Set(blocks.map((b) => b.pestKey)), [blocks]);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contractBlocks = useMemo(() => blocks.map(toContractBlock), [blocks]);
  const total = useMemo(() => totalSum(contractBlocks), [contractBlocks]);
  const validations = useMemo(() => blocks.map(validateBlock), [blocks]);
  const totalErrors = validations.reduce((s, v) => s + v.errors.length, 0);

  const updateBlock = (id: string, patch: Partial<UiBlock>) => {
    setBlocks((rows) => rows.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };
  const removeBlock = (id: string) => setBlocks((rows) => rows.filter((b) => b.id !== id));

  const togglePest = (pestKey: string) => {
    const existing = blocks.filter((b) => b.pestKey === pestKey);
    if (existing.length === 0) {
      setBlocks((rows) => [...rows, makeBlock(pestKey)]);
      return;
    }
    const hasWork = existing.some((b) => b.picks.length > 0 || b.withBarrier);
    if (hasWork) {
      const label = getPest(pestKey)?.name ?? "вредитель";
      const ok = typeof window === "undefined" ? true : window.confirm(`Удалить блок «${label}»? Отмеченные работы будут потеряны.`);
      if (!ok) return;
    }
    setBlocks((rows) => rows.filter((b) => b.pestKey !== pestKey));
  };

  const duplicateBlock = (pestKey: string) => {
    setBlocks((rows) => [...rows, makeBlock(pestKey)]);
  };

  const changeLevel = (id: string, level: InfestationLevel) => {
    updateBlock(id, { level, warrantyDays: LEVEL_WARRANTY_DAYS[level] });
  };

  const toggleElement = (blockId: string, el: TreatmentElement, checked: boolean) => {
    setBlocks((rows) =>
      rows.map((b) => {
        if (b.id !== blockId) return b;
        if (checked) {
          if (b.picks.some((p) => p.elementId === el.id)) return b;
          return {
            ...b,
            picks: [
              ...b.picks,
              {
                rowId: uid(),
                elementId: el.id,
                name: el.name,
                unit: el.unit,
                qty: el.defaultQty ?? 1,
                basePrice: el.basePrice,
              },
            ],
          };
        }
        return { ...b, picks: b.picks.filter((p) => p.elementId !== el.id) };
      })
    );
  };

  const updatePick = (blockId: string, rowId: string, patch: Partial<UiElementPick>) => {
    setBlocks((rows) =>
      rows.map((b) =>
        b.id === blockId
          ? { ...b, picks: b.picks.map((p) => (p.rowId === rowId ? { ...p, ...patch } : p)) }
          : b
      )
    );
  };

  const addCustomPick = (blockId: string) => {
    setBlocks((rows) =>
      rows.map((b) =>
        b.id === blockId
          ? {
              ...b,
              picks: [
                ...b.picks,
                { rowId: uid(), elementId: "custom-" + uid(), name: "", unit: "шт", qty: 1, basePrice: 0, manual: true },
              ],
            }
          : b
      )
    );
  };

  const removePick = (blockId: string, rowId: string) => {
    setBlocks((rows) =>
      rows.map((b) =>
        b.id === blockId ? { ...b, picks: b.picks.filter((p) => p.rowId !== rowId) } : b
      )
    );
  };

  const togglePrep = (blockId: string, prep: string) => {
    setBlocks((rows) =>
      rows.map((b) => {
        if (b.id !== blockId) return b;
        const has = b.preparations.includes(prep);
        return { ...b, preparations: has ? b.preparations.filter((p) => p !== prep) : [...b.preparations, prep] };
      })
    );
  };

  const addCustomPrep = (blockId: string) => {
    setBlocks((rows) =>
      rows.map((b) => {
        if (b.id !== blockId) return b;
        const v = b.customPrep.trim();
        if (!v) return b;
        if (b.preparations.includes(v)) return { ...b, customPrep: "" };
        return { ...b, preparations: [...b.preparations, v], customPrep: "" };
      })
    );
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
    if (totalErrors > 0) {
      setError(`Исправьте ошибки в блоках услуг (${totalErrors}) перед формированием PDF.`);
      return;
    }
    const cBlocks = contractBlocks.filter((b) => b.lines.length > 0);
    if (!cBlocks.length) { setError("Добавьте хотя бы одну услугу с ценой и количеством."); return; }
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
      companyName: clientType === "company" ? companyName.trim() : undefined,
      companyInn: clientType === "company" ? companyInn.trim() : undefined,
      companyKpp: clientType === "company" ? companyKpp.trim() || undefined : undefined,
      companyLegalAddress: clientType === "company" ? companyLegalAddress.trim() || undefined : undefined,
      contactPerson: clientType === "company" ? contactPerson.trim() || undefined : undefined,
      phone: phone.trim(),
      objectAddress: objectAddress.trim(),
      blocks: cBlocks,
      masterFio: masterFio.trim(),
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
            <p className="mt-2 text-xs text-muted-foreground">
              Не получилось скачать? Напишите нам в Telegram{" "}
              <a href={SITE.telegramHref} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
                {SITE.telegramHandle}
              </a>{" "}или позвоните <a href={SITE.phoneHref} className="font-semibold text-primary hover:underline">{SITE.phone}</a>.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={SITE.telegramHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-semibold text-foreground hover:border-primary hover:text-primary"
            >
              <Send className="h-4 w-4" /> {SITE.telegramHandle}
            </a>
            <Link to="/garantii" className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-semibold text-foreground hover:border-primary hover:text-primary">
              <ArrowLeft className="h-4 w-4" /> К гарантиям
            </Link>
          </div>
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
                <Field label="ФИО заказчика" full>
                  <input className={inputCls} value={personFio} onChange={(e) => setPersonFio(e.target.value)} placeholder="Иванов Иван Иванович" />
                </Field>
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
                <PestMultiSelect selected={selectedPests} onToggle={togglePest} />
                {blocks.length === 0 && (
                  <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                    Выберите хотя бы одного вредителя — отметьте чипы выше.
                  </div>
                )}
                {blocks.map((b, bi) => {
                  const pest = getPest(b.pestKey);
                  if (!pest) return null;
                  const m = LEVEL_MULTIPLIER[b.level];
                  const cb = contractBlocks[bi];
                  const bSum = cb ? blockSum(cb) : 0;
                  const v = validations[bi];
                  return (
                    <div key={b.id} className="rounded-2xl border border-border bg-background p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary text-sm font-bold text-primary">{bi + 1}</div>
                          <div className="text-sm font-bold">
                            Блок обработки {pest.outdoor && <span className="ml-1 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary">участок</span>}
                          </div>
                        </div>
                        {blocks.length > 1 && (
                          <button type="button" onClick={() => removeBlock(b.id)} className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Удалить блок">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="mt-2 text-base font-bold">{pest.name}</div>
                      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                        <label className="block">
                          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Степень заражения</span>
                          <select className={inputCls} value={b.level} onChange={(e) => changeLevel(b.id, e.target.value as InfestationLevel)}>
                            {(Object.keys(LEVEL_MULTIPLIER) as InfestationLevel[]).map((lv) => (
                              <option key={lv} value={lv}>{LEVEL_LABEL[lv]} · ×{LEVEL_MULTIPLIER[lv]}</option>
                            ))}
                          </select>
                        </label>
                        <label className="block">
                          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Гарантия (дней)</span>
                          <input type="number" min={1} className={inputCls} value={b.warrantyDays} onChange={(e) => updateBlock(b.id, { warrantyDays: Number(e.target.value) || 0 })} />
                        </label>
                      </div>

                      {/* Препараты */}
                      <div className="mt-4">
                        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Препараты</div>
                        <div className="flex flex-wrap gap-2">
                          {pest.preparations.map((p) => {
                            const on = b.preparations.includes(p);
                            return (
                              <button
                                key={p}
                                type="button"
                                onClick={() => togglePrep(b.id, p)}
                                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:border-primary hover:text-primary"}`}
                              >
                                {on ? "✓ " : ""}{p}
                              </button>
                            );
                          })}
                          {b.preparations.filter((p) => !pest.preparations.includes(p)).map((p) => (
                            <button key={p} type="button" onClick={() => togglePrep(b.id, p)} className="rounded-full border border-primary bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                              ✓ {p}
                            </button>
                          ))}
                        </div>
                        <div className="mt-2 flex gap-2">
                          <input
                            className={inputCls}
                            placeholder="Свой препарат…"
                            value={b.customPrep}
                            onChange={(e) => updateBlock(b.id, { customPrep: e.target.value })}
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomPrep(b.id); } }}
                          />
                          <button type="button" onClick={() => addCustomPrep(b.id)} className="shrink-0 rounded-md border border-border px-3 text-sm font-semibold hover:border-primary hover:text-primary">
                            Добавить
                          </button>
                        </div>
                      </div>

                      {/* Работы */}
                      <div className="mt-4">
                        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Работы (отметьте нужные)</div>
                        <div className="space-y-2">
                          {pest.elements.map((el) => {
                            const pick = b.picks.find((p) => p.elementId === el.id);
                            const checked = !!pick;
                            const catalogFinalPrice = Math.round(el.basePrice * m);
                            const finalPrice = pick
                              ? (pick.manual ? Math.round(pick.basePrice) : Math.round(pick.basePrice * m))
                              : catalogFinalPrice;
                            const lim = getElementLimits(el);
                            const outOfRange = !!pick && (pick.qty < lim.min || pick.qty > lim.max);
                            const wrongLevel = !!el.levelLock && !el.levelLock.includes(b.level);
                            return (
                              <div key={el.id} className="rounded-lg border border-border bg-card p-2">
                                <label className="flex cursor-pointer items-center gap-2">
                                  <input type="checkbox" checked={checked} onChange={(e) => toggleElement(b.id, el, e.target.checked)} />
                                  <span className="flex-1 text-sm">
                                    {el.name}
                                    <span className="ml-1 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary">{el.unit}</span>
                                    <span className="ml-1 text-xs text-muted-foreground">· {catalogFinalPrice.toLocaleString("ru-RU")} ₽/{el.unit}</span>
                                  </span>
                                </label>
                                {(el.hint || lim.hint) && (
                                  <p className="mt-1 pl-6 text-[11px] text-muted-foreground">{el.hint || lim.hint}</p>
                                )}
                                {checked && wrongLevel && (
                                  <p className="mt-1 pl-6 text-[11px] text-amber-600">
                                    Эта работа обычно нужна при степени {el.levelLock!.join("/")}.
                                  </p>
                                )}
                                {checked && pick && (
                                  <div className="mt-2 grid grid-cols-6 items-end gap-2 pl-6">
                                    <label className="col-span-3 md:col-span-2 text-xs text-muted-foreground">
                                      Кол-во ({el.unit})
                                      <input
                                        type="number"
                                        min={lim.min}
                                        max={lim.max}
                                        step={lim.step}
                                        className={`${inputCls} mt-1 ${outOfRange ? "border-destructive" : ""}`}
                                        value={pick.qty}
                                        onChange={(e) => updatePick(b.id, pick.rowId, { qty: Number(e.target.value) || 0 })}
                                        onBlur={(e) => updatePick(b.id, pick.rowId, { qty: clampQty(Number(e.target.value) || 0, el) })}
                                      />
                                    </label>
                                    <label className="col-span-3 md:col-span-2 text-xs text-muted-foreground">
                                      Цена, ₽/{el.unit}
                                      <input
                                        type="number"
                                        min={0}
                                        step={1}
                                        className={`${inputCls} mt-1`}
                                        value={pick.basePrice}
                                        onChange={(e) => updatePick(b.id, pick.rowId, { basePrice: Number(e.target.value) || 0 })}
                                      />
                                    </label>
                                    <div className="col-span-6 md:col-span-2 text-right text-sm">
                                      = <span className="font-semibold">{formatRub(pick.qty * finalPrice)}</span>
                                    </div>
                                    <label className="col-span-6 flex cursor-pointer items-center gap-2 text-[11px] text-muted-foreground">
                                      <input
                                        type="checkbox"
                                        checked={!!pick.manual}
                                        onChange={(e) => updatePick(b.id, pick.rowId, { manual: e.target.checked })}
                                      />
                                      <span>
                                        Ручная цена (не умножать на коэф. степени ×{m})
                                        {!pick.manual && (
                                          <span className="ml-1 text-muted-foreground">· базовая {pick.basePrice.toLocaleString("ru-RU")} ₽ × {m} = <b>{Math.round(pick.basePrice * m).toLocaleString("ru-RU")} ₽</b></span>
                                        )}
                                      </span>
                                    </label>
                                    {outOfRange && (
                                      <p className="col-span-6 text-[11px] text-destructive">Допустимо {lim.min}–{lim.max} {el.unit}</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          {/* кастомные строки */}
                          {b.picks.filter((p) => p.elementId.startsWith("custom-")).map((p) => (
                            <div key={p.rowId} className="rounded-lg border border-dashed border-border bg-card p-2">
                              <div className="grid grid-cols-1 gap-2 md:grid-cols-12">
                                <input className={`${inputCls} md:col-span-5`} placeholder="Своя работа" value={p.name} onChange={(e) => updatePick(b.id, p.rowId, { name: e.target.value })} />
                                <input className={`${inputCls} md:col-span-2`} placeholder="ед." value={p.unit} onChange={(e) => updatePick(b.id, p.rowId, { unit: e.target.value })} />
                                <input type="number" min={1} className={`${inputCls} md:col-span-2`} value={p.qty} onChange={(e) => updatePick(b.id, p.rowId, { qty: Number(e.target.value) || 0 })} />
                                <input type="number" min={0} className={`${inputCls} md:col-span-2`} placeholder="Цена, ₽" value={p.basePrice} onChange={(e) => updatePick(b.id, p.rowId, { basePrice: Number(e.target.value) || 0 })} />
                                <button type="button" onClick={() => removePick(b.id, p.rowId)} className="md:col-span-1 rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Удалить">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                              <div className="mt-1 flex flex-wrap items-center justify-between gap-2 pl-1 text-xs text-muted-foreground">
                                <label className="flex cursor-pointer items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={!!p.manual}
                                    onChange={(e) => updatePick(b.id, p.rowId, { manual: e.target.checked })}
                                  />
                                  <span>Ручная цена (не умножать на ×{m})</span>
                                </label>
                                <span>
                                  = <b>{formatRub(p.qty * (p.manual ? Math.round(p.basePrice) : Math.round(p.basePrice * m)))}</b>
                                </span>
                              </div>
                            </div>
                          ))}
                          <button type="button" onClick={() => addCustomPick(b.id)} className="inline-flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-1.5 text-xs font-semibold text-primary hover:bg-secondary">
                            <Plus className="h-3.5 w-3.5" /> Своя работа
                          </button>
                        </div>
                      </div>

                      {/* Барьер */}
                      {pest.barrier && (
                        <div className="mt-4 rounded-lg border border-border bg-card p-3">
                          <label className="flex cursor-pointer items-center justify-between gap-2">
                            <span className="flex items-center gap-2 text-sm">
                              <input type="checkbox" checked={b.withBarrier} onChange={(e) => updateBlock(b.id, { withBarrier: e.target.checked })} />
                              <span>{pest.barrier.name}</span>
                            </span>
                            <span className="text-sm font-semibold">+ {(b.barrierPriceOverride ?? Math.round(pest.barrier.basePrice * m)).toLocaleString("ru-RU")} ₽</span>
                          </label>
                          {b.withBarrier && (
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <span>Цена, ₽:</span>
                              <input
                                type="number"
                                min={0}
                                className={`${inputCls} h-8 w-32`}
                                value={b.barrierPriceOverride ?? Math.round(pest.barrier.basePrice * m)}
                                onChange={(e) => updateBlock(b.id, { barrierPriceOverride: Number(e.target.value) || 0 })}
                              />
                              {b.barrierPriceOverride != null && (
                                <button
                                  type="button"
                                  onClick={() => updateBlock(b.id, { barrierPriceOverride: undefined })}
                                  className="text-primary hover:underline"
                                >
                                  Сбросить к базовой
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-4 flex items-center justify-between rounded-lg bg-secondary px-3 py-2 text-sm">
                        <span className="text-muted-foreground">Итого по блоку (коэф. ×{m})</span>
                        <span className="font-bold text-primary">{formatRub(bSum)}</span>
                      </div>

                      {v.errors.length > 0 && (
                        <div className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                          <div className="mb-1 font-bold">Нужно исправить:</div>
                          <ul className="list-disc space-y-0.5 pl-4">
                            {v.errors.map((er, i) => <li key={i}>{er}</li>)}
                          </ul>
                        </div>
                      )}
                      {v.warnings.length > 0 && (
                        <div className="mt-3 rounded-md border border-amber-400/40 bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                          <div className="mb-1 font-bold">Рекомендации:</div>
                          <ul className="list-disc space-y-0.5 pl-4">
                            {v.warnings.map((wr, i) => <li key={i}>{wr}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
                {blocks.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1 text-xs text-muted-foreground">
                    <span>Нужен ещё один блок для того же вредителя?</span>
                    {Array.from(new Set(blocks.map((b) => b.pestKey))).map((pk) => {
                      const p = getPest(pk);
                      if (!p) return null;
                      return (
                        <button key={pk} type="button" onClick={() => duplicateBlock(pk)} className="inline-flex items-center gap-1 rounded-md border border-dashed border-border px-2 py-1 font-semibold text-primary hover:bg-secondary">
                          <Plus className="h-3 w-3" /> ещё «{p.name}»
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </Block>

            <Block title="4. Исполнитель и условия">
              <Field label="ФИО мастера" full>
                <input className={inputCls} value={masterFio} onChange={(e) => setMasterFio(e.target.value)} placeholder="Сидоров С.С." />
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
                {contractBlocks.map((cb, i) => cb.lines.length > 0 && (
                  <div key={i} className="border-t border-border pt-2 first:border-0 first:pt-0">
                    <div className="mb-1 text-xs font-bold uppercase tracking-wider text-primary">{cb.pestName} · ст. {cb.level}</div>
                    {cb.lines.map((ln, j) => (
                      <div key={j} className="flex justify-between gap-3">
                        <span className="truncate text-muted-foreground">{ln.name} × {ln.qty}</span>
                        <span className="shrink-0 font-semibold">{formatRub(ln.qty * ln.price)}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {error && (
                <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">{error}</div>
              )}

              <button
                type="button"
                onClick={onGenerate}
                disabled={busy || totalErrors > 0}
                className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-cta-gradient font-bold text-accent-foreground shadow-cta hover:scale-[1.01] disabled:opacity-60 disabled:hover:scale-100"
              >
                {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Готовлю PDF…</> : <><Download className="h-4 w-4" /> Сформировать PDF</>}
              </button>
              {totalErrors > 0 && (
                <p className="mt-2 text-center text-[11px] text-destructive">
                  Ошибок в блоках: {totalErrors}. Исправьте, чтобы сформировать PDF.
                </p>
              )}

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

function PestMultiSelect({ selected, onToggle }: { selected: Set<string>; onToggle: (key: string) => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-secondary/30 p-3">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Вредители <span className="normal-case text-[10px] font-normal">(можно выбрать несколько)</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {CATALOG.map((p) => {
          const on = selected.has(p.key);
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => onToggle(p.key)}
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:border-primary hover:text-primary"}`}
            >
              <span>{on ? "✓" : "+"}</span>
              <span>{p.name}</span>
              {p.outdoor && (
                <span className={`rounded px-1 py-0.5 text-[9px] uppercase ${on ? "bg-primary-foreground/20" : "bg-primary/10 text-primary"}`}>участок</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
