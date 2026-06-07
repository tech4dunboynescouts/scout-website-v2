import { loadStripe, type Stripe } from "@stripe/stripe-js"

declare global {
  // Keep a stable promise across HMR and page transitions.
  var __scoutStripeClientPromise: Promise<Stripe | null> | undefined
  var __scoutStripeClientLastError: string | undefined
}

function waitForScriptLoad(script: HTMLScriptElement, timeoutMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup()
      reject(new Error("Timed out loading Stripe.js v3 script"))
    }, timeoutMs)

    const onLoad = () => {
      cleanup()
      if ((window as any).Stripe) {
        resolve()
      } else {
        reject(new Error("Stripe global missing after script load"))
      }
    }

    const onError = () => {
      cleanup()
      reject(new Error("Failed to load Stripe.js v3 script"))
    }

    const cleanup = () => {
      window.clearTimeout(timeout)
      script.removeEventListener("load", onLoad)
      script.removeEventListener("error", onError)
    }

    script.addEventListener("load", onLoad)
    script.addEventListener("error", onError)

    if ((window as any).Stripe) {
      onLoad()
    }
  })
}

async function ensureStripeV3Script(timeoutMs = 20000): Promise<void> {
  if (typeof window === "undefined") return
  if ((window as any).Stripe) return

  let script = document.querySelector('script[src^="https://js.stripe.com/v3"]') as HTMLScriptElement | null

  if (!script) {
    script = document.createElement("script")
    script.src = `https://js.stripe.com/v3/?fallback=${Date.now()}`
    script.async = true
    script.crossOrigin = "anonymous"
    ;(document.head || document.body)?.appendChild(script)
  }

  await waitForScriptLoad(script, timeoutMs)
}

async function loadStripeWithFallback(publishableKey: string): Promise<Stripe | null> {
  try {
    return await loadStripe(publishableKey)
  } catch {
    await ensureStripeV3Script()
    return await loadStripe(publishableKey)
  }
}

export function getClientStripePromise(publishableKey: string | undefined): Promise<Stripe | null> | null {
  if (!publishableKey) return null

  if (!globalThis.__scoutStripeClientPromise) {
    // Convert hard loader failures to a handled null result so UI can render a
    // friendly error instead of surfacing unhandled promise rejections.
    globalThis.__scoutStripeClientPromise = loadStripeWithFallback(publishableKey)
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
