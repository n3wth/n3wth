import { type HTMLAttributes, type ReactNode } from 'react'
import { Dialog } from '@astryxdesign/core/Dialog'

export interface MobileDrawerProps extends HTMLAttributes<HTMLDivElement> {
  /** Whether the drawer is open */
  isOpen: boolean
  /** Callback when drawer should close */
  onClose: () => void
  /** Drawer content */
  children: ReactNode
  /** Width of the drawer */
  width?: string
  /** Position of the drawer */
  position?: 'left' | 'right'
  /** Z-index for the drawer */
  zIndex?: number
  /** Accessible label for the drawer */
  ariaLabel?: string
}


export function MobileDrawer({
  isOpen, onClose, children, width = '280px', position = 'right',
  zIndex = 50, ariaLabel = 'Navigation menu', className, ...props
}: MobileDrawerProps) {
  return <Dialog
    isOpen={isOpen} onOpenChange={open => { if (!open) onClose() }}
    purpose="info" aria-label={ariaLabel} aria-hidden={!isOpen}
    width={width} maxHeight="100dvh" padding={0}
    position={position === 'right' ? { top: 0, right: 0 } : { top: 0, left: 0 }}
    style={{ height: '100dvh', maxWidth: '80vw', borderRadius: 0, boxShadow: 'none', animation: 'none', zIndex }}
    className={className}
  ><div {...props}>{children}</div></Dialog>
}
