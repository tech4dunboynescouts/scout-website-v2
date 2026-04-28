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
