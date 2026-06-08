"use server"

import type Stripe from "stripe"

import { getStripeClient } from "@/lib/stripe"
import { buildStripeReturnUrl, getStripeSiteUrl } from "@/lib/stripeSiteUrl"
import nodemailer from "nodemailer"
import {
  annualSubscriptionPricingQuery,
  summerCampPaymentOptionsQuery,
} from "@/sanity/lib/queries"
import { serverClient } from "@/sanity/lib/serverClient"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// ── Types ──────────────────────────────────────────────────────────────────────

type SectionKey = "beavers" | "cubs" | "scouts" | "ventures"

type SectionPricing = {
  unitPrice?: number
  stripePriceId?: string
  subscriptionStripePriceId?: string
}

type AnnualSubscriptionPricing = {
  currency?: string
  paymentType?: string
  beavers?: SectionPricing
  cubs?: SectionPricing
  scouts?: SectionPricing
  ventures?: SectionPricing
  maximumSubscriptionFee?: number
}

type ScoutsSummerCampPricing = {
  _id?: string
  title?: string
  section?: string
  currency?: string
  paymentType?: string
  stripePriceId?: string
  active?: boolean
  amountOptions?: number[]
}

const SECTION_KEYS: SectionKey[] = ["beavers", "cubs", "scouts", "ventures"]
const INSTALLMENT_MONTHS = 4

type CheckoutCommitmentSummary =
  | {
      mode: "full"
      amount: number
      currency: string
    }
  | {
      mode: "installments"
      amount: number
      currency: string
      installmentCount: number
    }

// ── Utilities ─────────────────────────────────────────────────────────────────

function sanitiseEmail(val: unknown): string {
  const s = typeof val === "string" ? val.trim().slice(0, 254) : ""
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ? s.toLowerCase() : ""
}

function escapeHtml(val: string): string {
  return val
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function getMailTransporter() {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT ?? "587")
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const secure = process.env.SMTP_SECURE === "true"

  const missingVars = [
    ["SMTP_HOST", host],
    ["SMTP_USER", user],
    ["SMTP_PASS", pass],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name)

  if (missingVars.length > 0) {
    console.warn(
      `Payment confirmation email not sent: missing SMTP variable(s): ${missingVars.join(", ")}`
    )
    return null
  }

  return nodemailer.createTransport({ host, port, secure, auth: { user, pass } })
}

