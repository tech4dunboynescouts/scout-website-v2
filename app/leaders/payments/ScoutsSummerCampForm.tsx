"use client"

import { useMemo, useState } from "react"
import { ArrowRight } from "lucide-react"

import { startScoutsSummerCampCheckoutAction } from "./actions"

type SummerCampPaymentOption = {
  id: string
  title: string
  section: string
  currency: string
  stripePriceId: string
  amountOptions: number[]
}

type SummerCampPricingData = {
  currency: string
  options: SummerCampPaymentOption[]
}

function sectionLabel(section: string): string {
  if (!section) return "Other"
  return section[0].toUpperCase() + section.slice(1)
}

export default function ScoutsSummerCampForm({ pricing }: { pricing: SummerCampPricingData }) {
  const [selectedOptionId, setSelectedOptionId] = useState(pricing.options[0]?.id ?? "")

  const selectedOption = useMemo(
    () => pricing.options.find((option) => option.id === selectedOptionId) ?? pricing.options[0],
    [pricing.options, selectedOptionId]
  )

  const [selectedAmount, setSelectedAmount] = useState(selectedOption?.amountOptions[0]?.toFixed(2) ?? "")

  const money = useMemo(
    () =>
      new Intl.NumberFormat("en-IE", {
        style: "currency",
        currency: pricing.currency.toUpperCase(),
      }),
    [pricing.currency]
  )

  const availableAmounts = selectedOption?.amountOptions ?? []

  const handleOptionChange = (optionId: string) => {
    setSelectedOptionId(optionId)
    const nextOption = pricing.options.find((option) => option.id === optionId)
    setSelectedAmount(nextOption?.amountOptions[0]?.toFixed(2) ?? "")
  }

  const parsedAmount = Number(selectedAmount)
  const isValidAmount =
    Boolean(selectedOption) &&
    Number.isFinite(parsedAmount) &&
    parsedAmount > 0 &&
    availableAmounts.includes(parsedAmount)

  return (
    <form action={startScoutsSummerCampCheckoutAction} className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
        <h2 className="font-display font-bold text-navy-dark text-xl">Payee Details</h2>
        <p className="font-body text-sm text-textMuted mt-1">
          Add details so this payment can be identified in your transaction records.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label htmlFor="payeeName" className="block font-body text-sm font-semibold text-navy-dark mb-2">
              Payee Name
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
            <label
              htmlFor="payeeEmail"
              className="block font-body text-sm font-semibold text-navy-dark mb-2"
            >
              Payee Email
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
            <label
              htmlFor="payeeReference"
              className="block font-body text-sm font-semibold text-navy-dark mb-2"
            >
              Childs Name or Names
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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
        <h2 className="font-display font-bold text-navy-dark text-xl">Camp Payment Option</h2>
        <p className="font-body text-sm text-textMuted mt-1">
          Choose a summer camp payment option, then select an approved payment amount.
        </p>

        <div className="mt-4 max-w-xl">
          <label htmlFor="summerCampOption" className="block font-body text-sm font-semibold text-navy-dark mb-2">
            Option
          </label>
          <select
            id="summerCampOption"
            name="summerCampOptionId"
            required
            value={selectedOption?.id ?? ""}
            onChange={(event) => handleOptionChange(event.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 bg-white font-body text-navy-dark outline-none focus:ring-2 focus:ring-orange-main/40 focus:border-orange-main"
          >
            {pricing.options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.title} ({sectionLabel(option.section)})
              </option>
            ))}
          </select>
        </div>

        <h2 className="font-display font-bold text-navy-dark text-xl mt-6">Payment Amount</h2>
        <p className="font-body text-sm text-textMuted mt-1">
          Select how much you want to pay for the selected camp option.
        </p>

        <div className="mt-4 max-w-sm">
          <label htmlFor="summerCampAmount" className="block font-body text-sm font-semibold text-navy-dark mb-2">
            Amount
          </label>
          <select
            id="summerCampAmount"
            name="summerCampAmount"
            required
            value={selectedAmount}
            onChange={(event) => setSelectedAmount(event.target.value)}
            disabled={!selectedOption}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 bg-white font-body text-navy-dark outline-none focus:ring-2 focus:ring-orange-main/40 focus:border-orange-main"
          >
            {availableAmounts.map((amount) => {
              const value = amount.toFixed(2)
              return (
                <option key={value} value={value}>
                  {money.format(amount)}
                </option>
              )
            })}
          </select>
        </div>
      </div>

      <div className="bg-navy-dark rounded-2xl p-5 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="font-body text-white/70 text-sm">Payment category</p>
            <p className="font-display text-xl sm:text-2xl font-bold break-words">
              {selectedOption?.title ?? "Summer Camp"}
            </p>
            {selectedOption && (
              <p className="font-body text-white/70 text-sm mt-1">
                Section: {sectionLabel(selectedOption.section)}
              </p>
            )}
          </div>
          <div className="text-left sm:text-right">
            <p className="font-body text-white/70 text-sm">Total due</p>
            <p className="font-display text-2xl sm:text-3xl font-bold">
              {isValidAmount ? money.format(parsedAmount) : "-"}
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={!isValidAmount}
          className="mt-5 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-orange-main text-white font-body font-semibold hover:bg-orange-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Proceed to Checkout
          <ArrowRight size={15} />
        </button>
      </div>
    </form>
  )
}
