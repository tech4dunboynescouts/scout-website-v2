"use client"

import dynamic from "next/dynamic"

interface Props {
  url: string
  fileName?: string
}

const PdfViewer = dynamic(() => import("@/components/PdfViewer"), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-100 h-64 flex items-center justify-center gap-2 text-textMuted text-sm font-body">
      Loading document preview…
    </div>
  ),
})

export default function PdfViewerClient({ url, fileName }: Props) {
  return <PdfViewer url={url} fileName={fileName} />
}