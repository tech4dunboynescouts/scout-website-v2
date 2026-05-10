import { defineField, defineType } from 'sanity'

import { SCOUT_SECTIONS } from '../../lib/paymentTypes'

const PAYMENT_TYPES = [
  { title: 'Annual Membership', value: 'annual-membership' },
]

const CHECKOUT_MODES = [
  { title: 'Subscription', value: 'subscription' },
  { title: 'Payment', value: 'payment' },
]

export const paymentPlan = defineType({
  name: 'paymentPlan',
  title: 'Payment Plan',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'section',
      title: 'Scout Section',
      type: 'string',
      options: {
        list: SCOUT_SECTIONS.map(({ label, value }) => ({ title: label, value })),
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'paymentType',
      title: 'Payment Type',
      type: 'string',
      options: { list: PAYMENT_TYPES },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'checkoutMode',
      title: 'Stripe Checkout Mode',
      type: 'string',
      options: { list: CHECKOUT_MODES },
      initialValue: 'subscription',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'amount',
      title: 'Amount',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'currency',
      title: 'Currency',
      type: 'string',
      initialValue: 'eur',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'stripePriceId',
      title: 'Stripe Price ID',
      type: 'string',
      description: 'Price ID created in Stripe for this payment plan.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: { title: 'title', section: 'section', active: 'active', amount: 'amount', currency: 'currency' },
    prepare({
      title,
      section,
      active,
      amount,
      currency,
    }: {
      title?: string
      section?: string
      active?: boolean
      amount?: number
      currency?: string
    }) {
      return {
        title: title ?? 'Untitled',
        subtitle: [section, amount != null ? `${currency?.toUpperCase() ?? ''} ${amount}`.trim() : '', active === false ? 'INACTIVE' : 'Active']
          .filter(Boolean)
          .join(' · '),
      }
    },
  },
})
