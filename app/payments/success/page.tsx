import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react"
import { markPublicPaymentCompletedAction } from "../actions"

export const metadata: Metadata = {
  title: "Payment Complete",
  robots: { index: false, follow: false },
}

export default async function PublicPaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ payment_intent?: string }>
}) {
  const { payment_intent: paymentIntentId } = await searchParams

  if (paymentIntentId) {
    await markPublicPaymentCompletedAction(paymentIntentId).catch(() => null)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-24">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-green-50 flex items-center justify-center mb-5">
          <CheckCircle2 size={30} className="text-green-600" />
        </div>
        <h1 className="font-display font-bold text-navy-dark text-2xl sm:text-3xl mb-3">
          Payment complete
        </h1>
        <p className="font-body text-textMuted text-sm leading-relaxed">
          Your payment has been successfully processed. A confirmation email has been sent to the
          email address you provided.
        </p>

        {paymentIntentId && (
          <div className="mt-6 w-full rounded-2xl bg-navy-dark/5 border border-navy-dark/10 px-4 py-4">
            <p className="font-body text-xs text-navy-dark/50 uppercase tracking-widest mb-2">
              Transaction ID
            </p>
            <div className="flex items-start gap-2 justify-center">
              <ShieldCheck size={15} className="text-orange-main flex-shrink-0 mt-0.5" />
              <span className="font-body text-navy-dark text-sm font-mono break-all leading-relaxed">
                {paymentIntentId}
              </span>
            </div>
          </div>
        )}

        <p className="font-body text-textMuted text-xs mt-5 leading-relaxed">
          Please keep your Transaction ID for your records. If you have any questions, contact us at{" "}
          <a
            href="mailto:secretarydunboynescouts@gmail.com"
            className="text-orange-main hover:underline break-all"
          >
            secretarydunboynescouts@gmail.com
          </a>
          .
        </p>

        <div className="mt-8">
          <Link
            href="/payments"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-5 py-3 rounded-xl bg-orange-main text-white font-body font-semibold hover:bg-orange-dark transition-colors"
          >
            <ArrowLeft size={15} />
            Back to Online Payments
          </Link>
        </div>
      </div>
    </div>
  )
}
