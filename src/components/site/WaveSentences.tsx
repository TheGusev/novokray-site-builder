import { WaveText } from "./WaveText";

interface Props {
  text: string;
  className?: string;
  /** Delay before the first word appears, ms */
  startDelay?: number;
  /** Delay between words, ms */
  wordStep?: number;
  /** Extra pause inserted between sentences, ms */
  sentencePause?: number;
  /** Wave color cycle duration, seconds */
  waveDuration?: number;
}

/**
 * Renders a paragraph word-by-word, with an extra pause between sentences,
 * like a voiceover reading the text. The colored "wave" runs continuously
 * through the already-revealed words in the H1 palette.
 */
export function WaveSentences({
  text,
  className = "",
  startDelay = 0,
  wordStep = 90,
  sentencePause = 700,
  waveDuration = 6,
}: Props) {
  // Split into sentences, then into words; keep terminators with their words.
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.split(/\s+/));

  let elapsed = startDelay;

  return (
    <p className={className} aria-label={text}>
      <span className="sr-only">{text}</span>
      {sentences.map((words, si) => (
        <span key={si} aria-hidden>
          {words.map((word, wi) => {
            const delay = elapsed;
            elapsed += wordStep;
            const isLastWordOfSentence = wi === words.length - 1;
            if (isLastWordOfSentence && si < sentences.length - 1) {
              elapsed += sentencePause;
            }
            return (
              <span
                key={wi}
                className="wave-word-in inline-block whitespace-nowrap opacity-0 will-change-transform"
                style={{ animationDelay: `${delay}ms` }}
              >
                <WaveText text={word} className="on-dark" duration={waveDuration} />
                {!(isLastWordOfSentence && si === sentences.length - 1) ? "\u00A0" : null}
              </span>
            );
          })}
        </span>
      ))}
    </p>
  );
}
