"use client"

import { useMemo, useState } from "react"
import { ArrowRight, Minus, Plus } from "lucide-react"

import { startAnnualSubscriptionsCheckoutAction } from "./actions"

type SectionKey = "beavers" | "cubs" | "scouts" | "ventures"

type PricingData = {
  currency: string
  sections: Array<{ key: SectionKey; label: string; unitPrice: number }>
}

export default function AnnualSubscriptionsForm({ pricing }: { pricing: PricingData }) {
  const initialState = useMemo(
    () => ({ beavers: 0, cubs: 0, scouts: 0, ventures: 0 }),
    []
  )
  const [quantities, setQuantities] = useState<Record<SectionKey, number>>(initialState)

  const total = useMemo(() => {
    return pricing.sections.reduce((sum, section) => {
      return sum + section.unitPrice * quantities[section.key]
    }, 0)
  }, [pricing.sections, quantities])

  const totalCount = useMemo(() => {
    return Object.values(quantities).reduce((sum, qty) => sum + qty, 0)
  }, [quantities])

  const money = new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: pricing.currency.toUpperCase(),
  })

  const setQuantity = (section: SectionKey, value: number) => {
    const safeValue = Number.isFinite(value) ? Math.max(0, Math.min(999, value)) : 0
    setQuantities((prev) => ({ ...prev, [section]: safeValue }))
  }

  return (
    <form action={startAnnualSubscriptionsCheckoutAction} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pricing.sections.map((section) => {
          const quantity = quantities[section.key]
          const subtotal = section.unitPrice * quantity

          return (
            <div
              key={section.key}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="font-display font-bold text-navy-dark text-xl">{section.label}</h2>
                  <p className="font-body text-sm text-textMuted mt-1">
                    Unit price: {money.format(section.unitPrice)}
                  </p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-widest text-textMuted">
                  Annual
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="inline-flex items-center rounded-xl border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setQuantity(section.key, quantity - 1)}
                    className="w-10 h-10 inline-flex items-center justify-center text-navy-dark hover:bg-gray-50 rounded-l-xl"
                    aria-label={`Decrease ${section.label} subscriptions`}
                  >
                    <Minus size={15} />
                  </button>
                  <input
                    type="number"
                    min={0}
                    max={999}
                    value={quantity}
                    onChange={(event) => setQuantity(section.key, Number(event.target.value))}
                    className="w-16 h-10 text-center font-body font-semibold text-navy-dark border-x border-gray-200 outline-none"
                    aria-label={`${section.label} quantity`}
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(section.key, quantity + 1)}
                    className="w-10 h-10 inline-flex items-center justify-center text-navy-dark hover:bg-gray-50 rounded-r-xl"
                    aria-label={`Increase ${section.label} subscriptions`}
                  >
                    <Plus size={15} />
                  </button>
                </div>

                <p className="font-body font-semibold text-navy-dark">
                  {quantity > 0 ? money.format(subtotal) : "-"}
                </p>
              </div>

              <input type="hidden" name={`${section.key}Qty`} value={quantity} />
            </div>
          )
        })}
      </div>

      <div className="bg-navy-dark rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="font-body text-white/70 text-sm">Total subscriptions</p>
            <p className="font-display text-3xl font-bold">{totalCount}</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="font-body text-white/70 text-sm">Total due</p>
            <p className="font-display text-3xl font-bold">{money.format(total)}</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={totalCount === 0}
          className="mt-5 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-orange-main text-white font-body font-semibold hover:bg-orange-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Proceed to Checkout
          <ArrowRight size={15} />
        </button>
      </div>
    </form>
  )
}
