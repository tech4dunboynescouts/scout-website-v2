import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      isAuthorizedLeader: boolean
      leaderRole: string | null
      leaderName: string | null
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    isAuthorizedLeader?: boolean
    leaderRole?: string | null
    leaderName?: string | null
  }
}
