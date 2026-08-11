import { useState } from "react";
import { Play, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import type { WorkVideo } from "@/data/videos";
import { GOALS, trackGoal } from "@/lib/analytics";

function mmss(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

interface Props {
  video: WorkVideo;
  /** Приоритетная загрузка постера (первая карточка) */
  eager?: boolean;
}

/**
 * Карточка видео: до клика в DOM нет ни одного <video> — грузится только
 * лёгкий webp-постер. Сам файл подтягивается по запросу пользователя.
 */
export function VideoCard({ video, eager = false }: Props) {
  const [open, setOpen] = useState(false);

  const play = () => {
    setOpen(true);
    trackGoal(GOALS.videoPlay, { video: video.slug });
  };

  return (
    <>
      <button
        type="button"
        onClick={play}
        aria-label={`Смотреть видео: ${video.title}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card text-left shadow-card transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant"
      >
        <div
          className={`relative overflow-hidden bg-secondary ${
            video.orientation === "portrait" ? "aspect-[3/4]" : "aspect-[16/10]"
          }`}
        >
          <img
            src={video.poster}
            alt={video.title}
            title={video.title}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-elegant transition group-hover:scale-110">
              <Play className="ml-0.5 h-6 w-6 fill-current" />
            </span>
          </span>
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white">
            <Clock className="h-3 w-3" />
            {mmss(video.durationSec)}
          </span>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <h3 className="font-display text-base font-bold leading-snug text-foreground group-hover:text-primary">
            {video.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{video.description}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {video.tags.map((t) => (
              <span key={t} className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
                #{t}
              </span>
            ))}
          </div>
        </div>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[min(96vw,900px)] border-0 bg-black/95 p-2 sm:p-4">
          <VisuallyHidden>
            <DialogTitle>{video.title}</DialogTitle>
            <DialogDescription>{video.description}</DialogDescription>
          </VisuallyHidden>
          {open && (
            <video
              src={video.src}
              poster={video.poster}
              controls
              autoPlay
              playsInline
              preload="auto"
              className={`mx-auto rounded-xl bg-black ${
                video.orientation === "portrait"
                  ? "h-[72vh] w-auto max-w-full"
                  : "max-h-[72vh] w-full"
              }`}
            />
          )}
          <p className="px-2 pb-1 pt-2 text-center text-sm text-white/80">{video.title}</p>
        </DialogContent>
      </Dialog>
    </>
  );
}