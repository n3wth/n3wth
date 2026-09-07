import { Tooltip } from '@astryxdesign/core/Tooltip'
import type { GrowthStage as GrowthStageType } from '@/lib/content'
import { stageColor } from '@/lib/plant'

// The same brightness ramp the 3D garden uses: maturity = brightness.
const config: Record<GrowthStageType, { label: string; color: string; meaning: string }> = {
  seedling: {
    label: 'Seedling',
    color: stageColor.seedling,
    meaning: 'A fresh planting: rough, unfinished, likely to change',
  },
  budding: {
    label: 'Budding',
    color: stageColor.budding,
    meaning: 'Taking shape: it has structure and links, and is still tended often',
  },
  evergreen: {
    label: 'Evergreen',
    color: stageColor.evergreen,
    meaning: 'Mature and stable: revisited when something changes',
  },
}

interface GrowthStageProps {
  stage: GrowthStageType
  showLabel?: boolean
  /** Explain the stage in a tooltip — used where a reader first meets the term. */
  explain?: boolean
}

export function GrowthStage({ stage, showLabel = true, explain = false }: GrowthStageProps) {
  const { label, color, meaning } = config[stage]

  const badge = (
    <span
      className={`inline-flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] ${explain ? 'cursor-help' : ''}`}
      title={showLabel || explain ? undefined : label}
      tabIndex={explain ? 0 : undefined}
      aria-label={explain ? `${label} — ${meaning}` : undefined}
    >
      {/* The dot only earns its place when it is carrying the stage on its
          own. Beside the word it repeated it in a colour the page never
          gives the reader a key to, and this site already has a far better
          mark for maturity — the note's own plant. */}
      {showLabel ? (
        label
      ) : (
        <>
          <span
            aria-hidden
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: color }}
          />
          <span className="sr-only">{label}</span>
        </>
      )}
    </span>
  )

  if (!explain) return badge

  return (
    <Tooltip content={meaning} placement="above" hasHoverIndication>
      {badge}
    </Tooltip>
  )
}
