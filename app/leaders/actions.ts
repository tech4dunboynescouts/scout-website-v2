"use server"

import { signIn, signOut } from "@/auth"

export async function handleGoogleSignIn() {
  await signIn("google", { redirectTo: "/leaders/dashboard" })
}

export async function handleSignOut() {
  await signOut({ redirectTo: "/" })
}
