import type { Metadata } from "next"
import { auth } from "@/auth"
import { markPaymentCompletedAction } from "../actions"
import { CheckCircle2, ArrowLeft, ShieldCheck } from "lucide-react"
import Link from "next/link"
import LeadersBreadcrumb from "@/components/LeadersBreadcrumb"

export const metadata: Metadata = {
  title: "Payment Complete",
  robots: { index: false, follow: false },
}

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ payment_intent?: string; subscription_id?: string }>
}) {
  const session = await auth()
  if (!session?.user?.isAuthorizedLeader) {
    return null
  }

  const { payment_intent: paymentIntentId, subscription_id: subscriptionId } = await searchParams
  const isSubscription = !!subscriptionId

  if (paymentIntentId) {
    await markPaymentCompletedAction(paymentIntentId).catch(() => null)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-24">
      <LeadersBreadcrumb
        crumbs={[
          { label: "Leaders Portal", href: "/leaders/dashboard" },
          { label: "Payments", href: "/leaders/payments" },
          { label: "Payment Complete" },
        ]}
      />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-green-50 flex items-center justify-center mb-5">
          <CheckCircle2 size={30} className="text-green-600" />
        </div>
        <h1 className="font-display font-bold text-navy-dark text-2xl sm:text-3xl mb-3">Payment complete</h1>
        {isSubscription ? (
          <p className="font-body text-textMuted text-sm leading-relaxed max-w-xl mx-auto">
            Subscription setup is complete. The first installment has been processed and the
            remaining installments will be charged monthly.
          </p>
        ) : (
          <p className="font-body text-textMuted text-sm leading-relaxed max-w-xl mx-auto">
            Stripe confirmed the checkout session. A confirmation email has been sent to the payee
            email address provided at checkout.
          </p>
        )}

        {(paymentIntentId || subscriptionId) && (
          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-navy-dark/5 text-navy-dark text-sm font-body break-all">
              <ShieldCheck size={16} className="text-orange-main" />
              {isSubscription ? "Subscription" : "Payment Intent"}: {subscriptionId ?? paymentIntentId}
            </div>
          </div>
        )}

        <div className="mt-8">
          <Link
            href="/leaders/payments"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-5 py-3 rounded-xl bg-orange-main text-white font-body font-semibold hover:bg-orange-dark transition-colors"
          >
            <ArrowLeft size={15} />
            Back to Payments
          </Link>
        </div>
      </div>
    </div>
  )
}
