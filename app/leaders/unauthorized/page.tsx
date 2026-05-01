import type { Metadata } from "next"
import Link from "next/link"
import { handleSignOut } from "@/app/leaders/actions"
import { ShieldX } from "lucide-react"

export const metadata: Metadata = {
  title: "Access Denied, Leaders Portal",
  robots: { index: false, follow: false },
}

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
            <ShieldX size={32} className="text-red-400" />
          </div>
        </div>

        <h1 className="font-display font-bold text-navy-dark text-2xl mb-3">
          Access Not Granted
        </h1>
        <p className="font-body text-textMuted text-sm leading-relaxed mb-8">
          Your Google account is not registered as an active leader for 1st Meath Dunboyne
          Scout Group. If you believe this is an error, please contact the Group Leader to
          have your email added to the system.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-5 py-2.5 bg-navy-dark text-white font-body font-semibold rounded-lg text-sm hover:bg-navy-dark/90 transition-colors"
          >
            Return to Main Site
          </Link>
          <form action={handleSignOut}>
            <button
              type="submit"
              className="px-5 py-2.5 bg-white border border-gray-200 text-textMuted font-body font-semibold rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

