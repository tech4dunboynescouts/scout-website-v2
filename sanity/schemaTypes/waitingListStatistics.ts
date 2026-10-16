import { defineArrayMember, defineField, defineType } from 'sanity'

const SECTION_OPTIONS = [
  { title: 'Beavers', value: 'beavers' },
  { title: 'Cubs', value: 'cubs' },
  { title: 'Scouts', value: 'scouts' },
  { title: 'Ventures', value: 'ventures' },
  { title: 'Rovers', value: 'rovers' },
]

export const waitingListStatistics = defineType({
  name: 'waitingListStatistics',
  title: 'Waiting List Statistics',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      readOnly: true,
      initialValue: 'Waiting List Statistics',
    }),
    defineField({
      name: 'lastUpdated',
      title: 'Last updated — when were these statistics last reviewed?',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sections',
      title: 'Sections',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'section',
              title: 'Section',
              type: 'string',
              options: {
                list: SECTION_OPTIONS,
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'count',
              title: 'Current Waiting List Count',
              type: 'number',
              validation: (Rule) =>
                Rule.required()
                  .integer()
                  .min(0)
                  .error('Count must be a whole number of 0 or more'),
            }),
            defineField({
              name: 'comments',
              title: 'Comments',
              type: 'text',
              rows: 2,
            }),
          ],
          preview: {
            select: { section: 'section', count: 'count' },
            prepare({ section, count }: { section?: string; count?: number }) {
              const label = SECTION_OPTIONS.find((o) => o.value === section)?.title ?? section
              return {
                title: label ?? 'Unknown section',
                subtitle: count != null ? `${count} on waiting list` : 'Count not set',
              }
            },
          },
        }),
      ],
      validation: (Rule) =>
        Rule.custom((sections: Array<{ section?: string }> | undefined) => {
          if (!sections) return true
          const values = sections.map((s) => s.section).filter(Boolean)
          const unique = new Set(values)
          if (unique.size !== values.length) {
            return 'Each section may only appear once'
          }
          return true
        }),
    }),
  ],

  preview: {
    prepare() {
      return { title: 'Waiting List Statistics' }
    },
  },
})
