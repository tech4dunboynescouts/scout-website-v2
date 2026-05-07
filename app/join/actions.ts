"use server"

import { createClient } from "next-sanity"
import nodemailer from "nodemailer"
import { apiVersion, dataset, projectId } from "@/sanity/env"

// Write client — server-only, never imported from client components
function getWriteClient() {
  const token = process.env.SANITY_WRITE_TOKEN
  if (!token) throw new Error("SANITY_WRITE_TOKEN is not set")
  return createClient({ projectId, dataset, apiVersion, useCdn: false, token })
}

// Basic server-side sanitisation
function sanitiseString(val: unknown, max = 500): string {
  if (typeof val !== "string") return ""
  return val.trim().slice(0, max)
}

function sanitiseEmail(val: unknown): string {
  const s = sanitiseString(val, 254)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ? s.toLowerCase() : ""
}

// Normalizes mailbox variants for dedupe checks. For Gmail/Googlemail,
// dots and plus-tags in the local part are ignored by the provider.
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

function sanitiseEircode(val: unknown): string {
  const s = sanitiseString(val, 16).toUpperCase().replace(/\s+/g, "")
  if (!/^[AC-FHKNPRTV-Y]\d{2}[AC-FHKNPRTV-Y0-9]{4}$/.test(s)) return ""
  return `${s.slice(0, 3)} ${s.slice(3)}`
}

