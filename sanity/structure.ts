import type {StructureResolver} from 'sanity/structure'

const EXCLUDED_FROM_DEFAULT = ['faqList', 'formSubmission']

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
      // Form Submissions — grouped list with status filter
      S.listItem()
        .title('Form Submissions')
        .id('formSubmissions')
        .child(
          S.list()
            .title('Form Submissions')
            .items([
              S.listItem()
                .title('Youth Member Applications')
                .child(
                  S.documentList()
                    .title('Youth Member Applications')
                    .schemaType('formSubmission')
                    .filter('_type == "formSubmission" && formType == "youth"')
                    .defaultOrdering([{ field: 'submittedAt', direction: 'desc' }])
                ),
              S.listItem()
                .title('Volunteer Enquiries')
                .child(
                  S.documentList()
                    .title('Volunteer Enquiries')
                    .schemaType('formSubmission')
                    .filter('_type == "formSubmission" && formType == "volunteer"')
                    .defaultOrdering([{ field: 'submittedAt', direction: 'desc' }])
                ),
            ])
        ),
      S.divider(),
      // All other document types rendered as normal lists
      ...S.documentTypeListItems().filter(
        (item) => !EXCLUDED_FROM_DEFAULT.includes(item.getId() ?? '')
      ),
    ])
