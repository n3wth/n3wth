import { forwardRef } from 'react'
import type { AnchorHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'

/**
 * href-based anchor adapter for Astryx's LinkProvider: internal paths go
 * through react-router (client navigation), everything else (https, mailto,
 * hash) stays a plain anchor.
 */
export const RouterLink = forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement>
>(function RouterLink({ href = '', children, ...rest }, ref) {
  const isInternal = href.startsWith('/') && !href.startsWith('//')
  if (isInternal) {
    return (
      <Link to={href} ref={ref} viewTransition {...rest}>
        {children}
      </Link>
    )
  }
  return (
    <a href={href} ref={ref} {...rest}>
      {children}
    </a>
  )
})
