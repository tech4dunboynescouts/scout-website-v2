import { defineArrayMember, defineField, defineType } from 'sanity'

export const faqList = defineType({
  name: 'faqList',
  title: 'FAQs',
  type: 'document',
  // Singleton — only one document of this type should ever exist.
  // The Studio structure enforces this by linking directly to the single document.
  fields: [
    defineField({
      name: 'title',
      title: 'Internal Title',
      type: 'string',
      initialValue: 'FAQs',
      description: 'Used only inside Sanity Studio to identify this document.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'items',
      title: 'FAQ Items',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'faqItem',
          title: 'FAQ Item',
          fields: [
            defineField({
              name: 'question',
              title: 'Question',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'answer',
              title: 'Answer',
              type: 'text',
              rows: 4,
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { title: 'question', subtitle: 'answer' },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'title' },
  },
})
