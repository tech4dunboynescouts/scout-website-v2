import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { markPaymentCancelledAction } from "../actions"
import { XCircle, ArrowLeft, RotateCcw } from "lucide-react"
import Link from "next/link"
import LeadersBreadcrumb from "@/components/LeadersBreadcrumb"

export const metadata: Metadata = {
  title: "Payment Cancelled",
  robots: { index: false, follow: false },
}

export default async function PaymentCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ payment_intent?: string }>
}) {
  const session = await auth()
  if (!session?.user?.isAuthorizedLeader) {
    redirect("/leaders/login")
  }

  const { payment_intent: paymentIntentId } = await searchParams
  await markPaymentCancelledAction(paymentIntentId).catch(() => null)

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-24">
      <LeadersBreadcrumb
        crumbs={[
          { label: "Leaders Portal", href: "/leaders/dashboard" },
          { label: "Payments", href: "/leaders/payments" },
          { label: "Payment Cancelled" },
        ]}
      />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-5">
          <XCircle size={30} className="text-red-600" />
        </div>
        <h1 className="font-display font-bold text-navy-dark text-2xl sm:text-3xl mb-3">Payment cancelled</h1>
        <p className="font-body text-textMuted text-sm leading-relaxed max-w-xl mx-auto">
          No charge was completed. You can return to the payment list and start a new payment when
          you are ready.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/leaders/payments"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-5 py-3 rounded-xl bg-orange-main text-white font-body font-semibold hover:bg-orange-dark transition-colors"
          >
            <ArrowLeft size={15} />
            Back to Payments
          </Link>
          <Link
            href="/leaders/payments/cancel"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-gray-200 text-navy-dark font-body font-semibold hover:bg-gray-50 transition-colors"
          >
            <RotateCcw size={15} />
            Refresh Status
          </Link>
        </div>
      </div>
    </div>
  )
}
