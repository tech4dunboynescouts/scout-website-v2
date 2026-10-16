import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import PageHero from "@/components/PageHero"
import { serverClient } from "@/sanity/lib/serverClient"
import { waitingListStatisticsQuery } from "@/sanity/lib/queries"

export const metadata: Metadata = {
  title: "Waiting List Statistics | Leaders Portal",
}

export const revalidate = 300

type SectionKey = "beavers" | "cubs" | "scouts" | "ventures" | "rovers"

interface WaitingListSection {
  section: SectionKey
  count: number
  comments?: string | null
}

interface WaitingListStatisticsData {
  lastUpdated: string
  sections: WaitingListSection[] | null
}

const SECTION_ORDER: SectionKey[] = ["beavers", "cubs", "scouts", "ventures", "rovers"]

const SECTION_LABELS: Record<SectionKey, string> = {
  beavers: "Beavers",
  cubs: "Cubs",
  scouts: "Scouts",
  ventures: "Ventures",
  rovers: "Rovers",
}

export default async function WaitingListPage() {
  const data = await serverClient
    .fetch(waitingListStatisticsQuery)
    .catch(() => null) as WaitingListStatisticsData | null

  const formattedLastUpdated = data?.lastUpdated
    ? new Date(data.lastUpdated).toLocaleDateString("en-IE", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null

  return (
    <>
      <PageHero
        title="Waiting List Statistics"
        subtitle="Current waiting list counts for each section."
        breadcrumbs={[
          { label: "Leaders Portal", href: "/leaders/dashboard" },
          { label: "Waiting List Statistics" },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <Link
          href="/leaders/dashboard"
          className="inline-flex items-center gap-1.5 text-textMuted hover:text-navy-dark text-sm font-body mb-8 transition-colors"
        >
          <ChevronLeft size={15} /> Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {data === null ? (
            <div className="p-12 text-center">
              <p className="font-body text-textMuted text-sm">
                Waiting list statistics have not been configured yet. Please add them in Sanity Studio.
              </p>
            </div>
          ) : (
            <>
              {formattedLastUpdated && (
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                  <p className="font-body text-textMuted text-xs">
                    Last updated: {formattedLastUpdated}
                  </p>
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-body">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-5 py-3 text-left font-semibold text-navy-dark text-xs uppercase tracking-wider">
                        Section
                      </th>
                      <th className="px-5 py-3 text-left font-semibold text-navy-dark text-xs uppercase tracking-wider">
                        Current Waiting List
                      </th>
                      <th className="px-5 py-3 text-left font-semibold text-navy-dark text-xs uppercase tracking-wider">
                        Comments
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {SECTION_ORDER.map((key) => {
                      const row = (data.sections ?? []).find((s) => s.section === key)
                      return (
                        <tr
                          key={key}
                          className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-5 py-3 font-semibold text-navy-dark">
                            {SECTION_LABELS[key]}
                          </td>
                          <td className="px-5 py-3 text-navy-dark">
                            {row != null ? row.count : "—"}
                          </td>
                          <td className="px-5 py-3 text-textMuted">
                            {row?.comments?.trim() ? row.comments.trim() : "—"}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
