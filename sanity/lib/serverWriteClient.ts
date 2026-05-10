import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

export const serverWriteClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
})
