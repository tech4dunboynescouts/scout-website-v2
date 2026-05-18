import { auth } from "@/auth"
import Link from "next/link"
import { handleSignOut } from "@/app/leaders/actions"
import { Shield, LayoutDashboard, CreditCard, FileText, LogOut } from "lucide-react"

export default async function LeadersLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const isAuthorized = session?.user?.isAuthorizedLeader === true

  return (
    <>
      {isAuthorized && (
        <div className="bg-navy-dark/95 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <span className="flex items-center gap-1.5 text-orange-main text-xs font-body font-semibold">
                <Shield size={11} /> Leaders Portal
              </span>
              <Link
                href="/leaders/dashboard"
                className="flex items-center gap-1.5 text-white/60 hover:text-white text-xs font-body transition-colors"
              >
                <LayoutDashboard size={11} /> Dashboard
              </Link>
              <Link
                href="/leaders/payments"
                className="flex items-center gap-1.5 text-white/60 hover:text-white text-xs font-body transition-colors"
              >
                <CreditCard size={11} /> Payments
              </Link>
              <Link
                href="/leaders/expense-claim"
                className="flex items-center gap-1.5 text-white/60 hover:text-white text-xs font-body transition-colors"
              >
                <FileText size={11} /> Expense Claim
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-white/40 text-xs font-body hidden sm:block">
                {session.user.name}
              </span>
              <form action={handleSignOut}>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 text-white/60 hover:text-white text-xs font-body transition-colors"
                >
                  <LogOut size={11} /> Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      {children}
    </>
  )
}
