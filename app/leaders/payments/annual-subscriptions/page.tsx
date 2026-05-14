import type { Metadata } from "next"

import { auth } from "@/auth"
import { leadersAnnualSubscriptionPricingQuery } from "@/sanity/lib/queries"
import { serverClient } from "@/sanity/lib/serverClient"
import { BadgeInfo, Lock } from "lucide-react"
import PageHero from "@/components/PageHero"
import AnnualSubscriptionsForm from "../AnnualSubscriptionsForm"

export const metadata: Metadata = {
  title: "Annual Subscriptions",
  robots: { index: false, follow: false },
}

export default async function AnnualSubscriptionsPage() {
  const session = await auth()
  const pricing = await serverClient.fetch(leadersAnnualSubscriptionPricingQuery).catch(() => null)
  const pricingData = pricing
    ? {
        currency: String(pricing.currency ?? "EUR"),
        sections: [
          {
            key: "beavers" as const,
            label: "Leaders Beaver Subs",
            unitPrice: Number(pricing.beavers?.unitPrice ?? 0),
          },
          {
            key: "cubs" as const,
            label: "Leaders Cubs Subs",
            unitPrice: Number(pricing.cubs?.unitPrice ?? 0),
          },
          {
            key: "scouts" as const,
            label: "Leaders Scout Subs",
            unitPrice: Number(pricing.scouts?.unitPrice ?? 0),
          },
          {
            key: "ventures" as const,
            label: "Leaders Ventures Subs",
            unitPrice: Number(pricing.ventures?.unitPrice ?? 0),
          },
        ],
        maximumSubscriptionFee: pricing.maximumSubscriptionFee ? Number(pricing.maximumSubscriptionFee) : undefined,
      }
    : null

  return (
    <>
      <PageHero
        title="Leaders Annual Subscriptions"
        subtitle="Choose quantities for Leaders Beaver Subs, Leaders Cubs Subs, Leaders Scout Subs and Leaders Ventures Subs, then pay in full or in 4 monthly installments."
        breadcrumbs={[
          { label: "Leaders Portal", href: "/leaders/dashboard" },
          { label: "Payments", href: "/leaders/payments" },
          { label: "Annual Subscriptions" },
        ]}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-16">
      <div className="flex items-center gap-3 bg-navy-dark/5 border border-navy-dark/10 rounded-2xl px-4 py-3 mb-8">
        <Lock size={16} className="text-navy-dark/50 flex-shrink-0" />
        <p className="font-body text-sm text-navy-dark/70">
          Payments are processed securely by Stripe. A confirmation email will be sent to the
          address you provide below.
        </p>
      </div>

      {pricingData ? (
        <AnnualSubscriptionsForm pricing={pricingData} userEmail={session?.user?.email ?? ""} />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-main/10 flex items-center justify-center mb-4">
            <BadgeInfo size={22} className="text-orange-main" />
          </div>
          <h2 className="font-display font-bold text-navy-dark text-xl mb-2">Pricing not configured</h2>
          <p className="font-body text-textMuted text-sm max-w-xl mx-auto">
            Open <span className="font-semibold">Leaders Annual Subscription Pricing</span> in
            Sanity Studio and add prices and Stripe Price IDs for all leader subscription options.
          </p>
        </div>
      )}

      <p className="font-body text-xs text-textMuted mt-8 break-all">
        Signed in as {session?.user?.email ?? "unknown leader"}.
      </p>
      </div>
    </>
  )
}
