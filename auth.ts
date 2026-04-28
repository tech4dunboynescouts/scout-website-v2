import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { serverClient } from "@/sanity/lib/serverClient"
import { leaderProfileByEmailQuery } from "@/sanity/lib/queries"

// TEMPORARY DEBUG LOGGING — remove after confirming env vars are set in Vercel
console.log("=== AUTH ENV VAR DEBUG ===")
console.log("AUTH_SECRET:          ", process.env.AUTH_SECRET)
console.log("AUTH_GOOGLE_ID:       ", process.env.AUTH_GOOGLE_ID)
console.log("AUTH_GOOGLE_SECRET:   ", process.env.AUTH_GOOGLE_SECRET)
console.log("NEXTAUTH_URL:         ", process.env.NEXTAUTH_URL)
console.log("SANITY_API_READ_TOKEN:", process.env.SANITY_API_READ_TOKEN)
console.log("==========================")
// END TEMPORARY DEBUG LOGGING

// Only register the Google provider when credentials are present so that the
// login page can still render during local development before OAuth is configured.
const providers = process.env.AUTH_GOOGLE_ID ? [Google] : []

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  pages: {
    signIn: "/leaders/login",
  },
  callbacks: {
    async jwt({ token, trigger, account }) {
      // Query Sanity only on initial sign-in (not on every token refresh)
      if (trigger === "signIn" && token.email) {
        const leader = await serverClient
          .fetch(leaderProfileByEmailQuery, { email: token.email })
          .catch(() => null)

        token.isAuthorizedLeader = leader?.isActive === true
        token.leaderRole = (leader?.role as string) ?? null
        token.leaderName = (leader?.name as string) ?? token.name ?? null
      }
      // Keep account info from causing ts issues
      void account
      return token
    },
    async session({ session, token }) {
      session.user.isAuthorizedLeader = (token.isAuthorizedLeader as boolean | undefined) ?? false
      session.user.leaderRole = (token.leaderRole as string | null | undefined) ?? null
      session.user.leaderName = (token.leaderName as string | null | undefined) ?? null
      return session
    },
  },
})
