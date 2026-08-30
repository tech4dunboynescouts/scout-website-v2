"use client"

import Image from "next/image"
import { useMemo, useState } from "react"
import { ArrowRight, Minus, Plus } from "lucide-react"

import { startPublicAnnualSubscriptionsCheckoutAction } from "../actions"

type SectionKey = "beavers" | "cubs" | "scouts" | "ventures" | "rovers"

type PricingData = {
  currency: string
  sections: Array<{ key: SectionKey; label: string; unitPrice: number }>
  maximumSubscriptionFee?: number
}

const sectionVisuals: Record<SectionKey, { src: string; alt: string; accentClass: string }> = {
  beavers: {
    src: "/images/beaver_scouts_scouting_ireland.svg_.webp",
    alt: "Beavers",
    accentClass: "bg-red-50 border-red-100",
  },
  cubs: {
    src: "/images/cub_scouts_scouting_ireland.svg_.webp",
    alt: "Cubs",
    accentClass: "bg-emerald-50 border-emerald-100",
  },
  scouts: {
    src: "/images/scouts_scouting_ireland.svg_.webp",
    alt: "Scouts",
    accentClass: "bg-orange-50 border-orange-100",
  },
  ventures: {
    src: "/images/venture_scouts_scouting_ireland.svg_.webp",
    alt: "Ventures",
    accentClass: "bg-violet-50 border-violet-100",
  },
  rovers: {
    src: "/images/photo-1464822759023-fed622ff2c3b.jpg",
    alt: "Rovers",
    accentClass: "bg-purple-50 border-purple-100",
  },
}

export default function PublicAnnualSubscriptionsForm({ pricing }: { pricing: PricingData }) {
  const [quantities, setQuantities] = useState<Record<SectionKey, number>>({
    beavers: 0, cubs: 0, scouts: 0, ventures: 0, rovers: 0,
  })
  const [paymentMethod, setPaymentMethod] = useState<"full" | "installments">("full")

  const total = useMemo(() => {
    const subtotal = pricing.sections.reduce(
      (sum, section) => sum + section.unitPrice * quantities[section.key],
      0
    )
    if (pricing.maximumSubscriptionFee && subtotal > pricing.maximumSubscriptionFee) {
      return pricing.maximumSubscriptionFee
    }
    return subtotal
  }, [pricing.sections, pricing.maximumSubscriptionFee, quantities])

  const totalCount = useMemo(
    () => Object.values(quantities).reduce((sum, qty) => sum + qty, 0),
    [quantities]
  )

  const money = new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: pricing.currency.toUpperCase(),
  })

  const setQuantity = (section: SectionKey, value: number) => {
    const safeValue = Number.isFinite(value) ? Math.max(0, Math.min(999, value)) : 0
    setQuantities((prev) => ({ ...prev, [section]: safeValue }))
  }

  return (
    <form action={startPublicAnnualSubscriptionsCheckoutAction} className="space-y-6">
      <input type="hidden" name="paymentMethod" value={paymentMethod} />

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

      {/* Payment method selector */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
        <h2 className="font-display font-bold text-navy-dark text-xl">Payment Method</h2>
        <p className="font-body text-sm text-textMuted mt-1">
          Choose how you would like to pay for your subscriptions.
        </p>
        <fieldset className="mt-4 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="paymentMethod"
              value="full"
              checked={paymentMethod === "full"}
              onChange={(e) => setPaymentMethod(e.target.value as "full" | "installments")}
              className="w-4 h-4 cursor-pointer"
            />
            <div className="flex-1">
              <p className="font-body font-semibold text-navy-dark">Pay in Full</p>
              <p className="font-body text-sm text-textMuted">Pay the entire amount today</p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="paymentMethod"
              value="installments"
              checked={paymentMethod === "installments"}
              onChange={(e) => setPaymentMethod(e.target.value as "full" | "installments")}
              className="w-4 h-4 cursor-pointer"
            />
            <div className="flex-1">
              <p className="font-body font-semibold text-navy-dark">4 Monthly Instalments</p>
              <p className="font-body text-sm text-textMuted">
                Split payment into 4 equal monthly charges
              </p>
            </div>
          </label>
        </fieldset>
      </div>

      {/* Section quantities */}
      <div className="space-y-4">
        {pricing.sections.map((section) => {
          const quantity = quantities[section.key]
          const subtotal = section.unitPrice * quantity
          const visual = sectionVisuals[section.key]

          return (
            <div key={section.key} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-4 w-full">
                  <div className={`shrink-0 rounded-xl border p-1 ${visual.accentClass}`}>
                    <Image
                      src={visual.src}
                      alt={visual.alt}
                      width={72}
                      height={72}
                      className="w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] rounded-lg object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-navy-dark text-xl">{section.label}</h3>
                    <p className="font-body text-sm text-textMuted mt-1">
                      {money.format(section.unitPrice)} per member
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="inline-flex items-center rounded-xl border border-gray-200 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setQuantity(section.key, quantity - 1)}
                    className="w-11 sm:w-10 h-10 inline-flex items-center justify-center text-navy-dark hover:bg-gray-50 rounded-l-xl"
                    aria-label={`Decrease ${section.label}`}
                  >
                    <Minus size={15} />
                  </button>
                  <input
                    type="number"
                    name={`${section.key}Qty`}
                    value={quantity}
                    onChange={(e) => setQuantity(section.key, Number.parseInt(e.target.value, 10))}
                    min={0}
                    max={999}
                    className="w-full sm:w-14 h-10 text-center font-body text-navy-dark outline-none border-x border-gray-200 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(section.key, quantity + 1)}
                    className="w-11 sm:w-10 h-10 inline-flex items-center justify-center text-navy-dark hover:bg-gray-50 rounded-r-xl"
                    aria-label={`Increase ${section.label}`}
                  >
                    <Plus size={15} />
                  </button>
                </div>
                {quantity > 0 && (
                  <span className="font-body text-sm text-textMuted">
                    {quantity} × {money.format(section.unitPrice)} = {money.format(subtotal)}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Total + submit */}
      <div className="bg-navy-dark rounded-2xl p-5 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="font-body text-white/70 text-sm">
              {totalCount} member{totalCount !== 1 ? "s" : ""} selected
            </p>
            {pricing.maximumSubscriptionFee && (
              <p className="font-body text-white/50 text-xs mt-0.5">
                Maximum fee: {money.format(pricing.maximumSubscriptionFee)}
              </p>
            )}
          </div>
          <div className="text-left sm:text-right">
            <p className="font-body text-white/70 text-sm">Total due</p>
            <p className="font-display text-2xl sm:text-3xl font-bold">{money.format(total)}</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={totalCount === 0}
          className="mt-5 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-orange-main text-white font-body font-semibold hover:bg-orange-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Proceed to Payment <ArrowRight size={16} />
        </button>
      </div>
    </form>
  )
}

