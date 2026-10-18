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
  const lockedScrollY = useRef(0);

  useEffect(() => { setMounted(true); }, []);

  // Lock body scroll while lightbox is open (including iOS Safari)
  useEffect(() => {
    if (!lightboxOpen) return;

    lockedScrollY.current = window.scrollY;
    const body = document.body;
    const previous = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
    };

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${lockedScrollY.current}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";

    return () => {
      body.style.overflow = previous.overflow;
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.left = previous.left;
      body.style.right = previous.right;
      body.style.width = previous.width;
      window.scrollTo(0, lockedScrollY.current);
    };
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
            className="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 flex items-center justify-center text-white transition-colors z-10"
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
              className="fixed inset-0 z-[9999] bg-black/95"
              onClick={() => setLightboxOpen(false)}
            >
              {/* Image fills the entire viewport; object-contain preserves aspect ratio */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <motion.img
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
                src={url}
                alt={alt ?? ""}
                onClick={(e) => e.stopPropagation()}
                className="absolute inset-0 h-full w-full object-contain select-none"
              />

              {/* Close button (overlaid) */}
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
                aria-label="Close fullscreen"
                className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X size={20} />
              </button>

              {/* Caption (overlaid) */}
              {caption && (
                <div
                  className="absolute bottom-0 inset-x-0 z-10 px-4 py-3 flex justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="text-white/80 text-sm font-body text-center italic bg-black/30 rounded-lg px-3 py-1">
                    {caption}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
