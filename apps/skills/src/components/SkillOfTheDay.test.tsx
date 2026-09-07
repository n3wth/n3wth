import { act } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, expect, test, vi } from 'vitest'
import { SkillOfTheDay } from './SkillOfTheDay'
import { skills } from '../data/skills'

vi.mock('./CategoryShape', () => ({ CategoryShape: () => null }))
vi.mock('./CompatibilityMatrix', () => ({ CompatibilityMatrix: () => null }))

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

test('hydrates a build from another date before selecting the daily fallback', async () => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-01-01T12:00:00Z'))
  const container = document.createElement('div')
  container.innerHTML = renderToString(<SkillOfTheDay />)
  expect(container.textContent).toContain(skills[0].name)
  document.body.append(container)
  vi.setSystemTime(new Date('2026-06-15T12:00:00Z'))
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => ({}) }))
  const errors: unknown[] = []
  let root: ReturnType<typeof hydrateRoot>
  await act(async () => {
    root = hydrateRoot(container, <SkillOfTheDay />, { onRecoverableError: error => errors.push(error) })
  })
  expect(errors).toEqual([])
  expect(container.querySelector('h3')?.textContent).not.toBe(skills[0].name)
  await act(async () => root.unmount())
  container.remove()
})
