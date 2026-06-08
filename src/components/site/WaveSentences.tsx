interface Props {
  text: string;
  className?: string;
  startDelay?: number;
  wordStep?: number;
  sentencePause?: number;
}

export function WaveSentences({
  text,
  className = "",
  startDelay = 0,
  wordStep = 85,
  sentencePause = 600,
}: Props) {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.split(/\s+/));

  let elapsed = startDelay;

  return (
    <p className={`paragraph-wave ${className}`} aria-label={text}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {sentences.map((words, si) => (
          <span key={si}>
            {words.map((word, wi) => {
              const delay = elapsed;
              elapsed += wordStep;
              const isLastWordOfSentence = wi === words.length - 1;
              const isLastOverall = isLastWordOfSentence && si === sentences.length - 1;
              if (isLastWordOfSentence && !isLastOverall) elapsed += sentencePause;
              return (
                <span key={wi}>
                  <span
                    className="reveal-word"
                    style={{ animationDelay: `${delay}ms` }}
                  >
                    {word}
                  </span>
                  {!isLastOverall ? " " : null}
                </span>
              );
            })}
          </span>
        ))}
      </span>
    </p>
  );
}
