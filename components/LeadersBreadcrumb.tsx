import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface Crumb {
  label: string
  href?: string
}

export default function LeadersBreadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center flex-wrap gap-1 text-xs font-body text-textMuted mb-6"
    >
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && (
            <ChevronRight size={12} className="text-textMuted/40 flex-shrink-0" />
          )}
          {crumb.href ? (
            <Link
              href={crumb.href}
              className="hover:text-navy-dark transition-colors"
            >
              {crumb.label}
            </Link>
          ) : (
            <span className="text-navy-dark font-semibold">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
