import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { redirect } from "next/navigation"
import { createPublicSubscriptionAction } from "../actions"

export const metadata: Metadata = {
  title: "Completing Subscription",
  robots: { index: false, follow: false },
}

export default async function PublicSubscriptionCompletePage({
  searchParams,
}: {
  searchParams: Promise<{ setup_intent?: string }>
}) {
  const { setup_intent: setupIntentId } = await searchParams

  if (!setupIntentId) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 text-center">
          <AlertCircle size={28} className="mx-auto text-red-500 mb-4" />
          <h1 className="font-display font-bold text-xl sm:text-2xl text-navy-dark mb-2">
            Subscription could not be completed
          </h1>
          <p className="font-body text-sm text-textMuted mb-5">
            Missing subscription setup details. Please return to the payments page and try again.
          </p>
          <Link
            href="/payments"
            className="inline-flex items-center gap-2 text-sm font-body font-semibold text-orange-main hover:underline"
          >
            <ArrowLeft size={14} /> Back to Online Payments
          </Link>
        </div>
      </div>
    )
  }

  let subscriptionId: string | null = null
  let completionError: string | null = null

  try {
    const subscription = await createPublicSubscriptionAction(setupIntentId)
    subscriptionId = subscription.id
  } catch (error) {
    completionError = error instanceof Error ? error.message : "Please try again."
  }

  if (completionError || !subscriptionId) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 text-center">
          <AlertCircle size={28} className="mx-auto text-red-500 mb-4" />
          <h1 className="font-display font-bold text-xl sm:text-2xl text-navy-dark mb-2">
            Subscription could not be completed
          </h1>
          <p className="font-body text-sm text-textMuted mb-5">
            {completionError ?? "Please try again."}
          </p>
          <Link
            href="/payments/annual-subscriptions"
            className="inline-flex items-center gap-2 text-sm font-body font-semibold text-orange-main hover:underline"
          >
            <ArrowLeft size={14} /> Return to Annual Subscriptions
          </Link>
        </div>
      </div>
    )
  }

  redirect(`/payments/success?subscription_id=${subscriptionId}`)
}