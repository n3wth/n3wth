// @vitest-environment jsdom
import { fireEvent, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useCommandPalette } from '../useCommandPalette'

describe('useCommandPalette keyboard shortcuts', () => {
  it('toggles open and closed with Cmd/Ctrl+K', () => {
    const { result } = renderHook(() => useCommandPalette())

    fireEvent.keyDown(window, { key: 'k', metaKey: true })
    expect(result.current.open).toBe(true)

    fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
    expect(result.current.open).toBe(false)
  })

  it('opens on / and closes on Escape', () => {
    const { result } = renderHook(() => useCommandPalette())

    fireEvent.keyDown(window, { key: '/' })
    expect(result.current.open).toBe(true)

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(result.current.open).toBe(false)
  })

  it('ignores / while typing in a field', () => {
    const { result } = renderHook(() => useCommandPalette())
    const input = document.createElement('input')
    document.body.appendChild(input)

    fireEvent.keyDown(input, { key: '/' })
    expect(result.current.open).toBe(false)

    input.remove()
  })

  it('leaves composition and modified slash shortcuts to their owner', () => {
    const { result } = renderHook(() => useCommandPalette())
    fireEvent.keyDown(window, { key: '/', isComposing: true })
    fireEvent.keyDown(window, { key: '/', ctrlKey: true })
    fireEvent.keyDown(window, { key: '/', metaKey: true })
    fireEvent.keyDown(window, { key: 'k', metaKey: true, keyCode: 229 })
    expect(result.current.open).toBe(false)

    fireEvent.keyDown(window, { key: '/' })
    fireEvent.keyDown(window, { key: 'Escape', isComposing: true })
    fireEvent.keyDown(window, { key: 'Escape', keyCode: 229 })
    expect(result.current.open).toBe(true)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(result.current.open).toBe(false)
  })
})
