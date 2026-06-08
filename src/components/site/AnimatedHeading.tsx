import { useReveal } from "@/hooks/use-reveal";
import type { ReactNode } from "react";

interface Props {
  text: string;
  highlight?: string;
  className?: string;
  as?: "h1" | "h2" | "h3";
  after?: ReactNode;
}

export function AnimatedHeading({ text, highlight, className = "", as: Tag = "h2", after }: Props) {
  const { ref, shown } = useReveal<HTMLHeadingElement>();
  const words = text.split(" ");
  return (
    <Tag ref={ref} className={className}>
      {words.map((w, i) => {
        const isHl = highlight && w.toLowerCase().includes(highlight.toLowerCase());
        return (
          <span
            key={i}
            className="inline-block overflow-hidden align-baseline pr-[0.25em]"
          >
            <span
              style={{ transitionDelay: shown ? `${i * 70}ms` : "0ms" }}
              className={`inline-block transition-all duration-700 ease-out ${
                shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full"
              } ${isHl ? "relative text-accent" : ""}`}
            >
              {w}
              {isHl && (
                <span
                  className={`absolute inset-x-0 -bottom-0.5 h-[0.18em] origin-left rounded-full bg-accent/30 transition-transform duration-700 ${
                    shown ? "scale-x-100" : "scale-x-0"
                  }`}
                  style={{ transitionDelay: `${(i + 1) * 90 + 200}ms` }}
                />
              )}
            </span>
          </span>
        );
      })}
      {after}
    </Tag>
  );
}