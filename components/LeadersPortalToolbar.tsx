"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { handleSignOut } from "@/app/leaders/actions"
import { Shield, LayoutDashboard, CreditCard, FileText, LogOut } from "lucide-react"

interface LeadersPortalToolbarProps {
  isAuthorized: boolean
  userName?: string | null
}

const hiddenPaths = new Set(["/leaders", "/leaders/login", "/leaders/unauthorized"])

export default function LeadersPortalToolbar({
  isAuthorized,
  userName,
}: LeadersPortalToolbarProps) {
  const pathname = usePathname()

  if (!isAuthorized) return null
  if (!pathname) return null

  const shouldHide =
    hiddenPaths.has(pathname) ||
    pathname.startsWith("/leaders/login/") ||
    pathname.startsWith("/leaders/unauthorized/")

  if (shouldHide) return null

  return (
    <div className="bg-navy-dark/95 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:h-10 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4 flex-wrap">
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

        <div className="flex items-center gap-3 sm:gap-4">
          <span className="text-white/40 text-xs font-body hidden sm:block">{userName}</span>
          <form action={handleSignOut} className="hidden sm:block">
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
  )
}