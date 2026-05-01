"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, X } from "lucide-react";

interface Props {
  url: string;
  alt?: string;
  caption?: string;
}

export default function BodyImage({ url, alt, caption }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const lastTapRef = useRef<number>(0);

  useEffect(() => { setMounted(true); }, []);

  // Lock body scroll while lightbox is open
  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightboxOpen]);

  // ESC to close
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen]);

  const openLightbox = () => setLightboxOpen(true);

  // Double-tap detection for mobile
  const handleTouchEnd = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) openLightbox();
    lastTapRef.current = now;
  };

  return (
    <>
      <figure className="my-8">
        <div
          className="relative overflow-hidden rounded-xl cursor-zoom-in group"
          onDoubleClick={openLightbox}
          onTouchEnd={handleTouchEnd}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={alt ?? ""}
            className="w-full rounded-xl object-cover"
          />

          {/* Maximize button */}
          <button
            onClick={(e) => { e.stopPropagation(); openLightbox(); }}
            aria-label="View fullscreen"
            className="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 flex items-center justify-center text-white transition-colors z-10 opacity-0 group-hover:opacity-100 focus:opacity-100"
          >
            <Maximize2 size={16} />
          </button>
        </div>

        {caption && (
          <figcaption className="mt-2 text-center text-sm font-body text-textMuted italic">
            {caption}
          </figcaption>
        )}
      </figure>

      {/* Lightbox portal */}
      {mounted && createPortal(
        <AnimatePresence>
          {lightboxOpen && (
            <motion.div
              key="lightbox"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[9999] flex flex-col bg-black/95"
              onClick={() => setLightboxOpen(false)}
            >
              {/* Header bar */}
              <div
                className="flex items-center justify-end px-4 py-3 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setLightboxOpen(false)}
                  aria-label="Close fullscreen"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Image area */}
              <div
                className="flex-1 relative flex items-center justify-center overflow-hidden px-4"
                onClick={(e) => e.stopPropagation()}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <motion.img
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  src={url}
                  alt={alt ?? ""}
                  className="max-w-full max-h-full object-contain rounded-lg"
                  style={{ maxHeight: "calc(100dvh - 120px)" }}
                />
              </div>

              {/* Caption */}
              <div
                className="shrink-0 px-4 py-3 flex flex-col items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                {caption && (
                  <p className="text-white/70 text-sm font-body text-center italic">
                    {caption}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
