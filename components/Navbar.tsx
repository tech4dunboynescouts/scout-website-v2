"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/", label: "Home" },
  {
    label: "Sections",
    children: [
      { href: "/sections/beavers", label: "Beavers" },
      { href: "/sections/cubs", label: "Cubs" },
      { href: "/sections/scouts", label: "Scouts" },
      { href: "/sections/ventures", label: "Ventures" },
    ],
  },
  { href: "/news", label: "News & Events" },
  { href: "/about", label: "About" },
  { href: "/fundraising", label: "Fundraising" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sectionsOpen, setSectionsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSectionsOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href;
  const isSectionActive = () => pathname.startsWith("/sections");

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-navy-dark shadow-lg" : "bg-navy-dark/95 backdrop-blur-sm"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white/20 group-hover:ring-orange-main transition-all">
              <Image
                src="/images/logo.jpg"
                alt="1st Meath Dunboyne Scout Group"
                width={48}
                height={48}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <div className="text-white font-body font-bold text-sm lg:text-base leading-tight">
                1st Meath Dunboyne
              </div>
              <div className="text-orange-main text-xs font-body">
                Scout Group
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.label} className="relative">
                  <button
                    onClick={() => setSectionsOpen((v) => !v)}
                    className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-body font-medium transition-colors ${
                      isSectionActive()
                        ? "text-orange-main"
                        : "text-white/80 hover:text-white"
                    }`}
                    aria-expanded={sectionsOpen}
                  >
                    {link.label}
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${sectionsOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence>
                    {sectionsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-1 w-48 bg-navy-dark border border-white/10 rounded-lg shadow-xl overflow-hidden"
                      >
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`block px-4 py-2.5 text-sm font-body transition-colors ${
                              isActive(child.href)
                                ? "bg-orange-main text-white"
                                : "text-white/80 hover:bg-navy-mid hover:text-white"
                            }`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href!}
                  className={`px-3 py-2 rounded-md text-sm font-body font-medium transition-colors ${
                    isActive(link.href!)
                      ? "text-orange-main"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}
            <Link
              href="/join"
              className="ml-3 px-5 py-2.5 bg-orange-main hover:bg-orange-hover text-white text-sm font-body font-semibold rounded-lg transition-colors"
            >
              Join Now
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="lg:hidden p-2 text-white rounded-md"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden bg-navy-dark border-t border-white/10 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) =>
                link.children ? (
                  <div key={link.label}>
                    <div className="px-3 py-2 text-white/50 text-xs font-body uppercase tracking-wider">
                      {link.label}
                    </div>
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`block px-6 py-2.5 rounded-md text-sm font-body transition-colors ${
                          isActive(child.href)
                            ? "bg-orange-main text-white"
                            : "text-white/80 hover:bg-navy-mid hover:text-white"
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href!}
                    className={`block px-3 py-2.5 rounded-md text-sm font-body transition-colors ${
                      isActive(link.href!)
                        ? "bg-orange-main/20 text-orange-main"
                        : "text-white/80 hover:bg-navy-mid hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              )}
              <div className="pt-3">
                <Link
                  href="/join"
                  className="block w-full text-center px-5 py-3 bg-orange-main hover:bg-orange-hover text-white text-sm font-body font-semibold rounded-lg transition-colors"
                >
                  Join Now
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
