import type { Metadata } from "next"
import Link from "next/link"
import { auth } from "@/auth"
import { serverClient } from "@/sanity/lib/serverClient"
import { allLeaderResourcesQuery } from "@/sanity/lib/queries"
import { FileDown, Tag, Clock, ChevronRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Leaders Dashboard",
  robots: { index: false, follow: false },
}

export const revalidate = 60

interface Resource {
  _id: string
  title: string
  slug: string
  category: string
  publishedAt: string
  hasFile: boolean
  visibleToRoles: string[] | null
}

const categoryColours: Record<string, string> = {
  Announcements: "bg-orange-100 text-orange-700",
  "Meeting Notes": "bg-blue-100 text-blue-700",
  Documents: "bg-navy-dark/10 text-navy-dark",
  Training: "bg-green-100 text-green-700",
  Finance: "bg-purple-100 text-purple-700",
}

export default async function DashboardPage() {
  const session = await auth()
  const roles = session?.user?.leaderRoles ?? []
  const name = session?.user?.leaderName ?? session?.user?.name ?? "Leader"

  const resources: Resource[] = await serverClient
    .fetch(allLeaderResourcesQuery, { roles })
    .catch(() => [])

  const categories = ["All", ...Array.from(new Set(resources.map((r) => r.category)))]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      {/* Welcome */}
      <div className="mb-10">
        <p className="text-orange-main font-body font-semibold text-sm uppercase tracking-widest mb-1">
          Leaders Portal
        </p>
        <h1 className="font-display font-bold text-navy-dark text-3xl sm:text-4xl">
          Welcome back, {name}
        </h1>
        <p className="font-body text-textMuted text-sm mt-2">
          {resources.length} resource{resources.length !== 1 ? "s" : ""} available to you
        </p>
      </div>

      {/* Resources */}
      {resources.length === 0 ? (
        <div className="text-center py-20 text-textMuted font-body text-sm">
          No resources have been published yet.
        </div>
      ) : (
        <div>
          {/* Category summary pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => {
              const count =
                cat === "All"
                  ? resources.length
                  : resources.filter((r) => r.category === cat).length
              return (
                <span
                  key={cat}
                  className={`px-3 py-1 rounded-full text-xs font-body font-semibold ${
                    cat === "All"
                      ? "bg-navy-dark text-white"
                      : (categoryColours[cat] ?? "bg-gray-100 text-gray-600")
                  }`}
                >
                  {cat} ({count})
                </span>
              )
            })}
          </div>

          {/* Resource grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {resources.map((resource) => {
              const colourClass =
                categoryColours[resource.category] ?? "bg-gray-100 text-gray-600"
              const formatted = new Date(resource.publishedAt).toLocaleDateString("en-IE", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })

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
                      <Clock size={11} /> {formatted}
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
        </div>
      )}
    </div>
  )
}
