import NextAuth from "next-auth"
import { NextResponse } from "next/server"
import { authConfig } from "@/auth.config"
import { isRouteDisabled, type RouteToggle } from "@/lib/routeToggles"

// Use the Edge-compatible config so the proxy never imports the Sanity
// client or any other Node.js-only module.
const { auth } = NextAuth(authConfig)

type RouteToggleResponse = { result?: { routes?: RouteToggle[] } }

const SANITY_API_VERSION = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-04-27"
const FEATURE_FLAGS_TTL_MS = 30_000

let cachedRouteToggles: { expiresAt: number; routes: RouteToggle[] } | null = null

async function getRouteTogglesFromSanity(): Promise<RouteToggle[]> {
  if (cachedRouteToggles && Date.now() < cachedRouteToggles.expiresAt) {
    return cachedRouteToggles.routes
  }

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
  if (!projectId || !dataset) return []

  const query = '*[_type == "siteFeatureFlags" && _id == "siteFeatureFlags"][0]{routes[]{label,routePath,enabled}}'
  const url = `https://${projectId}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${dataset}?query=${encodeURIComponent(query)}`

  try {
    const res = await fetch(url, {
      headers: {
        ...(process.env.SANITY_API_READ_TOKEN
          ? { Authorization: `Bearer ${process.env.SANITY_API_READ_TOKEN}` }
          : {}),
      },
    })

    if (!res.ok) return []

    const data = (await res.json()) as RouteToggleResponse
    const routes = data.result?.routes ?? []
    cachedRouteToggles = {
      expiresAt: Date.now() + FEATURE_FLAGS_TTL_MS,
      routes,
    }
    return routes
  } catch {
    return []
  }
}

export default auth(async (req) => {
  const { nextUrl } = req
  const session = req.auth
  const path = nextUrl.pathname

  const routeToggles = await getRouteTogglesFromSanity()
  if (path !== "/not-found" && isRouteDisabled(path, routeToggles)) {
    return NextResponse.redirect(new URL("/not-found", req.url))
  }

  if (!path.startsWith("/leaders")) {
    return
  }

  // Public routes within /leaders — no auth needed
  if (
    path === "/leaders" ||
    path === "/leaders/login" ||
    path === "/leaders/unauthorized"
  ) {
    return
  }

  // All other /leaders/* routes require a valid, authorised session
  if (!session) {
    return NextResponse.redirect(new URL("/leaders/login", req.url))
  }

  if (!session.user?.isAuthorizedLeader) {
    return NextResponse.redirect(new URL("/leaders/unauthorized", req.url))
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|opengraph-image).*)"],
}