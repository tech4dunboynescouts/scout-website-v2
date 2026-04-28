import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/siteConfig'

export default function robots(): MetadataRoute.Robots {
  // Remove the disallow and uncomment the allow rule when the site goes live on 1stmeathdunboynescouts.ie
  return {
    rules: { userAgent: '*', disallow: '/' },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
