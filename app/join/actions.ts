"use server"

import { createClient } from "next-sanity"
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
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ? s : ""
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
  medicalNotes: string
  volunteeringInterest: string
}) {
  const email = sanitiseEmail(formData.email)
  if (!email) throw new Error("Invalid email address")

  const doc = {
    _type: "formSubmission",
    formType: "youth",
    status: "new",
    submittedAt: new Date().toISOString(),
    childName: sanitiseString(formData.childName, 200),
    dob: sanitiseString(formData.dob, 20),
    gender: sanitiseString(formData.gender, 30),
    schoolYear: sanitiseString(formData.schoolYear, 50),
    parentName: sanitiseString(formData.parentName, 200),
    email,
    phone: sanitiseString(formData.phone, 30),
    section: sanitiseString(formData.section, 50),
    medicalNotes: sanitiseString(formData.medicalNotes, 2000),
    volunteeringInterest: sanitiseString(formData.volunteeringInterest, 10),
  }

  await getWriteClient().create(doc)
}

export async function submitVolunteerApplication(formData: {
  name: string
  email: string
  phone: string
  volunteerSection: string
  availability: string
  interests: string
  experience: string
}) {
  const email = sanitiseEmail(formData.email)
  if (!email) throw new Error("Invalid email address")

  const doc = {
    _type: "formSubmission",
    formType: "volunteer",
    status: "new",
    submittedAt: new Date().toISOString(),
    contactName: sanitiseString(formData.name, 200),
    email,
    phone: sanitiseString(formData.phone, 30),
    volunteerSection: sanitiseString(formData.volunteerSection, 50),
    availability: sanitiseString(formData.availability, 50),
    interests: sanitiseString(formData.interests, 1000),
    experience: sanitiseString(formData.experience, 2000),
  }

  await getWriteClient().create(doc)
}
