import { defineArrayMember, defineField, defineType } from 'sanity'

export const siteFeatureFlags = defineType({
  name: 'siteFeatureFlags',
  title: 'Site Feature Flags',
  type: 'document',
  fields: [
    defineField({
      name: 'routes',
      title: 'Route Toggles',
      type: 'array',
      description:
        'Enable or disable specific site routes without redeploying. Example route: /payments',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'routeToggle',
          title: 'Route Toggle',
          fields: [
            defineField({
              name: 'routePath',
              title: 'Route Path',
              type: 'string',
              description: 'Exact internal path, for example /payments or /fundraising.',
              validation: (Rule) =>
                Rule.required().custom((value) => {
                  if (typeof value !== 'string') return 'Route path is required.'
                  if (!value.startsWith('/')) return 'Route path must start with /'
                  return true
                }),
            }),
            defineField({
              name: 'enabled',
              title: 'Enabled',
              type: 'boolean',
              initialValue: true,
              description: 'Turn off to block the route and hide matching nav links.',
            }),
          ],
          preview: {
            select: { routePath: 'routePath', enabled: 'enabled' },
            prepare({ routePath, enabled }: { routePath?: string; enabled?: boolean }) {
              return {
                title: routePath ?? 'Route',
                subtitle: enabled === false ? 'Disabled' : 'Enabled',
              }
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Site Feature Flags' }
    },
  },
})