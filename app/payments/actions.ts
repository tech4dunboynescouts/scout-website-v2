"use server"

import type Stripe from "stripe"

import { getStripeClient } from "@/lib/stripe"
import { siteUrl } from "@/lib/siteConfig"
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

  const paymentTypeLabel =
    paymentType === "annual-membership" ? "Annual Subscriptions" : "Camp Payment"

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

  let total = selections.reduce((sum, item) => sum + item.subtotal, 0)

  if (pricing.maximumSubscriptionFee && total > pricing.maximumSubscriptionFee) {
    total = pricing.maximumSubscriptionFee
  }

  return { selections, total }
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

// ── Annual Subscriptions ──────────────────────────────────────────────────────

export async function startPublicAnnualSubscriptionsCheckoutAction(formData: FormData) {
  const pricing = await serverClient.fetch(annualSubscriptionPricingQuery).catch(() => null)
  if (!pricing) throw new Error("Annual subscription pricing is not configured")

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

  const stripe = getStripeClient()
  const paymentIntent = await stripe.paymentIntents
    .create({
      amount: toMinorUnits(summary.total),
      currency,
      payment_method_types: ["card", "revolut_pay"],
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
    secure: siteUrl.startsWith("https://"),
    path: "/payments",
    maxAge: 60 * 60 * 24,
  })

  redirect(`/payments/checkout?payment_intent=${paymentIntent.id}`)
}

// ── Camp Payments ─────────────────────────────────────────────────────────────

export async function startPublicCampPaymentsCheckoutAction(formData: FormData) {
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
      payment_method_types: ["card", "revolut_pay"],
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
    secure: siteUrl.startsWith("https://"),
    path: "/payments",
    maxAge: 60 * 60 * 24,
  })

  redirect(`/payments/checkout?payment_intent=${paymentIntent.id}`)
}

// ── Checkout helpers ──────────────────────────────────────────────────────────

export async function getPublicPaymentIntentClientSecret(paymentIntentId: string) {
  const cookieStore = await cookies()
  const cookieValue = cookieStore.get("public_payment_intent")?.value

  if (!cookieValue || cookieValue !== paymentIntentId) {
    throw new Error("Payment session not found")
  }

  const stripe = getStripeClient()
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

  if (!paymentIntent.client_secret) {
    throw new Error("Missing payment intent client secret")
  }

  return paymentIntent.client_secret
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
