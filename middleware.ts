import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"

// Use the Edge-compatible config so the middleware never imports the Sanity
// client or any other Node.js-only module.
const { auth } = NextAuth(authConfig)
const enableStartupLogs = process.env.DEBUG_STARTUP_LOGS === "1"
let firstRequestLogged = false

if (enableStartupLogs) {
  console.info("[startup] middleware module loaded")
}

export default auth((req) => {
  const { nextUrl } = req
  const session = req.auth
  const path = nextUrl.pathname

  if (enableStartupLogs && !firstRequestLogged) {
    firstRequestLogged = true
    console.info("[startup] first request received", {
      method: req.method,
      path,
      host: req.headers.get("host"),
      userAgent: req.headers.get("user-agent") ?? "unknown",
      hasSessionCookie:
        (req.cookies.get("__Secure-authjs.session-token")?.value?.length ?? 0) > 0 ||
        (req.cookies.get("authjs.session-token")?.value?.length ?? 0) > 0,
      timestamp: new Date().toISOString(),
    })
  }

  // Non-leader routes are not access controlled.
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
    return Response.redirect(new URL("/leaders/login", req.url))
  }

  if (!session.user?.isAuthorizedLeader) {
    return Response.redirect(new URL("/leaders/unauthorized", req.url))
  }
})

export const config = {
  // Exclude static assets and API routes from temporary diagnostics.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
}
