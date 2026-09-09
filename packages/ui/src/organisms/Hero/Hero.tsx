import { type HTMLAttributes, type ReactNode } from 'react'
import { PageHeader, SiteContainer } from '../../site'
import { Badge } from '../../atoms/Badge'
import { Button } from '../../atoms/Button'

export interface HeroCTA {
  label: string
  href: string
  variant?: 'primary' | 'secondary' | 'ghost'
}

export interface HeroProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  badge?: string
  title: ReactNode
  description?: ReactNode
  ctas?: HeroCTA[]
  align?: 'left' | 'center'
  size?: 'default' | 'large'
  gradient?: boolean
}

/** @deprecated Use PageHeader from @n3wth/ui/site. */
export function Hero({ badge, title, description, ctas = [], align = 'left',
  size: _size, gradient: _gradient, className, ...props
}: HeroProps) {
  return <section className={className} {...props}>
    <SiteContainer>
      {badge && <Badge>{badge}</Badge>}
      <PageHeader title={title} description={description} style={{ textAlign: align }}
        actions={ctas.length ? ctas.map((cta, index) => <Button key={cta.href}
          variant={cta.variant || (index === 0 ? 'primary' : 'secondary')} asChild>
          <a href={cta.href}>{cta.label}</a>
        </Button>) : undefined} />
    </SiteContainer>
  </section>
}
