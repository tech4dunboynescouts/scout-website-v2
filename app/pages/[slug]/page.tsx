import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import ImageCarousel from "@/components/ImageCarousel";
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
      </section>
    </>
  );
}
