'use client'

/**
 * This configuration is used to for the Sanity Studio that's mounted on the `/app/studio/[[...tool]]/page.tsx` route
 */

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'

import {apiVersion, dataset, projectId} from './sanity/env'
import {schema} from './sanity/schemaTypes'
import {structure} from './sanity/structure'

const SINGLETON_TYPES = new Set([
  'faqList',
  'annualSubscriptionPricing',
  'leadersAnnualSubscriptionPricing',
  'siteFeatureFlags',
])

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  schema,
  plugins: [
    structureTool({structure}),
    visionTool({defaultApiVersion: apiVersion}),
  ],
  document: {
    // Hide singleton types from the global "Create new" menu.
    newDocumentOptions: (prev, {creationContext}) => {
      if (creationContext.type !== 'global') return prev
      return prev.filter((templateItem) => !SINGLETON_TYPES.has(templateItem.templateId))
    },
    // Prevent duplicate action on singleton documents.
    actions: (prev, {schemaType}) => {
      if (!SINGLETON_TYPES.has(schemaType)) return prev
      return prev.filter((action) => {
        const actionName =
          typeof action === 'string'
            ? action
            : (action as {action?: string}).action
        return actionName !== 'duplicate'
      })
    },
  },
})
