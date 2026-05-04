import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, ArrowRight } from "lucide-react";
import PageHero from "@/components/PageHero";
import { client } from "@/sanity/lib/client";
import { allFundraisingCampaignsQuery } from "@/sanity/lib/queries";

export const metadata: Metadata = {
  title: "Fundraising",
  description:
    "Support 1st Meath Dunboyne Scout Group. Learn about our active fundraising campaigns and how you can help.",
};

export const revalidate = 60;

interface Campaign {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string | null;
  target: number | null;
  raised: number | null;
  donorCount: number | null;
  ctaLabel: string | null;
  ctaLink: string | null;
  ctaOpenInNewTab: boolean | null;
  visibleFromMonth: number | null;
  visibleToMonth: number | null;
  hasBody: boolean;
}

function isVisibleThisMonth(campaign: Campaign): boolean {
  const { visibleFromMonth: from, visibleToMonth: to } = campaign;
  // If either bound is unset the campaign is always visible
  if (!from || !to) return true;
  const month = new Date().getMonth() + 1; // 1–12
  // Same-year range e.g. Mar–Sep
  if (from <= to) return month >= from && month <= to;
  // Wraps across year-end e.g. Oct–Jan
  return month >= from || month <= to;
}

export default async function FundraisingPage() {
  const all: Campaign[] = await client.fetch(allFundraisingCampaignsQuery).catch(() => []);
  const campaigns = all.filter(isVisibleThisMonth);

  return (
    <>
      <PageHero
        title="Fundraising"
        subtitle="Your support makes our adventures possible. Every contribution directly funds equipment, camps, and activities for our young members."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Fundraising" }]}
      />

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        {campaigns.length === 0 ? (
          <p className="text-center font-body text-textMuted py-16">
            No campaigns at the moment, check back soon.
          </p>
        ) : (
          <div className="space-y-8">
            {campaigns.map((campaign) => {
              const target = campaign.target ?? 0;
              const raised = campaign.raised ?? 0;
              const progress = target > 0 ? Math.min((raised / target) * 100, 100) : 0;

              return (
                <div
                  key={campaign._id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3">
                    {/* Image */}
                    <div className="lg:col-span-1 h-52 lg:h-auto overflow-hidden bg-gray-100">
                      {campaign.coverImage && (
                        <img
                          src={campaign.coverImage}
                          alt={campaign.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="lg:col-span-2 p-6 sm:p-8">
                      <h2 className="font-display font-bold text-navy-dark text-xl sm:text-2xl mb-4">
                        {campaign.title}
                      </h2>

                      <p className="font-body text-textMuted text-sm leading-relaxed mb-6">
                        {campaign.excerpt}
                      </p>

                      {/* Progress bar */}
                      {target > 0 && (
                        <div className="mb-6">
                          <div className="flex justify-between text-sm font-body mb-2">
                            <span className="font-semibold text-navy-dark">
                              €{raised.toLocaleString()} raised
                            </span>
                            <span className="text-textMuted">
                              of €{target.toLocaleString()} target
                            </span>
                          </div>
                          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-orange-main rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs font-body text-textMuted mt-1">
                            <span>{Math.round(progress)}% complete</span>
                            {(campaign.donorCount ?? 0) > 0 && (
                              <span>{campaign.donorCount} donors</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3">
                        {campaign.ctaLink && (
                          <a
                            href={campaign.ctaLink}
                            target={campaign.ctaOpenInNewTab !== false ? '_blank' : undefined}
                            rel={campaign.ctaOpenInNewTab !== false ? 'noopener noreferrer' : undefined}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-main hover:bg-orange-hover text-white font-body font-semibold rounded-lg text-sm transition-colors"
                          >
                            {campaign.ctaLabel ?? "Learn More"}
                            <ExternalLink size={14} />
                          </a>
                        )}
                        {campaign.hasBody && (
                          <Link
                            href={`/fundraising/${campaign.slug}`}
                            className="inline-flex items-center gap-2 px-5 py-2.5 font-body font-semibold rounded-lg text-sm border border-gray-200 text-navy-dark hover:border-navy-dark transition-colors"
                          >
                            Read more <ArrowRight size={14} />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* General donation */}
        <div className="mt-12 bg-navy-dark rounded-2xl p-8 sm:p-10 text-center">
          <h2 className="font-display font-bold text-white text-3xl mb-4">
            Support the Group
          </h2>
          <p className="font-body text-white/60 text-base leading-relaxed max-w-xl mx-auto mb-6">
            Can&apos;t find a specific campaign you want to support? We always welcome general
            donations to help fund equipment, maintenance, and activities across all sections.
          </p>
          <a
            href="mailto:secretarydunboynescouts@gmail.com?subject=General Donation"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-main hover:bg-orange-hover text-white font-body font-semibold rounded-lg transition-colors"
          >
            Get in touch to donate
          </a>
        </div>
      </section>
    </>
  );
}

