import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import Timeline from "@/components/Timeline";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about 1st Meath Dunboyne Scout Group — our history since 1973, our leaders, and our commitment to the Dunboyne community.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="About the Group"
        subtitle="Founded in 1973 and highly active to this day — two Beaver colonies, three Cub packs, two Scout troops, a Venture unit, and a Water Section that serves the whole group."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
        bgImage="/images/photo-1529156069898-49953e39b3ac.jpg"
      />

      {/* History */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center mb-16">
          <span className="text-orange-main font-body text-sm font-semibold uppercase tracking-widest mb-3 block">
            Our History
          </span>
          <h2 className="font-display font-bold text-navy-dark text-3xl sm:text-4xl lg:text-5xl">
            Five decades of scouting
          </h2>
          <p className="font-body text-textMuted mt-4 text-base max-w-2xl mx-auto">
            From a single Scout Troop meeting in a community hall to one of Meath&apos;s most active and well-respected scout groups — here&apos;s our story.
          </p>
        </div>
        <Timeline />
      </section>

      {/* Ethos */}
      <section className="bg-navy-dark py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-orange-main font-body text-sm font-semibold uppercase tracking-widest mb-4 block">
            Scouting Ireland
          </span>
          <blockquote className="font-display font-bold text-white text-2xl sm:text-3xl lg:text-4xl leading-tight italic mb-8">
            &ldquo;The Aim of Scouting Ireland is to encourage the physical, intellectual, character, emotional, social and spiritual development of young people so they may achieve their full potential and, as responsible citizens, to improve society.&rdquo;
          </blockquote>
          <p className="font-body text-white/60 text-base leading-relaxed max-w-2xl mx-auto">
            We are proud members of Scouting Ireland, part of the World Organisation of the Scout Movement (WOSM) — the world&apos;s largest youth organisation with over 57 million members in 170 countries.
          </p>
        </div>
      </section>

      {/* Water Section */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img
                src="/images/photo-1544551763-46a013bb70d5.jpg"
                alt="Water section kayaking"
                className="w-full rounded-2xl object-cover h-80 lg:h-96"
              />
            </div>
            <div className="order-1 lg:order-2">
              <span className="text-orange-main font-body text-sm font-semibold uppercase tracking-widest mb-4 block">
                Water Section
              </span>
              <h2 className="font-display font-bold text-navy-dark text-3xl sm:text-4xl leading-tight mb-5">
                A unique tradition since 1992
              </h2>
              <p className="font-body text-textMuted text-base leading-relaxed mb-4">
                Established in 1992, our Water Section is one of the defining features of 1st Meath Dunboyne. In a region with few groups offering structured water activities, we&apos;ve built a reputation for quality kayaking, canoeing, and water safety training.
              </p>
              <p className="font-body text-textMuted text-base leading-relaxed mb-4">
                Training takes place at the Royal Canal, Kilcock, and at Lough Owel, Westmeath, under the supervision of Canoeing Ireland-qualified instructors. Members can work towards formal paddling certifications at beginner, intermediate, and advanced levels.
              </p>
              <p className="font-body text-textMuted text-base leading-relaxed">
                The Water Section is open to Scouts (aged 13+), Venture Scouts, and adult leaders. All equipment is provided by the group.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leaders teaser */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-navy-dark rounded-2xl p-6 sm:p-8 lg:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <span className="text-orange-main font-body text-sm font-semibold uppercase tracking-widest mb-2 block">
                Our Team
              </span>
              <h2 className="font-display font-bold text-white text-2xl sm:text-3xl mb-2">
                Meet the Leader Team
              </h2>
              <p className="font-body text-white/60 text-base max-w-xl">
                Over 40 volunteers across nine section groups — dedicated to delivering the best of scouting to young people in Dunboyne.
              </p>
            </div>
            <Link
              href="/leaders"
              className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-orange-main hover:bg-orange-hover text-white font-body font-semibold rounded-lg transition-colors"
            >
              View the full team <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Community */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-orange-main font-body text-sm font-semibold uppercase tracking-widest mb-3 block">
              Community
            </span>
            <h2 className="font-display font-bold text-navy-dark text-3xl sm:text-4xl">
              Rooted in Dunboyne
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Christmas Tree Collection",
                desc: "Every January, our Scouts and Cubs collect Christmas trees across Dunboyne and Clonee, raising funds and providing a community service.",
              },
              {
                title: "Community Clean-Ups",
                desc: "We organise regular litter picks and environmental clean-up events as part of our commitment to caring for the places we love.",
              },
              {
                title: "Scout County Events",
                desc: "We compete in and host Meath Scout County events including camp craft competitions, orienteering, and community challenge events.",
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="w-2 h-8 bg-orange-main rounded-full mb-4" />
                <h3 className="font-display font-bold text-navy-dark text-lg mb-2">{item.title}</h3>
                <p className="font-body text-textMuted text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
