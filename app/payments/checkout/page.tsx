import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { siteUrl } from "@/lib/siteConfig"
import { getPublicPaymentIntentClientSecret } from "../actions"
import PaymentElementCheckout from "./PaymentElementCheckout"

export const metadata: Metadata = {
  title: "Online Payments — Checkout",
  robots: { index: false, follow: false },
}

export default async function PublicCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ payment_intent?: string }>
}) {
  const { payment_intent } = await searchParams

  if (!payment_intent) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
          <h1 className="font-display font-bold text-xl sm:text-2xl text-navy-dark mb-2">
            Checkout not available
          </h1>
          <p className="font-body text-sm text-textMuted mb-5">
            Missing payment intent ID. Please return to the payments page and try again.
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

  const clientSecret = await getPublicPaymentIntentClientSecret(payment_intent).catch(() => null)

  if (!clientSecret) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
          <h1 className="font-display font-bold text-xl sm:text-2xl text-navy-dark mb-2">
            Checkout not available
          </h1>
          <p className="font-body text-sm text-textMuted mb-5">
            The checkout session could not be loaded. Please return to the payments page and try again.
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-14">
      <div className="mb-5">
        <p className="text-orange-main font-body font-semibold text-sm uppercase tracking-widest mb-1">
          1st Meath Dunboyne Scout Group
        </p>
        <h1 className="font-display font-bold text-navy-dark text-2xl sm:text-3xl">Checkout</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
        <PaymentElementCheckout
          clientSecret={clientSecret}
          returnUrl={`${siteUrl}/payments/success`}
        />
      </div>

      <p className="mt-4 text-center font-body text-xs text-textMuted">
        Changed your mind?{" "}
        <Link href="/payments" className="text-orange-main hover:underline">
          Cancel and go back
        </Link>
      </p>
    </div>
  )
}
