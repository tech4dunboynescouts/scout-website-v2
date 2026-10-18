import Link from "next/link";
import { ArrowUpRight, ChevronRight } from "lucide-react";

export interface LinkPanel {
  _key?: string;
  title: string;
  description?: string;
  href: string;
  icon?: string;
}

function isExternal(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

function PanelInner({ panel }: { panel: LinkPanel }) {
  const external = isExternal(panel.href);
  return (
    <>
      {panel.icon && (
        <span
          aria-hidden="true"
          className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-orange-main/10 text-2xl"
        >
          {panel.icon}
        </span>
      )}

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 font-display font-bold text-navy-dark text-lg sm:text-xl break-words">
          {panel.title}
          {external && (
            <ArrowUpRight
              size={16}
              className="flex-shrink-0 text-textMuted"
              aria-hidden="true"
            />
          )}
        </span>
        {panel.description && (
          <span className="mt-1 block font-body text-textMuted text-sm leading-relaxed break-words">
            {panel.description}
          </span>
        )}
      </span>

      <ChevronRight
        size={22}
        aria-hidden="true"
        className="flex-shrink-0 self-center text-orange-main transition-transform duration-200 group-hover:translate-x-1"
      />
    </>
  );
}

export default function LinkPanelsBlock({ panels }: { panels?: LinkPanel[] }) {
  const valid = (panels ?? []).filter((p) => p?.title && p?.href);
  if (valid.length === 0) return null;

  const panelClasses =
    "group flex items-start gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 transition-all duration-200 hover:shadow-md hover:border-orange-main focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-main focus-visible:ring-offset-2";

  return (
    <div className="my-8 grid gap-4 sm:gap-6 sm:grid-cols-2">
      {valid.map((panel, i) => {
        const external = isExternal(panel.href);
        return external ? (
          <a
            key={panel._key ?? i}
            href={panel.href}
            target="_blank"
            rel="noopener noreferrer"
            className={panelClasses}
          >
            <PanelInner panel={panel} />
          </a>
        ) : (
          <Link key={panel._key ?? i} href={panel.href} className={panelClasses}>
            <PanelInner panel={panel} />
          </Link>
        );
      })}
    </div>
  );
}
