import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      isAuthorizedLeader: boolean
      leaderRoles: string[]
      leaderName: string | null
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    isAuthorizedLeader?: boolean
    leaderRoles?: string[]
    leaderName?: string | null
  }
}
