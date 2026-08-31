import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle, MapPin, Calendar, ArrowRight } from "lucide-react";
import { client } from "@/sanity/lib/client";
import { sectionPageBySlugQuery, allSectionPageSlugsQuery } from "@/sanity/lib/queries";
import sectionsJson from "@/data/sections.json";
import BadgePlacementViewer from "@/components/BadgePlacementViewer";
import PageHero from "@/components/PageHero";
import { buildSocialMetadata } from "@/lib/socialMetadata";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

// ── Normalised section type ────────────────────────────────────────────────────
interface Section {
  name: string;
  slug: string;
  sectionName: string;
  leaderTitle: string;
  ageRange: string;
  icon: string;
  colour: string;
  tagline: string;
  heroImage: string | null;
  description: string;
  programme: string;
  activities: string[];
  gallery: { url: string; alt?: string }[];
  meetings: { day: string; time: string }[];
  location: string;
  badgePlacementImage: string | null;
}

// Static badge placement images (public/images/badges/) keyed by slug
const staticBadgeImages: Record<string, string> = {
  beavers: "/images/badges/beavers-badge-placement.webp",
  cubs: "/images/badges/cubs-badge-placement.webp",
  scouts: "/images/badges/scouts-badge-placement.webp",
  ventures: "/images/badges/ventures-badge-placement.webp",
};

// Map the static JSON shape to the common Section type
function fromJson(s: (typeof sectionsJson)[number]): Section {
  return {
    name: s.name,
    slug: s.slug,
    sectionName: s.sectionName,
    leaderTitle: s.leaderTitle,
    ageRange: s.ageRange,
    icon: s.icon,
    colour: s.colour,
    tagline: s.tagline,
    heroImage: s.image ?? null,
    description: s.description,
    programme: s.programme,
    activities: s.activities,
    gallery: [],
    meetings: s.meetings,
    location: s.location,
    badgePlacementImage: null,
  };
}

async function getSection(slug: string): Promise<Section | null> {
  const sanity = await client
    .fetch(sectionPageBySlugQuery, { slug })
    .catch(() => null);
  if (sanity) return sanity as Section;

  const json = sectionsJson.find((s) => s.slug === slug);
  return json ? fromJson(json) : null;
}

export async function generateStaticParams() {
  const sanitySlugsDocs: { slug: string }[] = await client
    .fetch(allSectionPageSlugsQuery)
    .catch(() => []);
  const sanitySlugs = new Set(sanitySlugsDocs.map((d) => d.slug));
  const jsonSlugs = sectionsJson.map((s) => s.slug);
  // Union so routes exist for both Sanity-managed and JSON-only sections
  const all = [...new Set([...sanitySlugs, ...jsonSlugs])];
  return all.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const section = await getSection(slug);
  if (!section) return {};
  return buildSocialMetadata({
    title: section.name,
    description: section.description,
    canonicalPath: `/sections/${slug}`,
    image: `/sections/${slug}/opengraph-image`,
    imageAlt: section.name,
  });
}

