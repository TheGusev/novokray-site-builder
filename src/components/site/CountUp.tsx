import { useEffect, useRef, useState } from "react";
import { useReveal } from "@/hooks/use-reveal";

interface Props {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
}

export function CountUp({ value, duration = 1400, suffix = "", prefix = "", decimals = 0, className = "" }: Props) {
  const { ref, shown } = useReveal<HTMLSpanElement>();
  const [n, setN] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    if (!shown || done.current) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof requestAnimationFrame === "undefined") {
      done.current = true;
      setN(value);
      return;
    }
    const start = performance.now();
    let raf = 0;
    let finished = false;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(value * eased);
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        finished = true;
        done.current = true;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      // Анимацию прервали до конца (например, блок ушёл из зоны видимости) —
      // разрешаем перезапуск, чтобы на экране не остался ноль.
      if (!finished) done.current = false;
    };
  }, [shown, value, duration]);

  const formatted = decimals
    ? n.toFixed(decimals)
    : Math.round(n).toLocaleString("ru-RU");

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}