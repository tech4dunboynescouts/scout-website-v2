import { defineArrayMember, defineField, defineType } from 'sanity'

export const siteNavigation = defineType({
  name: 'siteNavigation',
  title: 'Navigation',
  type: 'document',
  fields: [
    defineField({
      name: 'navItems',
      title: 'Navigation Items',
      type: 'array',
      description:
        'Main nav links shown in the header. "Leaders Portal", "Search" and "Join Now" are always present and cannot be removed here.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'navLink',
          title: 'Link',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'href',
              title: 'URL',
              type: 'string',
              description: 'Internal path e.g. /news, or full external URL',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { label: 'label', href: 'href' },
            prepare({ label, href }: { label?: string; href?: string }) {
              return { title: label, subtitle: href }
            },
          },
        }),
        defineArrayMember({
          type: 'object',
          name: 'navGroup',
          title: 'Dropdown Group',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'children',
              title: 'Links',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'label',
                      title: 'Label',
                      type: 'string',
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: 'href',
                      title: 'URL',
                      type: 'string',
                      validation: (Rule) => Rule.required(),
                    }),
                  ],
                  preview: {
                    select: { label: 'label', href: 'href' },
                    prepare({ label, href }: { label?: string; href?: string }) {
                      return { title: label, subtitle: href }
                    },
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: { label: 'label', children: 'children' },
            prepare({ label, children }: { label?: string; children?: unknown[] }) {
              const count = Array.isArray(children) ? children.length : 0
              return { title: label, subtitle: `${count} link${count !== 1 ? 's' : ''}` }
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Site Navigation' }
    },
  },
})
