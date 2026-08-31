import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/siteConfig'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/leaders/',
        '/studio/',
        '/api/auth/',
        '/api/leaders/',
        '/api/revalidate/',
        '/api/telemetry/',
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
