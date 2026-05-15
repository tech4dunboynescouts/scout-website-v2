"use client"

import { useState } from "react"
import { ExternalLink, Loader2 } from "lucide-react"

interface Props {
  url: string
  fileName?: string
}

export default function PdfViewer({ url, fileName }: Props) {
  const [isLoading, setIsLoading] = useState(true)
  const previewUrl = `${url}#toolbar=1&navpanes=0&view=FitH`

  return (
    <div className="mb-10">
      <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-100 relative min-h-[640px]">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 text-textMuted text-sm font-body bg-gray-100">
            <Loader2 size={18} className="animate-spin" />
            Loading {fileName ?? "document"}…
          </div>
        )}

        <iframe
          src={previewUrl}
          title={fileName ?? "PDF preview"}
          className="h-[75vh] min-h-[640px] w-full bg-white"
          onLoad={() => setIsLoading(false)}
        />
      </div>

      <div className="mt-3 flex items-center justify-end">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-body font-semibold text-navy-dark hover:text-navy-dark/80 transition-colors"
        >
          Open preview in new tab <ExternalLink size={14} />
        </a>
      </div>
    </div>
  )
}
