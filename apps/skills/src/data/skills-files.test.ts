import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { skills } from './skills'
import { getAllSkills } from '../../cli/src/utils/skills'
import { getSkillInstallCommand } from '../config/commands'
import { assistants } from '../config/assistants'

const rawBase = 'https://raw.githubusercontent.com/n3wth/n3wth/main/apps/skills/skills/'

describe('advertised skill downloads', () => {
  for (const [name, catalog] of [['web', skills], ['cli', getAllSkills()]] as const) {
    it(`${name} downloads resolve to committed skill files`, () => {
      const local = catalog.flatMap(skill => skill.skillFile?.startsWith(rawBase)
        ? [skill.skillFile.slice(rawBase.length)] : [])
      expect(local.some(path => path.endsWith('/SKILL.md'))).toBe(true)
      expect(local.some(path => !path.includes('/'))).toBe(true)
      for (const path of local) {
        expect(existsSync(resolve('skills', path)), path).toBe(true)
      }
    })
  }

  it('preserves the independently hosted Canvas download', () => {
    expect(skills.find(skill => skill.id === 'canvas')?.skillFile)
      .toBe('https://raw.githubusercontent.com/n3wth/canvas/main/skills/canvas/SKILL.md')
  })

  it('creates missing assistant directories and never substitutes an all-skills install', () => {
    for (const assistant of Object.values(assistants)) {
      expect(assistant.installCommand('pdf', `${rawBase}pdf.md`))
        .toBe(`mkdir -p ${assistant.skillsDir} && curl -fsSL ${rawBase}pdf.md -o ${assistant.skillsDir}/pdf.md`)
      expect(getSkillInstallCommand(assistant.id, 'unavailable')).toBe('')
    }
  })
})
