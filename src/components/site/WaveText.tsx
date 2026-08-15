import type { ElementType } from "react";

interface Props {
  text: string;
  as?: ElementType;
  className?: string;
  /** Speed of the wave (one full cycle), seconds. */
  duration?: number;
  /**
   * Рендерит текст одним текстовым узлом (без разбивки на буквы).
   * Нужно для заголовков H1: парсеры и поисковые роботы получают цельную
   * строку, а анимация применяется ко всему элементу.
   */
  whole?: boolean;
}

/**
 * Renders text with a colored "wave" running through letters infinitely.
 * The wave shifts each letter through primary → accent → primary-glow.
 */
export function WaveText({ text, as: Tag = "span", className = "", duration = 3.2, whole = false }: Props) {
  if (whole) {
    return (
      <Tag
        className={`wave-text wave-text-whole ${className}`}
        style={{ animationDuration: `${duration}s` }}
      >
        {text}
      </Tag>
    );
  }
  const words = text.split(" ");
  const total = Array.from(text.replace(/\s/g, "")).length || 1;
  let charIdx = 0;
  return (
    <Tag className={`wave-text ${className}`} aria-label={text}>
      {words.map((word, wi) => {
        const chars = Array.from(word);
        return (
          <span key={wi}>
            <span className="wave-word" aria-hidden>
              {chars.map((ch, ci) => {
                const delay = (charIdx / total) * -duration;
                charIdx += 1;
                return (
                  <span
                    key={ci}
                    className="wave-char"
                    style={{
                      animationDuration: `${duration}s`,
                      animationDelay: `${delay}s`,
                    }}
                  >
                    {ch}
                  </span>
                );
              })}
            </span>
            {wi < words.length - 1 ? " " : null}
          </span>
        );
      })}
    </Tag>
  );
}