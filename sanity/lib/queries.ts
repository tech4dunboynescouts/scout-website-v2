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
