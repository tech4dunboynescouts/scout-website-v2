import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { processExpenseClaimSubmission } from "@/app/leaders/expense-claim/submitExpenseClaim"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const session = await auth()
    const formData = await request.formData()
    const result = await processExpenseClaimSubmission(formData, session?.user)
    const status = result.success ? 200 : result.error === "Unauthorised" ? 401 : 400
    return NextResponse.json(result, { status })
  } catch (error) {
    console.error("Expense claim route failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred while processing the expense claim.",
      },
      { status: 500 }
    )
  }
}