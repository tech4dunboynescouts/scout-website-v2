import { defineArrayMember, defineField, defineType } from 'sanity'

export const sectionPage = defineType({
  name: 'sectionPage',
  title: 'Sections',
  type: 'document',
  fields: [
    // ── Identity ────────────────────────────────────────────────────────────────
    defineField({
      name: 'name',
      title: 'Section Name',
      type: 'string',
      description: 'e.g. Beavers, Cubs, Scouts, Ventures',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'Must match the URL path — e.g. "beavers" for /sections/beavers',
      options: { source: 'name', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sectionName',
      title: 'Group Name',
      type: 'string',
      description: 'The collective name for the section, e.g. Colony, Pack, Troop, Unit',
    }),
    defineField({
      name: 'leaderTitle',
      title: 'Leader Title',
      type: 'string',
      description: 'e.g. Beaver Leader, Cub Scout Leader',
    }),
    defineField({
      name: 'ageRange',
      title: 'Age Range',
      type: 'string',
      description: 'e.g. 1st Class – 3rd Class',
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'string',
      description: 'A single emoji used as the section icon, e.g. 🦫',
    }),
    defineField({
      name: 'colour',
      title: 'Colour',
      type: 'string',
      description: 'Hex colour code used for the hero gradient, e.g. #E8640A',
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'Short tagline shown beneath the section title on the hero',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Background image shown in the hero section',
    }),

    // ── About the Programme ─────────────────────────────────────────────────────
    defineField({
      name: 'description',
      title: 'Programme Introduction',
      type: 'text',
      rows: 4,
      description: 'First paragraph of the "About the Programme" section',
    }),
    defineField({
      name: 'programme',
      title: 'Programme Description',
      type: 'text',
      rows: 4,
      description: 'Second paragraph giving more detail about the programme structure',
    }),

    // ── What We Get Up To ───────────────────────────────────────────────────────
    defineField({
      name: 'activities',
      title: 'Activities',
      type: 'array',
      description: 'Bullet-point list of activities shown in the "What We Get Up To" section',
      of: [defineArrayMember({ type: 'string' })],
    }),

    // ── Gallery ─────────────────────────────────────────────────────────────────
    defineField({
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      description: 'Photos shown in the gallery grid on the section page',
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              type: 'string',
              title: 'Alt text',
              description: 'Describe the image for screen readers and SEO',
            }),
          ],
        }),
      ],
    }),

    // ── Meeting Details ─────────────────────────────────────────────────────────
    defineField({
      name: 'meetings',
      title: 'Meeting Times',
      type: 'array',
      description: 'Weekly meeting schedule — add one entry per meeting slot',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'meetingSlot',
          title: 'Meeting Slot',
          fields: [
            defineField({
              name: 'day',
              title: 'Day',
              type: 'string',
              description: 'e.g. Monday',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'time',
              title: 'Time',
              type: 'string',
              description: 'e.g. 18:30 – 19:45',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { day: 'day', time: 'time' },
            prepare({ day, time }: { day?: string; time?: string }) {
              return { title: day ?? 'Meeting', subtitle: time }
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'location',
      title: 'Meeting Location',
      type: 'string',
      description: 'e.g. Rooske Road Scout Den, Dunboyne',
    }),

    // ── Badge Placement ─────────────────────────────────────────────────────────
    defineField({
      name: 'badgePlacementImage',
      title: 'Badge Placement Diagram',
      type: 'image',
      options: { hotspot: true },
      description: 'Official Scouting Ireland diagram showing where badges are placed on the uniform',
    }),
  ],

  preview: {
    select: {
      title: 'name',
      subtitle: 'tagline',
      media: 'heroImage',
    },
    prepare({ title, subtitle }: { title?: string; subtitle?: string }) {
      return { title, subtitle }
    },
  },
})
