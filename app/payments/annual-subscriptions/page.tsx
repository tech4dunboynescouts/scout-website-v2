import type { Metadata } from "next"
import { BadgeInfo, Lock } from "lucide-react"
import PageHero from "@/components/PageHero"
import { annualSubscriptionPricingQuery } from "@/sanity/lib/queries"
import { serverClient } from "@/sanity/lib/serverClient"
import AnnualSubscriptionsForm from "./AnnualSubscriptionsForm"

export const metadata: Metadata = {
  title: "Annual Subscriptions",
  description: "Pay annual membership subscriptions for Beavers, Cubs, Scouts, and Ventures.",
}

export default async function PublicAnnualSubscriptionsPage() {
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
        maximumSubscriptionFee: pricing.maximumSubscriptionFee
          ? Number(pricing.maximumSubscriptionFee)
          : undefined,
      }
    : null

  return (
    <>
      <PageHero
        title="Annual Subscriptions"
        subtitle="Pay annual membership subscriptions for your child's Scout section."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Online Payments", href: "/payments" },
          { label: "Annual Subscriptions" },
        ]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="flex items-center gap-3 bg-navy-dark/5 border border-navy-dark/10 rounded-2xl px-4 py-3 mb-8">
          <Lock size={16} className="text-navy-dark/50 flex-shrink-0" />
          <p className="font-body text-sm text-navy-dark/70">
            Payments are processed securely by Stripe. A confirmation email will be sent to the
            address you provide below.
          </p>
        </div>

        {pricingData ? (
          <AnnualSubscriptionsForm pricing={pricingData} />
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-main/10 flex items-center justify-center mb-4">
              <BadgeInfo size={22} className="text-orange-main" />
            </div>
            <h2 className="font-display font-bold text-navy-dark text-xl mb-2">
              Pricing not yet configured
            </h2>
            <p className="font-body text-textMuted text-sm max-w-xl mx-auto">
              Annual subscription pricing has not been set up yet. Please contact the group at{" "}
              <a
                href="mailto:secretarydunboynescouts@gmail.com"
                className="text-orange-main hover:underline"
              >
                secretarydunboynescouts@gmail.com
              </a>
              .
            </p>
          </div>
        )}
      </div>
    </>
  )
}
