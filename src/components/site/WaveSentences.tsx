import { useEffect, useMemo, useState } from "react";

interface Props {
  text: string;
  className?: string;
  startDelay?: number;
  wordStep?: number;
  sentencePause?: number;
}

interface WordToken {
  id: string;
  text: string;
}

export function WaveSentences({
  text,
  className = "",
  startDelay = 0,
  wordStep = 160,
  sentencePause = 950,
}: Props) {
  const sentences = useMemo(
    () =>
      text
        .split(/(?<=[.!?])\s+/)
        .map((sentence) => sentence.trim())
        .filter(Boolean),
    [text],
  );

  const words = useMemo<WordToken[]>(
    () =>
      sentences.flatMap((sentence, sentenceIndex) =>
        sentence
          .split(/\s+/)
          .filter(Boolean)
          .map((word, wordIndex) => ({
            id: `${sentenceIndex}-${wordIndex}`,
            text: word,
          })),
      ),
    [sentences],
  );

  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (!words.length) {
      setVisibleCount(0);
      return;
    }

    if (typeof window === "undefined") return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisibleCount(words.length);
      return;
    }

    setVisibleCount(0);

    let elapsed = startDelay;
    let revealed = 0;
    const timeouts: number[] = [];

    sentences.forEach((sentence, sentenceIndex) => {
      const sentenceWords = sentence.split(/\s+/).filter(Boolean);

      sentenceWords.forEach(() => {
        revealed += 1;
        const nextVisibleCount = revealed;
        timeouts.push(window.setTimeout(() => setVisibleCount(nextVisibleCount), elapsed));
        elapsed += wordStep;
      });

      if (sentenceIndex < sentences.length - 1) {
        elapsed += sentencePause;
      }
    });

    return () => {
      timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, [sentencePause, sentences, startDelay, wordStep, words.length]);

  const visibleWords = words.slice(0, visibleCount);

  return (
    <p className={`hero-sentence-reveal ${className}`} aria-label={text}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {visibleWords.map((word, index) => (
          <span key={word.id} className="reveal-word">
            {index > 0 ? " " : null}
            {word.text}
          </span>
        ))}
      </span>
    </p>
  );
}
