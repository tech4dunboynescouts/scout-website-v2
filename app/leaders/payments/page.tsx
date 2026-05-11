import type { Metadata } from "next"

import { auth } from "@/auth"
import Link from "next/link"
import { ArrowRight, CalendarDays, Shield } from "lucide-react"

export const metadata: Metadata = {
  title: "Payments",
  description: "Choose a payment category and continue through the secure Leaders Portal checkout flow.",
  robots: { index: false, follow: false },
}

export default async function PaymentsPage() {
  const session = await auth()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-16">
      <div className="mb-8 sm:mb-10 max-w-3xl">
        <p className="text-orange-main font-body font-semibold text-sm uppercase tracking-widest mb-1">
          Leaders Portal
        </p>
        <h1 className="font-display font-bold text-navy-dark text-2xl sm:text-4xl">
          Payments
        </h1>
        <p className="font-body text-textMuted text-sm mt-3 leading-relaxed">
          Choose the payment category you want and continue through the secure embedded checkout
          flow without leaving the Leaders Portal.
        </p>
      </div>

      <div className="bg-navy-dark rounded-2xl p-5 sm:p-8 mb-8 text-white/85 border border-navy-dark/20">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <Shield size={18} className="text-orange-main" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-white mb-1">Secure server-side Stripe flow</h2>
            <p className="font-body text-sm leading-relaxed text-white/70 max-w-3xl">
              Pricing is managed in Sanity Studio. Payment intents are created server-side via
              Stripe before the checkout panel is displayed.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <Link
          href="/leaders/payments/annual-subscriptions"
          className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 transition-all hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="w-12 h-12 rounded-xl bg-orange-main/10 flex items-center justify-center mb-4">
            <CalendarDays size={20} className="text-orange-main" />
          </div>
          <h2 className="font-display font-bold text-navy-dark text-xl sm:text-2xl mb-2">Annual Subscriptions</h2>
          <p className="font-body text-textMuted text-sm leading-relaxed">
            Pay annual subscriptions for Beavers, Cubs, Scouts, and Ventures with section-level
            quantities and one consolidated checkout.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 text-orange-main font-body font-semibold text-sm">
            Open Annual Subscriptions
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        <Link
          href="/leaders/payments/scouts-summer-camp"
          className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 transition-all hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="w-12 h-12 rounded-xl bg-orange-main/10 flex items-center justify-center mb-4">
            <CalendarDays size={20} className="text-orange-main" />
          </div>
          <h2 className="font-display font-bold text-navy-dark text-xl sm:text-2xl mb-2">Summer Camp Payments</h2>
          <p className="font-body text-textMuted text-sm leading-relaxed">
            Choose an active camp payment option (for example Beavers, Cubs, Scouts, Ventures)
            and then select the amount to pay.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 text-orange-main font-body font-semibold text-sm">
            Open Summer Camp Payments
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </div>

      <p className="font-body text-xs text-textMuted mt-8 break-all">
        Signed in as {session?.user?.email ?? "unknown leader"}.
      </p>
    </div>
  )
}
