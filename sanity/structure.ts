import type {StructureResolver} from 'sanity/structure'

const EXCLUDED_FROM_DEFAULT = ['faqList']

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
      S.divider(),
      // All other document types rendered as normal lists
      ...S.documentTypeListItems().filter(
        (item) => !EXCLUDED_FROM_DEFAULT.includes(item.getId() ?? '')
      ),
    ])
