import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { Contact } from '../Contact'
import { siteConfig } from '../../../data/content'

vi.mock('../../ConvergeLight', () => ({ ConvergeLight: () => null }))
const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard')

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  if (originalClipboard) Object.defineProperty(navigator, 'clipboard', originalClipboard)
  else Reflect.deleteProperty(navigator, 'clipboard')
})

describe('Contact options', () => {
  it('offers email and LinkedIn destinations', () => {
    render(<Contact />)
    expect(screen.getByRole('link', { name: siteConfig.email })).toHaveAttribute('href', `mailto:${siteConfig.email}`)
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', siteConfig.social.linkedin)
  })

  it('copies the configured address and announces success', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    render(<Contact />)
    fireEvent.click(screen.getByRole('button', { name: 'Copy email' }))

    expect(await screen.findByText('Email copied.')).toHaveAttribute('role', 'status')
    expect(writeText).toHaveBeenCalledWith(siteConfig.email)
  })

  it('provides a manual fallback when clipboard permission is denied', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('Permission denied'))
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    render(<Contact />)
    fireEvent.click(screen.getByRole('button', { name: 'Copy email' }))

    expect(await screen.findByText(`Could not copy. Select the address above: ${siteConfig.email}`)).toHaveAttribute('role', 'status')
  })
})