async function sendPaymentConfirmationEmail(params: {
  payeeEmail: string
  payeeName: string
  childNames: string
  paymentType: string
  amount: number
  currency: string
  paymentIntentId: string
  timestamp: string
}) {
  const transporter = getMailTransporter()
  if (!transporter) return

  const { payeeEmail, payeeName, childNames, paymentType, amount, currency, paymentIntentId, timestamp } = params

  const email = sanitiseEmail(payeeEmail)
  if (!email) return

  const from = process.env.SMTP_FROM_EMAIL || "payments@dunboynescouts.ie"
  const subject = "Payment Confirmation - 1st Meath Dunboyne Scout Group"

  const formattedAmount = new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount)

  const formattedDate = new Intl.DateTimeFormat("en-IE", {
    timeZone: "Europe/Dublin",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp))

  const paymentTypeLabel = getPaymentTypeLabel(paymentType)

  const text = [
    "Your payment has been successfully processed.",
    "",
    `Payment Type: ${paymentTypeLabel}`,
    `Child/Children: ${childNames}`,
    `Amount: ${formattedAmount}`,
    `Transaction ID: ${paymentIntentId}`,
    `Date: ${formattedDate}`,
    "",
    "Thank you for your payment to 1st Meath Dunboyne Scout Group.",
  ].join("\n")

  const html = `
    <div style="margin:0;padding:24px;background:#ffffff;font-family:Arial,Helvetica,sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:760px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e2e8f0;">
        <tr>
          <td style="background:#0f172a;padding:16px 20px;">
            <p style="margin:0;color:#ffffff;font-size:18px;font-weight:700;">Payment Confirmation</p>
            <p style="margin:6px 0 0;color:#cbd5e1;font-size:13px;">1st Meath Dunboyne Scout Group</p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 20px;">
            <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.6;">Dear ${escapeHtml(payeeName)},</p>
            <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.6;">Thank you for your payment. We have successfully processed your transaction for ${escapeHtml(paymentTypeLabel)}.</p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid #e2e8f0;margin:20px 0;">
              <tr>
                <th align="left" style="padding:10px 12px;border:1px solid #e2e8f0;background:#e2e8f0;font-size:12px;color:#111827;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;">Detail</th>
                <th align="left" style="padding:10px 12px;border:1px solid #e2e8f0;background:#e2e8f0;font-size:12px;color:#111827;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;">Information</th>
              </tr>
              <tr style="background:#ffffff;">
                <td style="padding:10px 12px;border:1px solid #e2e8f0;font-size:13px;color:#111827;font-weight:600;">Payment Type</td>
                <td style="padding:10px 12px;border:1px solid #e2e8f0;font-size:13px;color:#111827;">${escapeHtml(paymentTypeLabel)}</td>
              </tr>
              <tr style="background:#f8fafc;">
                <td style="padding:10px 12px;border:1px solid #e2e8f0;font-size:13px;color:#111827;font-weight:600;">Child/Children</td>
                <td style="padding:10px 12px;border:1px solid #e2e8f0;font-size:13px;color:#111827;">${escapeHtml(childNames)}</td>
              </tr>
              <tr style="background:#ffffff;">
                <td style="padding:10px 12px;border:1px solid #e2e8f0;font-size:13px;color:#111827;font-weight:600;">Amount Paid</td>
                <td style="padding:10px 12px;border:1px solid #e2e8f0;font-size:13px;color:#059669;font-weight:600;">${escapeHtml(formattedAmount)}</td>
              </tr>
              <tr style="background:#f8fafc;">
                <td style="padding:10px 12px;border:1px solid #e2e8f0;font-size:13px;color:#111827;font-weight:600;">Transaction ID</td>
                <td style="padding:10px 12px;border:1px solid #e2e8f0;font-size:13px;color:#111827;font-family:monospace;">${escapeHtml(paymentIntentId)}</td>
              </tr>
              <tr style="background:#ffffff;">
                <td style="padding:10px 12px;border:1px solid #e2e8f0;font-size:13px;color:#111827;font-weight:600;">Date</td>
                <td style="padding:10px 12px;border:1px solid #e2e8f0;font-size:13px;color:#111827;">${escapeHtml(formattedDate)}</td>
              </tr>
            </table>
            <p style="margin:16px 0;font-size:14px;color:#334155;line-height:1.6;">If you have any questions about this payment, please contact us at secretarydunboynescouts@gmail.com.</p>
            <p style="margin:16px 0 0;font-size:12px;color:#64748b;line-height:1.5;">Thank you for supporting 1st Meath Dunboyne Scout Group!</p>
          </td>
        </tr>
        <tr>
          <td style="background:#f8fafc;padding:12px 20px;border-top:1px solid #e2e8f0;">
            <p style="margin:0;font-size:11px;color:#64748b;">1st Meath Dunboyne Scout Group | secretarydunboynescouts@gmail.com</p>
          </td>
        </tr>
      </table>
    </div>
  `

  try {
    await transporter.sendMail({ from, to: email, subject, text, html })
    console.info("Public payment confirmation email sent", { to: email, paymentIntentId })
  } catch (error) {
    console.error("Public payment confirmation email failed", { error, to: email, paymentIntentId })
  }
}

function getPaymentTypeLabel(paymentType: string): string {
  switch (paymentType) {
    case "annual-membership":
      return "Annual Subscriptions"
    case "annual-membership-installments":
      return "Annual Subscriptions - Monthly Instalments"
    default:
      return "Camp Payment"
  }
}

function normalizeStripeError(error: unknown): { message: string; requestId?: string } {
  if (!error || typeof error !== "object") return { message: "Unknown Stripe error" }
  const e = error as { message?: string; requestId?: string }
  return { message: e.message ?? "Unknown Stripe error", requestId: e.requestId }
}

function parseQuantity(value: FormDataEntryValue | null): number {
  if (typeof value !== "string") return 0
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed < 0) return 0
  return Math.min(parsed, 999)
}

