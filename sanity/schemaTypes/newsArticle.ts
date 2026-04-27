import { defineField, defineType } from 'sanity'

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
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        {
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
        },
        {
          type: 'image',
          name: 'bodyImage',
          title: 'Image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alt text',
              description: 'Describe the image for screen readers and SEO.',
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
              description: 'Optional caption displayed beneath the image.',
            },
          ],
        },
        {
          type: 'object',
          name: 'imageGallery',
          title: 'Image Carousel',
          fields: [
            {
              name: 'images',
              title: 'Images',
              type: 'array',
              description: 'Add multiple images — they will display as a swipeable carousel on the website.',
              of: [
                {
                  type: 'image',
                  options: { hotspot: true },
                  fields: [
                    {
                      name: 'alt',
                      type: 'string',
                      title: 'Alt text',
                      description: 'Describe the image for screen readers.',
                    },
                    {
                      name: 'caption',
                      type: 'string',
                      title: 'Caption',
                      description: 'Optional caption shown beneath the image in the carousel.',
                    },
                  ],
                },
              ],
              validation: (Rule: { min: (n: number) => unknown }) => Rule.min(2),
            },
          ],
          preview: {
            select: { images: 'images' },
            prepare({ images }: { images: unknown[] }) {
              return {
                title: `Image Carousel (${images?.length ?? 0} images)`,
              }
            },
          },
        },
      ],
      validation: (Rule) => Rule.required(),
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
