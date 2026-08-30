import { defineArrayMember, defineField, defineType } from 'sanity'

export const generalPage = defineType({
  name: 'generalPage',
  title: 'Pages',
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
      description: 'The URL path for this page, e.g. a slug of "summer-camp-2025" gives the URL /pages/summer-camp-2025',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Page Description',
      type: 'text',
      rows: 2,
      description: 'Used as the meta description for search engines. Optional.',
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Optional hero image shown at the top of the page.',
    }),
    defineField({
      name: 'ctaLabel',
      title: 'Button Label',
      type: 'string',
      description: 'Text shown on the action button, e.g. "Pay Here" or "Donate Here". Leave blank to hide the button.',
    }),
    defineField({
      name: 'ctaLink',
      title: 'Button Link',
      type: 'url',
      description: 'The URL the button links to. Can be absolute (https://...) or a relative path starting with / (e.g. /payments).',
      validation: (rule) =>
        rule.uri({ scheme: ['http', 'https', 'mailto'], allowRelative: true }),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      description: 'Page content — text, headings, images, and image carousels.',
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
        defineArrayMember({
          type: 'object',
          name: 'videoEmbed',
          title: 'Video',
          fields: [
            defineField({
              name: 'url',
              type: 'url',
              title: 'Video URL',
              description: 'YouTube or Vimeo URL (e.g. https://www.youtube.com/watch?v=...)',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'caption',
              type: 'string',
              title: 'Caption',
              description: 'Optional caption displayed beneath the video.',
            }),
          ],
          preview: {
            select: { url: 'url', caption: 'caption' },
            prepare({ url, caption }: { url?: string; caption?: string }) {
              return { title: caption || 'Video', subtitle: url ?? '' }
            },
          },
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      slug: 'slug.current',
      media: 'coverImage',
    },
    prepare({ title, slug }: { title?: string; slug?: string }) {
      return {
        title,
        subtitle: slug ? `/pages/${slug}` : '',
      }
    },
  },
})
