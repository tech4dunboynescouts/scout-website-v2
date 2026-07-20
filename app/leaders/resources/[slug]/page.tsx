import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { PortableText, type PortableTextComponents } from "@portabletext/react"
import { auth } from "@/auth"
import { serverClient } from "@/sanity/lib/serverClient"
import { leaderResourceBySlugQuery, leaderProfileByEmailQuery } from "@/sanity/lib/queries"
import { Tag, Clock, FileDown } from "lucide-react"
import PdfViewerClient from "@/components/PdfViewerClient"
import PageHero from "@/components/PageHero"
import ImageCarousel from "@/components/ImageCarousel"
import TiledImageGallery from "@/components/TiledImageGallery"
import BodyImage from "@/components/BodyImage"

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
  types: {
    bodyImage: ({ value }: { value: { url: string; alt?: string; caption?: string } }) => (
      <BodyImage url={value.url} alt={value.alt} caption={value.caption} />
    ),
    imageGallery: ({ value }: { value: { images: { url: string; alt?: string; caption?: string }[] } }) => (
      <ImageCarousel images={value.images ?? []} />
    ),
    tiledImageGallery: ({ value }: { value: { images: { url: string; alt?: string; caption?: string; aspectRatio?: string }[]; columns?: number } }) => (
      <TiledImageGallery images={value.images ?? []} columns={value.columns ?? 3} />
    ),
  },
  block: {
    h2: ({ children }) => (
      <h2 className="font-display font-bold text-navy-dark text-2xl mt-8 mb-3">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-display font-bold text-navy-dark text-xl mt-6 mb-2">{children}</h3>
    ),
    normal: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc list-outside ml-6 mb-4 space-y-1">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal list-outside ml-6 mb-4 space-y-1">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
    number: ({ children }) => <li className="leading-relaxed">{children}</li>,
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
  const email = session?.user?.email ?? ""

  const [resource, profile] = await Promise.all([
    serverClient.fetch(leaderResourceBySlugQuery, { slug }).catch(() => null),
    serverClient.fetch(leaderProfileByEmailQuery, { email }).catch(() => null),
  ])

  if (!resource) notFound()

  // Re-fetch roles live from Sanity so stale JWT tokens don't cause false 404s
  const userRoles: string[] = profile?.roles ?? session?.user?.leaderRoles ?? []

  const restricted =
    Array.isArray(resource.visibleToRoles) &&
    resource.visibleToRoles.length > 0 &&
    !resource.visibleToRoles.some((r: string) => userRoles.includes(r))

  if (restricted) notFound()

  const formatted = new Date(resource.publishedAt).toLocaleDateString("en-IE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const colourClass = categoryColours[resource.category] ?? "bg-gray-100 text-gray-600"
  const isPdf = resource.fileMimeType === "application/pdf"

  return (
    <>
      <PageHero
        title={resource.title}
        breadcrumbs={[
          { label: "Leaders Portal", href: "/leaders/dashboard" },
          { label: "Resources" },
          { label: resource.title },
        ]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-body font-semibold ${colourClass}`}
          >
            <Tag size={10} /> {resource.category}
          </span>
          <span className="flex items-center gap-1.5 text-textMuted text-sm font-body">
            <Clock size={13} /> {formatted}
          </span>
        </div>

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

        {/* Inline PDF viewer */}
        {resource.fileUrl && isPdf && (
          <PdfViewerClient url={resource.fileUrl} fileName={resource.fileName} />
        )}

        {/* Body */}
        {resource.body && (
          <div className="font-body text-textMuted text-base">
            <PortableText value={resource.body} components={portableTextComponents} />
          </div>
        )}
      </div>
    </>
  )
}
