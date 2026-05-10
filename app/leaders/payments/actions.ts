"use server"

import type Stripe from "stripe"

import { auth } from "@/auth"
import { getStripeClient } from "@/lib/stripe"
import { siteUrl } from "@/lib/siteConfig"
import {
  annualSubscriptionPricingQuery,
  leaderProfileByEmailQuery,
  paymentRecordByPaymentIntentIdQuery,
} from "@/sanity/lib/queries"
import { serverClient } from "@/sanity/lib/serverClient"
import { serverWriteClient } from "@/sanity/lib/serverWriteClient"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

type SectionKey = "beavers" | "cubs" | "scouts" | "ventures"

type SectionPricing = {
  unitPrice?: number
  stripePriceId?: string
}

type AnnualSubscriptionPricing = {
  currency?: string
  paymentType?: string
  beavers?: SectionPricing
  cubs?: SectionPricing
  scouts?: SectionPricing
  ventures?: SectionPricing
}

const SECTION_KEYS: SectionKey[] = ["beavers", "cubs", "scouts", "ventures"]

function normalizeStripeError(error: unknown): {
  message: string
  type?: string
  code?: string
  declineCode?: string
  requestId?: string
  docUrl?: string
  statusCode?: number
} {
  if (!error || typeof error !== "object") {
    return { message: "Unknown Stripe error" }
  }

  const e = error as {
    message?: string
    type?: string
    code?: string
    decline_code?: string
    requestId?: string
    doc_url?: string
    statusCode?: number
  }

  return {
    message: e.message ?? "Unknown Stripe error",
    type: e.type,
    code: e.code,
    declineCode: e.decline_code,
    requestId: e.requestId,
    docUrl: e.doc_url,
    statusCode: e.statusCode,
  }
}

function toStripeMetadataEntries(metadata: Record<string, string | null | undefined>) {
  return Object.entries(metadata)
    .filter(([, value]) => typeof value === "string" && value.length > 0)
    .map(([key, value]) => ({ key, value: value ?? "" }))
}

function parseQuantity(value: FormDataEntryValue | null): number {
  if (typeof value !== "string") return 0
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed < 0) return 0
  return Math.min(parsed, 999)
}

function formatAmount(value: number): string {
  return value.toFixed(2)
}

function toMinorUnits(amount: number): number {
  return Math.round(amount * 100)
}

function buildSelectionSummary(
  pricing: AnnualSubscriptionPricing,
  quantities: Record<SectionKey, number>
) {
  const selections = SECTION_KEYS.flatMap((section) => {
    const quantity = quantities[section]
    if (quantity <= 0) return []

    const sectionPricing = pricing[section]
    const unitPrice = Number(sectionPricing?.unitPrice ?? 0)
    const stripePriceId = sectionPricing?.stripePriceId

    if (!stripePriceId || unitPrice <= 0) {
      throw new Error(`Missing Stripe pricing config for ${section}`)
    }

    return [
      {
        section,
        quantity,
        unitPrice,
        stripePriceId,
        subtotal: unitPrice * quantity,
      },
    ]
  })

  const total = selections.reduce((sum, item) => sum + item.subtotal, 0)
  return { selections, total }
}

async function getLeaderContext(email: string, fallbackName?: string | null, fallbackRoles?: string[]) {
  const profile = await serverClient
    .fetch(leaderProfileByEmailQuery, { email })
    .catch(() => null)

  return {
    name: profile?.name ?? fallbackName ?? "Leader",
    email,
    roles: (profile?.roles as string[]) ?? fallbackRoles ?? [],
  }
}

async function upsertTransactionFromPaymentIntent(params: {
  paymentIntent: Stripe.PaymentIntent
  leader: { name: string; email: string; roles: string[] }
  amount: number
  currency: string
  paymentType: string
  status: "pending" | "completed" | "cancelled" | "failed"
}) {
  const { paymentIntent, leader, amount, currency, paymentType, status } = params

  const existing = await serverClient
    .fetch(paymentRecordByPaymentIntentIdQuery, { paymentIntentId: paymentIntent.id })
    .catch(() => null)

  const document = {
    title: `Annual subscriptions - ${leader.name}`,
    status,
    planSlug: "annual-subscriptions",
    paymentType,
    section: "multiple",
    checkoutMode: "payment",
    leaderName: leader.name,
    leaderEmail: leader.email,
    leaderRoles: leader.roles,
    stripeCheckoutSessionId: undefined,
    stripePaymentIntentId: paymentIntent.id,
    stripeSubscriptionId: undefined,
    stripeCustomerId:
      typeof paymentIntent.customer === "string"
        ? paymentIntent.customer
        : paymentIntent.customer?.id,
    stripePaymentStatus: paymentIntent.status,
    amount,
    currency,
    createdAt: new Date(paymentIntent.created * 1000).toISOString(),
    completedAt: status === "completed" ? new Date().toISOString() : undefined,
    cancelledAt: status === "cancelled" ? new Date().toISOString() : undefined,
    stripeMetadata: toStripeMetadataEntries({
      paymentType,
      paymentIntentStatus: paymentIntent.status,
      customerEmail: paymentIntent.receipt_email,
      ...paymentIntent.metadata,
    }),
  }

  if (existing?._id) {
    await serverWriteClient.patch(existing._id).set(document).commit()
    return existing._id as string
  }

  const created = await serverWriteClient.create({
    _type: "paymentTransaction",
    _id: `paymentTransaction-${paymentIntent.id}`,
    ...document,
  })

  return created._id as string
}

export async function startAnnualSubscriptionsCheckoutAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.email || !session.user.isAuthorizedLeader) {
    redirect("/leaders/login")
  }

  const pricing = await serverClient.fetch(annualSubscriptionPricingQuery).catch(() => null)
  if (!pricing) {
    throw new Error("Annual subscription pricing is not configured in Sanity")
  }

  const quantities: Record<SectionKey, number> = {
    beavers: parseQuantity(formData.get("beaversQty")),
    cubs: parseQuantity(formData.get("cubsQty")),
    scouts: parseQuantity(formData.get("scoutsQty")),
    ventures: parseQuantity(formData.get("venturesQty")),
  }

  const summary = buildSelectionSummary(pricing, quantities)
  if (summary.selections.length === 0) {
    throw new Error("Please select at least one subscription")
  }

  const leader = await getLeaderContext(
    session.user.email,
    session.user.leaderName ?? session.user.name,
    session.user.leaderRoles
  )

  const currency = String(pricing.currency ?? "eur").toLowerCase()
  const paymentType = String(pricing.paymentType ?? "annual-membership")

  const stripe = getStripeClient()
  const paymentIntent = await stripe.paymentIntents
    .create({
      amount: toMinorUnits(summary.total),
      currency,
      automatic_payment_methods: { enabled: true },
      receipt_email: leader.email,
      metadata: {
        paymentType,
        currency,
        totalDue: formatAmount(summary.total),
        beaversQty: String(quantities.beavers),
        cubsQty: String(quantities.cubs),
        scoutsQty: String(quantities.scouts),
        venturesQty: String(quantities.ventures),
        leaderName: leader.name,
        leaderEmail: leader.email,
      },
    })
    .catch((error: unknown) => {
      const details = normalizeStripeError(error)
      console.error("[payments] PaymentIntent creation failed", {
        leaderEmail: leader.email,
        stripeError: details,
        quantities,
      })

      const requestSuffix = details.requestId ? ` Request ID: ${details.requestId}` : ""
      throw new Error(`Stripe payment intent could not be created.${requestSuffix}`)
    })

  await upsertTransactionFromPaymentIntent({
    paymentIntent,
    leader,
    amount: summary.total,
    currency,
    paymentType,
    status: "pending",
  })

  const cookieStore = await cookies()
  cookieStore.set("leaders_payment_intent", paymentIntent.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: siteUrl.startsWith("https://"),
    path: "/leaders/payments",
    maxAge: 60 * 60 * 24,
  })

  redirect(`/leaders/payments/checkout?payment_intent=${paymentIntent.id}`)
}

export async function getPaymentIntentClientSecret(paymentIntentId: string) {
  const session = await auth()
  if (!session?.user?.email || !session.user.isAuthorizedLeader) {
    throw new Error("Unauthorized")
  }

  const stripe = getStripeClient()
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

  const ownerEmail = paymentIntent.metadata?.leaderEmail
  if (ownerEmail && ownerEmail !== session.user.email) {
    throw new Error("Payment intent does not belong to this leader")
  }

  if (!paymentIntent.client_secret) {
    throw new Error("Missing payment intent client secret")
  }

  return paymentIntent.client_secret
}

export async function markPaymentCancelledAction(paymentIntentId?: string) {
  const session = await auth()
  if (!session?.user?.email || !session.user.isAuthorizedLeader) {
    redirect("/leaders/login")
  }

  const cookieStore = await cookies()
  const intentId = paymentIntentId ?? cookieStore.get("leaders_payment_intent")?.value
  if (!intentId) {
    return
  }

  const stripe = getStripeClient()
  const currentIntent = await stripe.paymentIntents.retrieve(intentId)

  const cancellableStatuses = new Set([
    "requires_payment_method",
    "requires_confirmation",
    "requires_action",
    "requires_capture",
    "processing",
  ])

  const paymentIntent = cancellableStatuses.has(currentIntent.status)
    ? await stripe.paymentIntents.cancel(intentId).catch(() => currentIntent)
    : currentIntent

  const amount = Number(paymentIntent.metadata?.totalDue ?? paymentIntent.amount / 100)
  const currency = String(paymentIntent.metadata?.currency ?? paymentIntent.currency ?? "eur")
  const paymentType = String(paymentIntent.metadata?.paymentType ?? "annual-membership")

  const leader = await getLeaderContext(
    session.user.email,
    session.user.leaderName ?? session.user.name,
    session.user.leaderRoles
  )

  await upsertTransactionFromPaymentIntent({
    paymentIntent,
    leader,
    amount,
    currency,
    paymentType,
    status: "cancelled",
  })
}

export async function markPaymentCompletedAction(paymentIntentId?: string) {
  const session = await auth()
  if (!session?.user?.email || !session.user.isAuthorizedLeader) {
    redirect("/leaders/login")
  }

  const cookieStore = await cookies()
  const intentId = paymentIntentId ?? cookieStore.get("leaders_payment_intent")?.value
  if (!intentId) {
    return
  }

  const stripe = getStripeClient()
  const paymentIntent = await stripe.paymentIntents.retrieve(intentId)

  const amount = Number(paymentIntent.metadata?.totalDue ?? paymentIntent.amount / 100)
  const currency = String(paymentIntent.metadata?.currency ?? paymentIntent.currency ?? "eur")
  const paymentType = String(paymentIntent.metadata?.paymentType ?? "annual-membership")

  const leader = await getLeaderContext(
    session.user.email,
    session.user.leaderName ?? session.user.name,
    session.user.leaderRoles
  )

  await upsertTransactionFromPaymentIntent({
    paymentIntent,
    leader,
    amount,
    currency,
    paymentType,
    status: paymentIntent.status === "succeeded" ? "completed" : "failed",
  })
}
