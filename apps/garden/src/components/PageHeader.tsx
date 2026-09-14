import { PageHeader as SharedPageHeader } from '@n3wth/ui/site'

interface PageHeaderProps {
  title: React.ReactNode
  sub?: React.ReactNode
  className?: string
}

export function PageHeader({ title, sub, className }: PageHeaderProps) {
  return <SharedPageHeader title={title} description={sub} className={className} />
}
