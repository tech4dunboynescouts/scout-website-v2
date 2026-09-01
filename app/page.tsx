import type { Metadata } from "next";
import Link from "next/link";
import { Anchor, Users, Mountain, Heart, ArrowRight } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import SectionCard from "@/components/SectionCard";
import NewsCard from "@/components/NewsCard";
import StatCounter from "@/components/StatCounter";
import sections from "@/data/sections.json";
import { client } from "@/sanity/lib/client";
import { allNewsQuery } from "@/sanity/lib/queries";
import { siteUrl } from "@/lib/siteConfig";

const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;

export const metadata: Metadata = {
  title: "1st Meath Dunboyne Scout Group",
  description:
    "1st Meath Dunboyne Scout Group serves the Dunboyne community with Beavers, Cubs, Scouts, Ventures, Rovers, and a unique Water Section. Join us today.",
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "1st Meath Dunboyne Scout Group",
    description:
      "1st Meath Dunboyne Scout Group serves the Dunboyne community with Beavers, Cubs, Scouts, Ventures, Rovers, and a unique Water Section. Join us today.",
    images: [
      {
        url: "/api/og/home",
        width: 1200,
        height: 630,
        alt: "Branded social share image for 1st Meath Dunboyne Scout Group",
      },
    ],
  },
  facebook: facebookAppId ? { appId: facebookAppId } : undefined,
  twitter: {
    card: "summary_large_image",
    images: ["/api/og/home"],
  },
};

const pillars = [
  {
    icon: Mountain,
    title: "Outdoors",
    desc: "From camping in the Wicklow Mountains to kayaking on the Royal Canal, we live for the great outdoors.",
  },
  {
    icon: Users,
    title: "Community",
    desc: "Deeply rooted in Dunboyne since 1973, we serve and give back to the community that supports us.",
  },
  {
    icon: Heart,
    title: "Leadership",
    desc: "We develop confident, caring young people who go on to make a difference in their communities.",
  },
  {
    icon: Anchor,
    title: "Water Section",
    desc: "Our unique Water Section gives members kayaking, canoeing and water safety skills found in few other groups.",
  },
];

export const revalidate = 60;

interface NewsArticle {
  _id: string;
  slug: string;
  title: string;
  date: string;
  tag: string;
  excerpt: string;
  image: string;
}

