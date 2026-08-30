import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

export function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    throw new Error('Missing environment variable: STRIPE_SECRET_KEY')
  }

  if (!stripeInstance) {
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2026-04-22.dahlia',
      typescript: true,
    })
  }

  return stripeInstance
}
