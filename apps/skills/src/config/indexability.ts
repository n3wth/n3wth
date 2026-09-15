import deployment from '../../vercel.json'

// Public skills are indexable. Track any explicit deployment exclusions here.
// Derive IDs from its exact route group so HTML and sitemap cannot drift.
export const noindexSkillIds = new Set(
  deployment.headers.flatMap(rule => {
    if (!rule.headers.some(header => header.key.toLowerCase() === 'x-robots-tag' && header.value === 'noindex')) return []
    const match = /^\/skill\/\(([a-z0-9|-]+)\)$/.exec(rule.source)
    if (!match) throw new Error(`Unsupported skill noindex route: ${rule.source}`)
    return match[1].split('|')
  }),
)
