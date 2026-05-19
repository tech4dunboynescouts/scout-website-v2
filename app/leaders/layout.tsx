import { auth } from "@/auth"
import LeadersPortalToolbar from "@/components/LeadersPortalToolbar"

export default async function LeadersLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const isAuthorized = session?.user?.isAuthorizedLeader === true

  return (
    <>
      <LeadersPortalToolbar isAuthorized={isAuthorized} />
      {children}
    </>
  )
}
