import { type SchemaTypeDefinition } from 'sanity'
import { newsArticle } from './newsArticle'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [newsArticle],
}
