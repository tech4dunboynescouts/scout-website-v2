import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import PageHero from "@/components/PageHero";
import fundraising from "@/data/fundraising.json";

export const metadata: Metadata = {
  title: "Fundraising",
  description:
    "Support 1st Meath Dunboyne Scout Group. Learn about our active fundraising campaigns and how you can help.",
};

const statusConfig = {
  Active: { bg: "bg-orange-main", text: "Active" },
  Upcoming: { bg: "bg-navy-light", text: "Upcoming" },
  Completed: { bg: "bg-textMuted", text: "Completed" },
};

export default function FundraisingPage() {
  return (
    <>
      <PageHero
        title="Fundraising"
        subtitle="Your support makes our adventures possible. Every contribution directly funds equipment, camps, and activities for our young members."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Fundraising" }]}
      />

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="space-y-8">
          {fundraising.map((campaign) => {
            const status = statusConfig[campaign.status as keyof typeof statusConfig];
            const progress = campaign.target > 0 ? Math.min((campaign.raised / campaign.target) * 100, 100) : 0;

            return (
              <div key={campaign.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-3">
                  <div className="lg:col-span-1 h-52 lg:h-auto overflow-hidden">
                    <img
                      src={campaign.image}
                      alt={campaign.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="lg:col-span-2 p-8">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <h2 className="font-display font-bold text-navy-dark text-2xl">
                        {campaign.title}
                      </h2>
                      <span
                        className={`flex-shrink-0 text-xs font-body font-semibold text-white px-3 py-1 rounded-full ${status.bg}`}
                      >
                        {status.text}
                      </span>
                    </div>

                    <p className="font-body text-textMuted text-sm leading-relaxed mb-6">
                      {campaign.description}
                    </p>

                    {campaign.target > 0 && (
                      <div className="mb-6">
                        <div className="flex justify-between text-sm font-body mb-2">
                          <span className="font-semibold text-navy-dark">
                            €{campaign.raised.toLocaleString()} raised
                          </span>
                          <span className="text-textMuted">
                            of €{campaign.target.toLocaleString()} target
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
                          <span>{campaign.donorCount} donors</span>
                        </div>
                      </div>
                    )}

                    <a
                      href={campaign.ctaLink}
                      className={`inline-flex items-center gap-2 px-6 py-3 font-body font-semibold rounded-lg text-sm transition-colors ${
                        campaign.status === "Active"
                          ? "bg-orange-main hover:bg-orange-hover text-white"
                          : campaign.status === "Upcoming"
                          ? "bg-navy-dark hover:bg-navy-mid text-white"
                          : "bg-gray-100 text-textMuted cursor-default"
                      }`}
                    >
                      {campaign.cta}
                      {campaign.status !== "Completed" && <ExternalLink size={14} />}
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* General donation */}
        <div className="mt-12 bg-navy-dark rounded-2xl p-10 text-center">
          <h2 className="font-display font-bold text-white text-3xl mb-4">
            Support the Group
          </h2>
          <p className="font-body text-white/60 text-base leading-relaxed max-w-xl mx-auto mb-6">
            Can&apos;t find a specific campaign you want to support? We always welcome general donations to help fund equipment, maintenance, and activities across all four sections.
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
