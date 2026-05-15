import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { siteUrl } from "@/lib/siteConfig"
import {
  getLeaderCheckoutCommitmentSummary,
  getPaymentIntentClientSecret,
  getSetupIntentClientSecret,
} from "../actions"
import PaymentElementCheckout from "./PaymentElementCheckout"
import PageHero from "@/components/PageHero"
import CheckoutCommitmentCard from "@/components/CheckoutCommitmentCard"

export const metadata: Metadata = {
  title: "Embedded Checkout",
  robots: { index: false, follow: false },
}

export default async function EmbeddedCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ payment_intent?: string; setup_intent?: string }>
}) {
  const session = await auth()
  if (!session?.user?.isAuthorizedLeader) {
    redirect("/leaders/login")
  }

  const { payment_intent, setup_intent } = await searchParams
  if (!payment_intent && !setup_intent) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
          <h1 className="font-display font-bold text-xl sm:text-2xl text-navy-dark mb-2">Checkout not available</h1>
          <p className="font-body text-sm text-textMuted">
            Missing payment intent ID. Please return to the payments page and try again.
          </p>
        </div>
      </div>
    )
  }

  const isSubscription = !!setup_intent
  const clientSecret = isSubscription
    ? await getSetupIntentClientSecret(String(setup_intent)).catch(() => null)
    : await getPaymentIntentClientSecret(String(payment_intent)).catch(() => null)
  const commitmentSummary = isSubscription
    ? await getLeaderCheckoutCommitmentSummary({ setupIntentId: String(setup_intent) }).catch(() => null)
    : await getLeaderCheckoutCommitmentSummary({ paymentIntentId: String(payment_intent) }).catch(() => null)

  if (!clientSecret) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
          <h1 className="font-display font-bold text-xl sm:text-2xl text-navy-dark mb-2">Checkout not available</h1>
          <p className="font-body text-sm text-textMuted">
            The checkout session could not be loaded. Try starting the payment again.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <PageHero
        title="Checkout"
        breadcrumbs={[
          { label: "Leaders Portal", href: "/leaders/dashboard" },
          { label: "Payments", href: "/leaders/payments" },
          { label: "Checkout" },
        ]}
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-14">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
          {commitmentSummary && (
            <CheckoutCommitmentCard
              amount={commitmentSummary.amount}
              currency={commitmentSummary.currency}
              mode={commitmentSummary.mode}
              installmentCount={commitmentSummary.mode === "installments" ? commitmentSummary.installmentCount : 4}
            />
          )}
          <PaymentElementCheckout
            clientSecret={clientSecret}
            returnUrl={
              isSubscription
                ? `${siteUrl}/leaders/payments/complete`
                : `${siteUrl}/leaders/payments/success`
            }
            isSubscription={isSubscription}
          />
        </div>
        <p className="mt-4 text-center font-body text-xs text-textMuted">
          Changed your mind?{" "}
          <Link href="/leaders/payments" className="text-orange-main hover:underline">
            Cancel and go back
          </Link>
        </p>
      </div>
    </>
  )
}
