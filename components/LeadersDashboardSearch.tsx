"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Search, X, FileDown, Tag, Clock, ChevronRight } from "lucide-react"

export interface LeaderResource {
  _id: string
  title: string
  slug: string
  category: string
  publishedAt: string
  hasFile: boolean
  visibleToRoles: string[] | null
  bodyText: string | null
}

interface Props {
  resources: LeaderResource[]
}

const categoryColours: Record<string, string> = {
  Announcements: "bg-orange-100 text-orange-700",
  "Meeting Notes": "bg-blue-100 text-blue-700",
  Documents: "bg-navy-dark/10 text-navy-dark",
  Training: "bg-green-100 text-green-700",
  Finance: "bg-purple-100 text-purple-700",
}

export default function LeadersDashboardSearch({ resources }: Props) {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return resources
    return resources.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        (r.bodyText?.toLowerCase().includes(q) ?? false)
    )
  }, [query, resources])

  const formatted = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })

  return (
    <div>
      {/* Search bar */}
      <div className="relative mb-6">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search resources by title, category or content…"
          className="w-full pl-11 pr-10 py-3.5 bg-white border border-gray-200 rounded-xl text-sm font-body text-navy-dark placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-orange-main/40 focus:border-orange-main transition-all shadow-sm"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-navy-dark transition-colors"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Result count when searching */}
      {query && (
        <p className="text-sm font-body text-textMuted mb-5">
          {filtered.length === 0
            ? `No resources match "${query}"`
            : `${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${query}"`}
        </p>
      )}

      {/* Empty search results */}
      {filtered.length === 0 && query ? (
        <div className="text-center py-20 text-textMuted font-body text-sm">
          Try a different search term.
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-textMuted font-body text-sm">
          No resources have been published yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((resource) => {
            const colourClass =
              categoryColours[resource.category] ?? "bg-gray-100 text-gray-600"
            return (
              <Link
                key={resource._id}
                href={`/leaders/resources/${resource.slug}`}
                className="group bg-white border border-gray-100 rounded-2xl p-6 hover:border-orange-main/30 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-body font-semibold ${colourClass}`}
                  >
                    <Tag size={10} /> {resource.category}
                  </span>
                  {resource.hasFile && (
                    <FileDown size={15} className="text-textMuted flex-shrink-0" />
                  )}
                </div>

                <h2 className="font-display font-bold text-navy-dark text-base leading-snug mb-3 group-hover:text-orange-main transition-colors">
                  {resource.title}
                </h2>

                <div className="flex items-center justify-between mt-auto">
                  <span className="flex items-center gap-1.5 text-textMuted text-xs font-body">
                    <Clock size={11} /> {formatted(resource.publishedAt)}
                  </span>
                  <ChevronRight
                    size={14}
                    className="text-textMuted group-hover:text-orange-main transition-colors"
                  />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
