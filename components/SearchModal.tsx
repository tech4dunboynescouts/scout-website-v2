"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Search, X, FileText, Newspaper, DollarSign, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { client } from "@/sanity/lib/client";
import { searchNewsQuery, searchFundraisingQuery, searchGeneralPagesQuery } from "@/sanity/lib/queries";
import sectionsData from "@/data/sections.json";

interface Result {
  title: string;
  href: string;
  description: string;
  type: "page" | "section" | "article" | "fundraising" | "generalPage";
  bodyText?: string;
}

const STATIC: Result[] = [
  { title: "Home", href: "/", description: "Welcome to 1st Meath Dunboyne Scout Group", type: "page" },
  { title: "About the Group", href: "/about", description: "Our history since 1973 and our commitment to Dunboyne", type: "page" },
  { title: "Leader Team 2025/26", href: "/leaders", description: "Meet our volunteer leaders for the 2025/26 scouting year", type: "page" },
  { title: "News & Events", href: "/news", description: "Latest news, events and achievements from the group", type: "page" },
  { title: "Join the Group", href: "/join", description: "Join as a youth member or volunteer as an adult leader", type: "page" },
  { title: "Contact Us", href: "/contact", description: "Get in touch with 1st Meath Dunboyne Scout Group", type: "page" },
  { title: "Fundraising", href: "/fundraising", description: "Support the group through our fundraising activities", type: "page" },
  ...sectionsData.map((s) => ({
    title: s.name,
    href: `/sections/${s.slug}`,
    description: s.tagline,
    type: "section" as const,
  })),
];

function hits(result: Result, q: string) {
  const lower = q.toLowerCase();
  return (
    result.title.toLowerCase().includes(lower) ||
    result.description.toLowerCase().includes(lower) ||
    (result.bodyText?.toLowerCase().includes(lower) ?? false)
  );
}

export default function SearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [dynamicResults, setDynamicResults] = useState<Result[]>([]);
  const [fetched, setFetched] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (open && !fetched) {
      Promise.all([
        client.fetch(searchNewsQuery),
        client.fetch(searchFundraisingQuery),
        client.fetch(searchGeneralPagesQuery),
      ])
        .then(([news, fundraising, pages]) => {
          const newsResults: Result[] = (news as { slug: string; title: string; excerpt: string; bodyText: string }[]).map((a) => ({
            title: a.title,
            href: `/news/${a.slug}`,
            description: a.excerpt ?? "",
            bodyText: a.bodyText ?? "",
            type: "article" as const,
          }));
          const fundraisingResults: Result[] = (fundraising as { slug: string; title: string; excerpt: string; bodyText: string }[]).map((a) => ({
            title: a.title,
            href: `/fundraising/${a.slug}`,
            description: a.excerpt ?? "",
            bodyText: a.bodyText ?? "",
            type: "fundraising" as const,
          }));
          const pageResults: Result[] = (pages as { slug: string; title: string; description: string; bodyText: string }[]).map((a) => ({
            title: a.title,
            href: `/pages/${a.slug}`,
            description: a.description ?? "",
            bodyText: a.bodyText ?? "",
            type: "generalPage" as const,
          }));
          setDynamicResults([...newsResults, ...fundraisingResults, ...pageResults]);
          setFetched(true);
        })
        .catch(() => setFetched(true));
    }
  }, [open, fetched]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else setQuery("");
  }, [open]);

  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const openHandler = () => setOpen(true);
    window.addEventListener("keydown", keyHandler);
    window.addEventListener("open-search", openHandler);
    return () => {
      window.removeEventListener("keydown", keyHandler);
      window.removeEventListener("open-search", openHandler);
    };
  }, []);

  const all = [...STATIC, ...dynamicResults];
  const results = query.length >= 2 ? all.filter((r) => hits(r, query)) : [];
  const pages = results.filter((r) => r.type === "page" || r.type === "section" || r.type === "generalPage");
  const news = results.filter((r) => r.type === "article");
  const fundraising = results.filter((r) => r.type === "fundraising");
  const close = () => setOpen(false);

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Search site"
        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-body text-white/80 hover:text-white transition-colors"
      >
        <Search size={18} />
        <span className="hidden lg:inline">Search</span>
      </button>

      {mounted && createPortal(
        <AnimatePresence>
          {open && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-50 bg-navy-dark/70 backdrop-blur-sm flex items-start justify-center pt-[10vh] px-4"
                onClick={close}
              >
              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: -8 }}
                transition={{ duration: 0.15 }}
                className="w-full max-w-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                  {/* Input row */}
                  <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
                    <Search size={18} className="text-textMuted flex-shrink-0" />
                    <input
                      ref={inputRef}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search pages, sections, news…"
                      className="flex-1 font-body text-base text-navy-dark outline-none placeholder:text-textMuted/50"
                    />
                    {query && (
                      <button
                        onClick={() => setQuery("")}
                        className="text-textMuted hover:text-navy-dark transition-colors"
                        aria-label="Clear search"
                      >
                        <X size={15} />
                      </button>
                    )}
                    <button
                      onClick={close}
                      className="text-xs font-body text-textMuted border border-gray-200 rounded px-2 py-1 hover:border-gray-400 transition-colors"
                    >
                      ESC
                    </button>
                  </div>

                  {/* Results */}
                  <div className="max-h-[60vh] overflow-y-auto">
                    {query.length < 2 ? (
                      <div className="px-4 py-10 text-center">
                        <p className="font-body text-textMuted text-sm">
                          Type at least 2 characters to search
                        </p>
                      </div>
                    ) : results.length === 0 ? (
                      <div className="px-4 py-10 text-center">
                        <p className="font-body text-textMuted text-sm">
                          No results for &ldquo;<strong className="text-navy-dark">{query}</strong>&rdquo;
                        </p>
                      </div>
                    ) : (
                      <div className="py-2">
                        {pages.length > 0 && (
                          <ResultGroup label="Pages & Sections" results={pages} onSelect={close} />
                        )}
                        {news.length > 0 && (
                          <ResultGroup label="News & Events" results={news} onSelect={close} />
                        )}
                        {fundraising.length > 0 && (
                          <ResultGroup label="Fundraising" results={fundraising} onSelect={close} />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

function ResultGroup({
  label,
  results,
  onSelect,
}: {
  label: string;
  results: Result[];
  onSelect: () => void;
}) {
  return (
    <div>
      <div className="px-4 pt-3 pb-1">
        <span className="text-xs font-body font-semibold uppercase tracking-widest text-textMuted/50">
          {label}
        </span>
      </div>
      {results.map((r) => (
        <Link
          key={r.href}
          href={r.href}
          onClick={onSelect}
          className="flex items-center gap-3 px-4 py-3 hover:bg-background transition-colors group"
        >
          <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-orange-main/10 flex items-center justify-center flex-shrink-0 transition-colors">
            {r.type === "article" ? (
              <Newspaper size={14} className="text-orange-main" />
            ) : r.type === "fundraising" ? (
              <DollarSign size={14} className="text-orange-main" />
            ) : (
              <FileText size={14} className="text-navy-dark/40 group-hover:text-orange-main transition-colors" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-body font-semibold text-navy-dark text-sm leading-snug">
              {r.title}
            </div>
            <div className="font-body text-textMuted text-xs line-clamp-1 mt-0.5">
              {r.description}
            </div>
          </div>
          <ArrowRight
            size={14}
            className="text-textMuted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          />
        </Link>
      ))}
    </div>
  );
}
