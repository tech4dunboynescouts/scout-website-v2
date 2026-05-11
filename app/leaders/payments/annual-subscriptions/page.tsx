import type { Metadata } from "next"

import { auth } from "@/auth"
import { annualSubscriptionPricingQuery } from "@/sanity/lib/queries"
import { serverClient } from "@/sanity/lib/serverClient"
import { BadgeInfo, Shield } from "lucide-react"

import AnnualSubscriptionsForm from "../AnnualSubscriptionsForm"

export const metadata: Metadata = {
  title: "Annual Subscriptions",
  robots: { index: false, follow: false },
}

export default async function AnnualSubscriptionsPage() {
  const session = await auth()
  const pricing = await serverClient.fetch(annualSubscriptionPricingQuery).catch(() => null)
  const pricingData = pricing
    ? {
        currency: String(pricing.currency ?? "EUR"),
        sections: [
          { key: "beavers" as const, label: "Beavers", unitPrice: Number(pricing.beavers?.unitPrice ?? 0) },
          { key: "cubs" as const, label: "Cubs", unitPrice: Number(pricing.cubs?.unitPrice ?? 0) },
          { key: "scouts" as const, label: "Scouts", unitPrice: Number(pricing.scouts?.unitPrice ?? 0) },
          { key: "ventures" as const, label: "Ventures", unitPrice: Number(pricing.ventures?.unitPrice ?? 0) },
        ],
        maximumSubscriptionFee: pricing.maximumSubscriptionFee ? Number(pricing.maximumSubscriptionFee) : undefined,
      }
    : null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-16">
      <div className="mb-8 sm:mb-10 max-w-3xl">
        <p className="text-orange-main font-body font-semibold text-sm uppercase tracking-widest mb-1">
          Leaders Portal
        </p>
        <h1 className="font-display font-bold text-navy-dark text-2xl sm:text-4xl">
          Annual Subscriptions
        </h1>
        <p className="font-body text-textMuted text-sm mt-3 leading-relaxed">
          Choose section quantities and complete annual subscription payments for Beavers, Cubs,
          Scouts, and Ventures.
        </p>
      </div>

      <div className="bg-navy-dark rounded-2xl p-5 sm:p-8 mb-8 text-white/85 border border-navy-dark/20">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <Shield size={18} className="text-orange-main" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-white mb-1">Secure annual subscription checkout</h2>
            <p className="font-body text-sm leading-relaxed text-white/70 max-w-3xl">
              Unit prices are managed in Sanity Studio. Quantities and totals are calculated here,
              then your embedded checkout session is created server-side via Stripe.
            </p>
          </div>
        </div>
      </div>

      {pricingData ? (
        <AnnualSubscriptionsForm pricing={pricingData} />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-main/10 flex items-center justify-center mb-4">
            <BadgeInfo size={22} className="text-orange-main" />
          </div>
          <h2 className="font-display font-bold text-navy-dark text-xl mb-2">Pricing not configured</h2>
          <p className="font-body text-textMuted text-sm max-w-xl mx-auto">
            Open <span className="font-semibold">Annual Subscription Pricing</span> in Sanity Studio and
            add prices and Stripe Price IDs for all four sections.
          </p>
        </div>
      )}

      <p className="font-body text-xs text-textMuted mt-8 break-all">
        Signed in as {session?.user?.email ?? "unknown leader"}.
      </p>
    </div>
  )
}
