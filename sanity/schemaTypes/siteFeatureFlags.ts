import { defineArrayMember, defineField, defineType } from 'sanity'

const routeFlagTitles: Record<string, string> = {
  '/leaders/payments': 'Leaders Payments',
}

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
              name: 'label',
              title: 'Feature Flag',
              type: 'string',
              description: 'Friendly name shown in Studio, for example Leaders Payments.',
            }),
            defineField({
              name: 'routePath',
              title: 'Route Path',
              type: 'string',
              description: 'Internal path to hide and block, including child routes. Leaders Payments uses /leaders/payments.',
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
            select: { label: 'label', routePath: 'routePath', enabled: 'enabled' },
            prepare({
              label,
              routePath,
              enabled,
            }: {
              label?: string
              routePath?: string
              enabled?: boolean
            }) {
              const routeTitle = routePath ? routeFlagTitles[routePath] : undefined
              return {
                title: label || routeTitle || routePath || 'Route',
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