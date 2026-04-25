import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, ArrowLeft, Tag } from "lucide-react";
import NewsCard from "@/components/NewsCard";
import news from "@/data/news.json";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return news.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = news.find((n) => n.slug === params.slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
  };
}

const tagColours: Record<string, string> = {
  Beavers: "#E8640A",
  Cubs: "#2A5298",
  Scouts: "#1A3A6B",
  Ventures: "#0D2044",
  Group: "#5A6A8A",
};

export default function NewsArticlePage({ params }: Props) {
  const article = news.find((n) => n.slug === params.slug);
  if (!article) notFound();

  const related = news
    .filter((n) => n.slug !== article.slug && n.tag === article.tag)
    .slice(0, 2);

  const formatted = new Date(article.date).toLocaleDateString("en-IE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const tagColour = tagColours[article.tag] || "#5A6A8A";

  return (
    <>
      {/* Hero image */}
      <div className="relative h-72 sm:h-96 lg:h-[480px] overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-navy-dark/60" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Article */}
          <article className="lg:col-span-2">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-textMuted hover:text-navy-dark text-sm font-body mb-6 transition-colors"
            >
              <ArrowLeft size={14} /> Back to News
            </Link>

            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span
                className="flex items-center gap-1.5 text-xs font-body font-semibold px-3 py-1 rounded-full text-white"
                style={{ background: tagColour }}
              >
                <Tag size={10} /> {article.tag}
              </span>
              <span className="flex items-center gap-1.5 text-textMuted text-sm font-body">
                <Calendar size={13} /> {formatted}
              </span>
              {article.readTime && (
                <span className="flex items-center gap-1.5 text-textMuted text-sm font-body">
                  <Clock size={13} /> {article.readTime}
                </span>
              )}
            </div>

            <h1 className="font-display font-bold text-navy-dark text-3xl sm:text-4xl lg:text-5xl leading-tight mb-8">
              {article.title}
            </h1>

            <div
              className="font-body text-textMuted text-base leading-relaxed prose prose-p:mb-4 prose-p:leading-relaxed max-w-none"
              dangerouslySetInnerHTML={{ __html: article.body }}
            />
          </article>

          {/* Sidebar */}
          <aside className="space-y-8">
            {related.length > 0 && (
              <div>
                <h2 className="font-display font-bold text-navy-dark text-xl mb-5">
                  More from {article.tag}
                </h2>
                <div className="space-y-5">
                  {related.map((rel, i) => (
                    <NewsCard key={rel.id} {...rel} index={i} />
                  ))}
                </div>
              </div>
            )}

            <div className="bg-navy-dark rounded-2xl p-6 text-center">
              <h3 className="font-display font-bold text-white text-xl mb-3">Get involved</h3>
              <p className="font-body text-white/60 text-sm mb-5">
                Want to be part of adventures like these? Join 1st Meath Dunboyne today.
              </p>
              <Link
                href="/join"
                className="inline-block px-5 py-2.5 bg-orange-main hover:bg-orange-hover text-white font-body font-semibold rounded-lg transition-colors text-sm"
              >
                Join the Group
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
