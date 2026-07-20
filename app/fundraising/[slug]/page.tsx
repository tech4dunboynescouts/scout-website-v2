import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import ImageCarousel from "@/components/ImageCarousel";
import TiledImageGallery from "@/components/TiledImageGallery";
import BodyImage from "@/components/BodyImage";
import { client } from "@/sanity/lib/client";
import { fundraisingCampaignBySlugQuery, allFundraisingSlugsQuery } from "@/sanity/lib/queries";
import { buildSocialMetadata } from "@/lib/socialMetadata";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs: { slug: string }[] = await client
    .fetch(allFundraisingSlugsQuery)
    .catch(() => []);
  return slugs;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const campaign = await client
    .fetch(fundraisingCampaignBySlugQuery, { slug })
    .catch(() => null);
  if (!campaign) return {};
  return buildSocialMetadata({
    title: campaign.title,
    description: campaign.excerpt,
    canonicalPath: `/fundraising/${slug}`,
    image: `/fundraising/${slug}/opengraph-image`,
    imageAlt: campaign.title,
  });
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

export default async function FundraisingCampaignPage({ params }: Props) {
  const { slug } = await params;
  const campaign = await client
    .fetch(fundraisingCampaignBySlugQuery, { slug })
    .catch(() => null);

  if (!campaign) notFound();

  const target = campaign.target ?? 0;
  const raised = campaign.raised ?? 0;
  const progress = target > 0 ? Math.min((raised / target) * 100, 100) : 0;

  return (
    <>
      {/* Hero image */}
      {campaign.coverImage && (
        <div className="relative h-72 sm:h-96 lg:h-[420px] overflow-hidden">
          <img
            src={campaign.coverImage}
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-navy-dark/60" />
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <Link
          href="/fundraising"
          className="inline-flex items-center gap-2 text-textMuted hover:text-navy-dark text-sm font-body mb-8 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Fundraising
        </Link>

        <h1 className="font-display font-bold text-navy-dark text-3xl sm:text-4xl leading-tight mb-4">
          {campaign.title}
        </h1>

        <p className="font-body text-textMuted text-lg leading-relaxed mb-8">
          {campaign.excerpt}
        </p>

        {/* Progress bar */}
        {target > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
            <div className="flex justify-between text-sm font-body mb-3">
              <span className="font-semibold text-navy-dark text-base">
                €{raised.toLocaleString()} raised
              </span>
              <span className="text-textMuted">
                of €{target.toLocaleString()} target
              </span>
            </div>
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-orange-main rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs font-body text-textMuted">
              <span>{Math.round(progress)}% complete</span>
              {(campaign.donorCount ?? 0) > 0 && (
                <span>{campaign.donorCount} donors</span>
              )}
            </div>
          </div>
        )}

        {/* CTA */}
        {campaign.ctaLink && (
          <a
            href={campaign.ctaLink}
            target={campaign.ctaOpenInNewTab !== false ? '_blank' : undefined}
            rel={campaign.ctaOpenInNewTab !== false ? 'noopener noreferrer' : undefined}
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-main hover:bg-orange-hover text-white font-body font-semibold rounded-lg transition-colors mb-10"
          >
            {campaign.ctaLabel ?? "Donate Now"} <ExternalLink size={15} />
          </a>
        )}

        {/* Body */}
        {campaign.body && campaign.body.length > 0 && (
          <div className="font-body text-textMuted text-base">
            <PortableText value={campaign.body} components={portableTextComponents} />
          </div>
        )}
      </div>
    </>
  );
}
