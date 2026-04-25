"use client";

import { motion } from "framer-motion";

const TAGS = ["All", "Beavers", "Cubs", "Scouts", "Ventures", "Group"];

interface TagFilterProps {
  active: string;
  onChange: (tag: string) => void;
}

export default function TagFilter({ active, onChange }: TagFilterProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by section">
      {TAGS.map((tag) => {
        const isActive = active === tag;
        return (
          <button
            key={tag}
            onClick={() => onChange(tag)}
            className={`relative px-4 py-2 rounded-full text-sm font-body font-medium transition-colors ${
              isActive
                ? "text-white"
                : "text-textMuted bg-white border border-gray-200 hover:border-navy-light hover:text-navy-dark"
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="tag-bg"
                className="absolute inset-0 rounded-full bg-navy-dark"
                transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
              />
            )}
            <span className="relative">{tag}</span>
          </button>
        );
      })}
    </div>
  );
}
