import path from 'node:path'
import career from '../../../../docs/editorial/visuals/career.json' with { type: 'json' }
import frameworks from '../../../../docs/editorial/visuals/frameworks.json' with { type: 'json' }
import knowledge from '../../../../docs/editorial/visuals/knowledge.json' with { type: 'json' }
import wellbeing from '../../../../docs/editorial/visuals/wellbeing.json' with { type: 'json' }
import selections from './resource-preview-data.json' with { type: 'json' }

export interface ResourceSource {
  url: string
  title: string
  publisher: string
}

export interface ResourceSelection {
  source: number
  description: string
}

export interface ResourcePreview extends ResourceSource {
  description: string
}

// Static imports keep the evidence registry in the server bundle. Curation stores
// source positions, not copied URLs: replacements in a manifest carry through.
// Reordering or changing a source's subject requires reviewing its description.
const records = new Map(
  [...career, ...frameworks, ...knowledge, ...wellbeing].map((record) => [record.file, record])
)
const curated: Readonly<Record<string, readonly ResourceSelection[]>> = selections

export function selectResourcePreviews(
  sources: readonly ResourceSource[],
  choices: readonly ResourceSelection[]
): ResourcePreview[] {
  const previews: ResourcePreview[] = []
  const seen = new Set<string>()

  for (const choice of choices) {
    const source = sources[choice.source]
    if (!source?.title?.trim() || !source.publisher?.trim() || !choice.description.trim()) continue

    let destination: URL
    try {
      destination = new URL(source.url)
    } catch {
      continue
    }
    if (destination.protocol !== 'https:' || destination.username || destination.password) continue

    const href = destination.href
    destination.hash = ''
    if (seen.has(destination.href)) continue
    seen.add(destination.href)

    previews.push({
      url: href,
      title: source.title.trim(),
      publisher: source.publisher.trim(),
      description: choice.description.trim(),
    })
    if (previews.length === 3) break
  }

  return previews
}

export function getResourcePreviews(filePath: string): ResourcePreview[] {
  // Use the content file, not a second implementation of the routing slug rules.
  const file = (path.isAbsolute(filePath)
    ? path.relative(path.join(process.cwd(), 'content'), filePath)
    : filePath).split(path.sep).join('/')
  const record = records.get(file)
  const choices = curated[file]
  return record && choices ? selectResourcePreviews(record.sources, choices) : []
}
