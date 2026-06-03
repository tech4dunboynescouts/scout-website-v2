import type {StructureResolver} from 'sanity/structure'

const EXCLUDED_FROM_DEFAULT = ['faqList', 'siteFeatureFlags']

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      // Singleton: only one FAQs document ever exists — link directly to it
      S.listItem()
        .title('FAQs')
        .id('faqList')
        .child(
          S.document()
            .schemaType('faqList')
            .documentId('faqList')
        ),
      S.listItem()
        .title('Site Feature Flags')
        .id('siteFeatureFlags')
        .child(
          S.document()
            .schemaType('siteFeatureFlags')
            .documentId('siteFeatureFlags')
        ),
      S.divider(),
      // All other document types rendered as normal lists
      ...S.documentTypeListItems().filter(
        (item) => !EXCLUDED_FROM_DEFAULT.includes(item.getId() ?? '')
      ),
    ])
