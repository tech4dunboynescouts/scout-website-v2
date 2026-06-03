import { groq } from 'next-sanity'

// ── FAQs ───────────────────────────────────────────────────────────────────────

export const faqListQuery = groq`
  *[_type == "faqList"][0] {
    items[] {
      _key,
      question,
      answer,
    }
  }
`

// ── Leader Team ────────────────────────────────────────────────────────────────

export const leaderTeamQuery = groq`
  *[_type == "leaderTeam"][0] {
    councilColour,
    councilMembers[] { name, role, lead },
    sectionGroups[] {
      name,
      colour,
      members[] { name, role, lead },
    }
  }
`

// ── Site Navigation ────────────────────────────────────────────────────────────

export const siteNavigationQuery = groq`
  *[_type == "siteNavigation"][0] {
    navItems[] {
      _type,
      label,
      href,
      children[] {
        label,
        href,
      }
    }
  }
`

export const siteFeatureFlagsQuery = groq`
  *[_type == "siteFeatureFlags"][0] {
    routes[] {
      routePath,
      enabled,
    }
  }
`

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
    ctaButton {
      label,
      url,
      openInNewTab,
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

export const searchFundraisingQuery = groq`
  *[_type == "fundraisingCampaign" && defined(body[0])] | order(_createdAt desc) {
    title,
    "slug": slug.current,
    excerpt,
    "bodyText": pt::text(body),
  }
`

export const searchGeneralPagesQuery = groq`
  *[_type == "generalPage"] | order(_createdAt desc) {
    title,
    "slug": slug.current,
    description,
    "bodyText": pt::text(body),
  }
`

export const searchLeaderTeamQuery = groq`
  *[_type == "leaderTeam"][0] {
    "entries": [
      ...councilMembers[]{
        "name": name,
        "role": role,
        "group": "Group Council"
      },
      ...sectionGroups[]{
        "groupName": name,
        "members": members[]{
          "name": name,
          "role": role,
          "group": ^.name
        }
      }.members[]
    ]
  }.entries
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
    ctaOpenInNewTab,
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
    ctaOpenInNewTab,
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
      _type == "videoEmbed" => {
        url,
        caption,
      }
    },
  }
`

export const allGeneralPageSlugsQuery = groq`
  *[_type == "generalPage"] { "slug": slug.current }
`

// ── Sections ───────────────────────────────────────────────────────────────────

export const sectionPageBySlugQuery = groq`
  *[_type == "sectionPage" && slug.current == $slug][0] {
    _id,
    name,
    "slug": slug.current,
    sectionName,
    leaderTitle,
    ageRange,
    icon,
    colour,
    tagline,
    "heroImage": heroImage.asset->url,
    description,
    programme,
    activities,
    "gallery": gallery[] {
      "url": asset->url,
      alt,
    },
    meetings[] {
      day,
      time,
    },
    location,
    "badgePlacementImage": badgePlacementImage.asset->url,
  }
`

export const allSectionPageSlugsQuery = groq`
  *[_type == "sectionPage"] { "slug": slug.current }
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
    "bodyText": pt::text(body),
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
