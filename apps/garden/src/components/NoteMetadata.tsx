import { Timestamp } from '@n3wth/ui/primitives'

interface NoteMetadataProps {
  readingTime: string
  date?: string
}

export function NoteMetadata({ readingTime, date }: NoteMetadataProps) {
  const parsed = date ? Date.parse(date) : NaN

  return (
    <span className="flex items-center gap-2 text-xs">
      {date && (
        <>
          <span className="text-[var(--color-text-secondary)]">
            {Number.isFinite(parsed) ? (
              <Timestamp value={new Date(parsed).toISOString()} format="date" />
            ) : (
              <time>{date}</time>
            )}
          </span>
          <span className="text-[var(--color-text-disabled)]">·</span>
        </>
      )}
      <span className="text-[var(--color-text-secondary)]">{readingTime}</span>
    </span>
  )
}
