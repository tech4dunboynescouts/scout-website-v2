import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle, MapPin, Calendar, ArrowRight } from "lucide-react";
import sections from "@/data/sections.json";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return sections.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const section = sections.find((s) => s.slug === slug);
  if (!section) return {};
  return {
    title: section.name,
    description: section.description,
  };
}

const galleryImages = [
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80",
  "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",
  "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600&q=80",
  "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80",
];

export default async function SectionPage({ params }: Props) {
  const { slug } = await params;
  const section = sections.find((s) => s.slug === slug);
  if (!section) notFound();

  return (
    <>
      {/* Hero */}
      <section
        className="relative pt-28 pb-20 lg:pt-40 lg:pb-28 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${section.colour}ee 0%, ${section.colour}99 100%)` }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-overlay"
          style={{ backgroundImage: `url(${section.image})` }}
        />
        <div className="absolute inset-0 bg-navy-dark/50" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/#sections"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm font-body mb-6 transition-colors"
          >
            ← All Sections
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl" role="img" aria-label={section.name}>{section.icon}</span>
          </div>
          <h1 className="font-display font-bold text-white text-5xl sm:text-6xl lg:text-7xl mb-4">
            {section.name}
          </h1>
          <p className="font-body text-white/80 text-xl italic">{section.tagline}</p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-12">
            <div>
              <h2 className="font-display font-bold text-navy-dark text-3xl mb-5">About the Programme</h2>
              <p className="font-body text-textMuted text-base leading-relaxed mb-4">{section.description}</p>
              <p className="font-body text-textMuted text-base leading-relaxed">{section.programme}</p>
            </div>

            <div>
              <h2 className="font-display font-bold text-navy-dark text-3xl mb-5">What We Get Up To</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {section.activities.map((activity, i) => (
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

            {/* Gallery */}
            <div>
              <h2 className="font-display font-bold text-navy-dark text-3xl mb-5">Gallery</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {galleryImages.map((src, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden">
                    <img
                      src={src}
                      alt={`${section.name} activity ${i + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Meeting details */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-display font-bold text-navy-dark text-xl mb-5">Meeting Details</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar size={18} className="text-orange-main mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-body text-xs text-textMuted uppercase tracking-wider mb-1.5">Meeting Times</div>
                    <div className="space-y-1">
                      {section.meetings.map((meeting, i) => (
                        <div key={i} className="font-body font-medium text-navy-dark text-sm">
                          {meeting.day} &middot; {meeting.time}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-orange-main mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-body text-xs text-textMuted uppercase tracking-wider mb-0.5">Location</div>
                    <div className="font-body font-medium text-navy-dark text-sm">{section.location}</div>
                  </div>
                </div>
              </div>
            </div>

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
                href="/join"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-navy-dark font-body font-semibold rounded-lg hover:bg-white/90 transition-colors text-sm"
              >
                Apply Now <ArrowRight size={14} />
              </Link>
            </div>

            {/* Other sections */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-display font-bold text-navy-dark text-base mb-4">Other Sections</h3>
              <div className="space-y-2">
                {sections
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
