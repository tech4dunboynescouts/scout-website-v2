import type { Metadata } from "next"
import Link from "next/link"
import { auth } from "@/auth"
import { serverClient } from "@/sanity/lib/serverClient"
import { allLeaderResourcesQuery, leaderProfileByEmailQuery } from "@/sanity/lib/queries"
import LeadersDashboardSearch from "@/components/LeadersDashboardSearch"
import type { LeaderResource } from "@/components/LeadersDashboardSearch"
import { Calculator, ChevronRight, CreditCard } from "lucide-react"

export default async function DashboardPage() {
  const session = await auth()
  const email = session?.user?.email ?? ""
  const name = session?.user?.leaderName ?? session?.user?.name ?? "Leader"

  // Re-fetch roles live from Sanity on every dashboard load so that changes
  // made in Sanity Studio take effect without requiring a sign-out/sign-in.
  const profile = await serverClient
    .fetch(leaderProfileByEmailQuery, { email })
    .catch(() => null)
  const roles: string[] = profile?.roles ?? session?.user?.leaderRoles ?? []

  const resources: LeaderResource[] = await serverClient
    .fetch(allLeaderResourcesQuery, { roles })
    .catch(() => [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      {/* Welcome */}
      <div className="mb-10">
        <p className="text-orange-main font-body font-semibold text-sm uppercase tracking-widest mb-1">
          Leaders Portal
        </p>
        <h1 className="font-display font-bold text-navy-dark text-3xl sm:text-4xl">
          Welcome back, {name}
        </h1>
        <p className="font-body text-textMuted text-sm mt-2">
          {resources.length} resource{resources.length !== 1 ? "s" : ""} available to you
        </p>
      </div>

      {/* Tools */}
      <div className="mb-10">
        <h2 className="font-display font-bold text-navy-dark text-xl mb-4">Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/leaders/ratios-calculator"
            className="group flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-5 hover:border-orange-main/30 hover:shadow-md transition-all"
          >
            <div className="w-11 h-11 bg-orange-main/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-orange-main/20 transition-colors">
              <Calculator size={20} className="text-orange-main" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-navy-dark text-sm leading-snug group-hover:text-orange-main transition-colors">
                Leader to Youth Member Ratio Calculator
              </p>
              <p className="font-body text-textMuted text-xs mt-0.5">
                Scouting Ireland minimum Scouter requirements
              </p>
            </div>
            <ChevronRight size={16} className="text-textMuted group-hover:text-orange-main transition-colors flex-shrink-0" />
          </Link>

          <Link
            href="/leaders/payments"
            className="group flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-5 hover:border-orange-main/30 hover:shadow-md transition-all"
          >
            <div className="w-11 h-11 bg-orange-main/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-orange-main/20 transition-colors">
              <CreditCard size={20} className="text-orange-main" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-navy-dark text-sm leading-snug group-hover:text-orange-main transition-colors">
                Payments
              </p>
              <p className="font-body text-textMuted text-xs mt-0.5">
                Make secure online payments for Annual Subscriptions, Camps and other activities here.
              </p>
            </div>
            <ChevronRight size={16} className="text-textMuted group-hover:text-orange-main transition-colors flex-shrink-0" />
          </Link>
        </div>
      </div>

      {/* Searchable + filterable resource grid */}
      <LeadersDashboardSearch resources={resources} />
    </div>
  )
}
