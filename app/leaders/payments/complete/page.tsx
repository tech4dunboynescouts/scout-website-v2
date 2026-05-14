import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { createLeaderSubscriptionAction } from "../actions"
import LeadersBreadcrumb from "@/components/LeadersBreadcrumb"

export const metadata: Metadata = {
  title: "Completing Subscription",
  robots: { index: false, follow: false },
}

export default async function LeadersSubscriptionCompletePage({
  searchParams,
}: {
  searchParams: Promise<{ setup_intent?: string }>
}) {
  const session = await auth()
  if (!session?.user?.isAuthorizedLeader) {
    return null
  }

  const { setup_intent: setupIntentId } = await searchParams

  if (!setupIntentId) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <LeadersBreadcrumb
          crumbs={[
            { label: "Leaders Portal", href: "/leaders/dashboard" },
            { label: "Payments", href: "/leaders/payments" },
            { label: "Completing Subscription" },
          ]}
        />
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 text-center">
          <AlertCircle size={28} className="mx-auto text-red-500 mb-4" />
          <h1 className="font-display font-bold text-xl sm:text-2xl text-navy-dark mb-2">
            Subscription could not be completed
          </h1>
          <p className="font-body text-sm text-textMuted mb-5">
            Missing subscription setup details. Please return to annual subscriptions and try again.
          </p>
          <Link
            href="/leaders/payments/annual-subscriptions"
            className="inline-flex items-center gap-2 text-sm font-body font-semibold text-orange-main hover:underline"
          >
            <ArrowLeft size={14} /> Return to Annual Subscriptions
          </Link>
        </div>
      </div>
    )
  }

  let subscriptionId: string | null = null
  let completionError: string | null = null

  try {
    const subscription = await createLeaderSubscriptionAction(setupIntentId)
    subscriptionId = subscription.id
  } catch (error) {
    completionError = error instanceof Error ? error.message : "Please try again."
  }

  if (completionError || !subscriptionId) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <LeadersBreadcrumb
          crumbs={[
            { label: "Leaders Portal", href: "/leaders/dashboard" },
            { label: "Payments", href: "/leaders/payments" },
            { label: "Completing Subscription" },
          ]}
        />
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 text-center">
          <AlertCircle size={28} className="mx-auto text-red-500 mb-4" />
          <h1 className="font-display font-bold text-xl sm:text-2xl text-navy-dark mb-2">
            Subscription could not be completed
          </h1>
          <p className="font-body text-sm text-textMuted mb-5">{completionError ?? "Please try again."}</p>
          <Link
            href="/leaders/payments/annual-subscriptions"
            className="inline-flex items-center gap-2 text-sm font-body font-semibold text-orange-main hover:underline"
          >
            <ArrowLeft size={14} /> Return to Annual Subscriptions
          </Link>
        </div>
      </div>
    )
  }

  redirect(`/leaders/payments/success?subscription_id=${subscriptionId}`)
}
