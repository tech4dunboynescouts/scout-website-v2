import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

interface SanityWebhookPayload {
  _type?: string;
  slug?: string | { current?: string };
  document?: { _type?: string; slug?: string | { current?: string } };
  before?: { _type?: string; slug?: string | { current?: string } };
}

function getSlug(value: SanityWebhookPayload["slug"]): string | null {
  if (typeof value === "string") return value;
  return value?.current ?? null;
}

function getDocumentType(payload: SanityWebhookPayload): string | null {
  return payload._type ?? payload.document?._type ?? payload.before?._type ?? null;
}

function getDocumentSlug(payload: SanityWebhookPayload): string | null {
  return (
    getSlug(payload.slug) ??
    getSlug(payload.document?.slug) ??
    getSlug(payload.before?.slug)
  );
}

function getPathsToRevalidate(
  documentType: string | null,
  slug: string | null
): string[] {
  const paths = new Set<string>();

  switch (documentType) {
    case "newsArticle":
      paths.add("/news");
      if (slug) {
        paths.add(`/news/${slug}`);
        paths.add(`/news/${slug}/opengraph-image`);
      }
      break;
    case "generalPage":
      if (slug) paths.add(`/pages/${slug}`);
      break;
    case "fundraisingCampaign":
      paths.add("/fundraising");
      if (slug) {
        paths.add(`/fundraising/${slug}`);
        paths.add(`/fundraising/${slug}/opengraph-image`);
      }
      break;
    case "sectionPage":
      if (slug) {
        paths.add(`/sections/${slug}`);
        paths.add(`/sections/${slug}/opengraph-image`);
      }
      break;
    case "faqList":
      paths.add("/join");
      break;
    case "leaderTeam":
    case "leaderProfile":
      paths.add("/leaders");
      break;
    case "leaderResource":
      if (slug) paths.add(`/leaders/resources/${slug}`);
      break;
    case "siteNavigation":
    case "siteFeatureFlags":
      // These documents are read by the root layout and affect the shared nav.
      revalidatePath("/", "layout");
      paths.add("/");
      break;
    case "annualSubscriptionPricing":
      paths.add("/payments/annual-subscriptions");
      break;
    case "leadersAnnualSubscriptionPricing":
      paths.add("/leaders/payments/annual-subscriptions");
      break;
    case "scoutsSummerCampPricing":
      paths.add("/leaders/payments/scouts-summer-camp");
      break;
    default:
      // Keep unknown webhook documents harmless and cheap. A later visit will
      // pick up the content through the normal one-hour ISR window.
      paths.add("/");
  }

  for (const path of paths) revalidatePath(path);
  return [...paths];
}

export async function POST(request: Request) {
  const secret = request.headers.get("x-revalidate-secret");
  if (!process.env.SANITY_REVALIDATE_SECRET || secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json().catch(() => ({}))) as SanityWebhookPayload;
  const paths = getPathsToRevalidate(getDocumentType(payload), getDocumentSlug(payload));

  return NextResponse.json({ ok: true, revalidated: paths });
}
