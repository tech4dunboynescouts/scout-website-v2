"use client"

import { useRef, useState, useCallback } from "react"
import { PlusCircle, Trash2, Receipt, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { submitExpenseClaim } from "@/app/leaders/expense-claim/actions"

const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg"]
const ALLOWED_ACCEPT = "application/pdf,image/jpeg"
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
const MAX_COMBINED_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024

interface ExpenseRow {
  id: number
  date: string
  description: string
  amount: string
  receipt: File | null
  receiptError: string
}

let nextId = 1

function createRow(): ExpenseRow {
  return { id: nextId++, date: "", description: "", amount: "", receipt: null, receiptError: "" }
}

function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 MB"
  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(1)} MB`
}

export default function ExpenseClaimForm() {
  const [rows, setRows] = useState<ExpenseRow[]>([createRow()])
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; error?: string } | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // ── Row mutation helpers ───────────────────────────────────────────────────
  const addRow = () => {
    if (rows.length >= 20) return
    setRows((prev) => [...prev, createRow()])
    setResult(null)
  }

  const removeRow = (id: number) => {
    if (rows.length === 1) return
    setRows((prev) => prev.filter((r) => r.id !== id))
    setResult(null)
  }

  const updateRow = useCallback(
    (id: number, field: keyof ExpenseRow, value: string | File | null) => {
      setRows((prev) =>
        prev.map((row) => {
          if (row.id !== id) return row
          return { ...row, [field]: value }
        })
      )
      setResult(null)
    },
    []
  )

  const handleFileChange = (id: number, files: FileList | null) => {
    const file = files?.[0] ?? null
    if (!file) {
      updateRow(id, "receipt", null)
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, receipt: null, receiptError: "" } : r))
      )
      return
    }

    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setRows((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, receipt: null, receiptError: "Only PDF or JPEG files are accepted." }
            : r
        )
      )
      return
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setRows((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, receipt: null, receiptError: "File exceeds the 10 MB limit." }
            : r
        )
      )
      return
    }

    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, receipt: file, receiptError: "" } : r))
    )
  }

  // ── Calculated total ───────────────────────────────────────────────────────
  const total = rows.reduce((sum, row) => {
    const n = parseFloat(row.amount)
    return sum + (Number.isNaN(n) ? 0 : n)
  }, 0)

  const totalAttachmentBytes = rows.reduce((sum, row) => sum + (row.receipt?.size ?? 0), 0)
  const isCombinedAttachmentLimitExceeded =
    totalAttachmentBytes > MAX_COMBINED_ATTACHMENT_SIZE_BYTES
  const attachmentUsagePercent = Math.min(
    100,
    Math.round((totalAttachmentBytes / MAX_COMBINED_ATTACHMENT_SIZE_BYTES) * 100)
  )
  const attachmentBarClass = isCombinedAttachmentLimitExceeded
    ? "bg-red-400"
    : attachmentUsagePercent >= 80
      ? "bg-amber-300"
      : "bg-emerald-300"

  // ── Form submission ────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setResult(null)
    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.set("itemCount", String(rows.length))

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        formData.set(`items[${i}][date]`, row.date)
        formData.set(`items[${i}][description]`, row.description)
        formData.set(`items[${i}][amount]`, row.amount)
        if (row.receipt) {
          formData.set(`items[${i}][receipt]`, row.receipt, row.receipt.name)
        }
      }

      const res = await submitExpenseClaim(formData)
      setResult(res)

      if (res.success) {
        // Reset form on success
        nextId = 1
        setRows([createRow()])
        formRef.current?.reset()
      }
    } catch {
      setResult({ success: false, error: "An unexpected error occurred. Please try again." })
    } finally {
      setSubmitting(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="w-full space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* ── Header row labels – desktop only ─────────────────────────────── */}
      <div className="hidden lg:grid lg:grid-cols-[160px_1fr_140px_200px_44px] gap-3 px-1 w-full overflow-x-hidden">
        <span className="font-body font-semibold text-navy-dark text-xs uppercase tracking-wide">
          Date <span className="text-red-500">*</span>
        </span>
        <span className="font-body font-semibold text-navy-dark text-xs uppercase tracking-wide">
          Description <span className="text-red-500">*</span>
        </span>
        <span className="font-body font-semibold text-navy-dark text-xs uppercase tracking-wide">
          Amount (€) <span className="text-red-500">*</span>
        </span>
        <span className="font-body font-semibold text-navy-dark text-xs uppercase tracking-wide">
          Receipt (PDF/JPEG) <span className="text-red-500">*</span>
        </span>
        <span />
      </div>

      {/* ── Expense rows ─────────────────────────────────────────────────── */}
      <div className="space-y-2 sm:space-y-3 w-full overflow-x-hidden">
        {rows.map((row, idx) => (
          <div
            key={row.id}
            className="bg-white border border-gray-100 rounded-2xl p-3 sm:p-4 shadow-sm w-full overflow-x-hidden"
          >
            {/* ── Mobile/tablet card header: index + remove button ──────── */}
            <div className="flex items-center justify-between mb-2 sm:mb-3 lg:hidden gap-2">
              <span className="font-body font-semibold text-navy-dark text-xs uppercase tracking-wide leading-tight">
                Expense #{idx + 1}
              </span>
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                disabled={rows.length === 1}
                aria-label={`Remove expense ${idx + 1}`}
                className="flex items-center gap-1 text-xs font-body text-gray-400 hover:text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
              >
                <Trash2 size={12} /> Remove
              </button>
            </div>

            {/* ── Desktop: 5-col inline layout ─────────────────────────── */}
            {/* ── Mobile: stacked full-width fields ──────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-[160px_1fr_140px_200px_44px] gap-2 sm:gap-3 items-start w-full overflow-x-hidden">

              {/* Date – col 1 */}
              <div className="w-full min-w-0">
                <label className="block font-body text-xs text-textMuted mb-1 sm:mb-1.5 lg:hidden truncate">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  max={new Date().toISOString().split("T")[0]}
                  value={row.date}
                  onChange={(e) => updateRow(row.id, "date", e.target.value)}
                  className="w-full h-9 sm:h-11 px-2 sm:px-3 rounded-xl border border-gray-200 font-body text-xs sm:text-sm text-navy-dark focus:outline-none focus:ring-2 focus:ring-orange-main/40 focus:border-orange-main bg-gray-50 box-border"
                />
              </div>

              {/* Description – col 2 */}
              <div className="w-full min-w-0">
                <label className="block font-body text-xs text-textMuted mb-1 sm:mb-1.5 lg:hidden truncate">
                  Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={200}
                  placeholder="e.g. Badge supplies…"
                  value={row.description}
                  onChange={(e) => updateRow(row.id, "description", e.target.value)}
                  className="w-full h-9 sm:h-11 px-2 sm:px-3 rounded-xl border border-gray-200 font-body text-xs sm:text-sm text-navy-dark placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-main/40 focus:border-orange-main bg-gray-50 box-border"
                />
              </div>

              {/* Amount – col 3 */}
              <div className="w-full min-w-0">
                <label className="block font-body text-xs text-textMuted mb-1 sm:mb-1.5 lg:hidden truncate">
                  Amount (€) <span className="text-red-500">*</span>
                </label>
                <div className="relative w-full">
                  <span className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 font-body text-xs sm:text-sm text-textMuted pointer-events-none">
                    €
                  </span>
                  <input
                    type="number"
                    required
                    min="0.01"
                    max="100000"
                    step="0.01"
                    placeholder="0.00"
                    value={row.amount}
                    onChange={(e) => updateRow(row.id, "amount", e.target.value)}
                    className="w-full h-9 sm:h-11 pl-5 sm:pl-7 pr-2 sm:pr-3 rounded-xl border border-gray-200 font-body text-xs sm:text-sm text-navy-dark placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-main/40 focus:border-orange-main bg-gray-50 box-border"
                  />
                </div>
              </div>

              {/* Receipt upload – col 4 */}
              <div className="w-full min-w-0">
                <label className="block font-body text-xs text-textMuted mb-1 sm:mb-1.5 lg:hidden truncate">
                  Receipt (PDF/JPEG) <span className="text-red-500">*</span>
                </label>
                <label className="flex items-center gap-1 sm:gap-2 cursor-pointer w-full min-w-0">
                  <span
                    className={`flex-1 flex items-center gap-1 sm:gap-2 h-9 sm:h-11 px-2 sm:px-3 rounded-xl border font-body text-xs transition-colors min-w-0 ${
                      row.receiptError
                        ? "border-red-400 bg-red-50 text-red-600"
                        : row.receipt
                          ? "border-green-400 bg-green-50 text-green-700"
                          : "border-gray-200 bg-gray-50 text-gray-400 hover:border-orange-main/50"
                    }`}
                  >
                    <Receipt size={12} className="flex-shrink-0" />
                    <span className="truncate min-w-0 block">
                      {row.receiptError
                        ? row.receiptError
                        : row.receipt
                          ? row.receipt.name
                          : "Attach…"}
                    </span>
                  </span>
                  <input
                    type="file"
                    accept={ALLOWED_ACCEPT}
                    className="sr-only"
                    onChange={(e) => handleFileChange(row.id, e.target.files)}
                  />
                </label>
                {row.receiptError && (
                  <p className="mt-0.5 font-body text-xs text-red-600 break-words">{row.receiptError}</p>
                )}
              </div>

              {/* Remove row – col 5 on desktop, hidden on mobile (header has remove button) */}
              <div className="hidden lg:flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  disabled={rows.length === 1}
                  aria-label="Remove expense item"
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Add row button ────────────────────────────────────────────────── */}
      {rows.length < 20 && (
        <button
          type="button"
          onClick={addRow}
          className="flex items-center justify-center sm:justify-start gap-2 font-body text-xs sm:text-sm text-orange-main hover:text-orange-600 font-semibold transition-colors w-full overflow-x-hidden"
        >
          <PlusCircle size={16} /> <span className="block sm:inline">Add another expense</span>
        </button>
      )}

      {/* ── Summary and CTA layout ───────────────────────────────────────── */}
      <div className="w-full overflow-x-hidden grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-4 lg:gap-6 items-start lg:items-stretch">
        <div className="w-full h-12 sm:h-14 bg-white border border-gray-200 rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 shadow-sm flex flex-col justify-center">
          <div className="flex items-center justify-between gap-3">
            <p className="font-body font-semibold text-[10px] sm:text-xs uppercase tracking-wide text-navy-dark leading-none">
              Combined Attachment(s) Size
            </p>
            <p className="font-body text-[10px] sm:text-xs text-textMuted whitespace-nowrap leading-none">
              {formatBytes(totalAttachmentBytes)} / {formatBytes(MAX_COMBINED_ATTACHMENT_SIZE_BYTES)}
            </p>
          </div>
          <div className="mt-1 h-1.5 sm:h-2 w-full rounded-full bg-gray-200 overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={attachmentUsagePercent} aria-label="Combined attachment size usage">
            <div
              className={`h-full rounded-full transition-all duration-300 ${attachmentBarClass}`}
              style={{ width: `${attachmentUsagePercent}%` }}
            />
          </div>
        </div>

        <div className="w-full flex flex-col gap-3">
          <div className="w-full h-12 sm:h-14 bg-navy-dark rounded-2xl border-2 border-orange-main/60 shadow-lg px-3 sm:px-4 py-2 sm:py-2.5 text-left min-w-0 flex items-center justify-between gap-3">
            <p className="font-body text-white/70 text-[10px] sm:text-xs uppercase tracking-wide truncate leading-none">
              Total Claimed
            </p>
            <p className="font-display font-bold text-white text-xl sm:text-2xl break-words leading-none whitespace-nowrap">
              {total > 0
                ? new Intl.NumberFormat("en-IE", {
                    style: "currency",
                    currency: "EUR",
                  }).format(total)
                : "€0.00"}
            </p>
          </div>

          <button
            type="submit"
            disabled={
              submitting ||
              rows.some((r) => r.receiptError !== "") ||
              isCombinedAttachmentLimitExceeded
            }
            className="w-full min-h-12 sm:min-h-14 flex items-center justify-center gap-2 bg-orange-main hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-body font-semibold text-sm sm:text-base px-5 sm:px-8 py-3 sm:py-4 rounded-2xl transition-colors shadow-md sm:shadow-lg"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Submitting…
              </>
            ) : (
              "Submit Claim"
            )}
          </button>
        </div>
      </div>

      {isCombinedAttachmentLimitExceeded && (
        <p className="font-body text-xs text-red-600">
          Combined attachment size exceeds 10 MB. Remove one or more receipts before submitting.
        </p>
      )}

      {/* ── Result banner ─────────────────────────────────────────────────── */}
      {result && (
        <div
          role="alert"
          className={`flex items-start gap-3 rounded-2xl p-4 w-full overflow-x-hidden ${
            result.success
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {result.success ? (
            <CheckCircle2 size={20} className="flex-shrink-0 mt-0.5 text-green-600" />
          ) : (
            <XCircle size={20} className="flex-shrink-0 mt-0.5 text-red-500" />
          )}
          <div>
            {result.success ? (
              <>
                <p className="font-body font-semibold text-sm">Expense claim submitted!</p>
                <p className="font-body text-sm mt-0.5">
                  Your claim has been sent to the treasurer and a copy has been emailed to you.
                </p>
              </>
            ) : (
              <>
                <p className="font-body font-semibold text-sm">Submission failed</p>
                {result.error && (
                  <p className="font-body text-sm mt-0.5">{result.error}</p>
                )}
              </>
            )}
          </div>
        </div>
      )}

    </form>
  )
}
