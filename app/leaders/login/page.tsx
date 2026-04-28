import type { Metadata } from "next"
import Image from "next/image"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { handleGoogleSignIn } from "@/app/leaders/actions"
import { Shield } from "lucide-react"

export const metadata: Metadata = {
  title: "Leaders Portal Login",
  robots: { index: false, follow: false },
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const session = await auth()
  if (session?.user?.isAuthorizedLeader) redirect("/leaders/dashboard")

  const { error } = await searchParams

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-navy-dark px-8 py-10 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-white/20">
                <Image
                  src="/images/logo.jpg"
                  alt="1st Meath Dunboyne Scout Group"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <Shield size={14} className="text-orange-main" />
              <span className="text-orange-main text-xs font-body font-semibold uppercase tracking-widest">
                Leaders Portal
              </span>
            </div>
            <h1 className="font-display font-bold text-white text-2xl">
              1st Meath Dunboyne
            </h1>
            <p className="text-white/50 font-body text-sm mt-1">Scout Group</p>
          </div>

          {/* Body */}
          <div className="px-8 py-8">
            {error === "unauthorized" ? (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-center">
                <p className="text-red-700 font-body text-sm font-semibold mb-1">
                  Access not granted
                </p>
                <p className="text-red-600 font-body text-xs">
                  Your Google account is not registered as an active leader. Contact the Group
                  Leader to request access.
                </p>
              </div>
            ) : (
              <p className="text-textMuted font-body text-sm text-center mb-6 leading-relaxed">
                Sign in with your Google account to access meeting notes, documents, and
                announcements.
              </p>
            )}

            <form action={handleGoogleSignIn}>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-3 px-5 py-3 bg-white border border-gray-200 rounded-xl font-body font-semibold text-navy-dark text-sm hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
              >
                <GoogleIcon />
                Continue with Google
              </button>
            </form>

            <p className="text-textMuted font-body text-xs text-center mt-6">
              Access is restricted to registered leaders.
              <br />
              Not a leader?{" "}
              <a href="/" className="text-orange-main hover:underline">
                Return to main site
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
