import { describe, expect, it } from 'vitest'
import { noindexSkillIds } from './indexability'

describe('inherited skill indexability policy', () => {
  it('recognizes the deployment exclusions without excluding original skills', () => {
    expect(noindexSkillIds.size).toBe(14)
    expect(noindexSkillIds.has('theme-factory')).toBe(true)
    expect(noindexSkillIds.has('skill-creator')).toBe(true)
    expect(noindexSkillIds.has('code-reviewer')).toBe(false)
  })
})
