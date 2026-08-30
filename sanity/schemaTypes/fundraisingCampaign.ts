import { defineArrayMember, defineField, defineType } from 'sanity'

export const fundraisingCampaign = defineType({
  name: 'fundraisingCampaign',
  title: 'Fundraising',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Campaign Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      description: 'Short summary shown on the fundraising listing card.',
      validation: (Rule) => Rule.required().max(300),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'target',
      title: 'Fundraising Target (€)',
      type: 'number',
      description: 'Leave blank if this campaign has no specific financial target.',
    }),
    defineField({
      name: 'raised',
      title: 'Amount Raised (€)',
      type: 'number',
      description: 'Current amount raised. Update this as donations come in.',
    }),
    defineField({
      name: 'donorCount',
      title: 'Number of Donors',
      type: 'number',
    }),
    defineField({
      name: 'ctaLabel',
      title: 'Button Label',
      type: 'string',
      description: 'Text shown on the call-to-action button, e.g. "Donate Now" or "Learn More".',
      initialValue: 'Donate Now',
    }),
    defineField({
      name: 'ctaLink',
      title: 'Button Link',
      type: 'url',
      description: 'Where the button links to. Can be an external donation page or a mailto: link.',
    }),
    defineField({
      name: 'ctaOpenInNewTab',
      title: 'Open Link in New Tab',
      type: 'boolean',
      initialValue: true,
      description: 'When enabled, the button link opens in a new browser tab.',
    }),
    defineField({
      name: 'visibleFromMonth',
      title: 'Visible From Month',
      type: 'number',
      description: 'First month this campaign appears on the site (e.g. October for a Christmas raffle). Leave blank to always show.',
      options: {
        list: [
          { title: 'January',   value: 1  },
          { title: 'February',  value: 2  },
          { title: 'March',     value: 3  },
          { title: 'April',     value: 4  },
          { title: 'May',       value: 5  },
          { title: 'June',      value: 6  },
          { title: 'July',      value: 7  },
          { title: 'August',    value: 8  },
          { title: 'September', value: 9  },
          { title: 'October',   value: 10 },
          { title: 'November',  value: 11 },
          { title: 'December',  value: 12 },
        ],
        layout: 'dropdown',
      },
    }),
    defineField({
      name: 'visibleToMonth',
      title: 'Visible To Month',
      type: 'number',
      description: 'Last month this campaign appears on the site (e.g. January for a Christmas raffle). Leave blank to always show.',
      options: {
        list: [
          { title: 'January',   value: 1  },
          { title: 'February',  value: 2  },
          { title: 'March',     value: 3  },
          { title: 'April',     value: 4  },
          { title: 'May',       value: 5  },
          { title: 'June',      value: 6  },
          { title: 'July',      value: 7  },
          { title: 'August',    value: 8  },
          { title: 'September', value: 9  },
          { title: 'October',   value: 10 },
          { title: 'November',  value: 11 },
          { title: 'December',  value: 12 },
        ],
        layout: 'dropdown',
      },
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      description: 'Full campaign description with text, images, and image carousels.',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Heading', value: 'h2' },
            { title: 'Subheading', value: 'h3' },
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
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
  ],
  preview: {
    select: {
      title: 'title',
      from: 'visibleFromMonth',
      to: 'visibleToMonth',
      media: 'coverImage',
    },
    prepare({ title, from, to }: { title?: string; from?: number; to?: number }) {
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
      const range = from && to ? `${months[from - 1]} – ${months[to - 1]}` : 'Always visible'
      return { title, subtitle: range }
    },
  },
})
