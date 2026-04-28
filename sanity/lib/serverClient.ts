import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../env'

// Server-only client with a read token — used for auth callbacks and private queries.
// Never import this in client components.
export const serverClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
})
