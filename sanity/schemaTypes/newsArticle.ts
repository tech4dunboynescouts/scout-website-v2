import { defineArrayMember, defineField, defineType } from 'sanity'

export const newsArticle = defineType({
  name: 'newsArticle',
  title: 'News Article',
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
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      options: {
        dateFormat: 'YYYY-MM-DD',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tag',
      title: 'Section Tag',
      type: 'string',
      options: {
        list: [
          { title: 'Group', value: 'Group' },
          { title: 'Beavers', value: 'Beavers' },
          { title: 'Cubs', value: 'Cubs' },
          { title: 'Scouts', value: 'Scouts' },
          { title: 'Ventures', value: 'Ventures' },
          { title: 'Water Section', value: 'Water Section' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      description: 'Short summary shown on news listing cards.',
      validation: (Rule) => Rule.required().max(300),
    }),
    defineField({
      name: 'image',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },
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
        defineArrayMember({
          type: 'object',
          name: 'imageGallery',
          title: 'Image Carousel',
          fields: [
            defineField({
              name: 'images',
              title: 'Images',
              type: 'array',
              description: 'Add multiple images — they will display as a swipeable carousel on the website.',
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
                      description: 'Optional caption shown beneath the image in the carousel.',
                    }),
                  ],
                }),
              ],
              validation: (Rule) => Rule.min(2),
            }),
          ],
          preview: {
            select: { images: 'images' },
            prepare({ images }) {
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
      validation: (Rule) => Rule.required(),
    }),

    // ── Call-to-Action Button ───────────────────────────────────────────────────
    defineField({
      name: 'ctaButton',
      title: 'Call-to-Action Button',
      type: 'object',
      description: 'Optional button shown at the bottom of the article',
      fields: [
        defineField({
          name: 'label',
          title: 'Button Label',
          type: 'string',
          description: 'Text shown on the button, e.g. "Register Now" or "Find Out More"',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'url',
          title: 'URL',
          type: 'string',
          description: 'Relative path (e.g. /join) for internal pages, or full URL (e.g. https://example.com) for external sites',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'openInNewTab',
          title: 'Open in new tab',
          type: 'boolean',
          description: 'Enable for external URLs so the article stays open',
          initialValue: false,
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      date: 'date',
      tag: 'tag',
      media: 'image',
    },
    prepare({ title, date, tag, media }) {
      return {
        title,
        subtitle: `${tag ?? ''} · ${date ?? ''}`,
        media,
      }
    },
  },
})
