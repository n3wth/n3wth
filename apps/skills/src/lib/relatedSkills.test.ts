import { describe, expect, it } from 'vitest'
import { getRelatedSkills } from './relatedSkills'
import type { Skill } from '../data/skills'

function skill(partial: Partial<Skill> & Pick<Skill, 'id' | 'category' | 'tags'>): Skill {
  return {
    name: partial.id,
    description: partial.id,
    icon: '◈',
    color: 'oklch(0.70 0.15 280)',
    version: '1.0.0',
    lastUpdated: '2026-09-16',
    ...partial,
  }
}

describe('getRelatedSkills', () => {
  const catalog = [
    skill({ id: 'current', category: 'development', tags: ['skills'], relatedSkillIds: ['pinned', 'missing'] }),
    skill({ id: 'pinned', category: 'business', tags: ['other'] }),
    skill({ id: 'same-category', category: 'development', tags: ['unrelated'] }),
    skill({ id: 'shared-tag', category: 'creative', tags: ['skills'] }),
  ]

  it('returns pinned skills first and ignores unknown ids', () => {
    expect(getRelatedSkills(catalog[0], catalog, 3).map(item => item.id)).toEqual([
      'pinned',
      'same-category',
      'shared-tag',
    ])
  })
})
