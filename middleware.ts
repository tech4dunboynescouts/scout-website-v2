import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"

// Use the Edge-compatible config so the middleware never imports the Sanity
// client or any other Node.js-only module.
const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl } = req
  const session = req.auth
  const path = nextUrl.pathname

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
    return Response.redirect(new URL("/leaders/login", req.url))
  }

  if (!session.user?.isAuthorizedLeader) {
    return Response.redirect(new URL("/leaders/unauthorized", req.url))
  }
})

export const config = {
  matcher: ["/leaders/:path*"],
}
