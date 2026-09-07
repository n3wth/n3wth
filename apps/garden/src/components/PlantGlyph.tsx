import { plantGlyph } from '@/lib/plant'

interface PlantGlyphProps {
  slug: string
  stage: string
  linkCount: number
  /** Height in px; width scales with the 24x32 viewBox. */
  size?: number
  /** Animate the plant drawing itself in (note headers). */
  draw?: boolean
  className?: string
}

/**
 * A note's identity mark: its generative plant from the 3D garden,
 * rendered flat. Same slug, same plant — everywhere.
 */
export function PlantGlyph({ slug, stage, linkCount, size = 32, draw = false, className }: PlantGlyphProps) {
  const glyph = plantGlyph(slug, stage, linkCount)

  return (
    <svg
      viewBox="0 0 24 32"
      width={(size * 24) / 32}
      height={size}
      fill="none"
      aria-hidden
      className={`${draw ? 'plant-draw' : ''} ${className ?? ''}`.trim()}
    >
      {glyph.paths.map((d, i) => (
        <path
          key={i}
          d={d}
          pathLength={1}
          stroke={glyph.color}
          strokeWidth={1}
          strokeLinecap="round"
          opacity={i === 0 ? 0.9 : 0.6}
          style={draw ? { animationDelay: `${i * 90}ms` } : undefined}
        />
      ))}
      <circle
        cx={glyph.tip.x}
        cy={glyph.tip.y}
        r={glyph.tip.r}
        fill={glyph.color}
        style={draw ? { animationDelay: `${glyph.paths.length * 90 + 120}ms` } : undefined}
      />
    </svg>
  )
}
