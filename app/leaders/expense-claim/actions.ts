"use server"

import { auth } from "@/auth"
import nodemailer from "nodemailer"

const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/jpg"]
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB per file
const MAX_TOTAL_ATTACHMENTS = 20

function escapeHtml(val: string): string {
  return val
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function sanitiseString(val: unknown, max = 500): string {
  if (typeof val !== "string") return ""
  return val.trim().slice(0, max)
}

function sanitiseEmail(val: unknown): string {
  const s = sanitiseString(val as string, 254)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ? s.toLowerCase() : ""
}

function sanitiseAmount(val: unknown): number | null {
  const n = Number(val)
  if (Number.isNaN(n) || n <= 0 || n > 100_000) return null
  // Round to 2 decimal places
  return Math.round(n * 100) / 100
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(amount)
}

function formatDateDisplay(dateStr: string): string {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  return new Intl.DateTimeFormat("en-IE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d)
}

function formatDateTimeIreland(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  const parts = new Intl.DateTimeFormat("en-IE", {
    timeZone: "Europe/Dublin",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date)
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? ""
  return `${get("day")}/${get("month")}/${get("year")} ${get("hour")}:${get("minute")}:${get("second")}`
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
      `Expense claim email not sent: missing SMTP environment variable(s): ${missingVars.join(", ")}`
    )
    return null
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  })
}

export interface ExpenseItem {
  date: string
  description: string
  amount: string
}

export interface SubmitExpenseClaimResult {
  success: boolean
  error?: string
}

