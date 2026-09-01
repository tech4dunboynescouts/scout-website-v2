import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, CreditCard, Tent } from "lucide-react"
import PageHero from "@/components/PageHero"
import { buildSocialMetadata } from "@/lib/socialMetadata"

export const metadata: Metadata = buildSocialMetadata({
  title: "Online Payments",
  description:
    "Make secure online payments for Annual Subscriptions and Camp Payments for 1st Meath Dunboyne Scout Group.",
  canonicalPath: "/payments",
})

export default function PaymentsPage() {
  return (
    <>
      <PageHero
        title="Online Payments"
        subtitle="Make secure online payments for Annual Subscriptions, Camps and other activities."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Online Payments" },
        ]}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Annual Subscriptions */}
          <Link
            href="/payments/annual-subscriptions"
            className="group bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md hover:border-orange-main/30 transition-all flex flex-col"
          >
            <div className="w-12 h-12 bg-orange-main/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-orange-main/20 transition-colors">
              <CreditCard size={22} className="text-orange-main" />
            </div>
            <h2 className="font-display font-bold text-navy-dark text-xl sm:text-2xl mb-2">
              Annual Subscriptions
            </h2>
            <p className="font-body text-textMuted text-sm leading-relaxed flex-1">
              Pay annual membership subscriptions for Beavers, Cubs, Scouts, Ventures, and Rovers. Select
              quantities per section and complete payment securely online.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-orange-main font-body font-semibold text-sm group-hover:gap-3 transition-all">
              Pay Now <ArrowRight size={15} />
            </div>
          </Link>

          {/* Camp Payments */}
          <Link
            href="/payments/camp-payments"
            className="group bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md hover:border-orange-main/30 transition-all flex flex-col"
          >
            <div className="w-12 h-12 bg-orange-main/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-orange-main/20 transition-colors">
              <Tent size={22} className="text-orange-main" />
            </div>
            <h2 className="font-display font-bold text-navy-dark text-xl sm:text-2xl mb-2">
              Camp Payments
            </h2>
            <p className="font-body text-textMuted text-sm leading-relaxed flex-1">
              Pay for upcoming Scout camps and activities. Choose a payment option, select your
              amount, and complete checkout securely online.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-orange-main font-body font-semibold text-sm group-hover:gap-3 transition-all">
              Pay Now <ArrowRight size={15} />
            </div>
          </Link>
        </div>

        {/* Security note */}
        <div className="mt-10 bg-navy-dark/5 border border-navy-dark/10 rounded-2xl px-5 py-4 flex items-start gap-3">
          <span className="text-lg mt-0.5">🔒</span>
          <p className="font-body text-sm text-navy-dark/70 leading-relaxed">
            All payments are processed securely by <strong className="text-navy-dark">Stripe</strong>.
            Your card details are never stored on this website. A confirmation email will be sent to
            the address you provide at checkout.
          </p>
        </div>
      </div>
    </>
  )
}
