import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { Calendar, ArrowLeft, Tag } from "lucide-react";
import ImageCarousel from "@/components/ImageCarousel";
import { client } from "@/sanity/lib/client";
import { newsArticleBySlugQuery, allNewsSlugsQuery } from "@/sanity/lib/queries";
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

  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/news/${slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      url: `${siteUrl}/news/${slug}`,
      publishedTime: article.date,
      tags: [article.tag],
      images: article.image
        ? [{ url: article.image, alt: article.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: article.image ? [article.image] : undefined,
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
      const id = u.pathname.replace(/^\//, '')
      return `https://player.vimeo.com/video/${id}`
    }
    return null
  } catch {
    return null
  }
}

const portableTextComponents: PortableTextComponents = {
  types: {
    bodyImage: ({ value }: { value: { url: string; alt?: string; caption?: string } }) => (
      <figure className="my-8">
        <img
          src={value.url}
          alt={value.alt ?? ""}
          className="w-full rounded-xl object-cover"
        />
        {value.caption && (
          <figcaption className="mt-2 text-center text-sm text-textMuted italic">
            {value.caption}
          </figcaption>
        )}
      </figure>
    ),
    imageGallery: ({ value }: { value: { images: { url: string; alt?: string; caption?: string }[] } }) => (
      <ImageCarousel images={value.images ?? []} />
    ),
    videoEmbed: ({ value }: { value: { url: string; caption?: string } }) => {
      const embedUrl = getEmbedUrl(value.url)
      if (!embedUrl) return null
      return (
        <figure className="my-8">
          <div className="relative aspect-video rounded-xl overflow-hidden">
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
};

const tagColours: Record<string, string> = {
  Beavers: "#E8640A",
  Cubs: "#2A5298",
  Scouts: "#1A3A6B",
  Ventures: "#0D2044",
  Group: "#5A6A8A",
  "Water Section": "#0077B6",
};

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await client
    .fetch(newsArticleBySlugQuery, { slug })
    .catch(() => null);

  if (!article) notFound();

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
              <PortableText value={article.body} components={portableTextComponents} />
            </div>
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
