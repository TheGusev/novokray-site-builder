import { WaveText } from "./WaveText";

interface Props {
  text: string;
  className?: string;
  /** Delay before the first sentence appears, ms */
  startDelay?: number;
  /** Gap between sentence reveals, ms */
  step?: number;
  /** Wave color cycle duration, seconds */
  waveDuration?: number;
}

/**
 * Renders a paragraph sentence-by-sentence with a soft rise-in animation,
 * while a colored wave (same palette as the H1) runs through the letters.
 */
export function WaveSentences({
  text,
  className = "",
  startDelay = 0,
  step = 650,
  waveDuration = 6,
}: Props) {
  // Split on sentence terminators, keep the terminator with the sentence
  const parts = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <p className={className} aria-label={text}>
      <span className="sr-only">{text}</span>
      {parts.map((sentence, i) => (
        <span
          key={i}
          aria-hidden
          className="wave-sentence inline-block opacity-0"
          style={{
            animation: "wave-sentence-in 600ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
            animationDelay: `${startDelay + i * step}ms`,
          }}
        >
          <WaveText text={sentence} className="on-dark" duration={waveDuration} />
          {i < parts.length - 1 ? " " : null}
        </span>
      ))}
    </p>
  );
}
