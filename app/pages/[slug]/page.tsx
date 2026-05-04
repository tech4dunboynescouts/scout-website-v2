import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import ImageCarousel from "@/components/ImageCarousel";
import BodyImage from "@/components/BodyImage";
import PageHero from "@/components/PageHero";
import { client } from "@/sanity/lib/client";
import { generalPageBySlugQuery, allGeneralPageSlugsQuery } from "@/sanity/lib/queries";

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
  return {
    title: page.title,
    description: page.description ?? undefined,
    alternates: { canonical: `/pages/${slug}` },
    openGraph: {
      title: page.title,
      description: page.description ?? undefined,
      images: page.coverImage
        ? [{ url: page.coverImage, alt: page.title }]
        : undefined,
    },
  };
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

const portableTextComponents: PortableTextComponents = {
  types: {
    bodyImage: ({ value }: { value: { url: string; alt?: string; caption?: string } }) => (
      <BodyImage url={value.url} alt={value.alt} caption={value.caption} />
    ),
    imageGallery: ({ value }: { value: { images: { url: string; alt?: string; caption?: string }[] } }) => (
      <ImageCarousel images={value.images ?? []} />
    ),
    videoEmbed: ({ value }: { value: { url: string; caption?: string } }) => {
      const embedUrl = getEmbedUrl(value.url)
      if (!embedUrl) return null
      return (
        <figure className="my-8">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden">
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full"
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

  return (
    <>
      <PageHero
        title={page.title}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: page.title }]}
        bgImage={page.coverImage ?? undefined}
      />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="font-body text-textMuted text-base">
          <PortableText value={page.body} components={portableTextComponents} />
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
