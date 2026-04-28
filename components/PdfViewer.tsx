"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString()

interface Props {
  url: string
  fileName?: string
}

export default function PdfViewer({ url, fileName }: Props) {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const [containerWidth, setContainerWidth] = useState<number>(0)
  const [error, setError] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const updateWidth = useCallback(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.clientWidth)
    }
  }, [])

  useEffect(() => {
    updateWidth()
    const observer = new ResizeObserver(updateWidth)
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [updateWidth])

  if (error) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-sm font-body text-textMuted">
        Unable to display this document. Please use the download button above.
      </div>
    )
  }

  return (
    <div className="mb-10">
      <div
        ref={containerRef}
        className="rounded-xl border border-gray-200 overflow-hidden bg-gray-100"
      >
        <Document
          file={url}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          onLoadError={() => setError(true)}
          loading={
            <div className="flex items-center justify-center h-64 gap-2 text-textMuted text-sm font-body">
              <Loader2 size={18} className="animate-spin" />
              Loading {fileName ?? "document"}…
            </div>
          }
        >
          {containerWidth > 0 && (
            <Page
              pageNumber={page}
              width={containerWidth}
              renderTextLayer
              renderAnnotationLayer
              loading={
                <div className="flex items-center justify-center h-64">
                  <Loader2 size={18} className="animate-spin text-textMuted" />
                </div>
              }
            />
          )}
        </Document>
      </div>

      {numPages && numPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="p-1.5 rounded-md text-navy-dark disabled:text-gray-300 hover:bg-gray-100 transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-body text-textMuted">
            Page {page} of {numPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(numPages, p + 1))}
            disabled={page >= numPages}
            className="p-1.5 rounded-md text-navy-dark disabled:text-gray-300 hover:bg-gray-100 transition-colors"
            aria-label="Next page"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  )
}
