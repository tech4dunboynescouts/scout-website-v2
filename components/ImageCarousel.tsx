"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";

interface CarouselImage {
  url: string;
  alt?: string;
  caption?: string;
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
};

export default function ImageCarousel({ images }: { images: CarouselImage[] }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
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

  // Keyboard navigation and ESC when lightbox is open
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") {
        setDirection(-1);
        setCurrent(c => (c - 1 + images.length) % images.length);
      }
      if (e.key === "ArrowRight") {
        setDirection(1);
        setCurrent(c => (c + 1) % images.length);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, images.length]);

  const go = (index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };
  const prev = () => go((current - 1 + images.length) % images.length);
  const next = () => go((current + 1) % images.length);
  const openLightbox = () => setLightboxOpen(true);

  // Double-tap detection for mobile
  const handleTouchEnd = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) openLightbox();
    lastTapRef.current = now;
  };

  if (!images?.length) return null;

  return (
    <>
      <figure className="my-8">
        {/* Image frame */}
        <div
          className="relative overflow-hidden rounded-xl bg-navy-dark aspect-[16/9] cursor-zoom-in"
          onDoubleClick={openLightbox}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence custom={direction} mode="popLayout">
            <motion.img
              key={current}
              src={images[current].url}
              alt={images[current].alt ?? ""}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>

          {/* Maximize button */}
          <button
            onClick={e => { e.stopPropagation(); openLightbox(); }}
            aria-label="View fullscreen"
            className="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 flex items-center justify-center text-white transition-colors z-10"
          >
            <Maximize2 size={16} />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); prev(); }}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={e => { e.stopPropagation(); next(); }}
                aria-label="Next image"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
              >
                <ChevronRight size={20} />
              </button>

              <span className="absolute top-3 right-3 text-xs font-body font-semibold text-white bg-black/40 rounded-full px-2.5 py-1">
                {current + 1} / {images.length}
              </span>
            </>
          )}
        </div>

        {/* Caption */}
        {images[current].caption && (
          <figcaption className="mt-2 text-center text-sm font-body text-textMuted italic">
            {images[current].caption}
          </figcaption>
        )}

        {/* Dot indicators */}
        {images.length > 1 && (
          <div className="flex justify-center gap-2 mt-3">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                aria-label={`Go to image ${i + 1}`}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === current ? "bg-orange-main" : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
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
                className="flex items-center justify-between px-4 py-3 shrink-0"
                onClick={e => e.stopPropagation()}
              >
                <span className="text-white/60 text-sm font-body select-none">
                  {images.length > 1 ? `${current + 1} / ${images.length}` : ""}
                </span>
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
                className="flex-1 relative flex items-center justify-center overflow-hidden px-14"
                onClick={e => e.stopPropagation()}
              >
                <AnimatePresence custom={direction} mode="popLayout">
                  <motion.img
                    key={current}
                    src={images[current].url}
                    alt={images[current].alt ?? ""}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="max-w-full max-h-full object-contain rounded-lg"
                    style={{ maxHeight: "calc(100dvh - 120px)" }}
                  />
                </AnimatePresence>

                {images.length > 1 && (
                  <>
                    <button
                      onClick={prev}
                      aria-label="Previous image"
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={next}
                      aria-label="Next image"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </div>

              {/* Caption and dots */}
              <div
                className="shrink-0 px-4 py-3 flex flex-col items-center gap-2"
                onClick={e => e.stopPropagation()}
              >
                {images[current].caption && (
                  <p className="text-white/70 text-sm font-body text-center italic">
                    {images[current].caption}
                  </p>
                )}
                {images.length > 1 && (
                  <div className="flex gap-2">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => go(i)}
                        aria-label={`Go to image ${i + 1}`}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          i === current ? "bg-orange-main" : "bg-white/30 hover:bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
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
