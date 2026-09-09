'use client'
import { skills, categories } from '../data/skills'
import { assistantList } from '../config/assistants'

interface StatProps {
  value: number
  label: string
  suffix?: string
}

function Stat({ value, label, suffix = '' }: StatProps) {
  return (
    <div className="text-center px-2">
      <span
        className="block text-3xl sm:text-4xl md:text-5xl font-semibold text-white"
      >
        {value}{suffix}
      </span>
      <span className="text-[10px] sm:text-xs uppercase tracking-wider" style={{ color: 'var(--color-grey-400)' }}>
        {label}
      </span>
    </div>
  )
}

export function StatsRow() {
  // Calculate stats from actual data
  const totalSkills = skills.length
  const totalCategories = categories.length - 1 // Exclude "all"
  const totalAssistants = assistantList.length
  const totalContributors = new Set(skills.map(s => s.contributor?.name).filter(Boolean)).size

  return (
    <div
      className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 n3wth-site-section rounded-2xl"
      style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
      }}
    >
      <div data-stat>
        <Stat value={totalSkills} label="Skills" />
      </div>
      <div data-stat>
        <Stat value={totalCategories} label="Categories" />
      </div>
      <div data-stat>
        <Stat value={totalAssistants} label="AI Assistants" />
      </div>
      <div data-stat>
        <Stat value={totalContributors} label="Contributors" />
      </div>
    </div>
  )
}
