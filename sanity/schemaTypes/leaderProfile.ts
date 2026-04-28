import { defineField, defineType } from 'sanity'

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
      name: 'role',
      title: 'Role',
      type: 'string',
      options: {
        list: [
          { title: 'Group Leader', value: 'group-leader' },
          { title: 'Section Leader', value: 'section-leader' },
          { title: 'Assistant Leader', value: 'assistant-leader' },
          { title: 'Committee Member', value: 'committee' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
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
    select: { name: 'name', email: 'email', isActive: 'isActive' },
    prepare({ name, email, isActive }: { name?: string; email?: string; isActive?: boolean }) {
      return {
        title: name ?? email ?? 'Unknown',
        subtitle: `${email ?? ''} ${isActive === false ? '· INACTIVE' : '· Active'}`,
      }
    },
  },
})
