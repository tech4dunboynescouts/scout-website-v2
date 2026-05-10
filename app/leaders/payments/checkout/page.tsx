import type { Metadata } from "next"

import { auth } from "@/auth"
import { siteUrl } from "@/lib/siteConfig"
import { getPaymentIntentClientSecret } from "../actions"
import PaymentElementCheckout from "./PaymentElementCheckout"

export const metadata: Metadata = {
  title: "Embedded Checkout",
  robots: { index: false, follow: false },
}

export default async function EmbeddedCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ payment_intent?: string }>
}) {
  const session = await auth()
  if (!session?.user?.isAuthorizedLeader) {
    return null
  }

  const { payment_intent } = await searchParams
  if (!payment_intent) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl border border-gray-100 p-8">
          <h1 className="font-display font-bold text-2xl text-navy-dark mb-2">Checkout not available</h1>
          <p className="font-body text-sm text-textMuted">
            Missing payment intent ID. Please return to the payments page and try again.
          </p>
        </div>
      </div>
    )
  }

  const clientSecret = await getPaymentIntentClientSecret(payment_intent).catch(() => null)
  if (!clientSecret) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl border border-gray-100 p-8">
          <h1 className="font-display font-bold text-2xl text-navy-dark mb-2">Checkout not available</h1>
          <p className="font-body text-sm text-textMuted">
            The checkout session could not be loaded. Try starting the payment again.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
      <div className="mb-5">
        <p className="text-orange-main font-body font-semibold text-sm uppercase tracking-widest mb-1">
          Leaders Portal
        </p>
        <h1 className="font-display font-bold text-navy-dark text-3xl">Checkout</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
        <PaymentElementCheckout
          clientSecret={clientSecret}
          returnUrl={`${siteUrl}/leaders/payments/success`}
        />
      </div>
    </div>
  )
}