function parseRequiredText(value: FormDataEntryValue | null, fieldName: string): string {
  if (typeof value !== "string") throw new Error(`${fieldName} is required`)
  const trimmed = value.trim()
  if (!trimmed) throw new Error(`${fieldName} is required`)
  return trimmed
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

    return [{ section, quantity, unitPrice, stripePriceId, subtotal: unitPrice * quantity }]
  })

  const subtotal = selections.reduce((sum, item) => sum + item.subtotal, 0)
  const maxFee = Number(pricing.maximumSubscriptionFee ?? 0)
  const hasMaxFee = Number.isFinite(maxFee) && maxFee > 0
  const isCapped = hasMaxFee && subtotal > maxFee
  const total = isCapped ? maxFee : subtotal

  return { selections, subtotal, total, isCapped }
}

function normalizeAmountOptions(values: number[] | undefined): number[] {
  if (!values || !Array.isArray(values)) return []
  const unique = Array.from(
    new Set(
      values
        .map((v) => Number(v))
        .filter((v) => Number.isFinite(v) && v > 0)
        .map((v) => Math.round(v * 100) / 100)
    )
  )
  unique.sort((a, b) => a - b)
  return unique
}

async function getOrCreateStripeCustomer(params: {
  email: string
  name: string
  paymentType: string
}) {
  const stripe = getStripeClient()
  const existingCustomers = await stripe.customers
    .list({ email: params.email, limit: 1 })
    .catch(() => null)

  const existingCustomer = existingCustomers?.data.find(
    (customer) => !("deleted" in customer && customer.deleted)
  )

  if (existingCustomer && !("deleted" in existingCustomer && existingCustomer.deleted)) {
    await stripe.customers
      .update(existingCustomer.id, {
        email: params.email,
        name: params.name,
        metadata: {
          ...existingCustomer.metadata,
          paymentType: params.paymentType,
          source: "public",
        },
      })
      .catch(() => null)

    return existingCustomer.id
  }

  const customer = await stripe.customers.create({
    email: params.email,
    name: params.name,
    metadata: {
      paymentType: params.paymentType,
      source: "public",
    },
  })

  return customer.id
}

async function calculateSubscriptionAmount(
  lineItems: Array<{ price: string; quantity: number }>,
  fallbackCurrency: string
) {
  const stripe = getStripeClient()

  const lineTotals = await Promise.all(
    lineItems.map(async (item) => {
      const price = await stripe.prices.retrieve(item.price)
      const unitAmount = price.unit_amount

      if (typeof unitAmount !== "number") {
        throw new Error("Subscription price must use a fixed unit amount")
      }

      return {
        total: unitAmount * Math.max(1, item.quantity || 1),
        currency: price.currency ?? fallbackCurrency,
      }
    })
  )

  return {
    amount: lineTotals.reduce((sum, item) => sum + item.total, 0) / 100,
    currency: lineTotals[0]?.currency ?? fallbackCurrency,
  }
}

async function loadPublicPaymentIntent(paymentIntentId: string) {
  const cookieStore = await cookies()
  const cookieValue = cookieStore.get("public_payment_intent")?.value

  if (!cookieValue || cookieValue !== paymentIntentId) {
    throw new Error("Payment session not found")
  }

  const stripe = getStripeClient()
  return stripe.paymentIntents.retrieve(paymentIntentId)
}

async function loadPublicSetupIntent(setupIntentId: string) {
  const cookieStore = await cookies()
  const cookieValue = cookieStore.get("public_subscription_setup")?.value

  if (!cookieValue || cookieValue !== setupIntentId) {
    throw new Error("Subscription setup session not found")
  }

  const stripe = getStripeClient()
  return stripe.setupIntents.retrieve(setupIntentId)
}

// ── Annual Subscriptions ──────────────────────────────────────────────────────

