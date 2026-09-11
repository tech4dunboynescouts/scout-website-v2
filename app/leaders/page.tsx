import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import { ArrowRight } from "lucide-react";
import { client } from "@/sanity/lib/client";
import { leaderTeamQuery } from "@/sanity/lib/queries";
import { buildSocialMetadata } from "@/lib/socialMetadata";

export const revalidate = 3600;
const DEFAULT_TEAM_YEAR = "2025-26";

export async function generateMetadata(): Promise<Metadata> {
  const team = await client.fetch<{ validFor?: string }>(leaderTeamQuery).catch(() => null);
  const validFor = team?.validFor?.trim() || DEFAULT_TEAM_YEAR;

  return buildSocialMetadata({
    title: `Leader Team for ${validFor}`,
    description: `Meet the volunteer leader team of 1st Meath Dunboyne Scout Group for the ${validFor} scouting year.`,
    canonicalPath: "/leaders",
  });
}

interface Member {
  name: string;
  role: string;
  lead?: boolean;
}

interface SectionGroup {
  name: string;
  colour: string;
  members: Member[];
}

interface LeaderTeamData {
  validFor?: string;
  councilColour: string;
  councilMembers: Member[];
  sectionGroups: SectionGroup[];
}

function initials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export default async function LeadersPage() {
  const sanity = await client.fetch(leaderTeamQuery).catch(() => null) as LeaderTeamData | null;

  const validFor = sanity?.validFor?.trim() || DEFAULT_TEAM_YEAR;
  const councilColour = sanity?.councilColour || "#5A6A8A";
  const councilMembers = sanity?.councilMembers ?? [];
  const sectionGroups = sanity?.sectionGroups ?? [];

  return (
    <>
      <PageHero
        title={`Leader Team for ${validFor}`}
        subtitle="Every leader is a volunteer, giving their time, energy, and expertise so young people in Dunboyne can have the scouting experience they deserve."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "About", href: "/about" },
          { label: "Leader Team" },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 space-y-16">

        {/* Group Council */}
        {councilMembers.length > 0 && (
          <div>
            <div className="mb-8">
              <span className="text-orange-main font-body text-sm font-semibold uppercase tracking-widest mb-2 block">
                Administration
              </span>
              <h2 className="font-display font-bold text-navy-dark text-3xl sm:text-4xl">
                Group Council
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {councilMembers.map((member) => (
                <div
                  key={member.name}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-body font-bold text-sm flex-shrink-0"
                    style={{ background: councilColour }}
                  >
                    {initials(member.name)}
                  </div>
                  <div>
                    <div className="font-body font-semibold text-navy-dark text-sm leading-snug">
                      {member.name}
                    </div>
                    <div className="font-body text-textMuted text-xs">{member.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section teams */}
        {sectionGroups.length > 0 && (
          <div>
            <div className="mb-8">
              <span className="text-orange-main font-body text-sm font-semibold uppercase tracking-widest mb-2 block">
                Sections
              </span>
              <h2 className="font-display font-bold text-navy-dark text-3xl sm:text-4xl">
                Leader Teams
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sectionGroups.map((group) => (
                <div
                  key={group.name}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div className="px-5 py-4" style={{ background: group.colour }}>
                    <h3 className="font-display font-bold text-white text-lg">{group.name}</h3>
                  </div>
                  <div className="p-4 space-y-2.5">
                    {(group.members ?? []).map((member) => (
                      <div key={member.name} className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center font-body font-bold text-xs flex-shrink-0"
                          style={
                            member.lead
                              ? { background: group.colour, color: "#fff" }
                              : { background: `${group.colour}20`, color: group.colour }
                          }
                        >
                          {initials(member.name)}
                        </div>
                        <div>
                          <div
                            className={`font-body text-sm leading-snug ${
                              member.lead ? "font-semibold text-navy-dark" : "text-textMuted"
                            }`}
                          >
                            {member.name}
                          </div>
                          {member.lead && (
                            <div className="font-body text-xs" style={{ color: group.colour }}>
                              {member.role}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Volunteer CTA */}
        <div className="bg-navy-dark rounded-2xl p-8 lg:p-12 text-center">
          <h2 className="font-display font-bold text-white text-2xl sm:text-3xl mb-3">
            Want to join our team?
          </h2>
          <p className="font-body text-white/60 text-base max-w-xl mx-auto mb-6">
            No experience needed, we provide full training. If you&apos;d like to make a difference in young people&apos;s lives, we&apos;d love to hear from you.
          </p>
          <Link
            href="/join#volunteer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-main hover:bg-orange-hover text-white font-body font-semibold rounded-lg transition-colors"
          >
            Volunteer as a Leader <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </>
  );
}

