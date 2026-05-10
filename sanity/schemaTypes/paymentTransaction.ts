import { defineArrayMember, defineField, defineType } from 'sanity'

const STATUSES = [
  { title: 'Pending', value: 'pending' },
  { title: 'Completed', value: 'completed' },
  { title: 'Cancelled', value: 'cancelled' },
  { title: 'Failed', value: 'failed' },
]

const CHECKOUT_MODES = [
  { title: 'Subscription', value: 'subscription' },
  { title: 'Payment', value: 'payment' },
]

export const paymentTransaction = defineType({
  name: 'paymentTransaction',
  title: 'Payment Transaction',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: { list: STATUSES },
      initialValue: 'pending',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'planSlug',
      title: 'Plan Slug',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'paymentType',
      title: 'Payment Type',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'section',
      title: 'Scout Section',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'checkoutMode',
      title: 'Checkout Mode',
      type: 'string',
      options: { list: CHECKOUT_MODES },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'leaderName',
      title: 'Leader Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'leaderEmail',
      title: 'Leader Email',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'leaderRoles',
      title: 'Leader Roles',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
    }),
    defineField({
      name: 'stripeCheckoutSessionId',
      title: 'Stripe Checkout Session ID',
      type: 'string',
      description: 'Optional for Payment Element flows that do not use Checkout Sessions.',
    }),
    defineField({
      name: 'stripePaymentIntentId',
      title: 'Stripe Payment Intent ID',
      type: 'string',
    }),
    defineField({
      name: 'stripeSubscriptionId',
      title: 'Stripe Subscription ID',
      type: 'string',
    }),
    defineField({
      name: 'stripeCustomerId',
      title: 'Stripe Customer ID',
      type: 'string',
    }),
    defineField({
      name: 'stripePaymentStatus',
      title: 'Stripe Payment Status',
      type: 'string',
    }),
    defineField({
      name: 'amount',
      title: 'Amount',
      type: 'number',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'currency',
      title: 'Currency',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'completedAt',
      title: 'Completed At',
      type: 'datetime',
    }),
    defineField({
      name: 'cancelledAt',
      title: 'Cancelled At',
      type: 'datetime',
    }),
    defineField({
      name: 'stripeMetadata',
      title: 'Stripe Metadata',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'metadataEntry',
          fields: [
            defineField({ name: 'key', type: 'string', title: 'Key', validation: (Rule) => Rule.required() }),
            defineField({ name: 'value', type: 'string', title: 'Value', validation: (Rule) => Rule.required() }),
          ],
          preview: {
            select: { key: 'key', value: 'value' },
            prepare({ key, value }: { key?: string; value?: string }) {
              return { title: key ?? 'key', subtitle: value ?? '' }
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'title', status: 'status', section: 'section', amount: 'amount', currency: 'currency' },
    prepare({
      title,
      status,
      section,
      amount,
      currency,
    }: {
      title?: string
      status?: string
      section?: string
      amount?: number
      currency?: string
    }) {
      return {
        title: title ?? 'Untitled',
        subtitle: [section, amount != null ? `${currency?.toUpperCase() ?? ''} ${amount}`.trim() : '', status].filter(Boolean).join(' · '),
      }
    },
  },
})
