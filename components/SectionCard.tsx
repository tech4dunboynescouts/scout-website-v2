"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface SectionCardProps {
  slug: string;
  name: string;
  ageRange: string;
  colour: string;
  tagline: string;
  description: string;
  icon: string;
  index?: number;
}

export default function SectionCard({
  slug,
  name,
  ageRange,
  colour,
  tagline,
  description,
  icon,
  index = 0,
}: SectionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link
        href={`/sections/${slug}`}
        className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
      >
        {/* Colour bar */}
        <div className="h-2" style={{ background: colour }} />

        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-navy-dark text-2xl">
                {name}
              </h3>
              <p className="font-body text-textMuted text-sm mt-1 italic">
                {tagline}
              </p>
            </div>
            <span className="text-4xl" role="img" aria-label={name}>
              {icon}
            </span>
          </div>

          <p className="font-body text-textMuted text-sm leading-relaxed mb-6 line-clamp-3">
            {description}
          </p>

          <div
            className="flex items-center gap-2 text-sm font-body font-semibold transition-colors group-hover:gap-3"
            style={{ color: colour }}
          >
            Learn more <ArrowRight size={16} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
