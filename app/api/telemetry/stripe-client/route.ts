import { NextResponse } from "next/server"

type StripeClientTelemetryBody = {
  eventName?: string
  checkoutScope?: string
  status?: string
  latencyMs?: number
  reason?: string
  path?: string
}

function sanitizeText(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  return trimmed.slice(0, maxLength)
}

export async function POST(request: Request) {
  let body: StripeClientTelemetryBody

  try {
    body = (await request.json()) as StripeClientTelemetryBody
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const eventName = sanitizeText(body.eventName, 64)
  const checkoutScope = sanitizeText(body.checkoutScope, 32)
  const status = sanitizeText(body.status, 32)
  const reason = sanitizeText(body.reason, 200)
  const path = sanitizeText(body.path, 200)
  const latencyMs = Number.isFinite(body.latencyMs) ? Math.max(0, Math.round(Number(body.latencyMs))) : undefined

  if (eventName !== "stripe_js_init") {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  console.info("[telemetry] stripe-client", {
    eventName,
    checkoutScope,
    status,
    latencyMs,
    reason,
    path,
    nodeEnv: process.env.NODE_ENV ?? null,
    vercelEnv: process.env.VERCEL_ENV ?? null,
  })

  return NextResponse.json({ ok: true }, { status: 202 })
}
