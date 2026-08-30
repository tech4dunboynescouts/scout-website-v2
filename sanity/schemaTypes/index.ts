import { type SchemaTypeDefinition } from 'sanity'
import { newsArticle } from './newsArticle'
import { leaderProfile } from './leaderProfile'
import { leaderResource } from './leaderResource'
import { fundraisingCampaign } from './fundraisingCampaign'
import { generalPage } from './generalPage'
import { sectionPage } from './sectionPage'
import { siteNavigation } from './siteNavigation'
import { siteFeatureFlags } from './siteFeatureFlags'
import { leaderTeam } from './leaderTeam'
import { faqList } from './faqList'
import { annualSubscriptionPricing } from './annualSubscriptionPricing'
import { leadersAnnualSubscriptionPricing } from './leadersAnnualSubscriptionPricing'
import { scoutsSummerCampPricing } from './scoutsSummerCampPricing'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    newsArticle,
    leaderProfile,
    leaderResource,
    fundraisingCampaign,
    generalPage,
    sectionPage,
    siteNavigation,
    siteFeatureFlags,
    leaderTeam,
    faqList,
    annualSubscriptionPricing,
    leadersAnnualSubscriptionPricing,
    scoutsSummerCampPricing,
  ],
}
