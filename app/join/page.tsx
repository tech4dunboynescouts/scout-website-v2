import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import FAQAccordion from "@/components/FAQAccordion";
import { YouthForm, VolunteerForm } from "@/components/ApplicationForm";
import staticFaqs from "@/data/faqs.json";
import sections from "@/data/sections.json";
import { client } from "@/sanity/lib/client";
import { faqListQuery } from "@/sanity/lib/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Join the Group",
  description:
    "Join 1st Meath Dunboyne Scout Group. Apply for your child to join as a youth member or express interest in volunteering as an adult leader.",
};

export default async function JoinPage() {
  // Local environments can intermittently fail TLS handshakes to Sanity,
  // which surfaces as unhandled timeout rejections in dev. Use static FAQs
  // locally and keep Sanity-powered FAQs on Vercel.
  const shouldFetchSanityFaqs = process.env.VERCEL === "1"
  const sanityData = shouldFetchSanityFaqs
    ? await client.fetch(faqListQuery).catch(() => null)
    : null

  // Map Sanity items to the shape FAQAccordion expects, falling back to static JSON
  const faqs: { id: number; question: string; answer: string }[] =
    sanityData?.items?.length
      ? sanityData.items.map(
          (item: { _key: string; question: string; answer: string }, i: number) => ({
            id: i + 1,
            question: item.question,
            answer: item.answer,
          })
        )
      : staticFaqs
  return (
    <>
      <PageHero
        title="Join the Group"
        subtitle="Start your scouting adventure with us. We welcome young people between 1st Class and 6th Year of secondary school, and adult volunteers of any age."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Join" }]}
      />

      {/* Pathways */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-navy-dark text-3xl sm:text-4xl">
            Two ways to join
          </h2>
          <p className="font-body text-textMuted mt-3 text-base">
            Whether you&apos;re enrolling a child or want to volunteer, we&apos;d love to have you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Youth member */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-orange-main px-8 py-6">
              <h2 className="font-display font-bold text-white text-2xl mb-1">Youth Member</h2>
              <p className="font-body text-white/80 text-sm">For children & young people aged 6–18</p>
            </div>
            <div className="p-8">
              <YouthForm />
            </div>
          </div>

          {/* Volunteer */}
          <div id="volunteer" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-navy-dark px-8 py-6">
              <h2 className="font-display font-bold text-white text-2xl mb-1">Adult Volunteer</h2>
              <p className="font-body text-white/80 text-sm">Leaders, helpers, and committee members</p>
            </div>
            <div className="p-8">
              <VolunteerForm />
            </div>
          </div>
        </div>
      </section>

      {/* Age guide */}
      <section className="bg-navy-dark py-16 lg:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-display font-bold text-white text-3xl sm:text-4xl">
              Which section is right for your child?
            </h2>
          </div>
          <div className="overflow-x-auto rounded-2xl overflow-hidden">
            <table className="w-full bg-white font-body text-sm">
              <thead>
                <tr className="bg-navy-mid text-white">
                  <th className="px-6 py-4 text-left font-semibold">Section</th>
                  <th className="px-6 py-4 text-left font-semibold">Class / Year</th>
                  <th className="px-6 py-4 text-left font-semibold">Meeting Night</th>
                  <th className="px-6 py-4 text-left font-semibold">Time</th>
                </tr>
              </thead>
              <tbody>
                {sections.flatMap((s, i) =>
                  s.meetings.map((meeting, j) => (
                    <tr key={`${s.slug}-${j}`} className={i % 2 === 0 ? "bg-white" : "bg-background"}>
                      {j === 0 && (
                        <>
                          <td className="px-6 py-4 font-semibold text-navy-dark" rowSpan={s.meetings.length}>
                            <span className="flex items-center gap-2"><span>{s.icon}</span> {s.name}</span>
                          </td>
                          <td className="px-6 py-4 text-textMuted" rowSpan={s.meetings.length}>{s.ageRange}</td>
                        </>
                      )}
                      <td className="px-6 py-4 text-textMuted">{meeting.day}</td>
                      <td className="px-6 py-4 text-textMuted">{meeting.time}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center mb-12">
          <span className="text-orange-main font-body text-sm font-semibold uppercase tracking-widest mb-3 block">
            FAQs
          </span>
          <h2 className="font-display font-bold text-navy-dark text-3xl sm:text-4xl">
            Common questions
          </h2>
        </div>
        <FAQAccordion faqs={faqs} />
      </section>
    </>
  );
}

