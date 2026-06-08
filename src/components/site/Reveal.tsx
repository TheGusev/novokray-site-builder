import { type ElementType, type ReactNode, type CSSProperties } from "react";
import { useReveal } from "@/hooks/use-reveal";

interface Props {
  as?: ElementType;
  children: ReactNode;
  delay?: number;
  className?: string;
  variant?: "up" | "fade" | "left" | "right" | "scale";
}

const map: Record<NonNullable<Props["variant"]>, string> = {
  up: "translate-y-6",
  fade: "",
  left: "-translate-x-6",
  right: "translate-x-6",
  scale: "scale-[0.96]",
};

export function Reveal({ as: Tag = "div", children, delay = 0, className = "", variant = "up" }: Props) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  const style: CSSProperties = { transitionDelay: shown ? `${delay}ms` : "0ms" };
  return (
    <Tag
      ref={ref}
      style={style}
      className={`transition-all duration-700 ease-out will-change-transform ${
        shown ? "opacity-100 translate-x-0 translate-y-0 scale-100" : `opacity-0 ${map[variant]}`
      } ${className}`}
    >
      {children}
    </Tag>
  );
}