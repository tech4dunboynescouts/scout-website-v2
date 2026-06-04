import { defineField, defineType } from 'sanity'

type SectionValue = {
  unitPrice?: number
  stripePriceId?: string
  subscriptionStripePriceId?: string
}

type LeadersAnnualPricingDocument = {
  currency?: string
  paymentType?: string
  beavers?: SectionValue
  cubs?: SectionValue
  scouts?: SectionValue
  ventures?: SectionValue
  maximumSubscriptionFee?: number
}

function sectionField(name: string, title: string) {
  return defineField({
    name,
    title,
    type: 'object',
    validation: (Rule) => Rule.required(),
    fields: [
      defineField({
        name: 'unitPrice',
        title: 'Unit Price',
        type: 'number',
        validation: (Rule) => Rule.required().min(0),
      }),
      defineField({
        name: 'stripePriceId',
        title: 'Stripe Price ID (Pay in Full)',
        type: 'string',
        description: 'One-time payment price from Stripe dashboard (e.g., price_...).',
        validation: (Rule) => Rule.required().regex(/^price_/, {
          name: 'Stripe Price ID',
          invert: false,
        }),
      }),
      defineField({
        name: 'subscriptionStripePriceId',
        title: 'Stripe Subscription Price ID (Monthly Instalments)',
        type: 'string',
        description:
          'Recurring monthly subscription price from Stripe dashboard (e.g., price_...). Used for 4-month installment payments.',
        validation: (Rule) =>
          Rule.required().regex(/^price_/, {
            name: 'Stripe Subscription Price ID',
            invert: false,
          }),
      }),
    ],
  })
}

export const leadersAnnualSubscriptionPricing = defineType({
  name: 'leadersAnnualSubscriptionPricing',
  title: 'Leaders Annual Subscription Pricing',
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
      initialValue: 'leaders-annual-membership',
      validation: (Rule) => Rule.required(),
    }),
    sectionField('beavers', 'Leaders Beaver Subs'),
    sectionField('cubs', 'Leaders Cubs Subs'),
    sectionField('scouts', 'Leaders Scout Subs'),
    sectionField('ventures', 'Leaders Ventures Subs'),
    defineField({
      name: 'maximumSubscriptionFee',
      title: 'Maximum Subscription Fee',
      type: 'number',
      description: 'Optional cap on total subscription charges. Leave blank for no limit.',
      validation: (Rule) => Rule.min(0),
    }),
  ],
  validation: (Rule) =>
    Rule.custom((doc) => {
      const value = (doc ?? {}) as LeadersAnnualPricingDocument

      if (!value.currency) {
        return 'Currency is required.'
      }

      if (!value.paymentType) {
        return 'Payment type is required.'
      }

      const sections: Array<keyof LeadersAnnualPricingDocument> = ['beavers', 'cubs', 'scouts', 'ventures']
      for (const key of sections) {
        const section = value[key] as SectionValue | undefined
        if (!section) {
          return `Section '${String(key)}' is required.`
        }
        if (section.unitPrice == null || section.unitPrice < 0) {
          return `Section '${String(key)}' must have a unit price of 0 or greater.`
        }
        if (!section.stripePriceId) {
          return `Section '${String(key)}' must have a Stripe Price ID (Pay in Full).`
        }
        if (!section.subscriptionStripePriceId) {
          return `Section '${String(key)}' must have a Stripe Subscription Price ID (Monthly Instalments).`
        }
      }

      return true
    }),
  preview: {
    select: { title: 'paymentType', currency: 'currency' },
    prepare({ title, currency }: { title?: string; currency?: string }) {
      return {
        title: 'Leaders Annual Subscription Pricing',
        subtitle: [title, currency?.toUpperCase()].filter(Boolean).join(' · '),
      }
    },
  },
})

