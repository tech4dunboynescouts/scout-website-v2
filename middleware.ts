import { auth } from "@/auth"
import { NextResponse } from "next/server"

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
    return NextResponse.next()
  }

  // All other /leaders/* routes require a valid, authorized session
  if (!session) {
    return NextResponse.redirect(new URL("/leaders/login", req.url))
  }

  if (!session.user?.isAuthorizedLeader) {
    return NextResponse.redirect(new URL("/leaders/unauthorized", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/leaders/:path*"],
}
