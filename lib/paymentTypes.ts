export type ScoutSection = 'beavers' | 'cubs' | 'scouts' | 'ventures'

export const SCOUT_SECTIONS: Array<{
  value: ScoutSection
  label: string
  description: string
}> = [
  { value: 'beavers', label: 'Beavers', description: 'Annual membership for Beavers' },
  { value: 'cubs', label: 'Cubs', description: 'Annual membership for Cubs' },
  { value: 'scouts', label: 'Scouts', description: 'Annual membership for Scouts' },
  { value: 'ventures', label: 'Ventures', description: 'Annual membership for Ventures' },
]

export function getScoutSectionLabel(value: string | null | undefined): string {
  return SCOUT_SECTIONS.find((section) => section.value === value)?.label ?? 'Other'
}
