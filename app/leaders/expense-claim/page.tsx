import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import PageHero from "@/components/PageHero"
import ExpenseClaimForm from "@/components/ExpenseClaimForm"

export const metadata: Metadata = {
  title: "Expense Claim",
  description: "Submit an online expense claim for reimbursement via the Leaders Portal.",
}

export default async function ExpenseClaimPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/leaders/login")
  }
  if (!session.user.isAuthorizedLeader) {
    redirect("/leaders/unauthorized")
  }

  const leaderName = session.user.leaderName ?? session.user.name ?? "Leader"
  const leaderEmail = session.user.email ?? ""

  return (
    <>
      <PageHero
        title="Expense Claim"
        subtitle="Complete the form below to submit expenses for reimbursement. Receipts must be attached as PDF or JPEG files."
        breadcrumbs={[
          { label: "Leaders Portal", href: "/leaders/dashboard" },
          { label: "Expense Claim" },
        ]}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Submitter info banner */}
        <div className="mb-8 p-4 bg-navy-dark/5 border border-navy-dark/10 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-main/15 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="font-display font-bold text-orange-main text-sm select-none">
              {leaderName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-body font-semibold text-navy-dark text-sm">{leaderName}</p>
            <p className="font-body text-textMuted text-xs">{leaderEmail}</p>
          </div>
          <p className="ml-auto font-body text-textMuted text-xs hidden sm:block">
            Claim will be sent from this account
          </p>
        </div>

        {/* Expense form */}
        <ExpenseClaimForm />

        {/* Guidance note */}
        <p className="mt-6 font-body text-textMuted text-xs text-center">
          Receipts are sent directly as email attachments and are not stored on this website.
          Only PDF and JPEG files up to 10 MB per item are accepted, with a 10 MB combined attachment limit.
        </p>
      </div>
    </>
  )
}
