'use client'

import { useState } from 'react'
import posthog from 'posthog-js'
import { componentDemos, DesignSystemScope } from './component-demos'

const components = [
  { name: 'button', category: 'Atoms', description: 'Primary actions with variant, size, and loading state' },
  { name: 'badge', category: 'Atoms', description: 'Status indicators with semantic color variants' },
  { name: 'input', category: 'Atoms', description: 'Text input with glass variant and icon slots' },
  { name: 'icon', category: 'Atoms', description: 'Icon wrapper with named map and size presets' },
  { name: 'switch', category: 'Atoms', description: 'Toggle control with three size variants' },
  { name: 'avatar', category: 'Atoms', description: 'Profile image with fallback initials' },
  { name: 'label', category: 'Atoms', description: 'Form label with required indicator' },
  { name: 'textarea', category: 'Atoms', description: 'Resizable text area with error state' },
  { name: 'separator', category: 'Atoms', description: 'Horizontal or vertical divider' },
  { name: 'progress', category: 'Atoms', description: 'Progress bar with semantic color states' },
  { name: 'skeleton', category: 'Atoms', description: 'Loading placeholder with shape variants' },
  { name: 'tooltip', category: 'Atoms', description: 'Portal-based tooltip with auto-positioning' },
  { name: 'card', category: 'Molecules', description: 'Content container with glass and interactive variants' },
  { name: 'modal', category: 'Molecules', description: 'Dialog with portal, focus trap, and compound API' },
  { name: 'tabs', category: 'Molecules', description: 'Tabbed navigation with underline and pill styles' },
  { name: 'toast', category: 'Molecules', description: 'Notification with variant styling and auto-dismiss' },
  { name: 'dropdown', category: 'Molecules', description: 'Select with single/multi-select and search' },
  { name: 'accordion', category: 'Molecules', description: 'Collapsible content with animated transitions' },
  { name: 'command-box', category: 'Molecules', description: 'Copyable command display with clipboard' },
  { name: 'theme-toggle', category: 'Molecules', description: 'Dark/light mode toggle button' },
  { name: 'code-block', category: 'Molecules', description: 'Syntax-highlighted code with copy button' },
  { name: 'noise-overlay', category: 'Molecules', description: 'Subtle noise texture overlay' },
  { name: 'nav', category: 'Blocks', description: 'Responsive navigation with mobile drawer' },
  { name: 'hero', category: 'Blocks', description: 'Page hero with badge, title, and CTA buttons' },
  { name: 'section', category: 'Blocks', description: 'Layout section with container options' },
  { name: 'footer', category: 'Blocks', description: 'Site footer with link columns and social icons' },
  { name: 'animated-text', category: 'Utilities', description: 'Text with entrance and exit animations' },
  { name: 'shape', category: 'Utilities', description: 'Decorative geometric shapes' },
  { name: 'character', category: 'Utilities', description: 'Character avatar with expressions' },
  { name: 'speech-bubble', category: 'Utilities', description: 'Speech bubble with tail positioning' },
  { name: 'scroll-indicator', category: 'Utilities', description: 'Scroll progress indicator' },
  { name: 'hamburger-icon', category: 'Utilities', description: 'Animated hamburger menu icon' },
  { name: 'mobile-drawer', category: 'Utilities', description: 'Mobile slide-out drawer' },
  { name: 'error-boundary', category: 'Utilities', description: 'Error boundary with fallback UI' },
  { name: 'composite-shape', category: 'Utilities', description: 'Composed geometric shapes' },
  { name: 'nav-link', category: 'Utilities', description: 'Navigation link with active state' },
]

const hooks = [
  { name: 'use-theme', description: 'Dark/light mode management' },
  { name: 'use-media-query', description: 'Responsive breakpoint detection' },
  { name: 'use-reduced-motion', description: 'Respects prefers-reduced-motion' },
  { name: 'use-keyboard-shortcuts', description: 'Keyboard shortcut registration' },
  { name: 'use-toast', description: 'Toast notification state management' },
  { name: 'use-count-up', description: 'Animated number counting' },
  { name: 'use-scroll-reveal', description: 'Scroll-triggered reveal animations' },
  { name: 'use-stagger-list', description: 'Staggered list entrance animations' },
  { name: 'use-page-transition', description: 'Page transition animations' },
  { name: 'use-text-reveal', description: 'Character-by-character text reveal' },
  { name: 'use-button-pulse', description: 'Button pulse attention animation' },
]

