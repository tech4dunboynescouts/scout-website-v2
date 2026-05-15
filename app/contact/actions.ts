"use server"

import nodemailer from "nodemailer"

function sanitiseString(val: unknown, max = 500): string {
  if (typeof val !== "string") return ""
  return val.trim().slice(0, max)
}

function sanitiseEmail(val: unknown): string {
  const s = sanitiseString(val, 254)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ? s.toLowerCase() : ""
}

function canonicalizeEmailForComparison(email: string): string {
  const [localRaw, domainRaw] = email.split("@")
  const local = localRaw ?? ""
  const domain = (domainRaw ?? "").toLowerCase()

  if (domain === "gmail.com" || domain === "googlemail.com") {
    const baseLocal = local.split("+")[0].replace(/\./g, "")
    return `${baseLocal}@gmail.com`
  }

  return `${local}@${domain}`
}

function escapeHtml(val: string): string {
  return val
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
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

  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? ""
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
      `Contact form email not sent: missing SMTP environment variable(s): ${missingVars.join(", ")}`
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

export async function submitContactForm(formData: {
  name: string
  email: string
  topic: string
  message: string
}): Promise<{ success: boolean }> {
  const name = sanitiseString(formData.name, 200)
  const email = sanitiseEmail(formData.email)
  const topic = sanitiseString(formData.topic, 100)
  const message = sanitiseString(formData.message, 2000)

  if (!name || !email || !topic || !message) {
    throw new Error("Invalid form data")
  }

  const submittedAt = new Date().toISOString()

  try {
    await sendContactNotificationEmail({ submittedAt, name, email, topic, message })
  } catch (error) {
    console.error("Contact form email notification failed", error)
  }

  return { success: true }
}

async function sendContactNotificationEmail(payload: {
  submittedAt: string
  name: string
  email: string
  topic: string
  message: string
}) {
  const transporter = getMailTransporter()
  if (!transporter) return

  const internalRecipient = sanitiseEmail(process.env.CONTACT_NOTIFICATION_EMAIL ?? "")
  if (!internalRecipient) {
    console.warn("Contact form email not sent: CONTACT_NOTIFICATION_EMAIL is not configured")
    return
  }

  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER
  const submittedAtIreland = formatDateTimeIreland(payload.submittedAt)

  // Human-readable topic label
  const topicLabels: Record<string, string> = {
    joining: "Joining the Group",
    beavers: "Beavers Section",
    cubs: "Cubs Section",
    scouts: "Scouts Section",
    ventures: "Ventures Section",
    volunteering: "Volunteering",
    fundraising: "Fundraising",
    other: "Other",
  }
  const topicDisplay = topicLabels[payload.topic] ?? payload.topic

  const subject = `New contact form message from ${payload.name || "Unknown"} – ${topicDisplay}`

  const fields: Array<[string, string]> = [
    ["Submitted At", submittedAtIreland],
    ["Name", payload.name],
    ["Email Address", payload.email],
    ["Topic", topicDisplay],
    ["Message", payload.message],
  ]

  const text = [
    "A new contact form message has been submitted.",
    "",
    ...fields.map(([label, value]) => `${label}: ${value || "Not provided"}`),
  ].join("\n")

  const rowsHtml = fields
    .map(
      ([label, value], index) =>
        `<tr style="background:${index % 2 === 0 ? "#f8fafc" : "#ffffff"};">` +
        `<th align="left" valign="top" style="padding:10px 12px;border:1px solid #e2e8f0;font-size:13px;color:#111827;width:180px;font-weight:600;">${escapeHtml(label)}</th>` +
        `<td style="padding:10px 12px;border:1px solid #e2e8f0;font-size:13px;color:#111827;line-height:1.55;white-space:pre-line;">${escapeHtml(value || "Not provided")}</td>` +
        `</tr>`
    )
    .join("")

  const html = `
    <div style="margin:0;padding:24px;background:#ffffff;font-family:Arial,Helvetica,sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:760px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e2e8f0;">
        <tr>
          <td style="background:#0f172a;padding:16px 20px;">
            <p style="margin:0;color:#ffffff;font-size:18px;font-weight:700;">Contact Form Message</p>
            <p style="margin:6px 0 0;color:#cbd5e1;font-size:13px;">Dunboyne Scouts Website</p>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 20px;">
            <p style="margin:0 0 12px;font-size:14px;color:#334155;">A new message has been submitted via the contact form. The details are below:</p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid #e2e8f0;">
              <tr>
                <th align="left" style="padding:10px 12px;border:1px solid #cbd5e1;background:#e2e8f0;font-size:12px;color:#111827;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;">Field</th>
                <th align="left" style="padding:10px 12px;border:1px solid #cbd5e1;background:#e2e8f0;font-size:12px;color:#111827;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;">Value</th>
              </tr>
              ${rowsHtml}
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 20px 18px;border-top:1px solid #f0f0f0;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">You can reply directly to this email to respond to ${escapeHtml(payload.name)}.</p>
          </td>
        </tr>
      </table>
    </div>
  `

  const applicantRecipient = sanitiseEmail(payload.email)
  const internalCanonical = canonicalizeEmailForComparison(internalRecipient)
  const applicantCanonical = applicantRecipient ? canonicalizeEmailForComparison(applicantRecipient) : ""

  const deliveries: Array<Promise<{ to: string; info: nodemailer.SentMessageInfo }>> = []

  deliveries.push(
    transporter
      .sendMail({
        from,
        to: internalRecipient,
        subject,
        text,
        html,
        replyTo: applicantRecipient,
      })
      .then((info) => ({ to: internalRecipient, info }))
  )

  const shouldSendApplicantCopy = !!applicantRecipient && applicantCanonical !== internalCanonical

  if (shouldSendApplicantCopy) {
    const confirmationSubject = `We've received your message – Dunboyne Scout Group`
    const confirmationHtml = `
      <div style="margin:0;padding:24px;background:#ffffff;font-family:Arial,Helvetica,sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:760px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e2e8f0;">
          <tr>
            <td style="background:#0f172a;padding:16px 20px;">
              <p style="margin:0;color:#ffffff;font-size:18px;font-weight:700;">Message Received</p>
              <p style="margin:6px 0 0;color:#cbd5e1;font-size:13px;">Dunboyne Scouts Website</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 20px;">
              <p style="margin:0 0 12px;font-size:15px;color:#111827;font-weight:600;">Hi ${escapeHtml(payload.name)},</p>
              <p style="margin:0 0 12px;font-size:14px;color:#334155;line-height:1.6;">
                Thank you for getting in touch with 1st Meath Dunboyne Scout Group.
              </p>
              <p style="margin:0 0 16px;font-size:14px;color:#334155;line-height:1.6;">
                For reference, here is a copy of what you sent us:
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid #e2e8f0;margin-bottom:16px;">
                <tr>
                  <th align="left" style="padding:10px 12px;border:1px solid #cbd5e1;background:#e2e8f0;font-size:12px;color:#111827;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;">Field</th>
                  <th align="left" style="padding:10px 12px;border:1px solid #cbd5e1;background:#e2e8f0;font-size:12px;color:#111827;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;">Value</th>
                </tr>
                ${rowsHtml}
              </table>
              <p style="margin:0;font-size:13px;color:#64748b;">
                If you did not submit this form, please ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </div>
    `

    deliveries.push(
      transporter
        .sendMail({
          from,
          to: applicantRecipient,
          subject: confirmationSubject,
          text: `Hi ${payload.name},\n\nThank you for getting in touch with 1st Meath Dunboyne Scout Group.\n\n${text}`,
          html: confirmationHtml,
        })
        .then((info) => ({ to: applicantRecipient, info }))
    )
  }

  const results = await Promise.allSettled(deliveries)

  for (const result of results) {
    if (result.status === "fulfilled") {
      console.info("Contact form email sent", {
        to: result.value.to,
        accepted: result.value.info.accepted,
        rejected: result.value.info.rejected,
      })
    } else {
      console.error("Contact form email failed", result.reason)
    }
  }
}
