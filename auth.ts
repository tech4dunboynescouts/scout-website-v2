import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { serverClient } from "@/sanity/lib/serverClient"
import { leaderProfileByEmailQuery } from "@/sanity/lib/queries"
import { authConfig } from "./auth.config"

// Only register the Google provider when credentials are present so that the
// login page can still render during local development before OAuth is configured.
const providers = process.env.AUTH_GOOGLE_ID ? [Google] : []

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, trigger, account }) {
      // Query Sanity only on initial sign-in, not on every token refresh
      if (trigger === "signIn" && token.email) {
        const leader = await serverClient
          .fetch(leaderProfileByEmailQuery, { email: token.email })
          .catch(() => null)

        token.isAuthorizedLeader = leader?.isActive === true
        token.leaderRole = (leader?.role as string) ?? null
        token.leaderName = (leader?.name as string) ?? token.name ?? null
      }
      void account
      return token
    },
  },
})
