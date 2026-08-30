import { loadStripe, type Stripe } from "@stripe/stripe-js"

declare global {
  // Keep a stable promise across HMR and page transitions.
  var __scoutStripeClientPromise: Promise<Stripe | null> | undefined
  var __scoutStripeClientLastError: string | undefined
}

export function getClientStripePromise(publishableKey: string | undefined): Promise<Stripe | null> | null {
  if (!publishableKey) return null

  if (!globalThis.__scoutStripeClientPromise) {
    // Convert hard loader failures to a handled null result so UI can render a
    // friendly error instead of surfacing unhandled promise rejections.
    globalThis.__scoutStripeClientPromise = loadStripe(publishableKey)
      .then((stripe) => {
        globalThis.__scoutStripeClientLastError = undefined
        return stripe
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : String(error)

        console.error("[stripe-client] Failed to initialize Stripe.js", {
          message,
        })

        globalThis.__scoutStripeClientLastError = message
        // Clear the cached promise so a future navigation/refresh can retry.
        globalThis.__scoutStripeClientPromise = undefined
        return null
      })
  }

  return globalThis.__scoutStripeClientPromise
}

export function getStripeClientLastError(): string | null {
  return globalThis.__scoutStripeClientLastError ?? null
}
