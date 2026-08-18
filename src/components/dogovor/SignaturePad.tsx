import { useEffect, useRef, useState } from "react";
import { Eraser, Check, PenLine } from "lucide-react";

interface Props {
  label: string;
  hint?: string;
  onChange: (png: ArrayBuffer | null) => void;
}

/** Холст для подписи пальцем или мышью. Отдаёт обрезанный PNG с прозрачным фоном. */
export function SignaturePad({ label, hint, onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const dirty = useRef(false);
  const [hasInk, setHasInk] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0f1c3f";
  }, []);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const p = pos(e);
    drawing.current = true;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const p = pos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    dirty.current = true;
    if (!hasInk) setHasInk(true);
    if (saved) setSaved(false);
  };

  const end = () => {
    drawing.current = false;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    dirty.current = false;
    setHasInk(false);
    setSaved(false);
    onChange(null);
  };

  const save = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !dirty.current) return;
    const trimmed = trim(canvas);
    const blob = await new Promise<Blob | null>((res) => trimmed.toBlob(res, "image/png"));
    if (!blob) return;
    onChange(await blob.arrayBuffer());
    setSaved(true);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
          <PenLine className="h-3.5 w-3.5" /> {label}
        </span>
        {saved && <span className="text-xs font-semibold text-emerald-600">Подпись сохранена</span>}
      </div>
      <canvas
        ref={canvasRef}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
        onPointerCancel={end}
        className="h-36 w-full cursor-crosshair rounded-lg border border-dashed border-input bg-background"
        style={{ touchAction: "none" }}
        aria-label={label}
      />
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">{hint ?? "Распишитесь пальцем или мышью"}</span>
        <div className="flex gap-2">
          <button type="button" onClick={clear} className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-semibold hover:bg-secondary">
            <Eraser className="h-3.5 w-3.5" /> Очистить
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!hasInk}
            className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground disabled:opacity-40"
          >
            <Check className="h-3.5 w-3.5" /> Готово
          </button>
        </div>
      </div>
    </div>
  );
}

/** Обрезает прозрачные поля вокруг штриха. */
function trim(src: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = src.getContext("2d");
  if (!ctx) return src;
  const { width, height } = src;
  const data = ctx.getImageData(0, 0, width, height).data;
  let minX = width, minY = height, maxX = 0, maxY = 0, found = false;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3]! > 8) {
        found = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (!found) return src;
  const pad = 6;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(width - 1, maxX + pad);
  maxY = Math.min(height - 1, maxY + pad);
  const out = document.createElement("canvas");
  out.width = maxX - minX + 1;
  out.height = maxY - minY + 1;
  out.getContext("2d")?.drawImage(src, minX, minY, out.width, out.height, 0, 0, out.width, out.height);
  return out;
}