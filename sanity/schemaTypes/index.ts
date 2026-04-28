import { type SchemaTypeDefinition } from 'sanity'
import { newsArticle } from './newsArticle'
import { leaderProfile } from './leaderProfile'
import { leaderResource } from './leaderResource'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [newsArticle, leaderProfile, leaderResource],
}
