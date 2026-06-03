"use client"

import { useMemo, useState } from "react"
import { ArrowRight } from "lucide-react"

import { startPublicCampPaymentsCheckoutAction } from "../actions"

type CampPaymentOption = {
  id: string
  title: string
  section: string
  currency: string
  amountOptions: number[]
}

type CampPricingData = {
  currency: string
  options: CampPaymentOption[]
}

function sectionLabel(section: string): string {
  if (!section) return "Other"
  return section[0].toUpperCase() + section.slice(1)
}

export default function PublicCampPaymentsForm({ pricing }: { pricing: CampPricingData }) {
  const [selectedOptionId, setSelectedOptionId] = useState("")

  const selectedOption = useMemo(
    () => pricing.options.find((o) => o.id === selectedOptionId),
    [pricing.options, selectedOptionId]
  )

  const [selectedAmount, setSelectedAmount] = useState("")

  const money = useMemo(
    () => new Intl.NumberFormat("en-IE", { style: "currency", currency: pricing.currency.toUpperCase() }),
    [pricing.currency]
  )

  const availableAmounts = selectedOption?.amountOptions ?? []
  const parsedAmount = Number(selectedAmount)
  const isValidAmount =
    Boolean(selectedOption) &&
    Number.isFinite(parsedAmount) &&
    parsedAmount > 0 &&
    availableAmounts.includes(parsedAmount)

  const handleOptionChange = (optionId: string) => {
    setSelectedOptionId(optionId)
    const nextOption = pricing.options.find((o) => o.id === optionId)
    setSelectedAmount(nextOption?.amountOptions[0]?.toFixed(2) ?? "")
  }

  return (
    <form action={startPublicCampPaymentsCheckoutAction} className="space-y-6">
      {/* Payee details */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
        <h2 className="font-display font-bold text-navy-dark text-xl">Your Details</h2>
        <p className="font-body text-sm text-textMuted mt-1">
          Please provide your details so we can identify this payment and send a confirmation.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label htmlFor="payeeName" className="block font-body text-sm font-semibold text-navy-dark mb-2">
              Your Name <span className="text-red-500">*</span>
            </label>
            <input
              id="payeeName"
              name="payeeName"
              type="text"
              required
              maxLength={120}
              placeholder="e.g. John Murphy"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 font-body text-navy-dark outline-none focus:ring-2 focus:ring-orange-main/40 focus:border-orange-main"
            />
          </div>
          <div>
            <label htmlFor="payeeEmail" className="block font-body text-sm font-semibold text-navy-dark mb-2">
              Your Email <span className="text-red-500">*</span>
            </label>
            <input
              id="payeeEmail"
              name="payeeEmail"
              type="email"
              required
              maxLength={254}
              placeholder="e.g. parent@example.com"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 font-body text-navy-dark outline-none focus:ring-2 focus:ring-orange-main/40 focus:border-orange-main"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="payeeReference" className="block font-body text-sm font-semibold text-navy-dark mb-2">
              Child&apos;s Name or Names <span className="text-red-500">*</span>
            </label>
            <input
              id="payeeReference"
              name="payeeReference"
              type="text"
              required
              maxLength={160}
              placeholder="e.g. Alex Murphy, Sam Murphy"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 font-body text-navy-dark outline-none focus:ring-2 focus:ring-orange-main/40 focus:border-orange-main"
            />
          </div>
        </div>
      </div>

      {/* Camp option + amount */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
        <h2 className="font-display font-bold text-navy-dark text-xl">Payment Option</h2>
        <p className="font-body text-sm text-textMuted mt-1">
          Choose a camp payment option, then select an approved payment amount.
        </p>

        <div className="mt-4 max-w-xl">
          <label htmlFor="summerCampOption" className="block font-body text-sm font-semibold text-navy-dark mb-2">
            Camp / Activity
          </label>
          <select
            id="summerCampOption"
            name="summerCampOptionId"
            required
            value={selectedOptionId}
            onChange={(e) => handleOptionChange(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 bg-white font-body text-navy-dark outline-none focus:ring-2 focus:ring-orange-main/40 focus:border-orange-main"
          >
            <option value="">Select a Camp to make a Payment for.</option>
            {pricing.options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.title} ({sectionLabel(option.section)})
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 max-w-sm">
          <label htmlFor="summerCampAmount" className="block font-body text-sm font-semibold text-navy-dark mb-2">
            Amount
          </label>
          <select
            id="summerCampAmount"
            name="summerCampAmount"
            required
            value={selectedAmount}
            onChange={(e) => setSelectedAmount(e.target.value)}
            disabled={!selectedOption}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 bg-white font-body text-navy-dark outline-none focus:ring-2 focus:ring-orange-main/40 focus:border-orange-main disabled:bg-gray-100 disabled:text-gray-400"
          >
            {!selectedOption ? (
              <option value="">Select a camp first</option>
            ) : (
              availableAmounts.map((amount) => {
                const value = amount.toFixed(2)
                return (
                  <option key={value} value={value}>
                    {money.format(amount)}
                  </option>
                )
              })
            )}
          </select>
        </div>
      </div>

      {/* Total + submit */}
      <div className="bg-navy-dark rounded-2xl p-5 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="font-body text-white/70 text-sm">Payment for</p>
            <p className="font-display text-xl sm:text-2xl font-bold break-words">
              {selectedOption?.title ?? "Camp Payment"}
            </p>
            {selectedOption && (
              <p className="font-body text-white/60 text-sm mt-0.5">
                {sectionLabel(selectedOption.section)}
              </p>
            )}
          </div>
          <div className="text-left sm:text-right">
            <p className="font-body text-white/70 text-sm">Total due</p>
            <p className="font-display text-2xl sm:text-3xl font-bold">
              {isValidAmount ? money.format(parsedAmount) : "—"}
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={!isValidAmount}
          className="mt-5 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-orange-main text-white font-body font-semibold hover:bg-orange-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Proceed to Payment <ArrowRight size={16} />
        </button>
      </div>
    </form>
  )
}
