import { Link } from "@tanstack/react-router";
import { ArrowRight, Film } from "lucide-react";
import { VideoCard } from "@/components/site/VideoCard";
import type { WorkVideo } from "@/data/videos";
import { typo } from "@/lib/typography";

interface Props {
  video: WorkVideo;
  heading: string;
  text?: string;
  /** Компактный вариант: ролик слева, текст справа */
  compact?: boolean;
  className?: string;
}

/**
 * Блок с одним роликом на посадочной странице + кнопка на общую галерею.
 * Видео по-прежнему грузится только по клику: в DOM лежит лёгкий постер.
 */
export function VideoTeaser({ video, heading, text, compact = false, className = "" }: Props) {
  const button = (
    <Link
      to="/video"
      className="inline-flex items-center gap-2 rounded-xl bg-cta-gradient px-5 py-3 text-sm font-bold text-accent-foreground shadow-cta transition hover:gap-3"
    >
      Смотреть все видео работ <ArrowRight className="h-4 w-4" />
    </Link>
  );

  return (
    <div className={className}>
      <h2 className="flex items-center gap-2 font-display text-2xl font-bold md:text-3xl">
        <Film className="h-6 w-6 text-primary" /> {typo(heading)}
      </h2>
      {text && <p className="mt-2 max-w-2xl text-muted-foreground">{typo(text)}</p>}
      <div className={`mt-6 grid items-start gap-6 ${compact ? "sm:grid-cols-[minmax(0,260px)_auto]" : "sm:grid-cols-[minmax(0,320px)_auto]"} sm:justify-start`}>
        <VideoCard video={video} schema={false} />
        <div className="flex flex-col items-start gap-4 pt-1">{button}</div>
      </div>
    </div>
  );
}
