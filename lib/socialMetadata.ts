import type { Metadata } from "next";
import { siteUrl } from "@/lib/siteConfig";

const SITE_NAME = "1st Meath Dunboyne Scout Group";
const TWITTER_HANDLE = "@dunboyne_scouts";
const DEFAULT_IMAGE_PATH = "/opengraph-image";
const DEFAULT_IMAGE_ALT = "1st Meath Dunboyne Scout Group social preview";
const OG_LOCALE = "en_IE";

interface BuildSocialMetadataOptions {
  title: string;
  canonicalPath: `/${string}`;
  description?: string | null;
  image?: string | null;
  imageAlt?: string;
  openGraphType?: "website" | "article";
  publishedTime?: string;
  tags?: string[];
}

function toAbsoluteUrl(value: string): string {
  try {
    return new URL(value).toString();
  } catch {
    return new URL(value, siteUrl).toString();
  }
}

function toNonEmptyString(value?: string | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function buildSocialMetadata(options: BuildSocialMetadataOptions): Metadata {
  const description = toNonEmptyString(options.description);
  const imageUrl = toAbsoluteUrl(options.image ?? DEFAULT_IMAGE_PATH);
  const imageAlt = toNonEmptyString(options.imageAlt) ?? options.title ?? DEFAULT_IMAGE_ALT;

  const openGraph: NonNullable<Metadata["openGraph"]> = {
    type: options.openGraphType ?? "website",
    locale: OG_LOCALE,
    siteName: SITE_NAME,
    title: options.title,
    description,
    url: toAbsoluteUrl(options.canonicalPath),
    images: [
      {
        url: imageUrl,
        alt: imageAlt,
      },
    ],
  };

  if (openGraph.type === "article") {
    openGraph.publishedTime = toNonEmptyString(options.publishedTime);
    openGraph.tags = options.tags?.filter((tag) => tag && tag.trim().length > 0);
  }

  return {
    title: options.title,
    description,
    alternates: { canonical: options.canonicalPath },
    openGraph,
    twitter: {
      card: "summary_large_image",
      site: TWITTER_HANDLE,
      title: options.title,
      description,
      images: [imageUrl],
    },
  };
}
