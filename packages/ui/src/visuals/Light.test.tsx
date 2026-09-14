import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, render } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { ForkLight } from './ForkLight'
import { ConvergeLight } from './ConvergeLight'

afterEach(() => vi.restoreAllMocks())

function motionPreference(reduced: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>()
  const media = {
    matches: reduced,
    addEventListener: (_: string, callback: (event: MediaQueryListEvent) => void) => listeners.add(callback),
    removeEventListener: (_: string, callback: (event: MediaQueryListEvent) => void) => listeners.delete(callback),
  }
  vi.spyOn(window, 'matchMedia').mockReturnValue(media as unknown as MediaQueryList)
  return (next: boolean) => {
    media.matches = next
    act(() => listeners.forEach(callback => callback({ matches: next } as MediaQueryListEvent)))
  }
}

describe.each([['fork', ForkLight], ['converge', ConvergeLight]] as const)('%s light', (_, Component) => {
  it('renders complete filaments without a reveal ancestor', () => {
    motionPreference(true)
    const { container } = render(<Component />)
    const paths = container.querySelectorAll('.n3wth-visual-light-path')
    expect(paths).toHaveLength(2)
    for (const path of paths) expect(path.getAttribute('d')?.split(' L ')).toHaveLength(73)
    expect(container.querySelector('[data-reveal]')).toBeNull()
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('does not start animation under reduced motion', () => {
    motionPreference(true)
    const request = vi.spyOn(window, 'requestAnimationFrame')
    render(<Component />)
    expect(request).not.toHaveBeenCalled()
  })

  it('updates the waveform and cancels it when motion preference changes', () => {
    const changeMotion = motionPreference(false)
    let callback: FrameRequestCallback | undefined
    const request = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(next => { callback = next; return 42 })
    const cancel = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
    const { container, unmount } = render(<Component />)
    const path = container.querySelector('.n3wth-visual-light-path')!
    const before = path.getAttribute('d')
    act(() => callback?.(performance.now() + 1000))
    expect(path.getAttribute('d')).not.toBe(before)
    expect(request).toHaveBeenCalledTimes(2)
    changeMotion(true)
    expect(cancel).toHaveBeenCalledWith(42)
    changeMotion(false)
    expect(request).toHaveBeenCalledTimes(3)
    unmount()
    expect(cancel).toHaveBeenCalledTimes(2)
  })
})

it('keeps gradient references local across multiple drawings', () => {
  motionPreference(true)
  const { container } = render(<><ForkLight /><ForkLight /><ConvergeLight /><ConvergeLight /></>)
  const ids = Array.from(container.querySelectorAll('[id]'), element => element.id)
  expect(new Set(ids).size).toBe(8)
  for (const svg of container.querySelectorAll('svg')) {
    const ownIds = Array.from(svg.querySelectorAll('[id]'), element => element.id)
    for (const path of svg.querySelectorAll('.n3wth-visual-light-path')) {
      const gradient = path.getAttribute('stroke')!.slice(5, -1)
      expect(ownIds).toContain(gradient)
    }
  }
})

it('makes paths visible by default and disables pulses for reduced motion', () => {
  // Vitest disables CSS transforms, including ?raw CSS imports, in this package.
  const css = readFileSync(resolve(process.cwd(), 'src/visuals/light.css'), 'utf8')
  expect(css).not.toContain('data-reveal')
  expect(css).not.toContain('fork-draw')
  const style = document.createElement('style')
  style.textContent = css
  document.head.appendChild(style)
  motionPreference(true)
  const { container } = render(<ForkLight />)
  expect(getComputedStyle(container.querySelector('.n3wth-visual-light-path')!).strokeDashoffset).toBe('0')
  expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*animation: none/)
  style.remove()
})
