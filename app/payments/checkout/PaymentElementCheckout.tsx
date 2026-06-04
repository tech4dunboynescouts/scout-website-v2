"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"

function CheckoutForm({ returnUrl, isSubscription }: { returnUrl: string; isSubscription: boolean }) {
  const stripe = useStripe()
  const elements = useElements()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!stripe || !elements) return

    setIsSubmitting(true)
    setErrorMessage(null)

    if (isSubscription) {
      // For subscriptions, use confirmSetup
      const { error } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: returnUrl,
        },
      })

      if (error) {
        setErrorMessage(error.message ?? "Unable to set up payment method")
        setIsSubmitting(false)
      }
    } else {
      // For one-time payments, use confirmPayment
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
        },
      })

      if (error) {
        setErrorMessage(error.message ?? "Unable to complete payment")
        setIsSubmitting(false)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 font-body text-sm">
          {errorMessage}
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || !elements || isSubmitting}
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
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  const [stripeLoadError, setStripeLoadError] = useState<string | null>(null)

  const stripePromise = useMemo(() => {
    if (!publishableKey) return null
    return loadStripe(publishableKey).catch(() => {
      return null
    })
  }, [publishableKey])

  useEffect(() => {
    if (!stripePromise) {
      setStripeLoadError(null)
      return
    }

    let isActive = true
    stripePromise.then((stripe) => {
      if (!isActive) return
      setStripeLoadError(stripe ? null : "Stripe.js could not be loaded. Please refresh and try again.")
    })

    return () => {
      isActive = false
    }
  }, [stripePromise])

  if (!stripePromise) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 font-body text-sm">
        Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
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
