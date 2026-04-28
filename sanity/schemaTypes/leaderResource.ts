import { defineArrayMember, defineField, defineType } from 'sanity'

const ROLES = [
  { title: 'Group Council', value: 'group-council' },
  { title: 'Beavers',       value: 'beavers' },
  { title: 'Cubs',          value: 'cubs' },
  { title: 'Scouts',        value: 'scouts' },
  { title: 'Ventures',      value: 'ventures' },
  { title: 'All',           value: 'all' },
]

export const leaderResource = defineType({
  name: 'leaderResource',
  title: 'Leader Resource',
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
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Announcements', value: 'Announcements' },
          { title: 'Meeting Notes', value: 'Meeting Notes' },
          { title: 'Documents',     value: 'Documents' },
          { title: 'Training',      value: 'Training' },
          { title: 'Finance',       value: 'Finance' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'Normal',     value: 'normal' },
            { title: 'Heading',    value: 'h2' },
            { title: 'Subheading', value: 'h3' },
          ],
          marks: {
            decorators: [
              { title: 'Bold',   value: 'strong' },
              { title: 'Italic', value: 'em' },
            ],
          },
        }),
      ],
    }),
    defineField({
      name: 'file',
      title: 'File Attachment',
      type: 'file',
      description: 'Optional file download (PDF, Word doc, spreadsheet, etc.).',
    }),
    defineField({
      name: 'visibleToRoles',
      title: 'Restrict to Roles',
      type: 'array',
      description:
        'Leave empty to show to all active leaders. Select specific roles to restrict visibility. "All" role leaders always have access.',
      of: [defineArrayMember({ type: 'string' })],
      options: { list: ROLES },
    }),
  ],
  preview: {
    select: { title: 'title', category: 'category', publishedAt: 'publishedAt' },
    prepare({
      title,
      category,
      publishedAt,
    }: {
      title?: string
      category?: string
      publishedAt?: string
    }) {
      return {
        title: title ?? 'Untitled',
        subtitle: [
          category,
          publishedAt ? new Date(publishedAt).toLocaleDateString('en-IE') : '',
        ]
          .filter(Boolean)
          .join(' · '),
      }
    },
  },
})
