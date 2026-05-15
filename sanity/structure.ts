import type {StructureResolver} from 'sanity/structure'

const EXCLUDED_FROM_DEFAULT = ['faqList', 'annualSubscriptionPricing', 'leadersAnnualSubscriptionPricing', 'scoutsSummerCampPricing']

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      // Singleton: only one FAQs document ever exists — link directly to it
      S.listItem()
        .title('FAQs')
        .id('singleton-faq-list')
        .child(
          S.document()
            .schemaType('faqList')
            .documentId('faqList')
        ),
      S.listItem()
        .title('Annual Subscription Pricing')
        .id('singleton-annual-subscription-pricing')
        .child(
          S.document()
            .schemaType('annualSubscriptionPricing')
            .documentId('annualSubscriptionPricing')
        ),
      S.listItem()
        .title('Leaders Annual Subscription Pricing')
        .id('singleton-leaders-annual-subscription-pricing')
        .child(
          S.document()
            .schemaType('leadersAnnualSubscriptionPricing')
            .documentId('leadersAnnualSubscriptionPricing')
        ),
      S.documentTypeListItem('scoutsSummerCampPricing').title('Camp Payments'),
      S.divider(),
      // All other document types rendered as normal lists
      ...S.documentTypeListItems().filter(
        (item) => !EXCLUDED_FROM_DEFAULT.includes(item.getId() ?? '')
      ),
    ])