export async function submitExpenseClaim(
  formData: FormData
): Promise<SubmitExpenseClaimResult> {
  // ── 1. Auth guard ─────────────────────────────────────────────────────────
  const session = await auth()
  if (!session?.user?.isAuthorizedLeader) {
    return { success: false, error: "Unauthorised" }
  }

  const applicantEmail = sanitiseEmail(session.user.email ?? "")
  const applicantName = sanitiseString(
    session.user.leaderName ?? session.user.name ?? "",
    200
  )

  if (!applicantEmail) {
    return { success: false, error: "Your account does not have a valid email address." }
  }

  // ── 2. Parse expense items ─────────────────────────────────────────────────
  const countRaw = formData.get("itemCount")
  const itemCount = Math.min(Number(countRaw ?? 0), MAX_TOTAL_ATTACHMENTS)

  if (!Number.isInteger(itemCount) || itemCount < 1) {
    return { success: false, error: "Please add at least one expense item." }
  }

  interface ValidatedItem {
    date: string
    description: string
    amount: number
    file: { name: string; content: Buffer; mimeType: string } | null
  }

  const items: ValidatedItem[] = []

  for (let i = 0; i < itemCount; i++) {
    const rawDate = sanitiseString(formData.get(`items[${i}][date]`), 20)
    const rawDesc = sanitiseString(formData.get(`items[${i}][description]`), 500)
    const rawAmount = formData.get(`items[${i}][amount]`)
    const rawReceipt = formData.get(`items[${i}][receipt]`)

    if (!rawDate || !rawDesc) {
      return {
        success: false,
        error: `Item ${i + 1}: date and description are required.`,
      }
    }

    // Validate date format (YYYY-MM-DD) and that it's not in the future
    const parsedDate = new Date(rawDate)
    if (Number.isNaN(parsedDate.getTime())) {
      return { success: false, error: `Item ${i + 1}: invalid date.` }
    }
    if (parsedDate > new Date()) {
      return { success: false, error: `Item ${i + 1}: date cannot be in the future.` }
    }

    const amount = sanitiseAmount(rawAmount)
    if (amount === null) {
      return {
        success: false,
        error: `Item ${i + 1}: amount must be a positive number.`,
      }
    }

    // ── Receipt file handling ──────────────────────────────────────────────
    let fileAttachment: { name: string; content: Buffer; mimeType: string } | null = null

    if (rawReceipt instanceof File && rawReceipt.size > 0) {
      if (!ALLOWED_MIME_TYPES.includes(rawReceipt.type)) {
        return {
          success: false,
          error: `Item ${i + 1}: only PDF or JPEG receipts are accepted.`,
        }
      }
      if (rawReceipt.size > MAX_FILE_SIZE_BYTES) {
        return {
          success: false,
          error: `Item ${i + 1}: receipt file exceeds the 10 MB limit.`,
        }
      }

      const arrayBuffer = await rawReceipt.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Validate file magic bytes
      const isValidFile =
        (rawReceipt.type === "application/pdf" &&
          buffer.slice(0, 4).toString("ascii") === "%PDF") ||
        (rawReceipt.type.startsWith("image/jpeg") &&
          buffer[0] === 0xff &&
          buffer[1] === 0xd8)

      if (!isValidFile) {
        return {
          success: false,
          error: `Item ${i + 1}: the uploaded file does not appear to be a valid PDF or JPEG.`,
        }
      }

      // Sanitise filename – strip path separators, limit length
      const safeName = rawReceipt.name
        .replace(/[/\\]/g, "")
        .replace(/[^a-zA-Z0-9._\- ]/g, "_")
        .slice(0, 120)

      fileAttachment = { name: safeName, content: buffer, mimeType: rawReceipt.type }
    }

    items.push({
      date: rawDate,
      description: rawDesc,
      amount,
      file: fileAttachment,
    })
  }

  if (items.length === 0) {
    return { success: false, error: "Please add at least one expense item." }
  }

  // ── 3. Build email content ─────────────────────────────────────────────────
  const submittedAt = new Date().toISOString()
  const submittedAtIreland = formatDateTimeIreland(submittedAt)
  const total = items.reduce((sum, item) => sum + item.amount, 0)

  const itemRowsHtml = items
    .map(
      (item, idx) =>
        `<tr style="background:${idx % 2 === 0 ? "#f8fafc" : "#ffffff"};">` +
        `<td style="padding:10px 12px;border:1px solid #e2e8f0;font-size:13px;color:#111827;text-align:center;">${idx + 1}</td>` +
        `<td style="padding:10px 12px;border:1px solid #e2e8f0;font-size:13px;color:#111827;">${escapeHtml(formatDateDisplay(item.date))}</td>` +
        `<td style="padding:10px 12px;border:1px solid #e2e8f0;font-size:13px;color:#111827;">${escapeHtml(item.description)}</td>` +
        `<td style="padding:10px 12px;border:1px solid #e2e8f0;font-size:13px;color:#111827;text-align:center;">${item.file ? `&#10003; ${escapeHtml(item.file.name)}` : "&#10007; None"}</td>` +
        `<td style="padding:10px 12px;border:1px solid #e2e8f0;font-size:13px;color:#111827;text-align:right;">${escapeHtml(formatCurrency(item.amount))}</td>` +
        `</tr>`
    )
    .join("")

  const itemRowsText = items
    .map(
      (item, idx) =>
        `${idx + 1}. ${formatDateDisplay(item.date)} | ${item.description} | Receipt: ${item.file ? item.file.name : "None"} | ${formatCurrency(item.amount)}`
    )
    .join("\n")

  const subject = `Expense Claim from ${applicantName || applicantEmail} – Submitted ${submittedAtIreland}`

  const headerBgColour = "#0f172a"

  function buildHtml(intro: string): string {
    return `
<div style="margin:0;padding:24px;background:#ffffff;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
    style="max-width:760px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e2e8f0;">
    <tr>
      <td style="background:${headerBgColour};padding:16px 20px;">
        <p style="margin:0;color:#ffffff;font-size:18px;font-weight:700;">Expense Claim</p>
        <p style="margin:6px 0 0;color:#cbd5e1;font-size:13px;">1st Meath Dunboyne Scout Group – Leaders Portal</p>
      </td>
    </tr>
    <tr>
      <td style="padding:18px 20px;">
        <p style="margin:0 0 12px;font-size:14px;color:#334155;">${intro}</p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
          style="border-collapse:collapse;border:1px solid #e2e8f0;margin-bottom:16px;">
          <tr>
            <th align="left" style="padding:10px 12px;border:1px solid #cbd5e1;background:#e2e8f0;font-size:12px;color:#111827;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;">Submitted</th>
            <td colspan="4" style="padding:10px 12px;border:1px solid #e2e8f0;font-size:13px;color:#111827;">${escapeHtml(submittedAtIreland)}</td>
          </tr>
          <tr>
            <th align="left" style="padding:10px 12px;border:1px solid #cbd5e1;background:#e2e8f0;font-size:12px;color:#111827;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;">Leader</th>
            <td colspan="4" style="padding:10px 12px;border:1px solid #e2e8f0;font-size:13px;color:#111827;">${escapeHtml(applicantName)} &lt;${escapeHtml(applicantEmail)}&gt;</td>
          </tr>
        </table>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
          style="border-collapse:collapse;border:1px solid #e2e8f0;margin-bottom:16px;">
          <tr>
            <th align="left" style="padding:10px 12px;border:1px solid #cbd5e1;background:#e2e8f0;font-size:12px;color:#111827;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;width:40px;">#</th>
            <th align="left" style="padding:10px 12px;border:1px solid #cbd5e1;background:#e2e8f0;font-size:12px;color:#111827;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;">Date</th>
            <th align="left" style="padding:10px 12px;border:1px solid #cbd5e1;background:#e2e8f0;font-size:12px;color:#111827;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;">Description</th>
            <th align="left" style="padding:10px 12px;border:1px solid #cbd5e1;background:#e2e8f0;font-size:12px;color:#111827;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;">Receipt</th>
            <th align="right" style="padding:10px 12px;border:1px solid #cbd5e1;background:#e2e8f0;font-size:12px;color:#111827;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;">Amount</th>
          </tr>
          ${itemRowsHtml}
          <tr style="background:#0f172a;">
            <td colspan="4" align="right" style="padding:10px 12px;border:1px solid #334155;font-size:14px;color:#ffffff;font-weight:700;">Total Claimed</td>
            <td align="right" style="padding:10px 12px;border:1px solid #334155;font-size:14px;color:#ffffff;font-weight:700;">${escapeHtml(formatCurrency(total))}</td>
          </tr>
        </table>
        ${items.some((i) => i.file) ? `<p style="margin:0;font-size:13px;color:#64748b;">Receipt attachments are included with this email.</p>` : ""}
      </td>
    </tr>
    <tr>
      <td style="padding:12px 20px 18px;border-top:1px solid #f0f0f0;">
        <p style="margin:0;font-size:12px;color:#94a3b8;">Submitted via the Leaders Portal · 1st Meath Dunboyne Scout Group</p>
      </td>
    </tr>
  </table>
</div>`
  }

  const internalHtml = buildHtml(
    `An expense claim has been submitted by <strong>${escapeHtml(applicantName || applicantEmail)}</strong>. Details are below.`
  )

  const applicantHtml = buildHtml(
    `Hi ${escapeHtml(applicantName || "Leader")}, here is a copy of your expense claim submission. It has been forwarded to the treasurer for review.`
  )

  const textBody = [
    `Expense Claim Submitted`,
    `Submitted: ${submittedAtIreland}`,
    `Leader: ${applicantName} <${applicantEmail}>`,
    "",
    itemRowsText,
    "",
    `Total: ${formatCurrency(total)}`,
  ].join("\n")

  // ── 4. Build nodemailer attachments (in-memory only, never persisted) ──────
  const attachments = items
    .filter((item) => item.file !== null)
    .map((item) => ({
      filename: item.file!.name,
      content: item.file!.content,
      contentType: item.file!.mimeType,
    }))

  // ── 5. Send emails ─────────────────────────────────────────────────────────
  const transporter = getMailTransporter()
  if (!transporter) {
    return {
      success: false,
      error: "Email service is not configured. Please contact the webmaster.",
    }
  }

  const recipientEmail = sanitiseEmail(process.env.EXPENSE_CLAIM_EMAIL ?? "")
  if (!recipientEmail) {
    console.warn("Expense claim email not sent: EXPENSE_CLAIM_EMAIL is not configured")
    return {
      success: false,
      error: "Expense claim recipient is not configured. Please contact the webmaster.",
    }
  }

  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER

  try {
    // Send to treasurer/admin
    await transporter.sendMail({
      from,
      to: recipientEmail,
      subject,
      text: textBody,
      html: internalHtml,
      attachments,
      replyTo: applicantEmail,
    })

    // Send copy to applicant (only if they differ from the recipient)
    if (applicantEmail.toLowerCase() !== recipientEmail.toLowerCase()) {
      await transporter.sendMail({
        from,
        to: applicantEmail,
        subject: `Copy of your expense claim – ${submittedAtIreland}`,
        text: textBody,
        html: applicantHtml,
        attachments,
      })
    }
  } catch (err) {
    console.error("Expense claim email send failed:", err)
    return {
      success: false,
      error: "Failed to send the expense claim email. Please try again or contact the webmaster.",
    }
  }

  return { success: true }
}
