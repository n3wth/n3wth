import { PageHeader as SharedPageHeader } from '@n3wth/ui/site'

interface PageHeaderProps { title: string; sub?: React.ReactNode }

export function PageHeader({ title, sub }: PageHeaderProps) {
  return <SharedPageHeader title={title} description={sub} />
}
