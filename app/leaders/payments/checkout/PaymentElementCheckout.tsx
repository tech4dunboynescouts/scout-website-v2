"use client"

import { FormEvent, useEffect, useState } from "react"
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { getClientStripePromise } from "@/lib/stripeClient"

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const stripePromise = getClientStripePromise(publishableKey)

function CheckoutForm({ returnUrl, isSubscription }: { returnUrl: string; isSubscription: boolean }) {
  const stripe = useStripe()
  const elements = useElements()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [elementsReady, setElementsReady] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!stripe || !elements) {
      setErrorMessage("Payment form is still initializing. Please wait a moment and try again.")
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    const { error } = isSubscription
      ? await stripe.confirmSetup({
          elements,
          confirmParams: {
            return_url: returnUrl,
          },
        })
      : await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: returnUrl,
          },
        })

    if (error) {
      setErrorMessage(
        error.message ?? (isSubscription ? "Unable to set up payment method" : "Unable to complete payment")
      )
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!elementsReady && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-xl p-3 font-body text-sm">
          Initializing secure payment fields...
        </div>
      )}

      <PaymentElement
        options={{ layout: "tabs" }}
        onReady={() => {
          setElementsReady(true)
        }}
      />

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 font-body text-sm">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || !elements || !elementsReady || isSubmitting}
        className="w-full inline-flex items-center justify-center px-5 py-3 rounded-xl bg-orange-main text-white font-body font-semibold hover:bg-orange-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Processing..." : isSubscription ? "Set Up Subscription" : "Pay Now"}
      </button>
    </form>
  )
}

export default function PaymentElementCheckout({
  clientSecret,
  returnUrl,
  isSubscription = false,
}: {
  clientSecret: string
  returnUrl: string
  isSubscription?: boolean
}) {
  const [stripeLoadError, setStripeLoadError] = useState<string | null>(null)

  const hasValidClientSecret =
    typeof clientSecret === "string" && clientSecret.length > 0 && clientSecret.includes("_secret")
  const hasValidReturnUrl = typeof returnUrl === "string" && returnUrl.length > 0

  useEffect(() => {
    if (!stripePromise) return

    let isActive = true

    stripePromise
      .then((stripe) => {
        if (!isActive) return
        if (!stripe) {
          setStripeLoadError("Stripe.js could not be initialized. Please refresh and try again.")
        }
      })
      .catch(() => {
        if (!isActive) return
        setStripeLoadError("Stripe.js could not be loaded. Please retry. If this persists, allowlist js.stripe.com on your network.")
      })

    return () => {
      isActive = false
    }
  }, [])

  if (!publishableKey || !stripePromise) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 font-body text-sm">
        Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.
      </div>
    )
  }

  if (!hasValidClientSecret) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 font-body text-sm">
        Checkout session is invalid or expired. Please return to payments and start again.
      </div>
    )
  }

  if (!hasValidReturnUrl) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 font-body text-sm">
        Return URL is missing. Please contact support.
      </div>
    )
  }

  if (stripeLoadError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 font-body text-sm">
        {stripeLoadError}
      </div>
    )
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#e86728",
            colorBackground: "#ffffff",
            colorText: "#0f172a",
            colorDanger: "#ef4444",
            borderRadius: "12px",
          },
        },
      }}
    >
      <CheckoutForm returnUrl={returnUrl} isSubscription={isSubscription} />
    </Elements>
  )
}
