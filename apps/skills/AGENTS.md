# Skill Catalog — Quick Reference

**Contact**: hey@n3wth.com

---

## File Map

```
skills/                          # Skill markdown files (YAML frontmatter + content)
  ├── gsap-animations/SKILL.md   # Skill in folder format
  └── mcp-builder.md             # Skill as single file

src/data/skills.ts               # Catalog array — add new entries here
src/config/categories.ts         # Category IDs: development | documents | creative | productivity | business
src/config/assistants.ts         # Assistant IDs: gemini | claude | cursor | windsurf | copilot
```

---

## Skill Record Schema

Add to the `skills` array in `src/data/skills.ts`:

```typescript
interface Skill {
  id: string                      // kebab-case, matches skill file name
  name: string                    // Display name
  description: string             // One sentence
  longDescription?: string        // Expanded description
  category: 'development' | 'documents' | 'creative' | 'productivity' | 'business'
  tags: string[]                  // Search keywords
  featured?: boolean              // Show on homepage
  icon: string                    // Single emoji or symbol
  color: string                   // oklch(0.70 0.15 200)
  features?: string[]             // Bullet points
  useCases?: string[]             // Example applications
  compatibility?: ('gemini' | 'claude' | 'cursor' | 'windsurf' | 'copilot')[]
  version: string                 // semver
  lastUpdated: string             // YYYY-MM-DD
  contributor?: { name: string; github?: string; url?: string }
  samplePrompts?: { prompt: string; output: string }[]
  skillFile?: string              // URL to raw skill file (optional)
}
```

---

## Copy-Paste Example

### 1. Add catalog entry in `src/data/skills.ts`

Insert into the `skills` array:

```typescript
  {
    id: 'my-new-skill',
    name: 'My New Skill',
    description: 'One-line description of what the skill does.',
    category: 'development',
    tags: ['keyword1', 'keyword2'],
    icon: '◆',
    color: 'oklch(0.72 0.16 200)',
    features: [
      'Feature one',
      'Feature two',
    ],
    useCases: [
      'Use case one',
      'Use case two',
    ],
    compatibility: ['claude', 'cursor'],
    version: '1.0.0',
    lastUpdated: '2026-09-01',
  },
```

### 2. Create skill file in `skills/`

Create `skills/my-new-skill.md`:

```markdown
---
name: my-new-skill
description: One-line description of what the skill does.
---

# My New Skill

Expanded description of the skill.

## Triggers

Use this skill when the user asks about:
- Trigger keyword one
- Trigger keyword two

## Instructions

1. Step one
2. Step two

## Example

**Prompt**: Example user request

**Output**: Example response
```

---

## Where to Put a New Skill

| What | Where |
|------|-------|
| Catalog entry | `src/data/skills.ts` — add to `skills` array |
| Skill file | `skills/<skill-id>.md` or `skills/<skill-id>/SKILL.md` |

**Required**: Catalog entry. Skill file is optional (for detailed instructions).

---

## Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm run typecheck    # TypeScript check
npm run lint         # ESLint
```

---

## Design System (for UI work)

- **Background**: Solid black (#000000)
- **Glass cards**: `backdrop-filter: blur(20px) saturate(180%)`
- **Glass border**: `rgba(255, 255, 255, 0.08)`
- **Category colors**: development=#30d158, documents=#ff6961, creative=#64d2ff, productivity=#a855f7, business=#ffd60a
- **No outer shadows**, only `box-shadow: inset` for highlights
