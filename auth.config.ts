import type { NextAuthConfig } from "next-auth"

// Edge-compatible config — no Node.js-only imports (no Sanity client, no crypto).
// Used by middleware.ts. The full auth.ts spreads this and adds providers + jwt callback.
export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/leaders/login",
  },
  callbacks: {
    // Runs in both Edge (middleware) and Node.js (server components).
    // Reads fields already stored in the JWT by the jwt() callback in auth.ts.
    session({ session, token }) {
      session.user.isAuthorizedLeader = (token.isAuthorizedLeader as boolean | undefined) ?? false
      session.user.leaderRole = (token.leaderRole as string | null | undefined) ?? null
      session.user.leaderName = (token.leaderName as string | null | undefined) ?? null
      return session
    },
  },
  providers: [],
}
