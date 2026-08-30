"use client"

import { useState } from "react"
import { FileText, FileDown, Eye, EyeOff } from "lucide-react"
import PdfViewer from "@/components/PdfViewer"

interface PdfDocumentValue {
  fileUrl?: string
  fileName?: string
  fileMimeType?: string
  fileSize?: number
  title?: string
  description?: string
  showInlineViewer?: boolean
}

interface Props {
  value: PdfDocumentValue
}

export default function PdfDocumentBlock({ value }: Props) {
  const {
    fileUrl,
    fileName,
    fileMimeType,
    fileSize,
    title,
    description,
    showInlineViewer = true,
  } = value || {}

  const [viewerOpen, setViewerOpen] = useState<boolean>(showInlineViewer)

  if (!fileUrl) return null

  const isPdf =
    !fileMimeType ||
    fileMimeType === "application/pdf" ||
    fileUrl.toLowerCase().includes(".pdf")

  const displayTitle = title || fileName || "Downloadable Document"

  const formatSize = (bytes?: number) => {
    if (!bytes) return null
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formattedSize = formatSize(fileSize)

  return (
    <div className="my-8 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm transition-all hover:shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-orange-main/10 text-orange-main">
            <FileText size={24} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-orange-main/10 px-2 py-0.5 text-xs font-body font-bold text-orange-main uppercase tracking-wider">
                PDF Document
              </span>
              {formattedSize && (
                <span className="text-xs font-body text-textMuted">
                  • {formattedSize}
                </span>
              )}
            </div>
            <h3 className="mt-1 font-display text-xl font-bold text-navy-dark">
              {displayTitle}
            </h3>
            {description && (
              <p className="mt-2 font-body text-sm text-textMuted leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:flex-shrink-0">
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="inline-flex items-center gap-2 rounded-xl bg-navy-dark px-4 py-2.5 text-sm font-body font-semibold text-white transition-colors hover:bg-navy-mid shadow-sm"
          >
            <FileDown size={16} />
            Download
          </a>

          {isPdf && (
            <button
              onClick={() => setViewerOpen(!viewerOpen)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-body font-medium text-navy-dark transition-colors hover:bg-gray-100"
              title={viewerOpen ? "Hide inline viewer" : "Preview document"}
            >
              {viewerOpen ? (
                <>
                  <EyeOff size={16} />
                  <span className="hidden sm:inline">Hide Preview</span>
                </>
              ) : (
                <>
                  <Eye size={16} />
                  <span>Preview</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Embedded PDF Viewer */}
      {isPdf && viewerOpen && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <PdfViewer url={fileUrl} fileName={fileName || displayTitle} />
        </div>
      )}
    </div>
  )
}