export default async function SectionPage({ params }: Props) {
  const { slug } = await params;
  const section = await getSection(slug);
  if (!section) notFound();

  // Badge placement image: prefer Sanity-managed, fall back to static public asset
  const badgeImage = section.badgePlacementImage ?? staticBadgeImages[slug] ?? null;

  // All sections for the sidebar — merge Sanity + JSON, dedup by slug
  const sanityAll: Section[] = await client
    .fetch(allSectionPageSlugsQuery)
    .then((docs: { slug: string }[]) =>
      Promise.all(docs.map((d) => client.fetch(sectionPageBySlugQuery, { slug: d.slug })))
    )
    .catch(() => []);
  const sanitySlugs = new Set(sanityAll.map((s) => s?.slug).filter(Boolean));
  const allSections: Section[] = [
    ...sanityAll,
    ...sectionsJson.filter((s) => !sanitySlugs.has(s.slug)).map(fromJson),
  ]
    .filter((s): s is Section => !!s?.slug)            // remove any null/undefined entries
    .filter((s, i, arr) => arr.findIndex((x) => x.slug === s.slug) === i); // dedup by slug

  return (
    <>
      <PageHero
        title={`${section.icon} ${section.name}`}
        subtitle={section.tagline}
        accentColour={section.colour}
        bgImage={section.heroImage ?? undefined}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Sections", href: "/#sections" },
          { label: section.name },
        ]}
      />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Main content */}
          <div className="lg:col-span-2 space-y-12">

            {/* About the Programme */}
            {(section.description || section.programme) && (
              <div>
                <h2 className="font-display font-bold text-navy-dark text-3xl mb-5">About the Programme</h2>
                {section.description && (
                  <p className="font-body text-textMuted text-base leading-relaxed mb-4">{section.description}</p>
                )}
                {section.programme && (
                  <p className="font-body text-textMuted text-base leading-relaxed">{section.programme}</p>
                )}
              </div>
            )}

            {/* What We Get Up To */}
            {(section.activities ?? []).length > 0 && (
              <div>
                <h2 className="font-display font-bold text-navy-dark text-3xl mb-5">What We Get Up To</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(section.activities ?? []).map((activity, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle
                        size={18}
                        className="mt-0.5 flex-shrink-0"
                        style={{ color: section.colour }}
                      />
                      <span className="font-body text-textMuted text-sm">{activity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery */}
            {(section.gallery ?? []).length > 0 && (
              <div>
                <h2 className="font-display font-bold text-navy-dark text-3xl mb-5">Gallery</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(section.gallery ?? []).map((img, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden">
                      <img
                        src={img.url}
                        alt={img.alt ?? `${section.name} activity ${i + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Badge Placement */}
            {badgeImage && (
              <BadgePlacementViewer
                src={badgeImage}
                sectionName={section.name}
                colour={section.colour}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Meeting details */}
            {((section.meetings ?? []).length > 0 || section.location) && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-display font-bold text-navy-dark text-xl mb-5">Meeting Details</h3>
                <div className="space-y-4">
                  {(section.meetings ?? []).length > 0 && (
                    <div className="flex items-start gap-3">
                      <Calendar size={18} className="text-orange-main mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-body text-xs text-textMuted uppercase tracking-wider mb-1.5">Meeting Times</div>
                        <div className="space-y-1">
                          {(section.meetings ?? []).map((meeting, i) => (
                            <div key={i} className="font-body font-medium text-navy-dark text-sm">
                              {meeting.day} &middot; {meeting.time}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {section.location && (
                    <div className="flex items-start gap-3">
                      <MapPin size={18} className="text-orange-main mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-body text-xs text-textMuted uppercase tracking-wider mb-0.5">Location</div>
                        <div className="font-body font-medium text-navy-dark text-sm">{section.location}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CTA */}
            <div
              className="rounded-2xl p-6 text-white text-center"
              style={{ background: `linear-gradient(135deg, ${section.colour} 0%, ${section.colour}cc 100%)` }}
            >
              <h3 className="font-display font-bold text-2xl mb-3">Ready to join?</h3>
              <p className="font-body text-white/80 text-sm mb-5 leading-relaxed">
                We&apos;d love to welcome your child into our {section.sectionName}. Apply online and a leader will be in touch.
              </p>
              <Link
                href={section.slug === "rovers" ? "/contact" : "/join"}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-navy-dark font-body font-semibold rounded-lg hover:bg-white/90 transition-colors text-sm"
              >
                Apply Now <ArrowRight size={14} />
              </Link>
            </div>

            {/* Other sections */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-display font-bold text-navy-dark text-base mb-4">Other Sections</h3>
              <div className="space-y-2">
                {allSections
                  .filter((s) => s.slug !== section.slug)
                  .map((s) => (
                    <Link
                      key={s.slug}
                      href={`/sections/${s.slug}`}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-background transition-colors group"
                    >
                      <span className="text-xl">{s.icon}</span>
                      <div>
                        <div className="font-body font-medium text-navy-dark text-sm group-hover:text-orange-main transition-colors">
                          {s.name}
                        </div>
                        <div className="font-body text-textMuted text-xs">{s.sectionName}</div>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
