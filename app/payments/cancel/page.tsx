import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, XCircle } from "lucide-react"
import { markPublicPaymentCancelledAction } from "../actions"

export const metadata: Metadata = {
  title: "Payment Cancelled",
  robots: { index: false, follow: false },
}

export default async function PublicPaymentCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ payment_intent?: string }>
}) {
  const { payment_intent: paymentIntentId } = await searchParams

  if (paymentIntentId) {
    await markPublicPaymentCancelledAction(paymentIntentId).catch(() => null)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-24">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-5">
          <XCircle size={30} className="text-red-500" />
        </div>
        <h1 className="font-display font-bold text-navy-dark text-2xl sm:text-3xl mb-3">
          Payment cancelled
        </h1>
        <p className="font-body text-textMuted text-sm leading-relaxed max-w-xl mx-auto">
          Your payment was cancelled and you have not been charged. If this was a mistake, you can
          start again below.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/payments"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-5 py-3 rounded-xl bg-orange-main text-white font-body font-semibold hover:bg-orange-dark transition-colors"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-5 py-3 rounded-xl bg-navy-dark/5 text-navy-dark font-body font-semibold hover:bg-navy-dark/10 transition-colors"
          >
            <ArrowLeft size={15} />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  )
}
