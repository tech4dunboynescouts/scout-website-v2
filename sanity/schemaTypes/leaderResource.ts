import { defineArrayMember, defineField, defineType } from 'sanity'

const ROLES = [
  { title: 'Group Council', value: 'group-council' },
  { title: 'Beavers',       value: 'beavers' },
  { title: 'Cubs',          value: 'cubs' },
  { title: 'Scouts',        value: 'scouts' },
  { title: 'Ventures',      value: 'ventures' },
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
        defineArrayMember({
          type: 'image',
          name: 'bodyImage',
          title: 'Image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              type: 'string',
              title: 'Alt text',
              description: 'Describe the image for screen readers and SEO.',
            }),
            defineField({
              name: 'caption',
              type: 'string',
              title: 'Caption',
              description: 'Optional caption displayed beneath the image.',
            }),
          ],
        }),
        defineArrayMember({
          type: 'object',
          name: 'imageGallery',
          title: 'Image Carousel',
          fields: [
            defineField({
              name: 'images',
              title: 'Images',
              type: 'array',
              description: 'Add multiple images — they will display as a swipeable carousel.',
              of: [
                defineArrayMember({
                  type: 'image',
                  options: { hotspot: true },
                  fields: [
                    defineField({
                      name: 'alt',
                      type: 'string',
                      title: 'Alt text',
                      description: 'Describe the image for screen readers.',
                    }),
                    defineField({
                      name: 'caption',
                      type: 'string',
                      title: 'Caption',
                    }),
                  ],
                }),
              ],
              validation: (Rule) => Rule.min(2),
            }),
          ],
          preview: {
            select: { images: 'images' },
            prepare({ images }: { images?: unknown[] }) {
              const count = Array.isArray(images) ? images.length : 0
              return { title: `Image Carousel (${count} images)` }
            },
          },
        }),
        defineArrayMember({
          type: 'object',
          name: 'tiledImageGallery',
          title: 'Tiled Image Gallery',
          fields: [
            defineField({
              name: 'images',
              title: 'Images',
              type: 'array',
              description: 'Add multiple images — they will display in a responsive grid (WordPress-style masonry layout).',
              of: [
                defineArrayMember({
                  type: 'image',
                  options: { hotspot: true },
                  fields: [
                    defineField({
                      name: 'alt',
                      type: 'string',
                      title: 'Alt text',
                      description: 'Describe the image for screen readers.',
                    }),
                    defineField({
                      name: 'caption',
                      type: 'string',
                      title: 'Caption',
                      description: 'Optional caption shown in the lightbox when viewing this image.',
                    }),
                    defineField({
                      name: 'aspectRatio',
                      type: 'string',
                      title: 'Aspect Ratio',
                      description: 'Hint for how to display this image in the grid.',
                      options: {
                        list: [
                          { title: 'Square (1:1)', value: 'square' },
                          { title: 'Landscape (16:9)', value: 'landscape' },
                          { title: 'Portrait (3:4)', value: 'portrait' },
                        ],
                      },
                    }),
                  ],
                }),
              ],
              validation: (Rule) => Rule.min(2),
            }),
            defineField({
              name: 'columns',
              title: 'Columns',
              type: 'number',
              description: 'Number of columns on desktop (2, 3, or 4).',
              options: {
                list: [2, 3, 4],
              },
              initialValue: 3,
            }),
          ],
          preview: {
            select: { images: 'images', columns: 'columns' },
            prepare({ images, columns }: { images?: unknown[]; columns?: number }) {
              const count = Array.isArray(images) ? images.length : 0
              return { title: `Tiled Gallery (${count} images, ${columns || 3} columns)` }
            },
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
        'Leave empty to show to all active leaders. Select specific roles to restrict visibility.',
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
