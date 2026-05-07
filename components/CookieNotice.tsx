"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

const COOKIE_NOTICE_KEY = "cookie_notice_dismissed_v1";

export default function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = window.localStorage.getItem(COOKIE_NOTICE_KEY) === "true";
    if (!dismissed) setVisible(true);
  }, []);

  const dismiss = () => {
    window.localStorage.setItem(COOKIE_NOTICE_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      role="status"
      aria-live="polite"
      className="fixed inset-x-3 bottom-3 z-[100] rounded-xl border border-navy-dark/10 bg-white/95 shadow-xl backdrop-blur sm:inset-x-auto sm:right-4 sm:bottom-4 sm:max-w-xl"
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-orange-main" />
          <div className="min-w-0 flex-1">
            <p className="font-body text-sm text-navy-dark">
              <span className="sm:hidden">
                We use essential cookies and always-on analytics.
              </span>
              <span className="hidden sm:inline">
                We use essential cookies for site security and leader sign-in, and always-on analytics to understand usage and improve content.
              </span>
              <Link href="/cookies" className="ml-1 font-semibold text-navy-dark underline underline-offset-2 hover:text-orange-main">
                Read our Cookie Notice
              </Link>
              .
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss cookie notice"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-textMuted transition-colors hover:bg-navy-dark/5 hover:text-navy-dark"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
