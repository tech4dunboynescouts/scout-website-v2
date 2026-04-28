import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { PortableText, type PortableTextComponents } from "@portabletext/react"
import { auth } from "@/auth"
import { serverClient } from "@/sanity/lib/serverClient"
import { leaderResourceBySlugQuery } from "@/sanity/lib/queries"
import { ArrowLeft, Tag, Clock, FileDown } from "lucide-react"

interface Props {
  params: Promise<{ slug: string }>
}

export const revalidate = 60

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const resource = await serverClient
    .fetch(leaderResourceBySlugQuery, { slug })
    .catch(() => null)
  return {
    title: resource?.title ?? "Resource",
    robots: { index: false, follow: false },
  }
}

const portableTextComponents: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="font-display font-bold text-navy-dark text-2xl mt-8 mb-3">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-display font-bold text-navy-dark text-xl mt-6 mb-2">{children}</h3>
    ),
    normal: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
  },
}

const categoryColours: Record<string, string> = {
  Announcements: "bg-orange-100 text-orange-700",
  "Meeting Notes": "bg-blue-100 text-blue-700",
  Documents: "bg-navy-dark/10 text-navy-dark",
  Training: "bg-green-100 text-green-700",
  Finance: "bg-purple-100 text-purple-700",
}

export default async function ResourcePage({ params }: Props) {
  const { slug } = await params
  const session = await auth()

  const resource = await serverClient
    .fetch(leaderResourceBySlugQuery, { slug })
    .catch(() => null)

  if (!resource) notFound()

  // Role-based visibility check (belt-and-braces — middleware already guards the route)
  const userRoles = session?.user?.leaderRoles ?? []
  const restricted =
    Array.isArray(resource.visibleToRoles) &&
    resource.visibleToRoles.length > 0 &&
    !userRoles.includes("all") &&
    !resource.visibleToRoles.some((r: string) => userRoles.includes(r))

  if (restricted) notFound()

  const formatted = new Date(resource.publishedAt).toLocaleDateString("en-IE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const colourClass = categoryColours[resource.category] ?? "bg-gray-100 text-gray-600"

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <Link
        href="/leaders/dashboard"
        className="inline-flex items-center gap-2 text-textMuted hover:text-navy-dark text-sm font-body mb-8 transition-colors"
      >
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-body font-semibold ${colourClass}`}
        >
          <Tag size={10} /> {resource.category}
        </span>
        <span className="flex items-center gap-1.5 text-textMuted text-sm font-body">
          <Clock size={13} /> {formatted}
        </span>
      </div>

      <h1 className="font-display font-bold text-navy-dark text-3xl sm:text-4xl leading-tight mb-8">
        {resource.title}
      </h1>

      {/* File download */}
      {resource.fileUrl && (
        <a
          href={resource.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-dark hover:bg-navy-dark/90 text-white font-body font-semibold rounded-lg text-sm transition-colors mb-10"
        >
          <FileDown size={15} />
          {resource.fileName ?? "Download file"}
        </a>
      )}

      {/* Body */}
      {resource.body && (
        <div className="font-body text-textMuted text-base">
          <PortableText value={resource.body} components={portableTextComponents} />
        </div>
      )}
    </div>
  )
}
