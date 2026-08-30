import { defineField, defineType } from 'sanity'

const SECTION_OPTIONS = [
  { title: 'Beavers', value: 'beavers' },
  { title: 'Cubs', value: 'cubs' },
  { title: 'Scouts', value: 'scouts' },
  { title: 'Ventures', value: 'ventures' },
  { title: 'Rovers', value: 'rovers' },
  { title: 'Other', value: 'other' },
]

export const scoutsSummerCampPricing = defineType({
  name: 'scoutsSummerCampPricing',
  title: 'Summer Camp Payment',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      description: 'Display name shown to leaders, for example "Scouts Summer Camp 2026".',
      type: 'string',
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: 'section',
      title: 'Section',
      type: 'string',
      options: { list: SECTION_OPTIONS },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'paymentType',
      title: 'Payment Type',
      type: 'string',
      initialValue: 'summer-camp-payment',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'currency',
      title: 'Currency',
      type: 'string',
      initialValue: 'EUR',
      validation: (Rule) => Rule.required().min(3).max(3),
    }),
    defineField({
      name: 'stripePriceId',
      title: 'Stripe Price ID',
      description: 'Stripe price/product reference for this payment option.',
      type: 'string',
      validation: (Rule) =>
        Rule.required().custom((value) => {
          if (!value) return 'Stripe Price ID is required'
          if (!String(value).startsWith('price_')) return 'Stripe Price ID must start with price_'
          return true
        }),
    }),
    defineField({
      name: 'amountOptions',
      title: 'Amount Options',
      description: 'Selectable payment amounts shown to leaders for this option.',
      type: 'array',
      of: [{ type: 'number' }],
      validation: (Rule) =>
        Rule.required()
          .min(1)
          .custom((values) => {
            if (!Array.isArray(values) || values.length === 0) {
              return 'Add at least one amount option'
            }

            for (const value of values) {
              if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
                return 'All amount options must be positive numbers'
              }
            }

            return true
          }),
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      section: 'section',
      paymentType: 'paymentType',
      currency: 'currency',
      amountOptions: 'amountOptions',
      active: 'active',
    },
    prepare({
      title,
      section,
      paymentType,
      currency,
      amountOptions,
      active,
    }: {
      title?: string
      section?: string
      paymentType?: string
      currency?: string
      amountOptions?: number[]
      active?: boolean
    }) {
      const count = Array.isArray(amountOptions) ? amountOptions.length : 0
      const sectionLabel = section ? section[0].toUpperCase() + section.slice(1) : 'Section'
      const statusLabel = active === false ? 'Inactive' : 'Active'
      return {
        title: title ?? paymentType ?? 'Summer Camp Payment',
        subtitle: [
          sectionLabel,
          `${(currency ?? 'EUR').toUpperCase()} · ${count} amount option${count === 1 ? '' : 's'}`,
          statusLabel,
        ].join(' · '),
      }
    },
  },
})
