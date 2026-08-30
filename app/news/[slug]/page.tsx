import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { Calendar, ArrowLeft, Tag, ExternalLink } from "lucide-react";
import ImageCarousel from "@/components/ImageCarousel";
import TiledImageGallery from "@/components/TiledImageGallery";
import BodyImage from "@/components/BodyImage";
import PdfDocumentBlock from "@/components/PdfDocumentBlock";
import { client } from "@/sanity/lib/client";
import { newsArticleBySlugQuery, allNewsSlugsQuery } from "@/sanity/lib/queries";
import { buildSocialMetadata } from "@/lib/socialMetadata";
import { siteUrl } from "@/lib/siteConfig";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs: { slug: string }[] = await client
    .fetch(allNewsSlugsQuery)
    .catch(() => []);
  return slugs;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await client
    .fetch(newsArticleBySlugQuery, { slug })
    .catch(() => null);
  if (!article) return {};

  return buildSocialMetadata({
    title: article.title,
    description: article.excerpt,
    canonicalPath: `/news/${slug}`,
    image: `/news/${slug}/opengraph-image`,
    imageAlt: article.title,
    openGraphType: "article",
    publishedTime: article.date,
    tags: [article.tag],
  });
}

function getEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v')
      return v ? `https://www.youtube.com/embed/${v}` : null
    }
    if (u.hostname === 'youtu.be') {
      return `https://www.youtube.com/embed${u.pathname}`
    }
    if (u.hostname.includes('vimeo.com')) {
      const parts = u.pathname.replace(/^\//, '').split('/')
      const id = parts[0]
      const hash = parts[1]  // privacy hash for unlisted videos
      return hash
        ? `https://player.vimeo.com/video/${id}?h=${hash}`
        : `https://player.vimeo.com/video/${id}`
    }
    return null
  } catch {
    return null
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function augmentVideoEmbeds(body: any[]): Promise<any[]> {
  return Promise.all(
    body.map(async (block) => {
      if (block._type !== 'videoEmbed' || !block.url || !String(block.url).includes('vimeo')) return block
      try {
        const res = await fetch(
          `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(block.url)}`,
          { next: { revalidate: 86400 } }
        )
        if (!res.ok) return block
        const data = await res.json()
        if (typeof data.width === 'number' && typeof data.height === 'number') {
          return { ...block, _paddingTop: (data.height / data.width) * 100 }
        }
      } catch { /* ignore, fall back to 16:9 */ }
      return block
    })
  )
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
      <TiledImageGallery images={value.images ?? []} columns={(value.columns as 2 | 3 | 4) ?? 3} />
    ),
    videoEmbed: ({ value }: { value: { url: string; caption?: string; _paddingTop?: number } }) => {
      const embedUrl = getEmbedUrl(value.url)
      if (!embedUrl) return null
      const paddingTop = value._paddingTop ?? 56.25
      return (
        <figure className="my-8 mx-0">
          <div style={{ position: 'relative', paddingTop: `${paddingTop}%` }}>
            <iframe
              src={embedUrl}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={value.caption ?? 'Embedded video'}
            />
          </div>
          {value.caption && (
            <figcaption className="mt-2 text-center text-sm text-textMuted italic">
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pdfDocument: ({ value }: { value: any }) => (
      <PdfDocumentBlock value={value} />
    ),
  },
  block: {
    h2: ({ children }) => (
      <h2 className="font-display font-bold text-navy-dark text-2xl mt-8 mb-3">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-display font-bold text-navy-dark text-xl mt-6 mb-2">{children}</h3>
    ),
    normal: ({ children }) => (
      <p className="mb-4 leading-relaxed">{children}</p>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc list-outside ml-6 mb-4 space-y-1">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal list-outside ml-6 mb-4 space-y-1">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
    number: ({ children }) => <li className="leading-relaxed">{children}</li>,
  },
};

const tagColours: Record<string, string> = {
  Beavers: "#E8640A",
  Cubs: "#2A5298",
  Scouts: "#1A3A6B",
  Ventures: "#0D2044",
  Rovers: "#6B4E71",
  Group: "#5A6A8A",
  "Water Section": "#0077B6",
};

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await client
    .fetch(newsArticleBySlugQuery, { slug })
    .catch(() => null);

  if (!article) notFound();

  const body = Array.isArray(article.body) ? await augmentVideoEmbeds(article.body) : article.body

  const formatted = new Date(article.date).toLocaleDateString("en-IE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const tagColour = tagColours[article.tag] || "#5A6A8A";

  const newsArticleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    url: `${siteUrl}/news/${slug}`,
    image: article.image ? [article.image] : undefined,
    publisher: {
      "@type": "Organization",
      name: "1st Meath Dunboyne Scout Group",
      logo: { "@type": "ImageObject", url: `${siteUrl}/images/logo.jpg` },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleSchema) }}
      />
      {/* Hero image */}
      <div className="relative h-72 sm:h-96 lg:h-[480px] overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-navy-dark/60" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Article */}
          <article className="lg:col-span-2">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-textMuted hover:text-navy-dark text-sm font-body mb-6 transition-colors"
            >
              <ArrowLeft size={14} /> Back to News
            </Link>

            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span
                className="flex items-center gap-1.5 text-xs font-body font-semibold px-3 py-1 rounded-full text-white"
                style={{ background: tagColour }}
              >
                <Tag size={10} /> {article.tag}
              </span>
              <span className="flex items-center gap-1.5 text-textMuted text-sm font-body">
                <Calendar size={13} /> {formatted}
              </span>
            </div>

            <h1 className="font-display font-bold text-navy-dark text-3xl sm:text-4xl lg:text-5xl leading-tight mb-8">
              {article.title}
            </h1>

            <div className="font-body text-textMuted text-base max-w-none">
              <PortableText value={body} components={portableTextComponents} />
            </div>

            {/* CTA Button */}
            {article.ctaButton?.label && article.ctaButton?.url && (
              <div className="mt-8 pt-8 border-t border-gray-100">
                {article.ctaButton.openInNewTab ? (
                  <a
                    href={article.ctaButton.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-orange-main hover:bg-orange-hover text-white font-body font-semibold rounded-lg transition-colors"
                  >
                    {article.ctaButton.label}
                    <ExternalLink size={15} />
                  </a>
                ) : (
                  <Link
                    href={article.ctaButton.url}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-orange-main hover:bg-orange-hover text-white font-body font-semibold rounded-lg transition-colors"
                  >
                    {article.ctaButton.label}
                  </Link>
                )}
              </div>
            )}
          </article>

          {/* Sidebar */}
          <aside className="space-y-8">
            <div className="bg-navy-dark rounded-2xl p-6 text-center">
              <h3 className="font-display font-bold text-white text-xl mb-3">
                Get involved
              </h3>
              <p className="font-body text-white/60 text-sm mb-5">
                Want to be part of adventures like these? Join 1st Meath Dunboyne today.
              </p>
              <Link
                href="/join"
                className="inline-block px-5 py-2.5 bg-orange-main hover:bg-orange-hover text-white font-body font-semibold rounded-lg transition-colors text-sm"
              >
                Join the Group
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
