import { StrictMode, useLayoutEffect } from 'react'
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  animations: [] as Array<{ counter: { value: number }; options: { value: number; onUpdate: () => void; onComplete: () => void }; kill: ReturnType<typeof vi.fn> }>,
  triggers: [] as Array<{ options: { onEnter: () => void }; kill: ReturnType<typeof vi.fn> }>,
  getAll: vi.fn(),
  enterImmediately: false,
}))

vi.mock('gsap', () => ({
  default: {
    registerPlugin: vi.fn(),
    to: (counter: { value: number }, options: { value: number; onUpdate: () => void; onComplete: () => void }) => {
      const animation = { counter, options, kill: vi.fn() }
      mocks.animations.push(animation)
      return animation
    },
  },
}))

vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {
    create: (options: { onEnter: () => void }) => {
      const trigger = { options, kill: vi.fn() }
      mocks.triggers.push(trigger)
      if (mocks.enterImmediately) options.onEnter()
      return trigger
    },
    getAll: mocks.getAll,
  },
}))

import { useCountUp } from './useCountUp'

function Counter({ target = 100, onScroll = true, onComplete }: { target?: number; onScroll?: boolean; onComplete?: () => void }) {
  const { ref, displayValue } = useCountUp(target, { onScroll, onComplete })
  return <div ref={element => { ref.current = element }}>{displayValue}</div>
}

describe('useCountUp animation lifecycle', () => {
  beforeEach(() => {
    mocks.animations.length = 0
    mocks.triggers.length = 0
    mocks.getAll.mockReset()
    mocks.enterImmediately = false
    Object.defineProperty(window, 'matchMedia', { configurable: true, value: vi.fn(() => ({ matches: false })) })
  })
  afterEach(cleanup)

  it('cleans up only its own trigger and tween', () => {
    const unrelated = { trigger: null as HTMLElement | null, kill: vi.fn() }
    mocks.getAll.mockReturnValue([unrelated])
    const view = render(<Counter />)
    unrelated.trigger = screen.getByText('0')
    act(() => mocks.triggers[0].options.onEnter())
    view.unmount()
    expect(mocks.triggers[0].kill).toHaveBeenCalledOnce()
    expect(mocks.animations[0].kill).toHaveBeenCalledOnce()
    expect(unrelated.kill).not.toHaveBeenCalled()
  })

  it('restarts an interrupted Strict Mode tween and uses the latest callback', () => {
    const first = vi.fn()
    const latest = vi.fn()
    const view = render(<StrictMode><Counter onScroll={false} onComplete={first} /></StrictMode>)
    expect(mocks.animations).toHaveLength(2)
    expect(mocks.animations[0].kill).toHaveBeenCalledOnce()
    const active = mocks.animations[1]
    act(() => { active.counter.value = 40; active.options.onUpdate() })
    expect(screen.getByText('40')).toBeTruthy()
    view.rerender(<StrictMode><Counter onScroll={false} onComplete={latest} /></StrictMode>)
    expect(active.kill).not.toHaveBeenCalled()
    expect(mocks.animations).toHaveLength(2)
    act(() => active.options.onComplete())
    expect(first).not.toHaveBeenCalled()
    expect(latest).toHaveBeenCalledOnce()
  })

  it('uses the committed callback before a parent layout effect completes the tween', () => {
    const first = vi.fn()
    const latest = vi.fn()
    function Parent({ onComplete, finish }: { onComplete: () => void; finish: boolean }) {
      useLayoutEffect(() => {
        if (finish) mocks.animations[0].options.onComplete()
      }, [finish])
      return <Counter onScroll={false} onComplete={onComplete} />
    }
    const view = render(<Parent onComplete={first} finish={false} />)
    view.rerender(<Parent onComplete={latest} finish />)
    expect(first).not.toHaveBeenCalled()
    expect(latest).toHaveBeenCalledOnce()
  })

  it('updates a completed counter when the target changes', () => {
    const view = render(<Counter onScroll={false} />)
    const initial = mocks.animations[0]
    act(() => { initial.counter.value = 100; initial.options.onUpdate(); initial.options.onComplete() })
    view.rerender(<Counter onScroll={false} target={200} />)
    expect(mocks.animations).toHaveLength(2)
    expect(mocks.animations[1].counter.value).toBe(100)
    act(() => { mocks.animations[1].counter.value = 200; mocks.animations[1].options.onUpdate() })
    expect(screen.getByText('200')).toBeTruthy()
  })

  it('retargets an in-flight animation from its current value', () => {
    const onComplete = vi.fn()
    const view = render(<Counter onScroll={false} target={100} onComplete={onComplete} />)
    const initial = mocks.animations[0]
    act(() => { initial.counter.value = 40; initial.options.onUpdate() })
    view.rerender(<Counter onScroll={false} target={200} onComplete={onComplete} />)
    expect(initial.kill).toHaveBeenCalledOnce()
    const next = mocks.animations[1]
    expect(next.counter.value).toBe(40)
    expect(next.options.value).toBe(200)
    act(() => { next.counter.value = 200; next.options.onUpdate(); next.options.onComplete() })
    expect(screen.getByText('200')).toBeTruthy()
    expect(onComplete).toHaveBeenCalledOnce()
  })

  it('waits for scroll when the target changes before entering', () => {
    const view = render(<Counter target={100} />)
    view.rerender(<Counter target={200} />)
    expect(mocks.triggers[0].kill).toHaveBeenCalledOnce()
    expect(mocks.animations).toHaveLength(0)
    act(() => mocks.triggers[1].options.onEnter())
    expect(mocks.animations[0].options.value).toBe(200)
  })

  it('cleans up when the trigger enters synchronously during creation', () => {
    mocks.enterImmediately = true
    const view = render(<Counter />)
    expect(mocks.animations).toHaveLength(1)
    view.unmount()
    expect(mocks.triggers[0].kill).toHaveBeenCalledOnce()
    expect(mocks.animations[0].kill).toHaveBeenCalledOnce()
  })

  it('honors reduced motion once under Strict Mode', () => {
    Object.defineProperty(window, 'matchMedia', { configurable: true, value: vi.fn(() => ({ matches: true })) })
    const onComplete = vi.fn()
    render(<StrictMode><Counter onComplete={onComplete} /></StrictMode>)
    expect(screen.getByText('100')).toBeTruthy()
    expect(onComplete).toHaveBeenCalledOnce()
    expect(mocks.animations).toHaveLength(0)
  })
})
