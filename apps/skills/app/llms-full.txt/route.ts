import { NextResponse } from 'next/server'
import { skills } from '@/src/data/skills'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function GET() {
  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = []
    acc[skill.category].push(skill)
    return acc
  }, {} as Record<string, typeof skills>)

  const categoryOrder = ['development', 'documents', 'creative', 'productivity', 'business']

  const skillsContent = categoryOrder
    .filter(cat => skillsByCategory[cat])
    .map(cat => {
      const catSkills = skillsByCategory[cat]
      const header = `## ${cat.charAt(0).toUpperCase() + cat.slice(1)} (${catSkills.length} skills)`
      
      const skillBlocks = catSkills.map(s => {
        const lines = [
          `### ${s.name}`,
          `ID: ${s.id}`,
          `Version: ${s.version}`,
          `Updated: ${s.lastUpdated}`,
          '',
          s.longDescription || s.description,
        ]

        if (s.features?.length) {
          lines.push('', '**Features:**')
          s.features.forEach(f => lines.push(`- ${f}`))
        }

        if (s.useCases?.length) {
          lines.push('', '**Use Cases:**')
          s.useCases.forEach(u => lines.push(`- ${u}`))
        }

        if (s.compatibility?.length) {
          lines.push('', `**Compatible with:** ${s.compatibility.join(', ')}`)
        }

        if (s.tags?.length) {
          lines.push(`**Tags:** ${s.tags.join(', ')}`)
        }

        if (s.skillFile) {
          lines.push('', `Raw skill file: ${s.skillFile}`)
        }

        lines.push('', `Install: \`npx skills add ${s.id}\``)
        lines.push(`Details: https://skills.n3wth.com/skill/${s.id}`)

        return lines.join('\n')
      }).join('\n\n---\n\n')

      return `${header}\n\n${skillBlocks}`
    })
    .join('\n\n' + '='.repeat(60) + '\n\n')

  const content = `# n3wth/skills — Full Catalog

> Complete reference for all ${skills.length} AI coding assistant skills.

Website: https://skills.n3wth.com
GitHub: https://github.com/n3wth/skills
Contact: hey@n3wth.com

${'='.repeat(60)}

${skillsContent}

${'='.repeat(60)}

## Installation

Install any skill with:
\`\`\`bash
npx skills add <skill-id>
\`\`\`

## Summary

For a concise overview: https://skills.n3wth.com/llms.txt

Generated: ${new Date().toISOString().split('T')[0]}
`

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
