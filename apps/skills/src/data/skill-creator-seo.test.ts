import { describe, expect, it } from 'vitest'
import { skills } from './skills'
import { getRelatedSkills } from '../lib/relatedSkills'

describe('skill-creator SEO', () => {
  const skill = skills.find(item => item.id === 'skill-creator')

  it('targets the Claude skill-creator cluster in title, lede, and meta', () => {
    expect(skill).toBeDefined()
    expect(skill?.name).toBe('Skill Creator')
    expect(skill?.seoTitle).toMatch(/Claude.*Skill/i)
    expect(skill?.seoDescription).toMatch(/skill-creator/i)
    expect(skill?.seoDescription).toMatch(/Claude Code/i)
    expect(skill?.description).toMatch(/Claude Code Agent Skills/i)
    expect(skill?.description).toMatch(/skill-creator/i)
    expect(skill?.longDescription).toMatch(/SKILL\.md/)
    expect(skill?.tags).toEqual(expect.arrayContaining(['skill-creator', 'claude-code', 'agent-skills']))
  })

  it('documents a Claude Code install path without changing advertised compatibility', () => {
    expect(skill?.compatibility).toEqual(['gemini'])
    expect(skill?.extraInstallCommands?.[0]?.name).toBe('Claude Code')
    expect(skill?.extraInstallCommands?.[0]?.command).toContain('~/.claude/skills/skill-creator')
    expect(skill?.extraInstallCommands?.[0]?.command).toContain('/SKILL.md')
    expect(skill?.installHint).toMatch(/Claude Code/i)
  })

  it('has FAQ answers for install and what Claude skills are', () => {
    const questions = skill?.faq?.map(item => item.question) ?? []
    expect(questions).toEqual(expect.arrayContaining([
      'What are Claude skills?',
      'How do I build a skill in Claude Code?',
      'What is skill-creator?',
      'How do I install skill-creator in Claude Code?',
      'What is SKILL.md?',
    ]))
    expect(skill?.faq?.every(item => item.answer.trim().length > 40)).toBe(true)
  })

  it('pins related skills that exist in the catalog', () => {
    expect(skill?.relatedSkillIds?.length).toBeGreaterThan(0)
    const related = getRelatedSkills(skill!, skills, 3)
    expect(related.map(item => item.id)).toEqual(skill?.relatedSkillIds?.slice(0, 3))
    for (const id of skill?.relatedSkillIds ?? []) {
      expect(skills.some(item => item.id === id), id).toBe(true)
    }
  })
})
