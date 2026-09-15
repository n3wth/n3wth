import { describe, expect, it } from 'vitest'
import { noindexSkillIds } from './indexability'

describe('public skill indexability policy', () => {
  it('keeps the entire public catalog indexable', () => {
    expect(noindexSkillIds.size).toBe(0)
    expect(noindexSkillIds.has('theme-factory')).toBe(false)
    expect(noindexSkillIds.has('skill-creator')).toBe(false)
    expect(noindexSkillIds.has('code-reviewer')).toBe(false)
  })
})