export async function startPublicAnnualSubscriptionsCheckoutAction(formData: FormData) {
  const stripeSiteUrl = getStripeSiteUrl()
  const secureCookies = stripeSiteUrl.startsWith("https://")

  const pricing = await serverClient.fetch(annualSubscriptionPricingQuery).catch(() => null)
  if (!pricing) throw new Error("Annual subscription pricing is not configured")

  const paymentMethod = String(formData.get("paymentMethod") ?? "full")

  const quantities: Record<SectionKey, number> = {
    beavers: parseQuantity(formData.get("beaversQty")),
    cubs: parseQuantity(formData.get("cubsQty")),
    scouts: parseQuantity(formData.get("scoutsQty")),
    ventures: parseQuantity(formData.get("venturesQty")),
  }

  const payeeName = parseRequiredText(formData.get("payeeName"), "Payee Name")
  const payeeReference = parseRequiredText(formData.get("payeeReference"), "Child's Name or Names")
  const payeeEmail = sanitiseEmail(parseRequiredText(formData.get("payeeEmail"), "Payee Email"))
  if (!payeeEmail) throw new Error("Please provide a valid email address")

  const summary = buildSelectionSummary(pricing, quantities)
  if (summary.selections.length === 0) throw new Error("Please select at least one subscription")

  const currency = String(pricing.currency ?? "eur").toLowerCase()
  const paymentType = String(pricing.paymentType ?? "annual-membership")
  const annualStripePriceIds = summary.selections.map((item) => item.stripePriceId).join(",")

  if (paymentMethod === "installments") {
    // ── Subscription flow (4 monthly installments) ──────────────────────────────────
    const stripe = getStripeClient()
    let subscriptionLineItems: Array<{ price: string; quantity: number }>

    if (summary.isCapped) {
      const cappedTotalMinorUnits = toMinorUnits(summary.total)
      const installmentAmountMinorUnits = Math.floor(cappedTotalMinorUnits / INSTALLMENT_MONTHS)

      if (installmentAmountMinorUnits <= 0) {
        throw new Error("Installment amount is too low to process")
      }

      const cappedInstallmentPrice = await stripe.prices
        .create({
          currency,
          unit_amount: installmentAmountMinorUnits,
          recurring: { interval: "month" },
          product_data: {
            name: "Annual subscriptions installment",
            metadata: {
              paymentType: "annual-membership-installments",
              source: "public",
            },
          },
          metadata: {
            paymentType: "annual-membership-installments",
            source: "public",
            cappedByMaximumFee: "true",
            cappedTotalDue: formatAmount(summary.total),
          },
        })
        .catch((error: unknown) => {
          const details = normalizeStripeError(error)
          const suffix = details.requestId ? ` Request ID: ${details.requestId}` : ""
          throw new Error(`Could not create capped installment pricing.${suffix}`)
        })

      subscriptionLineItems = [
        {
          price: cappedInstallmentPrice.id,
          quantity: 1,
        },
      ]
    } else {
      subscriptionLineItems = summary.selections.flatMap((item) => {
        const sectionPricing = pricing[item.section as SectionKey]
        const subscriptionPriceId = sectionPricing?.subscriptionStripePriceId

        if (!subscriptionPriceId) {
          throw new Error(
            `Subscription pricing not configured for ${item.section}. Please contact support.`
          )
        }

        return [
          {
            price: subscriptionPriceId,
            quantity: item.quantity,
          },
        ]
      })
    }

    const customerId = await getOrCreateStripeCustomer({
      email: payeeEmail,
      name: payeeName,
      paymentType: "annual-membership-installments",
    })

    const installmentStripePriceIds = subscriptionLineItems
      .map((item) => item.price)
      .join(",")
    
    // For subscriptions, we'll create a setup intent to collect payment method,
    // then create the subscription. Store setup intent ID in session for checkout flow.
    const setupIntent = await stripe.setupIntents
      .create({
        customer: customerId,
        payment_method_types: ["card"],
        usage: "off_session",
        metadata: {
          customerId,
          paymentType: "annual-membership-installments",
          currency,
          totalDue: formatAmount(summary.total),
          maximumSubscriptionFeeApplied: String(summary.isCapped),
          payeeName,
          payeeReference,
          payeeEmail,
          beaversQty: String(quantities.beavers),
          cubsQty: String(quantities.cubs),
          scoutsQty: String(quantities.scouts),
          venturesQty: String(quantities.ventures),
          source: "public",
          titlePrefix: "Annual subscriptions installments",
          summerCampOptionId: "n/a",
          stripePriceId: installmentStripePriceIds || annualStripePriceIds || "n/a",
          lineItemsJson: JSON.stringify(subscriptionLineItems),
        },
      })
      .catch((error: unknown) => {
        const details = normalizeStripeError(error)
        const suffix = details.requestId ? ` Request ID: ${details.requestId}` : ""
        throw new Error(`Could not prepare subscription setup.${suffix}`)
      })

    const cookieStore = await cookies()
    cookieStore.set("public_subscription_setup", setupIntent.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: secureCookies,
      path: "/",
      maxAge: 60 * 60 * 24,
    })

    console.info("[payments] Stripe checkout initialized", {
      flow: "public-annual-subscription",
      baseSiteUrl: stripeSiteUrl,
      return_url: buildStripeReturnUrl("/payments/complete"),
      cancel_url: buildStripeReturnUrl("/payments"),
      vercelEnv: process.env.VERCEL_ENV ?? null,
      nodeEnv: process.env.NODE_ENV ?? null,
    })

    redirect(`/payments/checkout?setup_intent=${setupIntent.id}`)
  } else {
    // ── One-time payment flow (Pay in full) ─────────────────────────────────────────
    const paymentIntent = await getStripeClient()
      .paymentIntents.create({
        amount: toMinorUnits(summary.total),
        currency,
        payment_method_types: ["card"],
        description: `Annual subscriptions - ${payeeName}`,
        receipt_email: payeeEmail,
        metadata: {
          paymentType,
          currency,
          totalDue: formatAmount(summary.total),
          beaversQty: String(quantities.beavers),
          cubsQty: String(quantities.cubs),
          scoutsQty: String(quantities.scouts),
          venturesQty: String(quantities.ventures),
          payeeName,
          payeeReference,
          payeeEmail,
          planSlug: "annual-subscriptions",
          section: "multiple",
          titlePrefix: "Annual subscriptions",
          summerCampOptionId: "n/a",
          stripePriceId: annualStripePriceIds || "n/a",
          source: "public",
        },
      })
      .catch((error: unknown) => {
        const details = normalizeStripeError(error)
        const suffix = details.requestId ? ` Request ID: ${details.requestId}` : ""
        throw new Error(`Payment could not be created.${suffix}`)
      })

    const cookieStore = await cookies()
    cookieStore.set("public_payment_intent", paymentIntent.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: secureCookies,
      path: "/",
      maxAge: 60 * 60 * 24,
    })

    console.info("[payments] Stripe checkout initialized", {
      flow: "public-annual-one-time",
      baseSiteUrl: stripeSiteUrl,
      return_url: buildStripeReturnUrl("/payments/success"),
      cancel_url: buildStripeReturnUrl("/payments"),
      vercelEnv: process.env.VERCEL_ENV ?? null,
      nodeEnv: process.env.NODE_ENV ?? null,
    })

    redirect(`/payments/checkout?payment_intent=${paymentIntent.id}`)
  }
}

