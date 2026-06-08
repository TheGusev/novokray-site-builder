import { Link } from "@tanstack/react-router";

interface Props {
  variant?: "dark" | "light";
  withTagline?: boolean;
  className?: string;
}

export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="lg-shield" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <path
        d="M24 3 L42 9 V24 C42 34 34 42 24 45 C14 42 6 34 6 24 V9 Z"
        fill="url(#lg-shield)"
      />
      <path
        d="M24 14 C28 19 31 23 31 27 C31 31 28 34 24 34 C20 34 17 31 17 27 C17 23 20 19 24 14 Z"
        fill="oklch(0.99 0 0)"
        opacity="0.95"
      />
      <circle cx="24" cy="28" r="2.5" fill="currentColor" />
    </svg>
  );
}

export function Logo({ variant = "dark", withTagline = false, className = "" }: Props) {
  const fg = variant === "light" ? "text-white" : "text-primary";
  const sub = variant === "light" ? "text-white/70" : "text-muted-foreground";
  return (
    <Link to="/" className={`flex items-center gap-2.5 ${className}`} aria-label="Дез-Федерация — на главную">
      <span className={fg}>
        <LogoMark className="h-9 w-9" />
      </span>
      <span className="flex flex-col leading-none">
        <span className={`font-display text-[15px] font-extrabold tracking-tight ${variant === "light" ? "text-white" : "text-foreground"}`}>
          Дез-Федерация
        </span>
        <span className={`mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${sub}`}>
          {withTagline ? "Санитарная служба Новосибирска" : "Новосибирск · с 2014"}
        </span>
      </span>
    </Link>
  );
}