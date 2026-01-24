import { cn } from '../../lib/utils'

interface SectionDividerProps {
  variant?: 'glow' | 'gradient' | 'dots' | 'simple'
  className?: string
}

export function SectionDivider({ variant = 'glow', className }: SectionDividerProps) {
  if (variant === 'simple') {
    return <div className={cn('h-px bg-white/10', className)} />
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex justify-center gap-2 py-8', className)}>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-gold/40"
          />
        ))}
      </div>
    )
  }

  if (variant === 'gradient') {
    return (
      <div className={cn('h-px bg-gradient-to-r from-transparent via-white/20 to-transparent', className)} />
    )
  }

  return (
    <div className={cn('glow-line', className)} />
  )
}
