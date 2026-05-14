import type { Metadata } from "next"

import { auth } from "@/auth"
import Link from "next/link"
import { ArrowRight, CalendarDays, Lock } from "lucide-react"
import PageHero from "@/components/PageHero"

export const metadata: Metadata = {
  title: "Payments",
  description: "Choose a payment category and continue through the secure Leaders Portal checkout flow.",
  robots: { index: false, follow: false },
}

export default async function PaymentsPage() {
  const session = await auth()

  return (
    <>
      <PageHero
        title="Payments"
        subtitle="Use leader-only annual subscription pricing with secure embedded checkout directly inside the Leaders Portal."
        breadcrumbs={[
          { label: "Leaders Portal", href: "/leaders/dashboard" },
          { label: "Payments" },
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <Link
          href="/leaders/payments/annual-subscriptions"
          className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 transition-all hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="w-12 h-12 rounded-xl bg-orange-main/10 flex items-center justify-center mb-4">
            <CalendarDays size={20} className="text-orange-main" />
          </div>
          <h2 className="font-display font-bold text-navy-dark text-xl sm:text-2xl mb-2">Leaders Annual Subscriptions</h2>
          <p className="font-body text-textMuted text-sm leading-relaxed">
            Pay leader-only subscription rates for Leaders Beaver Subs, Leaders Cubs Subs, Leaders
            Scout Subs and Leaders Ventures Subs with either full or installment checkout.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 text-orange-main font-body font-semibold text-sm">
            Open Annual Subscriptions
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </div>

      <p className="font-body text-xs text-textMuted mt-8 break-all">
        Signed in as {session?.user?.email ?? "unknown leader"}.
      </p>
      </div>
    </>
  )
}
