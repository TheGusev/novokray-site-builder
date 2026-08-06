import { Link } from "@tanstack/react-router";
import { AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";

export function slugify(str: string): string {
  const map: Record<string, string> = {
    а:"a",б:"b",в:"v",г:"g",д:"d",е:"e",ё:"yo",ж:"zh",з:"z",и:"i",й:"y",
    к:"k",л:"l",м:"m",н:"n",о:"o",п:"p",р:"r",с:"s",т:"t",у:"u",ф:"f",
    х:"h",ц:"c",ч:"ch",ш:"sh",щ:"sch",ъ:"",ы:"y",ь:"",э:"e",ю:"yu",я:"ya"," ":"-"};
  return str.toLowerCase().split("").map(c=>map[c]??c).join("")
    .replace(/[^a-z0-9-]/g,"").replace(/-+/g,"-").replace(/^-|-$/g,"");
}

export interface TocItem { id: string; title: string; level: 2 | 3 }

export function extractToc(body: string): TocItem[] {
  const out: TocItem[] = [];
  for (const line of body.split("\n")) {
    const m = line.match(/^(##|###)\s+(.+)$/);
    if (m) out.push({ level: m[1].length === 2 ? 2 : 3, title: m[2].trim(), id: slugify(m[2].trim()) });
  }
  return out;
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  // [label](url) -> Link or <a>, **bold**, `code`
  const parts: ReactNode[] = [];
  let i = 0; let key = 0;
  const re = /(\*\*([^*]+)\*\*)|(`([^`]+)`)|(\[([^\]]+)\]\(([^)]+)\))/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > i) parts.push(text.slice(i, m.index));
    if (m[1]) parts.push(<strong key={`${keyPrefix}-${key++}`}>{m[2]}</strong>);
    else if (m[3]) parts.push(<code key={`${keyPrefix}-${key++}`} className="rounded bg-secondary px-1 py-0.5 text-[0.92em]">{m[4]}</code>);
    else if (m[5]) {
      const label = m[6]; const href = m[7];
      if (href.startsWith("/")) parts.push(<Link key={`${keyPrefix}-${key++}`} to={href} className="text-primary underline decoration-primary/40 hover:decoration-primary">{label}</Link>);
      else parts.push(<a key={`${keyPrefix}-${key++}`} href={href} target="_blank" rel="noopener noreferrer nofollow" className="text-primary underline decoration-primary/40 hover:decoration-primary">{label}</a>);
    }
    i = m.index + m[0].length;
  }
  if (i < text.length) parts.push(text.slice(i));
  return parts;
}

export type MarkdownBlock =
  | { kind: "h2"; text: string }
  | { kind: "h3"; text: string }
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | { kind: "table"; head: string[]; rows: string[][] }
  | { kind: "callout"; flavor: "warn" | "info" | "ok"; text: string };

function splitTableRow(line: string): string[] {
  const trimmed = line.trim();
  const withoutEdges = trimmed.replace(/^\|/, "").replace(/\|$/, "");
  return withoutEdges.split("|").map((cell) => cell.trim());
}

function isTableDelimiter(line: string): boolean {
  const cells = splitTableRow(line);
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

export function parseMarkdownBlocks(body: string): MarkdownBlock[] {
  const lines = body.replace(/\r\n/g, "\n").split("\n");
  const out: MarkdownBlock[] = [];
  const nextContentLine = (from: number): number => {
    let index = from;
    while (index < lines.length && !lines[index].trim()) index++;
    return index;
  };
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    if (line.startsWith("## ")) { out.push({ kind: "h2", text: line.slice(3).trim() }); i++; continue; }
    if (line.startsWith("### ")) { out.push({ kind: "h3", text: line.slice(4).trim() }); i++; continue; }
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) { items.push(lines[i].replace(/^[-*]\s+/, "")); i++; }
      out.push({ kind: "ul", items }); continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) { items.push(lines[i].replace(/^\d+\.\s+/, "")); i++; }
      out.push({ kind: "ol", items }); continue;
    }
    if (line.startsWith("> ")) {
      const raw = line.slice(2).trim();
      let flavor: "warn" | "info" | "ok" = "info";
      let text = raw;
      if (raw.startsWith("⚠️")) { flavor = "warn"; text = raw.replace(/^⚠️\s*/, ""); }
      else if (raw.startsWith("✅")) { flavor = "ok"; text = raw.replace(/^✅\s*/, ""); }
      else if (raw.startsWith("ℹ️")) { flavor = "info"; text = raw.replace(/^ℹ️\s*/, ""); }
      out.push({ kind: "callout", flavor, text }); i++; continue;
    }
    const delimiterIndex = nextContentLine(i + 1);
    if (line.includes("|") && delimiterIndex < lines.length && isTableDelimiter(lines[delimiterIndex])) {
      const head = splitTableRow(line);
      i = delimiterIndex + 1;
      const rows: string[][] = [];
      while (i < lines.length) {
        i = nextContentLine(i);
        if (i >= lines.length || !lines[i].includes("|")) break;
        const cells = splitTableRow(lines[i]);
        rows.push(head.map((_, index) => cells[index] ?? ""));
        i++;
      }
      out.push({ kind: "table", head, rows }); continue;
    }
    // paragraph (one line per paragraph by convention; body uses \n\n)
    out.push({ kind: "p", text: line.trim() }); i++;
  }
  return out;
}

export function renderBody(body: string): ReactNode {
  const blocks = parseMarkdownBlocks(body);
  return (
    <>
      {blocks.map((b, idx) => {
        switch (b.kind) {
          case "h2": {
            const id = slugify(b.text);
            return <h2 key={idx} id={id} className="mt-10 scroll-mt-24 font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">{renderInline(b.text, `h2-${idx}`)}</h2>;
          }
          case "h3": {
            const id = slugify(b.text);
            return <h3 key={idx} id={id} className="mt-7 scroll-mt-24 font-display text-xl font-semibold text-foreground md:text-2xl">{renderInline(b.text, `h3-${idx}`)}</h3>;
          }
          case "p":
            return <p key={idx} className="mt-4 text-base leading-relaxed text-foreground/90">{renderInline(b.text, `p-${idx}`)}</p>;
          case "ul":
            return <ul key={idx} className="mt-4 list-disc space-y-1.5 pl-6 text-base leading-relaxed text-foreground/90 marker:text-primary">{b.items.map((it, j) => <li key={j}>{renderInline(it, `ul-${idx}-${j}`)}</li>)}</ul>;
          case "ol":
            return <ol key={idx} className="mt-4 list-decimal space-y-1.5 pl-6 text-base leading-relaxed text-foreground/90 marker:text-primary marker:font-semibold">{b.items.map((it, j) => <li key={j}>{renderInline(it, `ol-${idx}-${j}`)}</li>)}</ol>;
          case "table":
            return (
              <div key={idx} className="mt-5 overflow-x-auto rounded-lg border border-border bg-card shadow-card" role="region" aria-label="Сравнительная таблица" tabIndex={0}>
                <table className="w-full min-w-[36rem] border-collapse text-sm">
                  <thead className="bg-secondary"><tr>{b.head.map((h, j) => <th key={j} scope="col" className="px-4 py-3 text-left font-semibold text-secondary-foreground">{renderInline(h, `th-${idx}-${j}`)}</th>)}</tr></thead>
                  <tbody>{b.rows.map((r, ri) => (
                    <tr key={ri} className="border-t border-border even:bg-muted/40">{r.map((c, ci) => <td key={ci} className="px-4 py-3 align-top text-foreground/90">{renderInline(c, `td-${idx}-${ri}-${ci}`)}</td>)}</tr>
                  ))}</tbody>
                </table>
              </div>
            );
          case "callout": {
            const Icon = b.flavor === "warn" ? AlertTriangle : b.flavor === "ok" ? CheckCircle2 : Info;
            const cls = b.flavor === "warn"
              ? "border-destructive/30 bg-destructive/10 text-foreground"
              : b.flavor === "ok"
              ? "border-success/30 bg-success/10 text-foreground"
              : "border-primary/30 bg-primary/5 text-foreground";
            const iconCls = b.flavor === "warn" ? "text-destructive" : b.flavor === "ok" ? "text-success" : "text-primary";
            return (
              <div key={idx} className={`mt-5 flex gap-3 rounded-xl border p-4 ${cls}`}>
                <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${iconCls}`} />
                <div className="text-[15px] leading-relaxed">{renderInline(b.text, `cb-${idx}`)}</div>
              </div>
            );
          }
        }
      })}
    </>
  );
}

export function wordCount(body: string): number {
  return body.replace(/[#>*`|\-\[\]()]/g, " ").split(/\s+/).filter(Boolean).length;
}