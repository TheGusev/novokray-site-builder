import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export interface Crumb { label: string; to?: string; params?: Record<string, string> }

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Хлебные крошки" className="container-x py-4 text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 opacity-50" />}
            {c.to && i < items.length - 1 ? (
              // @ts-expect-error dynamic link target
              <Link to={c.to} params={c.params as never} className="hover:text-primary">{c.label}</Link>
            ) : (
              <span className="text-foreground">{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