const categories = ['All', 'Atoms', 'Molecules', 'Blocks', 'Utilities', 'Hooks'] as const

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        posthog.capture('component_install_copied', { command: text })
        setTimeout(() => setCopied(false), 2000)
      }}
      className="ml-2 shrink-0 text-xs text-ink-faint transition-colors hover:text-ink-dim"
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

export function ComponentGrid() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('All')

  const filteredComponents = components.filter((c) => {
    const matchesSearch = search === '' ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = activeCategory === 'All' || c.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const filteredHooks = hooks.filter((h) => {
    const matchesSearch = search === '' ||
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = activeCategory === 'All' || activeCategory === 'Hooks'
    return matchesSearch && matchesCategory
  })

  const showComponents = activeCategory !== 'Hooks'
  const showHooks = activeCategory === 'All' || activeCategory === 'Hooks'

  return (
    <div className="mt-8">
      {/* Search + Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search components..."
          className="flex-1 rounded-lg border border-rail bg-bg-soft px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-rail-strong focus:outline-none"
        />
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-accent text-accent-ink'
                  : 'border border-rail text-ink-dim hover:border-rail-strong hover:text-ink'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Components */}
      {showComponents && filteredComponents.length > 0 && (
        <>
          {activeCategory === 'All' ? (
            ['Atoms', 'Molecules', 'Blocks', 'Utilities'].map((category) => {
              const items = filteredComponents.filter((c) => c.category === category)
              if (items.length === 0) return null
              return (
                <section key={category} className="mt-10">
                  <h2 className="flex items-center gap-2 text-sm font-medium text-ink-label">
                    {category}
                    <span className="text-xs text-ink-faint">{items.length}</span>
                  </h2>
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((comp) => (
                      <ComponentCard key={comp.name} name={comp.name} description={comp.description} />
                    ))}
                  </div>
                </section>
              )
            })
          ) : (
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredComponents.map((comp) => (
                <ComponentCard key={comp.name} name={comp.name} description={comp.description} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Hooks */}
      {showHooks && filteredHooks.length > 0 && (
        <section className="mt-10">
          <h2 className="flex items-center gap-2 text-sm font-medium text-ink-label">
            Hooks
            <span className="text-xs text-ink-faint">{filteredHooks.length}</span>
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredHooks.map((hook) => {
              const command = `npx shadcn add https://kit.n3wth.com/r/${hook.name}.json`
              return (
                <div
                  key={hook.name}
                  className="rounded-lg border border-rail p-4"
                >
                  <h3 className="font-mono text-sm font-medium text-ink">
                    {hook.name}
                  </h3>
                  <p className="mt-1.5 text-sm text-ink-dim">
                    {hook.description}
                  </p>
                  <div className="mt-3 flex items-center rounded bg-bg-soft px-2 py-1">
                    <code className="flex-1 truncate font-mono text-xs text-ink-faint">
                      npx shadcn add .../{hook.name}.json
                    </code>
                    <CopyButton text={command} />
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Empty state */}
      {filteredComponents.length === 0 && filteredHooks.length === 0 && (
        <div className="mt-16 text-center">
          <p className="text-ink-dim">No results for &ldquo;{search}&rdquo;</p>
        </div>
      )}
    </div>
  )
}

function ComponentCard({ name, description }: { name: string; description: string }) {
  const command = `npx shadcn add https://kit.n3wth.com/r/${name}.json`
  const Demo = componentDemos[name]

  return (
    <div className="rounded-lg border border-rail overflow-hidden">
      {Demo ? (
        <div className="bg-bg-soft border-b border-rail p-4 min-h-[100px] flex items-center">
          <DesignSystemScope>
            <Demo />
          </DesignSystemScope>
        </div>
      ) : null}
      <div className="p-4">
        <h3 className="font-mono text-sm font-medium text-ink">
          {name}
        </h3>
        <p className="mt-1 text-sm text-ink-dim">
          {description}
        </p>
        <div className="mt-3 flex items-center rounded bg-bg-soft px-2 py-1">
          <code className="flex-1 truncate font-mono text-xs text-ink-faint">
            npx shadcn add .../{name}.json
          </code>
          <CopyButton text={command} />
        </div>
      </div>
    </div>
  )
}
