import { type SchemaTypeDefinition } from 'sanity'
import { newsArticle } from './newsArticle'
import { leaderProfile } from './leaderProfile'
import { leaderResource } from './leaderResource'
import { fundraisingCampaign } from './fundraisingCampaign'
import { generalPage } from './generalPage'
import { sectionPage } from './sectionPage'
import { siteNavigation } from './siteNavigation'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [newsArticle, leaderProfile, leaderResource, fundraisingCampaign, generalPage, sectionPage, siteNavigation],
}