// ── Camp Payments ─────────────────────────────────────────────────────────────

export async function startPublicCampPaymentsCheckoutAction(formData: FormData) {
  const stripeSiteUrl = getStripeSiteUrl()
  const secureCookies = stripeSiteUrl.startsWith("https://")

  const selectedOptionId = parseRequiredText(formData.get("summerCampOptionId"), "Camp payment option")

  const options = await serverClient
    .fetch<ScoutsSummerCampPricing[]>(summerCampPaymentOptionsQuery)
    .catch(() => [])

  const pricing = (Array.isArray(options) ? options : []).find(
    (option) => String(option._id ?? "") === selectedOptionId
  )

  if (!pricing) throw new Error("Selected payment option is no longer available")

  const optionTitle = String(pricing.title ?? "Camp Payment")
  const optionSection = String(pricing.section ?? "other")
  const stripePriceId = String(pricing.stripePriceId ?? "").trim()
  if (!stripePriceId) throw new Error("Selected option is missing Stripe configuration")

  const amountOptions = normalizeAmountOptions(pricing.amountOptions)
  if (amountOptions.length === 0) throw new Error("Selected option has no amount choices configured")

  const selectedAmount = Number(parseRequiredText(formData.get("summerCampAmount"), "Payment amount"))
  if (!Number.isFinite(selectedAmount) || !amountOptions.includes(selectedAmount)) {
    throw new Error("Please select a valid payment amount")
  }

  const payeeName = parseRequiredText(formData.get("payeeName"), "Payee Name")
  const payeeReference = parseRequiredText(formData.get("payeeReference"), "Child's Name or Names")
  const payeeEmail = sanitiseEmail(parseRequiredText(formData.get("payeeEmail"), "Payee Email"))
  if (!payeeEmail) throw new Error("Please provide a valid email address")

  const currency = String(pricing.currency ?? "eur").toLowerCase()
  const paymentType = String(pricing.paymentType ?? "camp-payment")

  const stripe = getStripeClient()
  const paymentIntent = await stripe.paymentIntents
    .create({
      amount: toMinorUnits(selectedAmount),
      currency,
      payment_method_types: ["card"],
      description: `${optionTitle} - ${payeeName}`,
      receipt_email: payeeEmail,
      metadata: {
        paymentType,
        currency,
        totalDue: formatAmount(selectedAmount),
        payeeName,
        payeeReference,
        payeeEmail,
        planSlug: "camp-payments",
        section: optionSection,
        titlePrefix: optionTitle,
        summerCampOptionId: selectedOptionId,
        stripePriceId,
        source: "public",
      },
    })
    .catch((error: unknown) => {
      const details = normalizeStripeError(error)
      const suffix = details.requestId ? ` Request ID: ${details.requestId}` : ""
      throw new Error(`Payment could not be created.${suffix}`)
    })

  const cookieStore = await cookies()
  cookieStore.set("public_payment_intent", paymentIntent.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookies,
    path: "/",
    maxAge: 60 * 60 * 24,
  })

  console.info("[payments] Stripe checkout initialized", {
    flow: "public-camp-one-time",
    baseSiteUrl: stripeSiteUrl,
    return_url: buildStripeReturnUrl("/payments/success"),
    cancel_url: buildStripeReturnUrl("/payments"),
    vercelEnv: process.env.VERCEL_ENV ?? null,
    nodeEnv: process.env.NODE_ENV ?? null,
  })

  redirect(`/payments/checkout?payment_intent=${paymentIntent.id}`)
}

