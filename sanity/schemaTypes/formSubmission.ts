import { defineField, defineType } from 'sanity'
import { EnvelopeIcon } from '@sanity/icons'

export const formSubmission = defineType({
  name: 'formSubmission',
  title: 'Form Submissions',
  type: 'document',
  icon: EnvelopeIcon,
  fields: [
    defineField({
      name: 'formType',
      title: 'Form Type',
      type: 'string',
      options: {
        list: [
          { title: 'Youth Member Application', value: 'youth' },
          { title: 'Volunteer / Leader Enquiry', value: 'volunteer' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      initialValue: 'new',
      hidden: ({ document }) => document?.formType === 'youth',
      options: {
        list: [
          { title: '🆕 New', value: 'new' },
          { title: '📞 Contacted', value: 'contacted' },
          { title: '✅ Enrolled / Accepted', value: 'enrolled' },
          { title: '❌ Declined', value: 'declined' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'submittedAt',
      title: 'Submitted At',
      type: 'datetime',
      readOnly: true,
    }),

    // ── Youth Application Fields ──────────────────────────────────────────────
    defineField({
      name: 'childName',
      title: "Child's Full Name",
      type: 'string',
      hidden: ({ document }) => document?.formType !== 'youth',
    }),
    defineField({
      name: 'dob',
      title: 'Date of Birth',
      type: 'string',
      hidden: ({ document }) => document?.formType !== 'youth',
    }),
    defineField({
      name: 'gender',
      title: 'Gender',
      type: 'string',
      hidden: ({ document }) => document?.formType !== 'youth',
    }),
    defineField({
      name: 'schoolYear',
      title: 'Current School Year / Class',
      type: 'string',
      hidden: ({ document }) => document?.formType !== 'youth',
    }),
    defineField({
      name: 'parentName',
      title: 'Parent / Guardian Name',
      type: 'string',
      hidden: ({ document }) => document?.formType !== 'youth',
    }),
    defineField({
      name: 'section',
      title: 'Section of Interest',
      type: 'string',
      hidden: ({ document }) => document?.formType !== 'youth',
    }),
    defineField({
      name: 'addressLine1',
      title: 'Address Line 1',
      type: 'string',
      hidden: ({ document }) => document?.formType !== 'youth',
    }),
    defineField({
      name: 'addressLine2',
      title: 'Address Line 2',
      type: 'string',
      hidden: ({ document }) => document?.formType !== 'youth',
    }),
    defineField({
      name: 'townCity',
      title: 'Town / City',
      type: 'string',
      hidden: ({ document }) => document?.formType !== 'youth',
    }),
    defineField({
      name: 'county',
      title: 'County',
      type: 'string',
      hidden: ({ document }) => document?.formType !== 'youth',
    }),
    defineField({
      name: 'eircode',
      title: 'Eircode',
      type: 'string',
      hidden: ({ document }) => document?.formType !== 'youth',
    }),
    defineField({
      name: 'medicalNotes',
      title: 'Full Address (Combined)',
      type: 'text',
      rows: 3,
      hidden: ({ document }) => document?.formType !== 'youth',
    }),
    defineField({
      name: 'volunteeringInterest',
      title: 'Interested in Volunteering?',
      type: 'string',
      hidden: ({ document }) => document?.formType !== 'youth',
    }),

    // ── Shared Contact Fields ─────────────────────────────────────────────────
    defineField({
      name: 'contactName',
      title: 'Name',
      type: 'string',
      hidden: ({ document }) => document?.formType !== 'volunteer',
      description: 'Volunteer full name',
    }),
    defineField({
      name: 'email',
      title: 'Email Address',
      type: 'string',
    }),
    defineField({
      name: 'phone',
      title: 'Phone Number',
      type: 'string',
    }),

    // ── Volunteer Fields ──────────────────────────────────────────────────────
    defineField({
      name: 'volunteerSection',
      title: 'Section to Help With',
      type: 'string',
      hidden: ({ document }) => document?.formType !== 'volunteer',
    }),
    defineField({
      name: 'reasonForVoulenteering',
      title: 'Reasons for Volunteering',
      type: 'text',
      rows: 6,
      hidden: ({ document }) => document?.formType !== 'volunteer',
    }),
  ],

  preview: {
    select: {
      formType: 'formType',
      childName: 'childName',
      contactName: 'contactName',
      email: 'email',
      status: 'status',
      submittedAt: 'submittedAt',
    },
    prepare({ formType, childName, contactName, email, status, submittedAt }) {
      const name = formType === 'youth' ? childName : contactName
      const label = formType === 'youth' ? 'Youth Application' : 'Volunteer Enquiry'
      const date = submittedAt
        ? new Date(submittedAt).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })
        : ''
      return {
        title: name ? `${name} — ${label}` : label,
        subtitle: [email, status, date].filter(Boolean).join(' · '),
      }
    },
  },

  // Prevent editors accidentally creating submissions by hand in Studio
  // (they come in via the website only)
  __experimental_omnisearch_visibility: false,
})
