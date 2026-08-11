import { useEffect, useState } from "react";
import { Play, Clock, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { videoJsonLd, type WorkVideo } from "@/data/videos";
import { SITE } from "@/data/site";
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
  /** Печатать JSON-LD VideoObject рядом с карточкой (выкл. там, где разметка уже в head) */
  schema?: boolean;
}

/**
 * Карточка видео: до клика в DOM нет ни одного <video> — грузится только
 * лёгкий webp-постер. Сам файл подтягивается по запросу пользователя.
 */
export function VideoCard({ video, eager = false, schema = true }: Props) {
  const [open, setOpen] = useState(false);

  // Блокируем прокрутку фона, пока открыт полноэкранный плеер
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

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
        <DialogContent
          showCloseButton={false}
          className="left-0 top-0 flex h-[100dvh] w-screen max-w-none translate-x-0 translate-y-0 flex-col items-center justify-center gap-0 rounded-none border-0 bg-black p-0 shadow-none"
        >
          <VisuallyHidden>
            <DialogTitle>{video.title}</DialogTitle>
            <DialogDescription>{video.description}</DialogDescription>
          </VisuallyHidden>

          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Закрыть видео"
            className="absolute right-3 z-20 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25"
            style={{ top: "max(0.75rem, env(safe-area-inset-top))" }}
          >
            <X className="h-6 w-6" />
          </button>

          {open && (
            <video
              src={video.src}
              poster={video.poster}
              controls
              autoPlay
              playsInline
              preload="auto"
              className="max-h-[100dvh] max-w-full object-contain"
              style={{
                height: "calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 3.5rem)",
                width: "100%",
              }}
            />
          )}

          <p
            className="absolute inset-x-0 z-10 px-14 text-center text-sm text-white/85"
            style={{ bottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
          >
            {video.title}
          </p>
        </DialogContent>
      </Dialog>

      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({ "@context": "https://schema.org", ...videoJsonLd(video, SITE.domain) }),
          }}
        />
      )}
    </>
  );
}