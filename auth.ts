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
      // Re-check the profile so changing Active in Sanity takes effect for existing sessions.
      if (token.email) {
        const leader = await serverClient
          .fetch(leaderProfileByEmailQuery, { email: token.email.trim().toLowerCase() })
          .catch(() => null)

        token.isAuthorizedLeader = leader?.isActive === true
        token.leaderRoles = (leader?.roles as string[]) ?? []
        token.leaderName = (leader?.name as string) ?? token.name ?? null
      }
      void account
      return token
    },
    async session({ session, token }) {
      const email = token.email ?? session.user.email
      const leader = email
        ? await serverClient
            .fetch(leaderProfileByEmailQuery, { email: email.trim().toLowerCase() })
            .catch(() => null)
        : null

      session.user.isAuthorizedLeader = leader?.isActive === true
      session.user.leaderRoles = (leader?.roles as string[]) ?? []
      session.user.leaderName = (leader?.name as string) ?? session.user.name ?? null
      return session
    },
  },
})
