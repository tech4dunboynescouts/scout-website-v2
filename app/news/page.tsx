"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import NewsCard from "@/components/NewsCard";
import TagFilter from "@/components/TagFilter";
import PageHero from "@/components/PageHero";
import news from "@/data/news.json";

export default function NewsPage() {
  const [activeTag, setActiveTag] = useState("All");

  const filtered = activeTag === "All" ? news : news.filter((n) => n.tag === activeTag);

  return (
    <>
      <PageHero
        title="News & Events"
        subtitle="The latest from 1st Meath Dunboyne — adventures, achievements, and upcoming activities."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "News & Events" }]}
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="mb-8">
          <TagFilter active={activeTag} onChange={setActiveTag} />
        </div>

        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((article, i) => (
              <motion.div
                key={article.id}
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
            <p className="font-body text-textMuted text-base">No articles found for this section.</p>
          </div>
        )}
      </section>
    </>
  );
}
