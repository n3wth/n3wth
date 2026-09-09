import { forwardRef, useState, type ImgHTMLAttributes } from 'react'
import { Avatar as AstryxAvatar } from '@astryxdesign/core/Avatar'
import { Text } from '@astryxdesign/core/Text'
import { cn } from '../../utils/cn'

export interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'size'> {
  src?: string
  alt?: string
  fallback?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizes = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt = '',
      fallback,
      size = 'md',
      className,
      ...props
    },
    ref
  ) => {
    const [erroredSrc, setErroredSrc] = useState<string>()
    const showImage = src && erroredSrc !== src

    // Astryx supports generated initials and owns image-error recovery. Preserve
    // the native image bridge for image attributes/events and arbitrary fallback
    // text, which Avatar 0.1.6 cannot forward or render without losing semantics.
    if (fallback && /^[A-Za-z]{1,2}$/.test(fallback) && Object.keys(props).length === 0) {
      const pixels = { xs: 24, sm: 32, md: 40, lg: 48, xl: 64 } as const
      return <AstryxAvatar ref={ref} src={src} alt={alt || fallback} name={fallback.split('').join(' ')} size={pixels[size]} className={cn(sizes[size], className)} />
    }

    return (
      <div
        ref={ref}
        role={!showImage && alt ? 'img' : undefined}
        aria-label={!showImage && alt ? alt : undefined}
        className={cn(
          'relative inline-flex shrink-0 items-center justify-center rounded-full overflow-hidden',
          !showImage && 'bg-[var(--glass-bg)] border border-[var(--glass-border)]',
          sizes[size],
          className
        )}
      >
        {showImage ? (
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover rounded-full"
            {...props}
            onError={(event) => { setErroredSrc(src); props.onError?.(event) }}
          />
        ) : (
          <Text as="span" type="supporting"
            className="font-medium text-[var(--color-grey-400)] select-none"
            aria-hidden={!!alt}
          >
            {fallback || ''}
          </Text>
        )}
      </div>
    )
  }
)

Avatar.displayName = 'Avatar'
