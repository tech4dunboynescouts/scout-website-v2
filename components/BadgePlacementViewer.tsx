"use client"

import { useState, useEffect } from "react"
import { Maximize2, X, ZoomIn, ZoomOut } from "lucide-react"
import { createPortal } from "react-dom"

interface Props {
  src: string
  sectionName: string
  colour: string
}

export default function BadgePlacementViewer({ src, sectionName, colour }: Props) {
  const [open, setOpen] = useState(false)
  const [scale, setScale] = useState(1)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Scroll-lock when overlay open (same pattern as other overlays on site)
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.cssText
    const y = window.scrollY
    document.body.style.cssText = `position:fixed;top:-${y}px;left:0;right:0;overflow-y:scroll;`
    return () => {
      document.body.style.cssText = prev
      window.scrollTo(0, y)
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); setScale(1) } }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open])

  const lightbox = open && mounted ? createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/90 flex flex-col"
      onClick={(e) => { if (e.target === e.currentTarget) { setOpen(false); setScale(1) } }}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
        <span className="text-white font-body text-sm font-semibold">
          {sectionName} — Badge Placement Guide
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}
            className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Zoom out"
          >
            <ZoomOut size={18} />
          </button>
          <span className="text-white/50 text-xs font-body w-10 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((s) => Math.min(3, s + 0.25))}
            className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Zoom in"
          >
            <ZoomIn size={18} />
          </button>
          <button
            onClick={() => { setOpen(false); setScale(1) }}
            className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors ml-2"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Image area — scrollable at high zoom */}
      <div className="flex-1 overflow-auto flex items-start justify-center p-4">
        <img
          src={src}
          alt={`${sectionName} badge placement diagram`}
          style={{ transform: `scale(${scale})`, transformOrigin: "top center", transition: "transform 0.2s" }}
          className="max-w-full rounded-lg shadow-2xl origin-top"
          draggable={false}
        />
      </div>
    </div>,
    document.body
  ) : null

  return (
    <>
      {lightbox}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-navy-dark text-3xl">Badge Placement Guide</h2>
          <button
            onClick={() => { setOpen(true); setScale(1) }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-body font-semibold transition-all hover:text-white"
            style={{ borderColor: colour, color: colour }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = colour
              ;(e.currentTarget as HTMLButtonElement).style.color = "white"
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = ""
              ;(e.currentTarget as HTMLButtonElement).style.color = colour
            }}
            aria-label="View full-size badge placement diagram"
          >
            <Maximize2 size={15} /> View Full Diagram
          </button>
        </div>

        <p className="font-body text-textMuted text-sm mb-5">
          The diagram below shows where each badge should be placed on the {sectionName.toLowerCase()} uniform.
          Tap "View Full Diagram" to zoom in for detail.
        </p>

        {/* Thumbnail — clicking also opens lightbox */}
        <div
          className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm cursor-zoom-in group"
          onClick={() => { setOpen(true); setScale(1) }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && setOpen(true)}
          aria-label="Open badge placement diagram fullscreen"
        >
          <img
            src={src}
            alt={`${sectionName} badge placement diagram`}
            className="w-full object-contain bg-white"
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white rounded-xl px-4 py-2 flex items-center gap-2 text-sm font-body font-semibold">
              <Maximize2 size={15} /> Enlarge
            </div>
          </div>
        </div>

        <p className="text-xs font-body text-textMuted mt-3 text-center">
          All graphics © Scouting Ireland
        </p>
      </div>
    </>
  )
}