// ── Checkout helpers ──────────────────────────────────────────────────────────

export async function getPublicPaymentIntentClientSecret(paymentIntentId: string) {
  const paymentIntent = await loadPublicPaymentIntent(paymentIntentId)

  if (!paymentIntent.client_secret) {
    throw new Error("Missing payment intent client secret")
  }

  return paymentIntent.client_secret
}
export async function getPublicSetupIntentClientSecret(setupIntentId: string) {
  const setupIntent = await loadPublicSetupIntent(setupIntentId)

  if (!setupIntent.client_secret) {
    throw new Error("Missing setup intent client secret")
  }

  return setupIntent.client_secret
}

export async function getPublicCheckoutCommitmentSummary(options: {
  paymentIntentId?: string
  setupIntentId?: string
}): Promise<CheckoutCommitmentSummary> {
  if (options.setupIntentId) {
    const setupIntent = await loadPublicSetupIntent(options.setupIntentId)
    const metadata = setupIntent.metadata as Record<string, string> | undefined

    if (!metadata) {
      throw new Error("Subscription metadata not found")
    }

    let lineItems: Array<{ price: string; quantity: number }>
    try {
      lineItems = JSON.parse(metadata.lineItemsJson || "[]")
    } catch {
      throw new Error("Invalid subscription configuration")
    }

    if (!Array.isArray(lineItems) || lineItems.length === 0) {
      throw new Error("No subscription line items were configured")
    }

    const { amount, currency } = await calculateSubscriptionAmount(
      lineItems,
      String(metadata.currency ?? "eur")
    )

    return {
      mode: "installments",
      amount,
      currency,
      installmentCount: INSTALLMENT_MONTHS,
    }
  }

  if (!options.paymentIntentId) {
    throw new Error("Payment session not found")
  }

  const paymentIntent = await loadPublicPaymentIntent(options.paymentIntentId)
  return {
    mode: "full",
    amount: (paymentIntent.amount ?? 0) / 100,
    currency: String(paymentIntent.currency ?? "eur"),
  }
}

