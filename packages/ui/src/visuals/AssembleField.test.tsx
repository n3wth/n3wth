import { act, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AssembleField } from './AssembleField'

const clusters: [number, number][] = [[1100, 100], [1400, 300]]
const geometry = (container: HTMLElement) => Array.from(container.querySelectorAll('circle'), (dot) => [dot.getAttribute('cx'), dot.getAttribute('cy'), dot.getAttribute('r')])

afterEach(() => vi.restoreAllMocks())

describe('AssembleField', () => {
  it('renders a visible decorative lattice without a reveal observer', () => {
    const { container } = render(<AssembleField clusters={clusters} className="custom-field" />)
    const dots = container.querySelectorAll('circle')
    expect(dots).toHaveLength(46 * 12)
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    expect(container.querySelector('svg')).toHaveClass('n3wth-visual-field', 'custom-field')
    expect(container.querySelector('[data-reveal]')).toBeNull()
    for (const dot of dots) {
      expect(dot).toHaveAttribute('opacity', '0.6')
    }
    expect(dots[0]).toHaveAttribute('cx', '30')
    expect(dots[0]).toHaveAttribute('cy', '34')
    expect(container.querySelector('animateMotion')).toBeNull()
  })

  it('keeps positions stable across renders and changes them for a new seed', () => {
    const { container, rerender } = render(<AssembleField clusters={clusters} seed={41} cols={6} rows={4} />)
    const first = geometry(container)
    rerender(<AssembleField clusters={[...clusters]} seed={41} cols={6} rows={4} />)
    expect(geometry(container)).toEqual(first)
    rerender(<AssembleField clusters={clusters} seed={42} cols={6} rows={4} />)
    expect(geometry(container)).not.toEqual(first)
  })

  it('keeps SVG geometry finite for invalid dimensions, singleton grids and empty clusters', () => {
    const { container, rerender } = render(<AssembleField clusters={[]} cols={1} rows={1} width={0} height={Number.NaN} seed={Number.MAX_VALUE} envelopeEnd={0} />)
    expect(container.querySelectorAll('circle')).toHaveLength(1)
    expect(container.innerHTML).not.toMatch(/NaN|Infinity/)
    rerender(<AssembleField clusters={[[Number.NaN, 3], [1, Number.POSITIVE_INFINITY]]} cols={Number.NaN} rows={-1} width={Number.POSITIVE_INFINITY} height={-1} seed={Number.NaN} />)
    expect(container.querySelectorAll('circle')).toHaveLength(46)
    expect(container.innerHTML).not.toMatch(/NaN|Infinity/)
  })

  it('reacts to motion preference changes without moving or hiding the dots', () => {
    const listeners = new Set<(event: MediaQueryListEvent) => void>()
    vi.spyOn(window, 'matchMedia').mockImplementation((media) => ({
      matches: false, media, onchange: null,
      addEventListener: (_type, listener) => listeners.add(listener as (event: MediaQueryListEvent) => void),
      removeEventListener: (_type, listener) => listeners.delete(listener as (event: MediaQueryListEvent) => void),
      addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: () => true,
    }))
    const { container, unmount } = render(<AssembleField clusters={clusters} cols={6} rows={4} />)
    const original = geometry(container)
    expect(container.querySelector('svg')).toHaveAttribute('data-reduced-motion', 'false')
    act(() => listeners.forEach((listener) => listener({ matches: true } as MediaQueryListEvent)))
    expect(container.querySelector('svg')).toHaveAttribute('data-reduced-motion', 'true')
    expect(geometry(container)).toEqual(original)
    act(() => listeners.forEach((listener) => listener({ matches: false } as MediaQueryListEvent)))
    expect(container.querySelector('svg')).toHaveAttribute('data-reduced-motion', 'false')
    unmount()
    expect(listeners.size).toBe(0)
  })
})
