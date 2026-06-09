import { useEffect, useMemo, useState } from "react";

interface Props {
  text: string;
  className?: string;
  startDelay?: number;
  wordStep?: number;
  sentencePause?: number;
  highlights?: Record<string, "nature" | "ozone" | "warm">;
}

interface WordToken {
  id: string;
  text: string;
}

export function WaveSentences({
  text,
  className = "",
  startDelay = 0,
  wordStep = 190,
  sentencePause = 700,
  highlights,
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

  const normalizedHighlights = useMemo(() => {
    if (!highlights) return null;
    const map = new Map<string, "nature" | "ozone" | "warm">();
    Object.entries(highlights).forEach(([k, v]) => map.set(k.toLowerCase(), v));
    return map;
  }, [highlights]);

  const accentFor = (word: string) => {
    if (!normalizedHighlights) return null;
    const key = word.toLowerCase().replace(/[.,!?;:()«»"']/g, "");
    return normalizedHighlights.get(key) ?? null;
  };

  return (
    <p className={`hero-sentence-reveal ${className}`} aria-label={text}>
      <span className="sr-only">{text}</span>
      <span className="hero-sentence-reveal__ghost" aria-hidden>
        {text}
      </span>
      <span className="hero-sentence-reveal__live" aria-hidden>
        {visibleWords.map((word, index) => (
          <span
            key={word.id}
            className={`reveal-word${accentFor(word.text) ? ` reveal-word--accent-${accentFor(word.text)}` : ""}`}
          >
            {index > 0 ? " " : null}
            {word.text}
          </span>
        ))}
      </span>
    </p>
  );
}
