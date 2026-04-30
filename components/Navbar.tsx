"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SearchModal from "@/components/SearchModal";

export type NavChild = { label: string; href: string };
export type NavItem =
  | { _type: "navLink"; label: string; href: string; children?: never }
  | { _type: "navGroup"; label: string; href?: never; children: NavChild[] };

// Static fallback used when no Sanity navigation document exists yet
const staticNavItems: NavItem[] = [
  { _type: "navLink", label: "Home", href: "/" },
  { _type: "navLink", label: "News & Events", href: "/news" },
  {
    _type: "navGroup",
    label: "Sections",
    children: [
      { label: "Beavers", href: "/sections/beavers" },
      { label: "Cubs", href: "/sections/cubs" },
      { label: "Scouts", href: "/sections/scouts" },
      { label: "Ventures", href: "/sections/ventures" },
    ],
  },
  {
    _type: "navGroup",
    label: "About",
    children: [
      { label: "About the Group", href: "/about" },
      { label: "Leader Team", href: "/leaders" },
      { label: "Fundraising", href: "/fundraising" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
];

interface Props {
  navItems?: NavItem[];
}

export default function Navbar({ navItems }: Props) {
  const items = navItems && navItems.length > 0 ? navItems : staticNavItems;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenGroup(null);
  }, [pathname]);

  const toggleGroup = (label: string) =>
    setOpenGroup((g) => (g === label ? null : label));

  const isActive = (href: string) => pathname === href;
  const isGroupActive = (children: NavChild[]) =>
    children.some((c) => {
      if (pathname === c.href) return true;
      if (c.href === "/leaders") return false;
      return pathname.startsWith(c.href + "/");
    });

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
            {items.map((item) =>
              item._type === "navGroup" ? (
                <div key={item.label} className="relative">
                  <button
                    onClick={() => toggleGroup(item.label)}
                    aria-expanded={openGroup === item.label}
                    className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-body font-medium transition-colors ${
                      isGroupActive(item.children ?? [])
                        ? "text-orange-main"
                        : "text-white/80 hover:text-white"
                    }`}
                  >
                    {item.label}
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${openGroup === item.label ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence>
                    {openGroup === item.label && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-1 w-48 bg-navy-dark border border-white/10 rounded-lg shadow-xl overflow-hidden"
                      >
                        {(item.children ?? []).map((child) => (
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
                  key={item.href}
                  href={item.href!}
                  className={`px-3 py-2 rounded-md text-sm font-body font-medium transition-colors ${
                    isActive(item.href!)
                      ? "text-orange-main"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              )
            )}

            {/* Fixed items — not editable via Studio */}
            <Link
              href="/leaders/login"
              className={`px-3 py-2 rounded-md text-sm font-body font-medium transition-colors ${
                pathname.startsWith("/leaders/")
                  ? "text-orange-main"
                  : "text-white/80 hover:text-white"
              }`}
            >
              Leaders Portal
            </Link>
            <SearchModal />
            <Link
              href="/join"
              className="ml-1 px-5 py-2.5 bg-orange-main hover:bg-orange-hover text-white text-sm font-body font-semibold rounded-lg transition-colors"
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
            className="lg:hidden bg-navy-dark border-t border-white/10 overflow-hidden max-h-[calc(100vh-4rem)] overflow-y-auto"
          >
            <div className="px-4 py-4 space-y-1">
              {items.map((item) =>
                item._type === "navGroup" ? (
                  <div key={item.label}>
                    <div className="px-3 py-2 text-white/50 text-xs font-body uppercase tracking-wider">
                      {item.label}
                    </div>
                    {(item.children ?? []).map((child) => (
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
                    key={item.href}
                    href={item.href!}
                    className={`block px-3 py-2.5 rounded-md text-sm font-body transition-colors ${
                      isActive(item.href!)
                        ? "bg-orange-main/20 text-orange-main"
                        : "text-white/80 hover:bg-navy-mid hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              )}

              {/* Fixed mobile items */}
              <div className="pt-3 flex flex-col gap-2">
                <Link
                  href="/leaders/login"
                  className={`block px-3 py-2.5 rounded-md text-sm font-body transition-colors ${
                    pathname.startsWith("/leaders/")
                      ? "bg-orange-main/20 text-orange-main"
                      : "text-white/80 hover:bg-navy-mid hover:text-white"
                  }`}
                >
                  Leaders Portal
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    window.dispatchEvent(new Event("open-search"));
                  }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-body text-white/80 hover:text-white hover:bg-navy-mid transition-colors w-full"
                >
                  <Search size={18} />
                  Search the site
                </button>
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
