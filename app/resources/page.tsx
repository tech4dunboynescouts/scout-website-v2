import type { Metadata } from "next";
import { Lock, BookOpen, GraduationCap, Heart, FileText, ExternalLink } from "lucide-react";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Resources for adult leaders and volunteers at 1st Meath Dunboyne Scout Group.",
};

const resources = [
  {
    icon: <BookOpen size={24} />,
    title: "Scouter Resources",
    desc: "Access programme guides, activity plans, badge requirements, and leader handbooks from Scouting Ireland.",
    link: "https://www.scouts.ie/scouters/",
    linkLabel: "Visit Scouting Ireland",
  },
  {
    icon: <GraduationCap size={24} />,
    title: "Training Courses",
    desc: "View upcoming leader training courses, wood badge modules, and specialist qualifications in your area.",
    link: "https://www.scouts.ie/scouters/training/",
    linkLabel: "Browse Training",
  },
  {
    icon: <Heart size={24} />,
    title: "Wellness Assist Programme",
    desc: "Scouting Ireland's support programme for adult volunteers, confidential counselling, financial advice, and more.",
    link: "https://www.scouts.ie/scouters/wellness/",
    linkLabel: "Learn More",
  },
  {
    icon: <FileText size={24} />,
    title: "Expense Claim Form",
    desc: "Submit expense claims for approved group purchases, activity costs, and leader out-of-pocket expenses.",
    link: "mailto:secretarydunboynescouts@gmail.com?subject=Expense Claim",
    linkLabel: "Submit a Claim",
  },
];

export default function ResourcesPage() {
  return (
    <>
      <PageHero
        title="Resources"
        subtitle="Tools, training, and support for adult leaders and volunteers at 1st Meath Dunboyne Scout Group."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Resources" }]}
        bgImage="/images/photo-1551836022-d5d88e9218df.jpg"
      />

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="mb-10 rounded-2xl border border-navy-light/20 bg-navy-mid/10 p-5 sm:p-6">
          <div className="flex items-start gap-3 text-sm font-body text-navy-mid">
            <Lock size={18} className="mt-0.5 flex-shrink-0 text-orange-main" />
            <p className="leading-relaxed">
              These resources are intended for registered adult leaders of 1st Meath Dunboyne Scout Group.
              For access to restricted materials, please{" "}
              <a href="mailto:secretarydunboynescouts@gmail.com" className="font-semibold text-orange-main hover:underline">
                contact the Group Leader
              </a>
              .
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {resources.map((res, i) => (
            <div
              key={i}
              className="group bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-navy-dark rounded-xl flex items-center justify-center text-orange-main mb-5">
                {res.icon}
              </div>
              <h3 className="font-display font-bold text-navy-dark text-xl mb-3">{res.title}</h3>
              <p className="font-body text-textMuted text-sm leading-relaxed mb-6">{res.desc}</p>
              <a
                href={res.link}
                target={res.link.startsWith("http") ? "_blank" : undefined}
                rel={res.link.startsWith("http") ? "noopener noreferrer" : undefined}
                className="inline-flex items-center gap-2 text-sm font-body font-semibold text-orange-main hover:text-orange-hover transition-colors"
              >
                {res.linkLabel} <ExternalLink size={14} />
              </a>
            </div>
          ))}
        </div>

        {/* Additional info */}
        <div className="mt-12 bg-navy-dark rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-orange-main/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Lock size={18} className="text-orange-main" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-xl mb-2">
                Group-specific documents
              </h3>
              <p className="font-body text-white/60 text-sm leading-relaxed mb-4">
                Meeting minutes, financial reports, safeguarding statements, and internal group documents are shared directly with registered leaders via email. If you&apos;re a registered leader and need access to these documents, please contact the Group Secretary.
              </p>
              <a
                href="mailto:secretarydunboynescouts@gmail.com"
                className="inline-flex items-center gap-2 text-sm font-body font-semibold text-orange-main hover:text-orange-hover transition-colors"
              >
                Contact Group Secretary
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

