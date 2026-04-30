import { defineArrayMember, defineField, defineType } from 'sanity'

const memberFields = [
  defineField({
    name: 'name',
    title: 'Name',
    type: 'string',
    validation: (Rule) => Rule.required(),
  }),
  defineField({
    name: 'role',
    title: 'Role',
    type: 'string',
    description: 'e.g. Section Leader, Leader, Chairperson',
    validation: (Rule) => Rule.required(),
  }),
  defineField({
    name: 'lead',
    title: 'Lead / Section Leader',
    type: 'boolean',
    description: 'Check for the Group Leader or Section Leader — shown with emphasis on the page',
    initialValue: false,
  }),
]

const memberPreview = {
  select: { name: 'name', role: 'role', lead: 'lead' },
  prepare({ name, role, lead }: { name?: string; role?: string; lead?: boolean }) {
    return { title: name, subtitle: lead ? `★ ${role}` : role }
  },
}

export const leaderTeam = defineType({
  name: 'leaderTeam',
  title: 'Leader Team',
  type: 'document',
  fields: [
    // ── Group Council ───────────────────────────────────────────────────────────
    defineField({
      name: 'councilColour',
      title: 'Council Avatar Colour',
      type: 'string',
      description: 'Hex colour used for Group Council avatar backgrounds, e.g. #5A6A8A',
    }),
    defineField({
      name: 'councilMembers',
      title: 'Group Council Members',
      type: 'array',
      description: 'People shown in the Group Council card grid at the top of the page',
      of: [
        defineArrayMember({
          type: 'object',
          fields: memberFields,
          preview: memberPreview,
        }),
      ],
    }),

    // ── Section Groups ──────────────────────────────────────────────────────────
    defineField({
      name: 'sectionGroups',
      title: 'Section Groups',
      type: 'array',
      description: 'Each entry is one meeting-night section card, e.g. Monday Beavers, Wednesday Cubs',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'sectionGroup',
          title: 'Section Group',
          fields: [
            defineField({
              name: 'name',
              title: 'Group Name',
              type: 'string',
              description: 'e.g. Monday Beavers, Wednesday Cubs, Ventures',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'colour',
              title: 'Colour',
              type: 'string',
              description: 'Hex colour for the card header, e.g. #E8640A',
            }),
            defineField({
              name: 'members',
              title: 'Members',
              type: 'array',
              description: 'Put the Section Leader first and mark them as Lead',
              of: [
                defineArrayMember({
                  type: 'object',
                  fields: memberFields,
                  preview: memberPreview,
                }),
              ],
            }),
          ],
          preview: {
            select: { name: 'name', colour: 'colour', members: 'members' },
            prepare({ name, members }: { name?: string; colour?: string; members?: unknown[] }) {
              const count = Array.isArray(members) ? members.length : 0
              return { title: name, subtitle: `${count} member${count !== 1 ? 's' : ''}` }
            },
          },
        }),
      ],
    }),
  ],

  preview: {
    prepare() {
      return { title: 'Leader Team' }
    },
  },
})
