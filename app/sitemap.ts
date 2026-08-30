import type { MetadataRoute } from 'next'
import { client } from '@/sanity/lib/client'
import { allNewsSlugsQuery } from '@/sanity/lib/queries'
import sections from '@/data/sections.json'
import { siteUrl } from '@/lib/siteConfig'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl,                         changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${siteUrl}/news`,               changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${siteUrl}/about`,              changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/join`,               changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/contact`,            changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/leaders`,            changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/fundraising`,        changeFrequency: 'monthly', priority: 0.6 },
  ]

  const sectionPages: MetadataRoute.Sitemap = sections.map((s) => ({
    url: `${siteUrl}/sections/${s.slug}`,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const slugs: { slug: string }[] = await client.fetch(allNewsSlugsQuery).catch(() => [])
  const newsPages: MetadataRoute.Sitemap = slugs.map(({ slug }) => ({
    url: `${siteUrl}/news/${slug}`,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [...staticPages, ...sectionPages, ...newsPages]
}
