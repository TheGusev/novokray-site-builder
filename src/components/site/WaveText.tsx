import type { ElementType } from "react";

interface Props {
  text: string;
  as?: ElementType;
  className?: string;
  /** Speed of the wave (one full cycle), seconds. */
  duration?: number;
}

/**
 * Renders text with a colored "wave" running through letters infinitely.
 * The wave shifts each letter through primary → accent → primary-glow.
 */
export function WaveText({ text, as: Tag = "span", className = "", duration = 3.2 }: Props) {
  const chars = Array.from(text);
  const n = chars.length || 1;
  return (
    <Tag className={`wave-text ${className}`} aria-label={text}>
      {chars.map((ch, i) => (
        <span
          key={i}
          aria-hidden
          className="wave-char"
          style={{
            animationDuration: `${duration}s`,
            animationDelay: `${(i / n) * -duration}s`,
          }}
        >
          {ch === " " ? "\u00A0" : ch}
        </span>
      ))}
    </Tag>
  );
}