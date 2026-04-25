"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Clock } from "lucide-react";

const tagColours: Record<string, string> = {
  Beavers: "#E8640A",
  Cubs: "#2A5298",
  Scouts: "#1A3A6B",
  Ventures: "#0D2044",
  Group: "#5A6A8A",
};

interface NewsCardProps {
  slug: string;
  title: string;
  date: string;
  tag: string;
  excerpt: string;
  image: string;
  readTime?: string;
  index?: number;
}

export default function NewsCard({
  slug,
  title,
  date,
  tag,
  excerpt,
  image,
  readTime,
  index = 0,
}: NewsCardProps) {
  const formatted = new Date(date).toLocaleDateString("en-IE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const tagColour = tagColours[tag] || "#5A6A8A";

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link
        href={`/news/${slug}`}
        className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full"
      >
        {/* Image */}
        <div className="relative h-52 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-navy-dark/20 group-hover:bg-navy-dark/10 transition-colors" />
          <span
            className="absolute top-4 left-4 text-xs font-body font-semibold px-3 py-1 rounded-full text-white"
            style={{ background: tagColour }}
          >
            {tag}
          </span>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-4 text-xs font-body text-textMuted mb-3">
            <span className="flex items-center gap-1.5">
              <Calendar size={12} />
              {formatted}
            </span>
            {readTime && (
              <span className="flex items-center gap-1.5">
                <Clock size={12} />
                {readTime}
              </span>
            )}
          </div>
          <h3 className="font-display font-bold text-navy-dark text-lg leading-snug mb-2 group-hover:text-navy-mid transition-colors line-clamp-2">
            {title}
          </h3>
          <p className="font-body text-textMuted text-sm leading-relaxed line-clamp-3">
            {excerpt}
          </p>
          <span className="inline-block mt-4 text-xs font-body font-semibold text-orange-main group-hover:underline">
            Read more →
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
