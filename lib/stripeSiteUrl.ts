const LOCAL_SITE_URL = "http://localhost:3000"

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "")
}

export function getStripeSiteUrl(): string {
  const configuredSiteUrl = process.env.SITE_URL?.trim()

  if (configuredSiteUrl) {
    return stripTrailingSlash(configuredSiteUrl)
  }

  if (process.env.NODE_ENV === "development") {
    return LOCAL_SITE_URL
  }

  throw new Error("SITE_URL is required outside local development for Stripe redirects")
}

export function buildStripeReturnUrl(pathname: string): string {
  const baseSiteUrl = getStripeSiteUrl()
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`

  return `${baseSiteUrl}${normalizedPath}`
}
