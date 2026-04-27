"use client";

import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import NewsCard from "@/components/NewsCard";
import TagFilter from "@/components/TagFilter";

interface Article {
  slug: string;
  title: string;
  date: string;
  tag: string;
  excerpt: string;
  image: string;
  readTime?: string;
}

function YearFilter({
  years,
  active,
  onChange,
}: {
  years: string[];
  active: string;
  onChange: (year: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by year">
      {["All", ...years].map((year) => {
        const isActive = active === year;
        return (
          <button
            key={year}
            onClick={() => onChange(year)}
            className={`relative px-4 py-2 rounded-full text-sm font-body font-medium transition-colors ${
              isActive
                ? "text-white"
                : "text-textMuted bg-white border border-gray-200 hover:border-navy-light hover:text-navy-dark"
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="year-bg"
                className="absolute inset-0 rounded-full bg-orange-main"
                transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
              />
            )}
            <span className="relative">{year}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function NewsFilterGrid({ articles }: { articles: Article[] }) {
  const [activeTag, setActiveTag] = useState("All");
  const [activeYear, setActiveYear] = useState("All");

  const years = useMemo(() => {
    const set = new Set(
      articles.map((a) => new Date(a.date).getFullYear().toString())
    );
    return Array.from(set).sort((a, b) => Number(b) - Number(a));
  }, [articles]);

  const filtered = articles.filter((a) => {
    const tagMatch = activeTag === "All" || a.tag === activeTag;
    const yearMatch =
      activeYear === "All" ||
      new Date(a.date).getFullYear().toString() === activeYear;
    return tagMatch && yearMatch;
  });

  return (
    <>
      <div className="mb-8 space-y-3">
        <div>
          <p className="text-xs font-body font-semibold uppercase tracking-widest text-textMuted mb-2">
            Section
          </p>
          <TagFilter active={activeTag} onChange={setActiveTag} />
        </div>
        {years.length > 1 && (
          <div>
            <p className="text-xs font-body font-semibold uppercase tracking-widest text-textMuted mb-2">
              Year
            </p>
            <YearFilter years={years} active={activeYear} onChange={setActiveYear} />
          </div>
        )}
      </div>

      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((article, i) => (
            <motion.div
              key={article.slug}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <NewsCard {...article} index={i} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="font-body text-textMuted text-base">
            No articles found for this filter combination.
          </p>
        </div>
      )}
    </>
  );
}