export async function createPublicSubscriptionAction(setupIntentId: string) {
  const cookieStore = await cookies()
  const cookieValue = cookieStore.get("public_subscription_setup")?.value

  if (!cookieValue || cookieValue !== setupIntentId) {
    throw new Error("Subscription setup session not found")
  }

  const stripe = getStripeClient()

  const setupIntent = await stripe.setupIntents.retrieve(setupIntentId).catch(() => null)
  if (!setupIntent) {
    throw new Error("Subscription setup not found")
  }

  if (setupIntent.status !== "succeeded") {
    throw new Error("Payment method not confirmed")
  }

  const paymentMethod = setupIntent.payment_method

  if (!paymentMethod || typeof paymentMethod !== "string") {
    throw new Error("No payment method available")
  }

  const metadata = setupIntent.metadata as Record<string, string> | undefined
  if (!metadata) {
    throw new Error("Subscription metadata not found")
  }

  const existingSubscriptionId = metadata.createdSubscriptionId
  if (existingSubscriptionId) {
    const existingSubscription = await stripe.subscriptions
      .retrieve(existingSubscriptionId)
      .catch(() => null)

    if (existingSubscription) {
      return existingSubscription as Stripe.Subscription
    }
  }

  let lineItems: Array<{ price: string; quantity: number }>
  try {
    lineItems = JSON.parse(metadata.lineItemsJson || "[]")
  } catch {
    throw new Error("Invalid subscription configuration")
  }

  let customerId = typeof setupIntent.customer === "string" ? setupIntent.customer : metadata.customerId

  if (!customerId) {
    customerId = await getOrCreateStripeCustomer({
      email: sanitiseEmail(metadata.payeeEmail),
      name: metadata.payeeName ?? "Parent/Guardian",
      paymentType: metadata.paymentType ?? "annual-membership-installments",
    })
  }

  await stripe.paymentMethods.attach(paymentMethod, { customer: customerId }).catch((error: unknown) => {
    const details = normalizeStripeError(error)
    if (!details.message.toLowerCase().includes("already attached")) {
      throw error
    }
  })

  await stripe.customers.update(customerId, {
    email: sanitiseEmail(metadata.payeeEmail),
    name: metadata.payeeName,
    invoice_settings: {
      default_payment_method: paymentMethod,
    },
    metadata: {
      paymentType: metadata.paymentType,
      source: metadata.source,
    },
  })

  const schedule = await stripe.subscriptionSchedules
    .create({
      customer: customerId,
      start_date: "now",
      end_behavior: "cancel",
      default_settings: {
        automatic_tax: { enabled: true },
        collection_method: "charge_automatically",
        default_payment_method: paymentMethod,
        description: `Annual subscriptions installment plan - ${metadata.payeeName}`,
      },
      phases: [
        {
          automatic_tax: { enabled: true },
          collection_method: "charge_automatically",
          currency: metadata.currency,
          default_payment_method: paymentMethod,
          duration: {
            interval: "month",
            interval_count: INSTALLMENT_MONTHS,
          },
          items: lineItems,
          metadata: {
            paymentType: metadata.paymentType,
            currency: metadata.currency,
            payeeName: metadata.payeeName,
            payeeReference: metadata.payeeReference,
            payeeEmail: metadata.payeeEmail,
            beaversQty: metadata.beaversQty,
            cubsQty: metadata.cubsQty,
            scoutsQty: metadata.scoutsQty,
            venturesQty: metadata.venturesQty,
            source: metadata.source,
            titlePrefix: metadata.titlePrefix,
            summerCampOptionId: metadata.summerCampOptionId,
            stripePriceId: metadata.stripePriceId,
            installmentCount: String(INSTALLMENT_MONTHS),
          },
        },
      ],
      metadata: {
        paymentType: metadata.paymentType,
        currency: metadata.currency,
        payeeName: metadata.payeeName,
        payeeReference: metadata.payeeReference,
        payeeEmail: metadata.payeeEmail,
        source: metadata.source,
        titlePrefix: metadata.titlePrefix,
        summerCampOptionId: metadata.summerCampOptionId,
        stripePriceId: metadata.stripePriceId,
        installmentCount: String(INSTALLMENT_MONTHS),
        setupIntentId: setupIntent.id,
      },
    })
    .catch((error: unknown) => {
      const details = normalizeStripeError(error)
      const suffix = details.requestId ? ` Request ID: ${details.requestId}` : ""
      throw new Error(`Subscription could not be created.${suffix}`)
    })

  const subscriptionId =
    typeof schedule.subscription === "string" ? schedule.subscription : schedule.subscription?.id

  if (!subscriptionId) {
    throw new Error("Stripe did not return a subscription for the installment plan")
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId).catch((error: unknown) => {
    const details = normalizeStripeError(error)
    const suffix = details.requestId ? ` Request ID: ${details.requestId}` : ""
    throw new Error(`Subscription was created but could not be retrieved.${suffix}`)
  })

  // Send confirmation email for subscription
  const payeeEmail = sanitiseEmail(metadata.payeeEmail)
  if (payeeEmail && !metadata.paymentConfirmationEmailSentAt) {
    const { amount, currency } = await calculateSubscriptionAmount(
      lineItems,
      String(metadata.currency ?? subscription.currency ?? "eur")
    )

    await sendPaymentConfirmationEmail({
      payeeEmail,
      payeeName: metadata.payeeName,
      childNames: metadata.payeeReference,
      paymentType: "annual-membership-installments",
      amount,
      currency,
      paymentIntentId: String(subscription.id),
      timestamp: new Date().toISOString(),
    }).catch(() => null)
  }

  await stripe.setupIntents
    .update(setupIntent.id, {
      metadata: {
        ...metadata,
        createdSubscriptionId: subscription.id,
        createdSubscriptionScheduleId: schedule.id,
        customerId,
        paymentConfirmationEmailSentAt:
          metadata.paymentConfirmationEmailSentAt || new Date().toISOString(),
      },
    })
    .catch((error: unknown) => {
      const { message } = normalizeStripeError(error)
      console.error("[public-payments] Failed to persist subscription completion metadata", {
        setupIntentId: setupIntent.id,
        message,
      })
    })

  return subscription as Stripe.Subscription
}
export async function markPublicPaymentCancelledAction(paymentIntentId?: string) {
  const cookieStore = await cookies()
  const intentId = paymentIntentId ?? cookieStore.get("public_payment_intent")?.value
  if (!intentId) return

  const stripe = getStripeClient()
  const currentIntent = await stripe.paymentIntents.retrieve(intentId).catch(() => null)
  if (!currentIntent) return

  const cancellableStatuses = new Set([
    "requires_payment_method",
    "requires_confirmation",
    "requires_action",
    "requires_capture",
    "processing",
  ])

  if (cancellableStatuses.has(currentIntent.status)) {
    await stripe.paymentIntents.cancel(intentId).catch(() => null)
  }
}

