# n3wth/skills

AI assistant skills for Cursor, Gemini CLI, and other AI coding assistants. Markdown files that teach your AI new tricks.

**[skills.n3wth.com](https://skills.n3wth.com)**

## Install

```bash
npx skills add n3wth/skills
```

Or install specific skills:

```bash
npx skills add n3wth/skills --skill cursor-code-review
npx skills add n3wth/skills --skill gsap-animations
```

## Skills

### Cursor and AI Tooling

| Skill | Description |
|-------|-------------|
| `ai-rules-manager` | Generate, version, and manage .cursor/rules files with automatic pattern learning |
| `cursor-agent-orchestrator` | Coordinate multiple AI agents for complex tasks with context handoff |
| `cursor-code-review` | Review AI-generated code for quality and suggest rule improvements |
| `cursor-driven-refactoring` | AI-assisted code refactoring with safety checks and rollback |
| `cursor-git-workflow` | Git operations orchestrated through Cursor with branch management |
| `cursor-linear-bridge` | Sync Linear issues with Cursor tasks and auto-update status |
| `cursor-project-bootstrapper` | Initialize new projects with AI-friendly configurations |
| `cursor-project-scanner` | Analyze codebases to generate AI context and recommendations |
| `cursor-rules-generator` | Generate .cursor/rules from codebase analysis |
| `cursor-usage-analytics` | Track and optimize AI assistant usage patterns |

### Development Tools

| Skill | Description |
|-------|-------------|
| `code-generation-pipeline` | Multi-stage code generation with validation and testing |
| `codebase-context-builder` | Build comprehensive context files for AI assistants |
| `extension-sync` | Sync VS Code/Cursor extensions across machines |
| `git-workflow` | Advanced git workflows with branching strategies |
| `gsap-animations` | Create GSAP animations with ScrollTrigger and SplitText |
| `monorepo-manager` | Manage monorepo dependencies and workspace configurations |
| `settings-distribution-manager` | Distribute IDE settings across teams |
| `vscode-cursor-sync` | Sync settings between VS Code and Cursor |

### Utilities

| Skill | Description |
|-------|-------------|
| `business-panel` | Create dashboard UIs with data visualization |
| `imessage` | iMessage automation and integration |
| `typography-selector` | Font pairing and typography recommendations |

## How it works

Skills are SKILL.md files with YAML frontmatter that follow the [Agent Skills specification](https://agentskills.io). They install to your AI assistant's skills directory and work offline.

```markdown
---
name: skill-name
description: What this skill does and when to use it
---

# Skill Name

Instructions for your AI...
```

## Development

See [AGENTS.md](./AGENTS.md) for development guidelines, design system, and project structure.

```bash
npm install
npm run dev          # localhost:3000
npm run build
npm run test:unit
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js dev server |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm run test:unit` | Unit tests |
| `npm run test:e2e` | Playwright E2E |

## Stack

Next.js 16, React 19, Tailwind CSS 4, TypeScript, Supabase, Vercel

## License

MIT