export default async function HomePage() {
  const latestNews: NewsArticle[] = await client
    .fetch(allNewsQuery)
    .then((articles: NewsArticle[]) => articles.slice(0, 3))
    .catch(() => []);

  return (
    <>
      {/* Hero */}
      <HeroSection
        titles={[
          "Built for the outdoors. Made for life.",
          "Where young people become remarkable.",
          "Skills for life. Memories forever.",
          "Be prepared for everything.",
          "Fifty years of adventure in Dunboyne.",
          "Camp. Explore. Lead. Belong.",
          "Get outside. Get involved.",
          "Do more. Be more.",
          "The wild is waiting.",
          "Earn it. Learn it. Live it.",
          "Be part of something bigger.",
          "Prepared for everything. Ready for anything.",
        ]}
        subtitle="Founded in 1973, we are a highly active Scout group based in Dunboyne, Co. Meath, with five youth sections from Beavers to Rovers, plus a very active Water Section that supports the entire group."
        image="/images/photo-1501854140801-50d01698950b.jpg"
        primaryCta={{ label: "Join Our Group", href: "/join" }}
        secondaryCta={{ label: "Explore Sections", href: "#sections" }}
      />

      {/* Stats */}
      <section className="bg-navy-dark py-16 lg:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-6">
            <StatCounter value={50} suffix="+" label="Years Active" />
            <StatCounter value={5} label="Youth Sections" />
            <StatCounter value={200} suffix="+" label="Young Members" />
          </div>
        </div>
      </section>

      {/* About strip */}
      <section className="bg-navy-mid py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <span className="text-orange-main font-body text-sm font-semibold uppercase tracking-widest mb-4 block">
                About the Group
              </span>
              <h2 className="font-display font-bold text-white text-3xl sm:text-4xl lg:text-5xl leading-tight mb-6">
                Over 50 years of scouting in Dunboyne
              </h2>
              <p className="font-body text-white/70 text-base leading-relaxed mb-6">
                1st Meath Dunboyne Scout Group was founded in 1973 and remains a highly active group to this day. We comprise two Beaver colonies, three Cub packs, two Scout troops, a Venture unit and a Rovers section, plus a very active Water Section that serves the entire group.
              </p>
              <p className="font-body text-white/70 text-base leading-relaxed mb-8">
                We are part of Scouting Ireland, and our programme aims to encourage the physical, intellectual, character, emotional, social and spiritual development of young people so they may achieve their full potential.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-orange-main font-body font-semibold hover:gap-3 transition-all"
              >
                Our full story <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {pillars.map((p, i) => (
                <div
                  key={i}
                  className="bg-white/10 rounded-2xl p-5 hover:bg-white/15 transition-colors"
                >
                  <div className="text-orange-main mb-3">
                    <p.icon size={28} />
                  </div>
                  <h3 className="font-display font-bold text-white text-base mb-2">{p.title}</h3>
                  <p className="font-body text-white/60 text-sm leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sections */}
      <section id="sections" className="py-16 lg:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-orange-main font-body text-sm font-semibold uppercase tracking-widest mb-3 block">
              Our Sections
            </span>
            <h2 className="font-display font-bold text-navy-dark text-3xl sm:text-4xl lg:text-5xl">
              Find your section
            </h2>
            <p className="font-body text-textMuted mt-4 text-base max-w-xl mx-auto">
              From age 6 to 25, there&apos;s a place in 1st Meath Dunboyne for every young person ready for adventure.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {sections.map((section, i) => (
              <SectionCard key={section.slug} {...section} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Water Section highlight */}
      <section className="bg-navy-dark py-16 lg:py-20 overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: "url(/images/photo-1544551763-46a013bb70d5.jpg" }}
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <Anchor className="text-orange-main" size={28} />
              <span className="text-orange-main font-body text-sm font-semibold uppercase tracking-widest">
                Water Section
              </span>
            </div>
            <h2 className="font-display font-bold text-white text-3xl sm:text-4xl lg:text-5xl leading-tight mb-6">
              Building Skills on the Water
            </h2>
            <p className="font-body text-white/70 text-base leading-relaxed mb-8">
              For more than two decades, our Water Section has been a key part of our group, covering all sections, as well as adult leaders. With a focus on building skills in kayaking, canoeing, and water safety. Above all, it’s about enjoying time on the water, building confidence, working together, and creating memorable adventures along the way.
            </p>
            <Link
              href="/join"
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-main hover:bg-orange-hover text-white font-body font-semibold rounded-lg transition-colors"
            >
              Learn how to join <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-orange-main font-body text-sm font-semibold uppercase tracking-widest mb-3 block">
                Latest
              </span>
              <h2 className="font-display font-bold text-navy-dark text-3xl sm:text-4xl">
                News &amp; Events
              </h2>
            </div>
            <Link
              href="/news"
              className="hidden sm:inline-flex items-center gap-2 text-sm font-body font-semibold text-navy-light hover:text-orange-main transition-colors"
            >
              All news <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestNews.map((article, i) => (
              <NewsCard key={article._id} {...article} index={i} />
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-sm font-body font-semibold text-navy-light hover:text-orange-main transition-colors"
            >
              View all news <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Join CTA */}
      <section className="bg-navy-dark py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-white text-3xl sm:text-4xl lg:text-5xl mb-4">
              Ready to get involved?
            </h2>
            <p className="font-body text-white/60 text-base max-w-xl mx-auto">
              Whether you want to enrol your child or volunteer as a leader, there&apos;s a place for you at 1st Meath Dunboyne.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="bg-white/10 hover:bg-white/15 transition-colors rounded-2xl p-8 text-center">
              <div className="w-14 h-14 bg-orange-main rounded-full flex items-center justify-center mx-auto mb-5">
                <Users size={24} className="text-white" />
              </div>
              <h3 className="font-display font-bold text-white text-xl mb-3">Enrol a Child</h3>
              <p className="font-body text-white/60 text-sm leading-relaxed mb-6">
                All sections currently have places available. Apply online in minutes.
              </p>
              <Link
                href="/join"
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-main hover:bg-orange-hover text-white font-body font-semibold rounded-lg transition-colors text-sm"
              >
                Apply Now <ArrowRight size={14} />
              </Link>
            </div>
            <div className="bg-white/10 hover:bg-white/15 transition-colors rounded-2xl p-8 text-center">
              <div className="w-14 h-14 bg-navy-light rounded-full flex items-center justify-center mx-auto mb-5">
                <Heart size={24} className="text-white" />
              </div>
              <h3 className="font-display font-bold text-white text-xl mb-3">Volunteer as a Leader</h3>
              <p className="font-body text-white/60 text-sm leading-relaxed mb-6">
                No experience needed. We provide full training. Make a lasting difference in young lives.
              </p>
              <Link
                href="/join#volunteer"
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white/30 hover:border-white text-white font-body font-semibold rounded-lg transition-colors text-sm"
              >
                Get Involved <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

