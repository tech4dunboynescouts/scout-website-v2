import { defineField, defineType } from 'sanity'

function sectionField(name: string, title: string) {
  return defineField({
    name,
    title,
    type: 'object',
    fields: [
      defineField({
        name: 'unitPrice',
        title: 'Unit Price',
        type: 'number',
        validation: (Rule) => Rule.required().min(0),
      }),
      defineField({
        name: 'stripePriceId',
        title: 'Stripe Price ID',
        type: 'string',
        description: 'Price ID from Stripe dashboard (e.g., price_...).',
        validation: (Rule) => Rule.required(),
      }),
    ],
  })
}

export const annualSubscriptionPricing = defineType({
  name: 'annualSubscriptionPricing',
  title: 'Annual Subscription Pricing',
  type: 'document',
  fields: [
    defineField({
      name: 'currency',
      title: 'Currency',
      type: 'string',
      initialValue: 'eur',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'paymentType',
      title: 'Payment Type',
      type: 'string',
      initialValue: 'annual-membership',
      validation: (Rule) => Rule.required(),
    }),
    sectionField('beavers', 'Beavers'),
    sectionField('cubs', 'Cubs'),
    sectionField('scouts', 'Scouts'),
    sectionField('ventures', 'Ventures'),
  ],
  preview: {
    select: { title: 'paymentType', currency: 'currency' },
    prepare({ title, currency }: { title?: string; currency?: string }) {
      return {
        title: 'Annual Subscription Pricing',
        subtitle: [title, currency?.toUpperCase()].filter(Boolean).join(' · '),
      }
    },
  },
})
