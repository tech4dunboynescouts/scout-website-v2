import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Leader Team",
  description:
    "Meet the volunteer leader team of 1st Meath Dunboyne Scout Group for the 2025/26 scouting year.",
};

const groups = [
  {
    id: "group-council",
    name: "Group Council",
    colour: "#5A6A8A",
    isCouncil: true,
    members: [
      { name: "Bernie O'Connor", role: "Group Leader", lead: true },
      { name: "Tom Holmes", role: "Deputy" },
      { name: "Dermot Walsh", role: "Deputy" },
      { name: "Karl Maher", role: "Chairperson" },
      { name: "Marcus McInerney", role: "Treasurer" },
      { name: "Celine Sludds", role: "Scouter Representative" },
      { name: "Philip Flood", role: "Quartermaster" },
      { name: "Siobhan Murphy", role: "Secretary" },
    ],
  },
  {
    id: "monday-beavers",
    name: "Monday Beavers",
    colour: "#E8640A",
    members: [
      { name: "Gary Gunning", role: "Section Leader", lead: true },
      { name: "Celine Sludds", role: "Leader", lead: false },
      { name: "Neil Brady", role: "Leader", lead: false },
      { name: "Louise Roche", role: "Leader", lead: false },
      { name: "Gareth Fereday", role: "Leader", lead: false },
      { name: "Karl Maher", role: "Leader", lead: false },
    ],
  },
  {
    id: "tuesday-beavers",
    name: "Tuesday Beavers",
    colour: "#E8640A",
    members: [
      { name: "Shaun O'Rourke", role: "Section Leader", lead: true },
      { name: "Michelle McKenna", role: "Leader", lead: false },
      { name: "Martha Sutton", role: "Leader", lead: false },
      { name: "Matthew Berigan", role: "Leader", lead: false },
      { name: "Gabriel Beirne", role: "Leader", lead: false },
      { name: "Karen Flannery", role: "Leader", lead: false },
    ],
  },
  {
    id: "tuesday-cubs",
    name: "Tuesday Cubs",
    colour: "#2A5298",
    members: [
      { name: "Ronnie Kane", role: "Section Leader", lead: true },
      { name: "Oriel Helena Smith", role: "Leader", lead: false },
      { name: "Sinead Lowe", role: "Leader", lead: false },
      { name: "Philip Flood", role: "Leader", lead: false },
      { name: "Helen Beswick", role: "Leader", lead: false },
      { name: "James Sludds", role: "Leader", lead: false },
    ],
  },
  {
    id: "wednesday-cubs",
    name: "Wednesday Cubs",
    colour: "#2A5298",
    members: [
      { name: "Cormac Mooney", role: "Section Leader", lead: true },
      { name: "Michael Ó Baille", role: "Leader", lead: false },
      { name: "Daniel Doyle", role: "Leader", lead: false },
      { name: "Ciara O'Neill", role: "Leader", lead: false },
    ],
  },
  {
    id: "thursday-cubs",
    name: "Thursday Cubs",
    colour: "#2A5298",
    members: [
      { name: "Anita Reid", role: "Section Leader", lead: true },
      { name: "Alan Keane", role: "Leader", lead: false },
      { name: "Eoin O'Toole", role: "Leader", lead: false },
      { name: "Michelle Phelan", role: "Leader", lead: false },
      { name: "Ruth Mullins", role: "Leader", lead: false },
      { name: "Dara Collins", role: "Leader", lead: false },
    ],
  },
  {
    id: "monday-scouts",
    name: "Monday Scouts",
    colour: "#1A3A6B",
    members: [
      { name: "Barry Lonergan", role: "Section Leader", lead: true },
      { name: "Dave Brown", role: "Leader", lead: false },
      { name: "Marcus McInerney", role: "Leader", lead: false },
      { name: "Jennifer Phillips", role: "Leader", lead: false },
      { name: "Ian Roe", role: "Leader", lead: false },
      { name: "Bernie O'Connor", role: "Leader", lead: false },
      { name: "Méabh Ní Thiarnáin", role: "Leader", lead: false },
    ],
  },
  {
    id: "wednesday-scouts",
    name: "Wednesday Scouts",
    colour: "#1A3A6B",
    members: [
      { name: "Tony Collins", role: "Section Leader", lead: true },
      { name: "Helen Lonergan", role: "Leader", lead: false },
      { name: "Paul D'Alton", role: "Leader", lead: false },
      { name: "Tom Holmes", role: "Leader", lead: false },
      { name: "Dermot Walsh", role: "Leader", lead: false },
    ],
  },
  {
    id: "ventures",
    name: "Ventures",
    colour: "#0D2044",
    members: [
      { name: "David Renshaw", role: "Section Leader", lead: true },
      { name: "Dave Kavanagh", role: "Leader", lead: false },
      { name: "Méabh Ní Thiarnáin", role: "Leader", lead: false },
      { name: "Liam Egan", role: "Leader", lead: false },
    ],
  },
];

function initials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export default function LeadersPage() {
  const council = groups.find((g) => g.id === "group-council")!;
  const sections = groups.filter((g) => g.id !== "group-council");

  return (
    <>
      <PageHero
        title="Leader Team"
        subtitle="Every leader is a volunteer — giving their time, energy, and expertise so young people in Dunboyne can have the scouting experience they deserve."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "About", href: "/about" },
          { label: "Leader Team" },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 space-y-16">

        {/* Group Council */}
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
            {council.members.map((member) => (
              <div
                key={member.name}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-body font-bold text-sm flex-shrink-0"
                  style={{ background: council.colour }}
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

        {/* Section teams */}
        <div>
          <div className="mb-8">
            <span className="text-orange-main font-body text-sm font-semibold uppercase tracking-widest mb-2 block">
              Section Leaders
            </span>
            <h2 className="font-display font-bold text-navy-dark text-3xl sm:text-4xl">
              Section Teams
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((group) => (
              <div
                key={group.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="px-5 py-4" style={{ background: group.colour }}>
                  <h3 className="font-display font-bold text-white text-lg">{group.name}</h3>
                </div>
                <div className="p-4 space-y-2.5">
                  {group.members.map((member) => (
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

        {/* Volunteer CTA */}
        <div className="bg-navy-dark rounded-2xl p-8 lg:p-12 text-center">
          <h2 className="font-display font-bold text-white text-2xl sm:text-3xl mb-3">
            Want to join our team?
          </h2>
          <p className="font-body text-white/60 text-base max-w-xl mx-auto mb-6">
            No experience needed — we provide full training. If you&apos;d like to make a difference in young people&apos;s lives, we&apos;d love to hear from you.
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