export async function markPublicPaymentCompletedAction(paymentIntentId?: string) {
  const cookieStore = await cookies()
  const intentId = paymentIntentId ?? cookieStore.get("public_payment_intent")?.value
  if (!intentId) return

  const stripe = getStripeClient()
  const paymentIntent = await stripe.paymentIntents.retrieve(intentId).catch(() => null)
  if (!paymentIntent) return

  if (
    paymentIntent.status === "succeeded" &&
    !paymentIntent.metadata?.paymentConfirmationEmailSentAt
  ) {
    const payeeEmail = sanitiseEmail(paymentIntent.metadata?.payeeEmail)
    if (payeeEmail) {
      const amount = Number(paymentIntent.metadata?.totalDue ?? paymentIntent.amount / 100)
      const currency = String(paymentIntent.metadata?.currency ?? paymentIntent.currency ?? "eur")
      const paymentType = String(paymentIntent.metadata?.paymentType ?? "camp-payment")

      await sendPaymentConfirmationEmail({
        payeeEmail,
        payeeName: paymentIntent.metadata?.payeeName ?? "Parent/Guardian",
        childNames: paymentIntent.metadata?.payeeReference ?? "Not provided",
        paymentType,
        amount,
        currency,
        paymentIntentId: paymentIntent.id,
        timestamp: new Date().toISOString(),
      })

      await stripe.paymentIntents
        .update(paymentIntent.id, {
          metadata: {
            ...paymentIntent.metadata,
            paymentConfirmationEmailSentAt: new Date().toISOString(),
          },
        })
        .catch((error: unknown) => {
          const { message } = normalizeStripeError(error)
          console.error("[public-payments] Failed to set email confirmation metadata", {
            paymentIntentId: paymentIntent.id,
            message,
          })
        })
    }
  }
}

