"use client";

import { motion } from "framer-motion";

const sectionColours: Record<string, string> = {
  Beavers: "#E8640A",
  Cubs: "#2A5298",
  Scouts: "#1A3A6B",
  Ventures: "#0D2044",
  Group: "#5A6A8A",
};

interface LeaderCardProps {
  name: string;
  role: string;
  section: string;
  bio: string;
  image: string;
  index?: number;
}

export default function LeaderCard({ name, role, section, bio, image, index = 0 }: LeaderCardProps) {
  const colour = sectionColours[section] || "#5A6A8A";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
    >
      <div className="relative h-52 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/60 to-transparent" />
        <span
          className="absolute bottom-3 left-3 text-xs font-body font-semibold px-2.5 py-1 rounded-full text-white"
          style={{ background: colour }}
        >
          {section}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-display font-bold text-navy-dark text-lg mb-0.5">
          {name}
        </h3>
        <p className="font-body text-orange-main text-sm font-medium mb-3">
          {role}
        </p>
        <p className="font-body text-textMuted text-sm leading-relaxed">
          {bio}
        </p>
      </div>
    </motion.div>
  );
}
