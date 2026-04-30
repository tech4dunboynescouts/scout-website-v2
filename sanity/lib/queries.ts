import { groq } from 'next-sanity'

export const allNewsQuery = groq`
  *[_type == "newsArticle"] | order(date desc) {
    _id,
    title,
    "slug": slug.current,
    date,
    tag,
    excerpt,
    "image": image.asset->url,
  }
`

export const newsArticleBySlugQuery = groq`
  *[_type == "newsArticle" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    date,
    tag,
    excerpt,
    "image": image.asset->url,
    body[] {
      ...,
      _type == "bodyImage" => {
        ...,
        "url": asset->url,
        alt,
        caption,
      },
      _type == "imageGallery" => {
        ...,
        images[] {
          ...,
          "url": asset->url,
          alt,
          caption,
        }
      },
      _type == "videoEmbed" => {
        url,
        caption,
      }
    },
  }
`

export const allNewsSlugsQuery = groq`
  *[_type == "newsArticle"] { "slug": slug.current }
`

export const searchNewsQuery = groq`
  *[_type == "newsArticle"] | order(date desc) {
    title,
    "slug": slug.current,
    excerpt,
    "bodyText": pt::text(body),
  }
`

// ── Fundraising ────────────────────────────────────────────────────────────────

export const allFundraisingCampaignsQuery = groq`
  *[_type == "fundraisingCampaign"] | order(_createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    "coverImage": coverImage.asset->url,
    target,
    raised,
    donorCount,
    ctaLabel,
    ctaLink,
    visibleFromMonth,
    visibleToMonth,
    "hasBody": defined(body[0]),
  }
`

export const fundraisingCampaignBySlugQuery = groq`
  *[_type == "fundraisingCampaign" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    "coverImage": coverImage.asset->url,
    target,
    raised,
    donorCount,
    ctaLabel,
    ctaLink,
    body[] {
      ...,
      _type == "bodyImage" => {
        ...,
        "url": asset->url,
        alt,
        caption,
      },
      _type == "imageGallery" => {
        ...,
        images[] {
          ...,
          "url": asset->url,
          alt,
          caption,
        }
      },
    },
  }
`

export const allFundraisingSlugsQuery = groq`
  *[_type == "fundraisingCampaign"] { "slug": slug.current }
`

// ── General Pages ──────────────────────────────────────────────────────────────

export const generalPageBySlugQuery = groq`
  *[_type == "generalPage" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    description,
    "coverImage": coverImage.asset->url,
    body[] {
      ...,
      _type == "bodyImage" => {
        ...,
        "url": asset->url,
        alt,
        caption,
      },
      _type == "imageGallery" => {
        ...,
        images[] {
          ...,
          "url": asset->url,
          alt,
          caption,
        }
      },
    },
  }
`

export const allGeneralPageSlugsQuery = groq`
  *[_type == "generalPage"] { "slug": slug.current }
`

// ── Leaders Portal ─────────────────────────────────────────────────────────────

export const leaderProfileByEmailQuery = groq`
  *[_type == "leaderProfile" && email == $email && isActive == true][0] {
    _id,
    name,
    roles,
    isActive,
  }
`

export const allLeaderResourcesQuery = groq`
  *[
    _type == "leaderResource" &&
    (
      count(visibleToRoles) == 0 ||
      count(visibleToRoles[@ in $roles]) > 0
    )
  ] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    category,
    publishedAt,
    visibleToRoles,
    "hasFile": defined(file.asset),
  }
`

export const leaderResourceBySlugQuery = groq`
  *[_type == "leaderResource" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    category,
    publishedAt,
    body,
    visibleToRoles,
    "fileUrl": file.asset->url,
    "fileName": file.asset->originalFilename,
    "fileMimeType": file.asset->mimeType,
  }
`
