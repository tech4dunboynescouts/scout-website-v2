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
          { label: "Dashboard", href: "/leaders/dashboard" },
          { label: "Waiting List Statistics" },
        ]}
      />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-12 lg:py-16">

        {data === null ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <p className="font-body text-textMuted text-sm">
              Waiting list statistics have not been configured yet. Please add them in Sanity Studio.
            </p>
          </div>
        ) : (
          <>
            {formattedLastUpdated && (
              <p className="font-body text-textMuted text-sm mb-4">
                Last updated: {formattedLastUpdated}
              </p>
            )}
            {/* Table layout for tablet and up */}
            <div className="hidden md:block rounded-2xl overflow-hidden">
              <table className="w-full bg-white font-body text-sm">
                <thead>
                  <tr className="bg-navy-mid text-white">
                    <th className="px-6 py-4 text-left font-semibold">Section</th>
                    <th className="px-6 py-4 text-left font-semibold whitespace-nowrap">Current Waiting List</th>
                    <th className="px-6 py-4 text-left font-semibold">Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {SECTION_ORDER.map((key, i) => {
                    const row = (data.sections ?? []).find((s) => s.section === key)
                    return (
                      <tr key={key} className={i % 2 === 0 ? "bg-white" : "bg-background"}>
                        <td className="px-6 py-4 font-semibold text-navy-dark align-top">
                          {SECTION_LABELS[key]}
                        </td>
                        <td className="px-6 py-4 text-textMuted align-top">
                          {row != null ? row.count : "—"}
                        </td>
                        <td className="px-6 py-4 text-textMuted whitespace-pre-line align-top">
                          {row?.comments?.trim() ? row.comments.trim() : "—"}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Stacked card layout for mobile */}
            <div className="md:hidden space-y-4">
              {SECTION_ORDER.map((key) => {
                const row = (data.sections ?? []).find((s) => s.section === key)
                return (
                  <div
                    key={key}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                  >
                    <div className="flex items-center justify-between bg-navy-mid text-white px-5 py-3">
                      <span className="font-semibold">{SECTION_LABELS[key]}</span>
                      <span className="text-sm">
                        Waiting: <span className="font-semibold">{row != null ? row.count : "—"}</span>
                      </span>
                    </div>
                    <div className="px-5 py-4 font-body text-sm">
                      <p className="text-xs font-semibold uppercase tracking-wide text-textMuted mb-1">
                        Comments
                      </p>
                      <p className="text-textMuted whitespace-pre-line">
                        {row?.comments?.trim() ? row.comments.trim() : "—"}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </>
  )
}
