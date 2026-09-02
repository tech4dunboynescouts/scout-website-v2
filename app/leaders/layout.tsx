import { auth } from "@/auth"
import LeadersPortalToolbar from "@/components/LeadersPortalToolbar"
import { isRouteDisabled, type RouteToggle } from "@/lib/routeToggles"
import { siteFeatureFlagsQuery } from "@/sanity/lib/queries"
import { serverClient } from "@/sanity/lib/serverClient"

export default async function LeadersLayout({ children }: { children: React.ReactNode }) {
  const [session, featureFlags] = await Promise.all([
    auth(),
    serverClient
      .fetch(siteFeatureFlagsQuery)
      .catch(() => null) as Promise<{ routes?: RouteToggle[] } | null>,
  ])
  const isAuthorized = session?.user?.isAuthorizedLeader === true
  const routeToggles = featureFlags?.routes ?? []
  const showPayments = !isRouteDisabled("/leaders/payments", routeToggles)

  return (
    <>
      <LeadersPortalToolbar isAuthorized={isAuthorized} showPayments={showPayments} />
      {children}
    </>
  )
}
