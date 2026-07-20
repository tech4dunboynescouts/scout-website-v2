import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import ImageCarousel from "@/components/ImageCarousel";
import TiledImageGallery from "@/components/TiledImageGallery";
import BodyImage from "@/components/BodyImage";
import PageHero from "@/components/PageHero";
import { client } from "@/sanity/lib/client";
import { generalPageBySlugQuery, allGeneralPageSlugsQuery } from "@/sanity/lib/queries";
import { buildSocialMetadata } from "@/lib/socialMetadata";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs: { slug: string }[] = await client
    .fetch(allGeneralPageSlugsQuery)
    .catch(() => []);
  return slugs;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await client
    .fetch(generalPageBySlugQuery, { slug })
    .catch(() => null);
  if (!page) return {};
  return buildSocialMetadata({
    title: page.title,
    description: page.description,
    canonicalPath: `/pages/${slug}`,
    image: page.coverImage,
    imageAlt: page.title,
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
      <TiledImageGallery images={value.images ?? []} columns={value.columns ?? 3} />
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
    bullet: ({ children }) => (
      <ul className="list-disc list-outside ml-6 mb-4 space-y-1">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-outside ml-6 mb-4 space-y-1">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => (
      <li className="leading-relaxed">{children}</li>
    ),
    number: ({ children }) => (
      <li className="leading-relaxed">{children}</li>
    ),
  },
};

export default async function GeneralPage({ params }: Props) {
  const { slug } = await params;
  const page = await client
    .fetch(generalPageBySlugQuery, { slug })
    .catch(() => null);

  if (!page) notFound();

  const body = Array.isArray(page.body) ? await augmentVideoEmbeds(page.body) : page.body

  return (
    <>
      <PageHero
        title={page.title}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: page.title }]}
        bgImage={page.coverImage ?? undefined}
      />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="font-body text-textMuted text-base">
          <PortableText value={body} components={portableTextComponents} />
        </div>

        {page.ctaLink && (
          <div className="mt-8">
            <a
              href={page.ctaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-main hover:bg-orange-hover text-white font-body font-semibold rounded-lg transition-colors"
            >
              {page.ctaLabel ?? "Click Here"}
              <ExternalLink size={16} />
            </a>
          </div>
        )}
      </section>
    </>
  );
}
