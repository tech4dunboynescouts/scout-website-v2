"use server"

import { auth } from "@/auth"
import {
  processExpenseClaimSubmission,
  type SubmitExpenseClaimResult,
} from "./submitExpenseClaim"

export async function submitExpenseClaim(
  formData: FormData
): Promise<SubmitExpenseClaimResult> {
  const session = await auth()
  return processExpenseClaimSubmission(formData, session?.user)
}
