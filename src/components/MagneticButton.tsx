import { useRef, useCallback, useEffect, useState } from 'react'
import gsap from 'gsap'

interface Props extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  href?: string
  onClick?: () => void
  strength?: number
  external?: boolean
}

export function MagneticButton({
  children,
  className,
  style,
  href,
  onClick,
  strength = 0.3,
  external = false,
  ...rest
}: Props) {
  const buttonRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLSpanElement>(null)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    setReducedMotion(
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (reducedMotion) return
    const rect = buttonRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2

    gsap.to(buttonRef.current, {
      x: x * strength,
      y: y * strength,
      duration: 0.3,
      ease: 'power2.out'
    })

    if (contentRef.current) {
      gsap.to(contentRef.current, {
        x: x * strength * 0.5,
        y: y * strength * 0.5,
        duration: 0.3,
        ease: 'power2.out'
      })
    }
  }, [strength, reducedMotion])

  const handleMouseLeave = useCallback(() => {
    if (reducedMotion) return
    gsap.to(buttonRef.current, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.3)'
    })

    if (contentRef.current) {
      gsap.to(contentRef.current, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)'
      })
    }
  }, [reducedMotion])

  const Tag = href ? 'a' : 'button'
  const externalProps = external && href
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {}

  return (
    <Tag
      ref={buttonRef as React.RefObject<HTMLAnchorElement & HTMLButtonElement>}
      href={href}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{ ...style, willChange: 'transform' }}
      {...externalProps}
      {...rest}
    >
      <span
        ref={contentRef}
        className="inline-flex items-center gap-2"
        style={{ willChange: 'transform' }}
      >
        {children}
      </span>
    </Tag>
  )
}
