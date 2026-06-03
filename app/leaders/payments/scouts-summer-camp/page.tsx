import type { Metadata } from "next"

import { auth } from "@/auth"
import { summerCampPaymentOptionsQuery } from "@/sanity/lib/queries"
import { serverClient } from "@/sanity/lib/serverClient"
import { BadgeInfo, Shield } from "lucide-react"

import ScoutsSummerCampForm from "../ScoutsSummerCampForm"

export const metadata: Metadata = {
  title: "Summer Camp Payments",
  robots: { index: false, follow: false },
}

function normalizeAmountOptions(values: number[] | undefined): number[] {
  if (!values || !Array.isArray(values)) return []

  const unique = Array.from(
    new Set(
      values
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value) && value > 0)
        .map((value) => Math.round(value * 100) / 100)
    )
  )

  unique.sort((a, b) => a - b)
  return unique
}

export default async function ScoutsSummerCampPage() {
  const session = await auth()
  const options = await serverClient.fetch(summerCampPaymentOptionsQuery).catch(() => [])

  const normalizedOptions = (Array.isArray(options) ? options : [])
    .map((option) => ({
      id: String(option._id ?? ""),
      title: String(option.title ?? "Summer Camp Payment"),
      section: String(option.section ?? "other"),
      currency: String(option.currency ?? "EUR"),
      stripePriceId: String(option.stripePriceId ?? ""),
      amountOptions: normalizeAmountOptions(option.amountOptions),
    }))
    .filter((option) => option.id && option.amountOptions.length > 0)

  const fallbackCurrency = normalizedOptions[0]?.currency ?? "EUR"
  const pricingData =
    normalizedOptions.length > 0
      ? {
          currency: fallbackCurrency,
          options: normalizedOptions,
        }
      : null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-16">
      <div className="mb-8 sm:mb-10 max-w-3xl">
        <p className="text-orange-main font-body font-semibold text-sm uppercase tracking-widest mb-1">
          Leaders Portal
        </p>
        <h1 className="font-display font-bold text-navy-dark text-2xl sm:text-4xl">
          Summer Camp Payments
        </h1>
        <p className="font-body text-textMuted text-sm mt-3 leading-relaxed">
          Choose a camp payment option and amount, then complete payment securely in the embedded
          checkout flow.
        </p>
      </div>

      <div className="bg-navy-dark rounded-2xl p-5 sm:p-8 mb-8 text-white/85 border border-navy-dark/20">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <Shield size={18} className="text-orange-main" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-white mb-1">Secure summer camp checkout</h2>
            <p className="font-body text-sm leading-relaxed text-white/70 max-w-3xl">
              Multiple camp payment options are managed in Sanity Studio, each with its own Stripe
              price ID and amount choices. Checkout is created server-side via Stripe.
            </p>
          </div>
        </div>
      </div>

      {pricingData ? (
        <ScoutsSummerCampForm pricing={pricingData} />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-main/10 flex items-center justify-center mb-4">
            <BadgeInfo size={22} className="text-orange-main" />
          </div>
          <h2 className="font-display font-bold text-navy-dark text-xl mb-2">Summer camp options not configured</h2>
          <p className="font-body text-textMuted text-sm max-w-xl mx-auto">
            Open <span className="font-semibold">Summer Camp Payments</span> in Sanity Studio and add one
            or more active payment options with section, Stripe Price ID, and amount choices.
          </p>
        </div>
      )}

      <p className="font-body text-xs text-textMuted mt-8 break-all">
        Signed in as {session?.user?.email ?? "unknown leader"}.
      </p>
    </div>
  )
}
