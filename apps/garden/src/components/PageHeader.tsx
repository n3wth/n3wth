interface PageHeaderProps {
  title: string
  sub?: React.ReactNode
}

/* Shared page-header pattern: tight-tracked display title over a quiet
   subtitle — the n3wth blueprint rhythm, without the label chrome. */
export function PageHeader({ title, sub }: PageHeaderProps) {
  return (
    <header className="mb-10">
      <h1 className="font-display text-[2.25rem] md:text-[3rem] leading-[1.05] font-semibold tracking-[-0.03em] text-[var(--color-text-primary)] text-balance">
        {title}
      </h1>
      {sub && (
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)] max-w-md">
          {sub}
        </p>
      )}
    </header>
  )
}
