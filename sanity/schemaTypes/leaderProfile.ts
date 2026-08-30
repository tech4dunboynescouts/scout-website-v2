import { defineArrayMember, defineField, defineType } from 'sanity'

const ROLES = [
  { title: 'Group Council', value: 'group-council' },
  { title: 'Beavers',       value: 'beavers' },
  { title: 'Cubs',          value: 'cubs' },
  { title: 'Scouts',        value: 'scouts' },
  { title: 'Ventures',      value: 'ventures' },
  { title: 'Rovers',        value: 'rovers' },
]

export const leaderProfile = defineType({
  name: 'leaderProfile',
  title: 'Leader Profile',
  type: 'document',
  fields: [
    defineField({
      name: 'email',
      title: 'Email Address',
      type: 'string',
      description: 'Must exactly match the Google account email used to sign in.',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'roles',
      title: 'Roles',
      type: 'array',
      description: 'Select all sections this leader belongs to.',
      of: [defineArrayMember({ type: 'string' })],
      options: { list: ROLES },
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      description: 'Uncheck to revoke portal access without deleting this record.',
      initialValue: true,
    }),
  ],
  preview: {
    select: { name: 'name', email: 'email', roles: 'roles', isActive: 'isActive' },
    prepare({
      name,
      email,
      roles,
      isActive,
    }: {
      name?: string
      email?: string
      roles?: string[]
      isActive?: boolean
    }) {
      const roleLabels = (roles ?? [])
        .map((r) => ROLES.find((o) => o.value === r)?.title ?? r)
        .join(', ')
      return {
        title: name ?? email ?? 'Unknown',
        subtitle: [roleLabels, isActive === false ? 'INACTIVE' : 'Active'].filter(Boolean).join(' · '),
      }
    },
  },
})
