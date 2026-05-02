"use client"

import type { Metadata } from "next"
import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, Calculator, AlertTriangle, CheckCircle2, Users, UsersRound } from "lucide-react"

// ── Types ──────────────────────────────────────────────────────────────────────

type Section = "beavers" | "cubs" | "scouts" | "ventures"
type ActivityType = "standard" | "overnight" | "international"

interface RatioRule {
  base: number
  baseMax: number
  increment: number
}

// ── Calculation logic ─────────────────────────────────────────────────────────
// Rules sourced from Scouting Ireland Leader-to-Child Ratios policy.

function getRule(section: Section, activity: ActivityType): RatioRule | null {
  if (section === "ventures") return null // fixed minimum — handled separately

  if (section === "beavers") {
    if (activity === "standard")     return { base: 3, baseMax: 16, increment: 8 }
    if (activity === "overnight")    return { base: 3, baseMax: 16, increment: 4 }
    if (activity === "international") return { base: 4, baseMax: 16, increment: 4 }
  }

  if (section === "cubs") {
    if (activity === "standard" || activity === "overnight")
      return { base: 3, baseMax: 16, increment: 8 }
    if (activity === "international") return { base: 3, baseMax: 16, increment: 6 }
  }

  if (section === "scouts") {
    // Same rule for all activity types
    return { base: 2, baseMax: 16, increment: 8 }
  }

  return null
}

function calculate(
  section: Section,
  activity: ActivityType,
  youth: number
): number {
  if (section === "ventures") return 2

  const rule = getRule(section, activity)
  if (!rule) return 2

  if (youth <= rule.baseMax) return rule.base
  return rule.base + Math.ceil((youth - rule.baseMax) / rule.increment)
}

// ── Labels ────────────────────────────────────────────────────────────────────

const sectionLabels: Record<Section, string> = {
  beavers:  "Beavers",
  cubs:     "Cubs",
  scouts:   "Scouts",
  ventures: "Ventures",
}

const activityLabels: Record<ActivityType, string> = {
  standard:      "Standard Activity / Meeting",
  overnight:     "Overnight",
  international: "International Trip",
}

