import type { Skill } from '../data/skills'

export function getRelatedSkills(currentSkill: Skill, allSkills: Skill[], limit: number = 4): Skill[] {
  const byId = new Map(allSkills.map(skill => [skill.id, skill]))
  const pinned = (currentSkill.relatedSkillIds ?? [])
    .map(id => byId.get(id))
    .filter((skill): skill is Skill => Boolean(skill) && skill.id !== currentSkill.id)

  if (pinned.length >= limit) return pinned.slice(0, limit)

  const exclude = new Set([currentSkill.id, ...pinned.map(skill => skill.id)])
  const scored = allSkills
    .filter(skill => !exclude.has(skill.id))
    .map(skill => {
      let score = 0

      if (skill.category === currentSkill.category) {
        score += 10
      }

      const matchingTags = skill.tags.filter(tag => currentSkill.tags.includes(tag))
      score += matchingTags.length * 2

      return { skill, score }
    })

  scored.sort((a, b) => b.score - a.score)

  return [...pinned, ...scored.map(item => item.skill)].slice(0, limit)
}
