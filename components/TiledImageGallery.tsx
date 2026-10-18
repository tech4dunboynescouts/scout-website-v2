"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface GalleryImage {
  url: string;
  alt?: string;
  caption?: string;
  aspectRatio?: string;
}

interface TiledImageGalleryProps {
  images: GalleryImage[];
  columns?: 2 | 3 | 4;
}

export default function TiledImageGallery({
  images,
  columns = 3,
}: TiledImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!images?.length) return null;

  // Determine aspect ratio class for each image
  const getAspectClass = (aspectRatio?: string) => {
    switch (aspectRatio) {
      case "portrait":
        return "aspect-[3/4]";
      case "landscape":
        return "aspect-video";
      default:
        return "aspect-square";
    }
  };

  // Responsive column classes
  const getColumnClasses = () => {
    switch (columns) {
      case 2:
        return "grid-cols-1 sm:grid-cols-2";
      case 4:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
      default: // 3
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    }
  };

  const handleOpenLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = "hidden";
  };

  const handleCloseLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = "unset";
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") handleCloseLightbox();
    if (e.key === "ArrowLeft") handlePrevious();
    if (e.key === "ArrowRight") handleNext();
  };

  return (
    <>
      {/* Tiled Grid */}
      <figure className="my-8">
        <div className={`grid ${getColumnClasses()} gap-4`}>
          {images.map((image, index) => (
            <motion.button
              key={index}
              onClick={() => handleOpenLightbox(index)}
              className="group relative overflow-hidden rounded-xl bg-gray-200 cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-main focus-visible:ring-offset-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label={`Open image ${index + 1}: ${image.alt || "Untitled"}`}
            >
              <img
                src={image.url}
                alt={image.alt ?? ""}
                className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${getAspectClass(
                  image.aspectRatio
                )}`}
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
            </motion.button>
          ))}
        </div>
      </figure>

      {/* Lightbox Modal */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {lightboxOpen && (
            <motion.div
              key="lightbox"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[9999] bg-black/95"
              onClick={handleCloseLightbox}
              onKeyDown={handleKeyDown}
              role="dialog"
              aria-modal="true"
              aria-label="Image viewer"
            >
              {/* Image fills the entire viewport; object-contain preserves aspect ratio */}
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentIndex}
                  src={images[currentIndex].url}
                  alt={images[currentIndex].alt ?? ""}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute inset-0 h-full w-full object-contain select-none"
                />
              </AnimatePresence>

              {/* Top bar: counter + close (overlaid) */}
              <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between px-4 py-3 pointer-events-none">
                <span className="text-white/70 text-sm font-body select-none bg-black/30 rounded-full px-2.5 py-1">
                  {images.length > 1 ? `${currentIndex + 1} / ${images.length}` : ""}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleCloseLightbox(); }}
                  aria-label="Close lightbox"
                  className="pointer-events-auto w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <X size={20} />
                </button>
              </div>

              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
                    aria-label="Previous image"
                    className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                    aria-label="Next image"
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <ChevronRight size={20} className="sm:w-6 sm:h-6" />
                  </button>
                </>
              )}

              {/* Bottom bar: caption + dots (overlaid) */}
              {(images[currentIndex].caption || images.length > 1) && (
                <div
                  className="absolute bottom-0 inset-x-0 z-10 px-3 sm:px-4 py-2 sm:py-3 flex flex-col items-center gap-2 sm:gap-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  {images[currentIndex].caption && (
                    <p className="text-white/80 text-xs sm:text-sm font-body text-center italic max-w-2xl line-clamp-2 bg-black/30 rounded-lg px-3 py-1">
                      {images[currentIndex].caption}
                    </p>
                  )}

                  {images.length > 1 && (
                    <div className="flex gap-1.5 sm:gap-2 flex-wrap justify-center">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentIndex(index)}
                          aria-label={`Go to image ${index + 1}`}
                          aria-current={index === currentIndex}
                          className={`w-2 h-2 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                            index === currentIndex
                              ? "bg-orange-main"
                              : "bg-white/30 hover:bg-white/50"
                          }`}
                        />
                      ))}
                    </div>
                  )}
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
