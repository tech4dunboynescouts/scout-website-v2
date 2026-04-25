"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface HeroProps {
  title: string;
  subtitle: string;
  image: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}

export default function HeroSection({ title, subtitle, image, primaryCta, secondaryCta }: HeroProps) {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      aria-label="Hero section"
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${image})` }}
      />
      {/* Navy overlay */}
      <div className="absolute inset-0 bg-navy-dark/75" />
      {/* Gradient fade bottom */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-navy-dark/60 to-transparent" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 text-orange-main font-body text-sm font-medium tracking-widest uppercase mb-6">
            <span>⚜</span> 1st Meath Dunboyne Scout Group <span>⚜</span>
          </span>
          <h1 className="font-display font-bold text-white text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-tight mb-6">
            {title}
          </h1>
          <p className="font-body text-white/75 text-lg sm:text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed mb-10">
            {subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {primaryCta && (
              <Link
                href={primaryCta.href}
                className="px-8 py-4 bg-orange-main hover:bg-orange-hover text-white font-body font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-orange-main/30 text-base"
              >
                {primaryCta.label}
              </Link>
            )}
            {secondaryCta && (
              <Link
                href={secondaryCta.href}
                className="px-8 py-4 border-2 border-white/40 hover:border-white text-white font-body font-semibold rounded-lg transition-all hover:bg-white/10 text-base"
              >
                {secondaryCta.label}
              </Link>
            )}
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="w-1.5 h-1.5 bg-white/60 rounded-full"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