function escapeHtml(val: string): string {
  return val
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
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

function formatDateOnly(value: string): string {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return value
  const [, year, month, day] = match
  return `${day}/${month}/${year}`
}

function getYouthNotificationRecipient(): string {
  return sanitiseEmail(process.env.YOUTH_NOTIFICATION_EMAIL) || ""
}

function getVolunteerNotificationRecipient(): string {
  return sanitiseEmail(process.env.VOLUNTEER_NOTIFICATION_EMAIL) || ""
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
      `Join form email not sent: missing SMTP environment variable(s): ${missingVars.join(", ")}`
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

async function notifyYouthApplicationByEmail(payload: {
  submittedAt: string
  childName: string
  dob: string
  gender: string
  schoolYear: string
  parentName: string
  email: string
  phone: string
  section: string
  addressLine1: string
  addressLine2: string
  townCity: string
  county: string
  eircode: string
  fullAddress: string
  volunteeringInterest: string
}) {
  const transporter = getMailTransporter()
  if (!transporter) return

  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER
  const subject = `New application submitted via Dunboyne Scouts Website for ${payload.childName || "Unknown Child"}`
  const submittedAtIreland = formatDateTimeIreland(payload.submittedAt)
  const dobDisplay = formatDateOnly(payload.dob)
  const fields: Array<[string, string]> = [
    ["Submitted At", submittedAtIreland],
    ["Child Name", payload.childName],
    ["Date of Birth", dobDisplay],
    ["Gender", payload.gender],
    ["Current School Year / Class", payload.schoolYear],
    ["Parent / Guardian Name", payload.parentName],
    ["Email Address", payload.email],
    ["Phone Number", payload.phone],
    ["Section of Interest", payload.section],
    ["Address Line 1", payload.addressLine1],
    ["Address Line 2", payload.addressLine2],
    ["Town / City", payload.townCity],
    ["County", payload.county],
    ["Eircode", payload.eircode],
    ["Full Address", payload.fullAddress],
    ["Interested in Volunteering", payload.volunteeringInterest],
  ]

  const text = [
    "A new youth application has been submitted.",
    "",
    ...fields.map(([label, value]) => `${label}: ${value || "Not provided"}`),
  ].join("\n")

  const rowsHtml = fields
    .map(
      ([label, value], index) =>
        `<tr style="background:${index % 2 === 0 ? "#f8fafc" : "#ffffff"};">` +
        `<th align="left" style="padding:10px 12px;border:1px solid #e2e8f0;font-size:13px;color:#111827;width:220px;">${escapeHtml(label)}</th>` +
        `<td style="padding:10px 12px;border:1px solid #e2e8f0;font-size:13px;color:#111827;line-height:1.45;white-space:pre-line;">${escapeHtml(value || "Not provided")}</td>` +
        `</tr>`
    )
    .join("")

  const html = `
    <div style="margin:0;padding:24px;background:#ffffff;font-family:Arial,Helvetica,sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:760px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e2e8f0;">
        <tr>
          <td style="background:#f97316;padding:16px 20px;">
            <p style="margin:0;color:#ffffff;font-size:18px;font-weight:700;">Youth Member Application</p>
            <p style="margin:6px 0 0;color:#ffedd5;font-size:13px;">Dunboyne Scouts Website</p>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 20px;">
            <p style="margin:0 0 12px;font-size:14px;color:#334155;">A new youth member application has been submitted. The details are below:</p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid #e2e8f0;">
              <tr>
                <th align="left" style="padding:10px 12px;border:1px solid #fed7aa;background:#fff7ed;font-size:12px;color:#111827;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;">Field</th>
                <th align="left" style="padding:10px 12px;border:1px solid #fed7aa;background:#fff7ed;font-size:12px;color:#111827;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;">Value</th>
              </tr>
              ${rowsHtml}
            </table>
          </td>
        </tr>
      </table>
    </div>
  `

  const internalRecipient = getYouthNotificationRecipient()
  if (!internalRecipient) {
    console.warn("Youth application email not sent: YOUTH_NOTIFICATION_EMAIL is not configured")
    return
  }
  const applicantRecipient = sanitiseEmail(payload.email)

  const internalCanonical = canonicalizeEmailForComparison(internalRecipient)
  const applicantCanonical = applicantRecipient ? canonicalizeEmailForComparison(applicantRecipient) : ""

  const deliveries: Array<Promise<{ to: string; info: nodemailer.SentMessageInfo }>> = []

  deliveries.push(
    transporter.sendMail({
      from,
      to: internalRecipient,
      subject,
      text,
      html,
      // Allows leaders to reply directly to the applicant from the internal notification email.
      replyTo: applicantRecipient,
    }).then((info) => ({ to: internalRecipient, info }))
  )

  const shouldSendApplicantCopy =
    !!applicantRecipient &&
    applicantCanonical !== internalCanonical

  if (shouldSendApplicantCopy) {
    deliveries.push(
      transporter.sendMail({
        from,
        to: applicantRecipient,
        subject,
        text,
        html,
      }).then((info) => ({ to: applicantRecipient, info }))
    )
  }

  const results = await Promise.allSettled(deliveries)

  let sentCount = 0
  for (const result of results) {
    if (result.status === "fulfilled") {
      sentCount += 1
      console.info("Youth application email sent", {
        to: result.value.to,
        accepted: result.value.info.accepted,
        rejected: result.value.info.rejected,
        response: result.value.info.response,
      })
    } else {
      console.error("Youth application email failed", result.reason)
    }
  }

  if (sentCount === 0) {
    throw new Error("Failed to send youth application emails to all recipients")
  }
}

async function notifyVolunteerApplicationByEmail(payload: {
  submittedAt: string
  name: string
  email: string
  phone: string
  volunteerSection: string
  reasonForVoulenteering: string
}) {
  const transporter = getMailTransporter()
  if (!transporter) return

  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER
  const subject = `New adult volunteer application submitted via Dunboyne Scouts Website for ${payload.name || "Unknown Volunteer"}`
  const submittedAtIreland = formatDateTimeIreland(payload.submittedAt)
  const fields: Array<[string, string]> = [
    ["Submitted At", submittedAtIreland],
    ["Full Name", payload.name],
    ["Email Address", payload.email],
    ["Phone Number", payload.phone],
    ["Section to Help With", payload.volunteerSection],
    ["Reasons for Volunteering", payload.reasonForVoulenteering],
  ]

  const text = [
    "A new adult volunteer application has been submitted.",
    "",
    ...fields.map(([label, value]) => `${label}: ${value || "Not provided"}`),
  ].join("\n")

  const rowsHtml = fields
    .map(
      ([label, value], index) =>
        `<tr style="background:${index % 2 === 0 ? "#f8fafc" : "#ffffff"};">` +
        `<th align="left" style="padding:10px 12px;border:1px solid #e2e8f0;font-size:13px;color:#111827;width:220px;">${escapeHtml(label)}</th>` +
        `<td style="padding:10px 12px;border:1px solid #e2e8f0;font-size:13px;color:#111827;line-height:1.45;white-space:pre-line;">${escapeHtml(value || "Not provided")}</td>` +
        `</tr>`
    )
    .join("")

  const html = `
    <div style="margin:0;padding:24px;background:#ffffff;font-family:Arial,Helvetica,sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:760px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e2e8f0;">
        <tr>
          <td style="background:#0f172a;padding:16px 20px;">
            <p style="margin:0;color:#ffffff;font-size:18px;font-weight:700;">Adult Volunteer Application</p>
            <p style="margin:6px 0 0;color:#cbd5e1;font-size:13px;">Dunboyne Scouts Website</p>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 20px;">
            <p style="margin:0 0 12px;font-size:14px;color:#334155;">A new adult volunteer application has been submitted. The details are below:</p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid #e2e8f0;">
              <tr>
                <th align="left" style="padding:10px 12px;border:1px solid #cbd5e1;background:#e2e8f0;font-size:12px;color:#111827;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;">Field</th>
                <th align="left" style="padding:10px 12px;border:1px solid #cbd5e1;background:#e2e8f0;font-size:12px;color:#111827;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;">Value</th>
              </tr>
              ${rowsHtml}
            </table>
          </td>
        </tr>
      </table>
    </div>
  `

  const internalRecipient = getVolunteerNotificationRecipient()
  if (!internalRecipient) {
    console.warn("Volunteer application email not sent: VOLUNTEER_NOTIFICATION_EMAIL is not configured")
    return
  }
  const applicantRecipient = sanitiseEmail(payload.email)

  const internalCanonical = canonicalizeEmailForComparison(internalRecipient)
  const applicantCanonical = applicantRecipient ? canonicalizeEmailForComparison(applicantRecipient) : ""

  const deliveries: Array<Promise<{ to: string; info: nodemailer.SentMessageInfo }>> = []

  deliveries.push(
    transporter.sendMail({
      from,
      to: internalRecipient,
      subject,
      text,
      html,
      replyTo: applicantRecipient,
    }).then((info) => ({ to: internalRecipient, info }))
  )

  const shouldSendApplicantCopy =
    !!applicantRecipient &&
    applicantCanonical !== internalCanonical

  if (shouldSendApplicantCopy) {
    deliveries.push(
      transporter.sendMail({
        from,
        to: applicantRecipient,
        subject,
        text,
        html,
      }).then((info) => ({ to: applicantRecipient, info }))
    )
  }

  const results = await Promise.allSettled(deliveries)

  let sentCount = 0
  for (const result of results) {
    if (result.status === "fulfilled") {
      sentCount += 1
      console.info("Volunteer application email sent", {
        to: result.value.to,
        accepted: result.value.info.accepted,
        rejected: result.value.info.rejected,
        response: result.value.info.response,
      })
    } else {
      console.error("Volunteer application email failed", result.reason)
    }
  }

  if (sentCount === 0) {
    throw new Error("Failed to send volunteer application emails to all recipients")
  }
}

export async function submitYouthApplication(formData: {
  childName: string
  dob: string
  gender: string
  schoolYear: string
  parentName: string
  email: string
  phone: string
  section: string
  addressLine1: string
  addressLine2: string
  townCity: string
  county: string
  eircode: string
  volunteeringInterest: string
}) {
  const email = sanitiseEmail(formData.email)
  if (!email) throw new Error("Invalid email address")

  const submittedAt = new Date().toISOString()
  const childName = sanitiseString(formData.childName, 200)
  const dob = sanitiseString(formData.dob, 20)
  const gender = sanitiseString(formData.gender, 30)
  const schoolYear = sanitiseString(formData.schoolYear, 50)
  const parentName = sanitiseString(formData.parentName, 200)
  const phone = sanitiseString(formData.phone, 30)
  const section = sanitiseString(formData.section, 50)
  const addressLine1 = sanitiseString(formData.addressLine1, 200)
  const addressLine2 = sanitiseString(formData.addressLine2, 200)
  const townCity = sanitiseString(formData.townCity, 100)
  const county = sanitiseString(formData.county, 100)
  const eircode = sanitiseEircode(formData.eircode)
  const volunteeringInterest = sanitiseString(formData.volunteeringInterest, 10)

  if (!addressLine1) throw new Error("Address line 1 is required")
  if (!townCity) throw new Error("Town / City is required")
  if (!county) throw new Error("County is required")
  if (!eircode) throw new Error("Invalid Eircode")

  const fullAddress = [addressLine1, addressLine2, townCity, county, eircode].filter(Boolean).join("\n")

  const doc = {
    _type: "formSubmission",
    formType: "youth",
    submittedAt,
    childName,
    dob,
    gender,
    schoolYear,
    parentName,
    email,
    phone,
    section,
    addressLine1,
    addressLine2,
    townCity,
    county,
    eircode,
    medicalNotes: fullAddress,
    volunteeringInterest,
  }

  await getWriteClient().create(doc)

  // Do not fail the user submission if SMTP credentials are invalid or the mail
  // provider is temporarily unavailable. The form has already been stored.
  try {
    await notifyYouthApplicationByEmail({
      submittedAt,
      childName,
      dob,
      gender,
      schoolYear,
      parentName,
      email,
      phone,
      section,
      addressLine1,
      addressLine2,
      townCity,
      county,
      eircode,
      fullAddress,
      volunteeringInterest,
    })
  } catch (error) {
    console.error("Youth application email notification failed", error)
  }
}

export async function submitVolunteerApplication(formData: {
  name: string
  email: string
  phone: string
  volunteerSection: string
  reasonForVoulenteering: string
}) {
  const email = sanitiseEmail(formData.email)
  if (!email) throw new Error("Invalid email address")

  const submittedAt = new Date().toISOString()
  const name = sanitiseString(formData.name, 200)
  const phone = sanitiseString(formData.phone, 30)
  const volunteerSection = sanitiseString(formData.volunteerSection, 50)
  const reasonForVoulenteering = sanitiseString(formData.reasonForVoulenteering, 2000)

  const doc = {
    _type: "formSubmission",
    formType: "volunteer",
    status: "new",
    submittedAt,
    contactName: name,
    email,
    phone,
    volunteerSection,
    reasonForVoulenteering,
  }

  await getWriteClient().create(doc)

  try {
    await notifyVolunteerApplicationByEmail({
      submittedAt,
      name,
      email,
      phone,
      volunteerSection,
      reasonForVoulenteering,
    })
  } catch (error) {
    console.error("Volunteer application email notification failed", error)
  }
}
