import { useEffect, useLayoutEffect, useRef, useState } from "react";

// SSR-safe layout effect
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Reveal-on-scroll hook. To avoid a flash of invisible content above the fold
 * (and a hydration mismatch), the element starts visible and is only hidden if,
 * on mount, it sits below the viewport. After that, an IntersectionObserver
 * reveals it once it enters view.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(threshold = 0.12) {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(true);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return;
    const rect = el.getBoundingClientRect();
    const belowFold = rect.top > window.innerHeight - 40;
    if (!belowFold) return; // already visible, keep shown=true
    setShown(false);

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        });
      },
      { threshold, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return { ref, shown };
}