import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, fireEvent, act } from '@testing-library/react'
import { useSkillNavigation } from './useSkillNavigation'
import { useKeyboardShortcuts } from './useKeyboardShortcuts'
import type { Skill } from '../data/skills'

const push = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => '/',
}))

const skills = [
  { id: 'first-skill' },
  { id: 'second-skill' },
  { id: 'third-skill' },
] as Skill[]

function useCatalogNavigation() {
  const nav = useSkillNavigation({ skills })
  useKeyboardShortcuts({
    filteredSkillsCount: skills.length,
    selectedIndex: nav.selectedIndex,
    setSelectedIndex: nav.setSelectedIndex,
  })
  return nav
}

describe('catalog keyboard navigation', () => {
  beforeEach(() => {
    push.mockClear()
  })

  it('j/k move the shared selection used by card highlight', () => {
    const { result } = renderHook(() => useCatalogNavigation())

    act(() => { fireEvent.keyDown(window, { key: 'j' }) })
    expect(result.current.selectedIndex).toBe(0)

    act(() => { fireEvent.keyDown(window, { key: 'j' }) })
    expect(result.current.selectedIndex).toBe(1)

    act(() => { fireEvent.keyDown(window, { key: 'k' }) })
    expect(result.current.selectedIndex).toBe(0)
  })

  it('wraps selection at both ends', () => {
    const { result } = renderHook(() => useCatalogNavigation())

    act(() => { fireEvent.keyDown(window, { key: 'k' }) })
    expect(result.current.selectedIndex).toBe(skills.length - 1)

    act(() => { fireEvent.keyDown(window, { key: 'j' }) })
    expect(result.current.selectedIndex).toBe(0)
  })

  it('Enter activates the selected skill', () => {
    renderHook(() => useCatalogNavigation())

    act(() => { fireEvent.keyDown(window, { key: 'j' }) })
    act(() => { fireEvent.keyDown(window, { key: 'j' }) })
    act(() => { fireEvent.keyDown(window, { key: 'Enter' }) })

    expect(push).toHaveBeenCalledWith('/skill/second-skill')
  })

  it('Escape clears the selection', () => {
    const { result } = renderHook(() => useCatalogNavigation())

    act(() => { fireEvent.keyDown(window, { key: 'j' }) })
    expect(result.current.selectedIndex).toBe(0)

    act(() => { fireEvent.keyDown(window, { key: 'Escape' }) })
    expect(result.current.selectedIndex).toBe(-1)
  })

  it('does not move selection while typing in an input', () => {
    const { result } = renderHook(() => useCatalogNavigation())

    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()

    act(() => { fireEvent.keyDown(window, { key: 'j' }) })
    expect(result.current.selectedIndex).toBe(-1)

    input.remove()
  })
})