const sectionColours: Record<Section, string> = {
  beavers:  "bg-orange-500",
  cubs:     "bg-blue-600",
  scouts:   "bg-emerald-600",
  ventures: "bg-purple-600",
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function RatiosCalculatorPage() {
  const [section, setSection]    = useState<Section>("beavers")
  const [activity, setActivity]  = useState<ActivityType>("standard")
  const [youth, setYouth]        = useState("")
  const [result, setResult]      = useState<number | null>(null)
  const [error, setError]        = useState("")
  const [mixedGender, setMixedGender] = useState(false)

  // Cubs: international is the only distinct type; standard & overnight are identical.
  // Scouts: activity type doesn't change the ratio but we still show the toggle
  // so the UI is consistent and the user can record what they're planning.
  const showActivityToggle = section !== "ventures"

  function handleCalculate() {
    const n = parseInt(youth, 10)
    if (!youth || isNaN(n) || n < 1) {
      setError("Please enter a valid number of youth members (minimum 1).")
      setResult(null)
      return
    }
    if (n > 500) {
      setError("Please enter a realistic number of youth members (max 500).")
      setResult(null)
      return
    }
    setError("")
    setResult(calculate(section, activity, n))
  }

  function handleReset() {
    setYouth("")
    setResult(null)
    setError("")
    setMixedGender(false)
  }

  const isVentures = section === "ventures"
  const colourDot = sectionColours[section]

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">

        {/* Back link */}
        <Link
          href="/leaders/dashboard"
          className="inline-flex items-center gap-2 text-sm font-body text-textMuted hover:text-navy-dark transition-colors mb-8"
        >
          <ArrowLeft size={15} /> Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-main/10 rounded-xl flex items-center justify-center">
              <Calculator size={20} className="text-orange-main" />
            </div>
            <p className="text-orange-main font-body font-semibold text-sm uppercase tracking-widest">
              Leaders Portal Tool
            </p>
          </div>
          <h1 className="font-display font-bold text-navy-dark text-3xl sm:text-4xl leading-tight">
            Leader to Youth Member Ratio Calculator
          </h1>
          <p className="font-body text-textMuted text-sm mt-3">
            Based on Scouting Ireland policy. Select your section, activity type,
            and number of youth members to calculate the minimum number of Scouters required.
          </p>
        </div>

        {/* Calculator card */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">

          {/* Section selector */}
          <div>
            <label className="block font-body font-semibold text-navy-dark text-sm mb-3">
              Section
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(Object.keys(sectionLabels) as Section[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSection(s)
                    setResult(null)
                    setError("")
                  }}
                  className={`py-2.5 px-3 rounded-xl text-sm font-body font-medium border-2 transition-all ${
                    section === s
                      ? "border-orange-main bg-orange-main text-white shadow-sm"
                      : "border-gray-200 bg-white text-navy-dark hover:border-orange-main/50"
                  }`}
                >
                  {sectionLabels[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Activity type toggle */}
          {showActivityToggle && (
            <div>
              <label className="block font-body font-semibold text-navy-dark text-sm mb-3">
                Activity Type
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                {(Object.keys(activityLabels) as ActivityType[]).map((a) => (
                  <label
                    key={a}
                    className={`flex items-center gap-3 flex-1 cursor-pointer rounded-xl border-2 px-4 py-3 transition-all ${
                      activity === a
                        ? "border-orange-main bg-orange-main/5"
                        : "border-gray-200 hover:border-orange-main/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="activity"
                      value={a}
                      checked={activity === a}
                      onChange={() => {
                        setActivity(a)
                        setResult(null)
                        setError("")
                      }}
                      className="accent-orange-main w-4 h-4 flex-shrink-0"
                    />
                    <span className="font-body text-sm text-navy-dark">
                      {activityLabels[a]}
                    </span>
                  </label>
                ))}
              </div>
              {/* Helpful note for Cubs where standard/overnight are identical */}
              {section === "cubs" && activity !== "international" && (
                <p className="text-xs font-body text-textMuted mt-2">
                  For Cubs, the same ratio applies to both Standard and Overnight activities.
                </p>
              )}
              {/* Helpful note for Scouts where activity type doesn't change ratio */}
              {section === "scouts" && (
                <p className="text-xs font-body text-textMuted mt-2">
                  For Scouts, the same ratio (2 for 1–16, +1 per 8) applies to all activity types.
                </p>
              )}
            </div>
          )}

          {/* Venture note */}
          {isVentures && (
            <div className="flex items-start gap-3 p-4 bg-purple-50 border border-purple-200 rounded-xl">
              <Users size={18} className="text-purple-600 flex-shrink-0 mt-0.5" />
              <p className="font-body text-sm text-purple-700">
                For Venture Scouts, a minimum of <strong>2 Scouters</strong> is required at all
                times, regardless of group size (up to reasonable safety limits).
              </p>
            </div>
          )}

          {/* Mixed-gender toggle */}
          <div>
            <label className="block font-body font-semibold text-navy-dark text-sm mb-3">
              Mixed-Gender Group?
            </label>
            <div className="flex gap-3">
              {([false, true] as const).map((val) => (
                <label
                  key={String(val)}
                  className={`flex items-center gap-3 flex-1 cursor-pointer rounded-xl border-2 px-4 py-3 transition-all ${
                    mixedGender === val
                      ? "border-orange-main bg-orange-main/5"
                      : "border-gray-200 hover:border-orange-main/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="mixed-gender"
                    checked={mixedGender === val}
                    onChange={() => { setMixedGender(val); setResult(null) }}
                    className="accent-orange-main w-4 h-4 flex-shrink-0"
                  />
                  <span className="font-body text-sm text-navy-dark">{val ? "Yes" : "No"}</span>
                </label>
              ))}
            </div>
            {mixedGender && (
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl mt-3">
                <UsersRound size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="font-body text-sm text-blue-700 leading-relaxed">
                  A mixed-gender group requires <strong>at least one male and one female
                  Scouter</strong> to be present, especially for overnights.
                </p>
              </div>
            )}
          </div>

          {/* Youth members input */}
          <div>
            <label
              htmlFor="youth-count"
              className="block font-body font-semibold text-navy-dark text-sm mb-2"
            >
              Number of Youth Members
            </label>
            <input
              id="youth-count"
              type="number"
              min={1}
              max={500}
              value={youth}
              onChange={(e) => {
                setYouth(e.target.value)
                setResult(null)
                setError("")
              }}
              onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
              placeholder={isVentures ? "Optional — result is always 2" : "e.g. 12"}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-body text-navy-dark placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-orange-main/40 focus:border-orange-main transition-all"
            />
            {error && (
              <p className="mt-2 text-sm font-body text-red-600 flex items-center gap-1.5">
                <AlertTriangle size={14} /> {error}
              </p>
            )}
          </div>

          {/* Calculate / Reset buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCalculate}
              className="flex-1 py-3 px-6 bg-orange-main hover:bg-orange-hover text-white font-body font-semibold text-sm rounded-xl transition-colors"
            >
              Calculate
            </button>
            {result !== null && (
              <button
                type="button"
                onClick={handleReset}
                className="py-3 px-5 border border-gray-200 text-navy-dark font-body text-sm rounded-xl hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Result card */}
        {result !== null && (
          <div className="mt-6 bg-white border-2 border-orange-main/30 rounded-2xl shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 size={22} className="text-orange-main flex-shrink-0" />
              <h2 className="font-display font-bold text-navy-dark text-lg">Result</h2>
            </div>

            <div className="flex items-center gap-4 mb-5">
              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${colourDot}`} />
              <div>
                <p className="font-body text-textMuted text-xs uppercase tracking-widest mb-0.5">
                  {sectionLabels[section]}
                  {!isVentures && ` · ${activityLabels[activity]}`}
                  {!isVentures && youth && ` · ${youth} youth member${parseInt(youth) !== 1 ? "s" : ""}`}
                  {mixedGender && " · Mixed-gender"}
                </p>
                <p className="font-display font-bold text-navy-dark text-4xl">
                  {result}
                  <span className="font-body font-normal text-base text-textMuted ml-2">
                    Scouter{result !== 1 ? "s" : ""} minimum
                  </span>
                </p>
              </div>
            </div>

            {/* Breakdown note */}
            {!isVentures && (() => {
              const rule = getRule(section, activity)
              const n = parseInt(youth, 10)
              if (!rule || isNaN(n)) return null
              if (n <= rule.baseMax) {
                return (
                  <p className="font-body text-sm text-textMuted bg-gray-50 rounded-xl px-4 py-3 mb-4">
                    Base ratio: <strong>{rule.base}</strong> Scouters for up to {rule.baseMax} youth members.
                  </p>
                )
              }
              const extra = Math.ceil((n - rule.baseMax) / rule.increment)
              return (
                <p className="font-body text-sm text-textMuted bg-gray-50 rounded-xl px-4 py-3 mb-4">
                  Base of <strong>{rule.base}</strong> for the first {rule.baseMax}, plus{" "}
                  <strong>{extra}</strong> additional Scouter{extra !== 1 ? "s" : ""} for the
                  remaining {n - rule.baseMax} youth (1 per {rule.increment}).
                </p>
              )
            })()}

            {/* Mixed-gender result note */}
            {mixedGender && (
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl mb-4">
                <UsersRound size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="font-body text-xs text-blue-700 leading-relaxed">
                  <strong>Mixed-gender group:</strong> The Scouter team must include{" "}
                  <strong>at least one male and one female Scouter.</strong>
                  {(activity === "overnight" || activity === "international") && (
                    <> For {activity === "overnight" ? "overnight" : "international"} activities
                    this is an absolute requirement — gender balance in the Scouter team is
                    mandatory to ensure appropriate supervision.
                    {" "}The minimum of <strong>{result} Scouter{result !== 1 ? "s" : ""}</strong> shown
                    above must therefore comprise both male and female Scouters.
                    </>
                  )}
                </p>
              </div>
            )}

            {/* Disclaimer */}
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="font-body text-xs text-amber-700 leading-relaxed">
                <strong>These are absolute minimums.</strong> High-risk activities (water/mountain)
                or mixed-gender groups may require additional Scouters to ensure safety and gender
                balance. Always apply sound judgement and consult your Group Leader if in doubt.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
