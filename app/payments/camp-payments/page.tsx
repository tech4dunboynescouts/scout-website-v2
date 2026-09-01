import type { Metadata } from "next"
import { BadgeInfo, Lock } from "lucide-react"
import PageHero from "@/components/PageHero"
import { summerCampPaymentOptionsQuery } from "@/sanity/lib/queries"
import { serverClient } from "@/sanity/lib/serverClient"
import CampPaymentsForm from "./CampPaymentsForm"
import { buildSocialMetadata } from "@/lib/socialMetadata"

export const metadata: Metadata = buildSocialMetadata({
  title: "Camp Payments",
  description: "Pay for upcoming Scout camps and activities online.",
  canonicalPath: "/payments/camp-payments",
})

export default async function PublicCampPaymentsPage() {
  const rawOptions = await serverClient
    .fetch<
      Array<{
        _id: string
        title: string
        section: string
        currency: string
        amountOptions?: number[]
        active?: boolean
      }>
    >(summerCampPaymentOptionsQuery)
    .catch(() => [])

  const activeOptions = (Array.isArray(rawOptions) ? rawOptions : [])
    .filter((o) => o.active !== false)
    .map((o) => ({
      id: String(o._id),
      title: String(o.title ?? "Camp Payment"),
      section: String(o.section ?? "scouts"),
      currency: String(o.currency ?? "EUR"),
      amountOptions: Array.isArray(o.amountOptions)
        ? o.amountOptions.map(Number).filter((n) => Number.isFinite(n) && n > 0)
        : [],
    }))
    .filter((o) => o.amountOptions.length > 0)

  const currency = activeOptions[0]?.currency ?? "EUR"

  return (
    <>
      <PageHero
        title="Camp Payments"
        subtitle="Pay for upcoming Scout camps and activities securely online."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Online Payments", href: "/payments" },
          { label: "Camp Payments" },
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

        {activeOptions.length > 0 ? (
          <CampPaymentsForm pricing={{ currency, options: activeOptions }} />
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-main/10 flex items-center justify-center mb-4">
              <BadgeInfo size={22} className="text-orange-main" />
            </div>
            <h2 className="font-display font-bold text-navy-dark text-xl mb-2">
              No camp payments currently available
            </h2>
            <p className="font-body text-textMuted text-sm max-w-xl mx-auto">
              There are currently no active camp payment options. Please contact the group at{" "}
              <a
                href="mailto:secretarydunboynescouts@gmail.com"
                className="text-orange-main hover:underline"
              >
                secretarydunboynescouts@gmail.com
              </a>{" "}
              for more information.
            </p>
          </div>
        )}
      </div>
    </>
  )
}
