import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router'
import { useGoogleAnalytics } from './useGoogleAnalytics'
import { SiteNav } from './SiteNav'
import { N3wthProvider, PageHeader, SiteContainer } from '@n3wth/ui/site'
import { SiteFooter } from '@n3wth/ui/site'
import { siteUrls } from '@n3wth/site-config'
import { Icon } from '@n3wth/ui'
import { useTheme } from '@n3wth/ui'
import { cn } from '@n3wth/ui'
import { SystemHome } from './SystemHome'
import { TokensSection } from './sections/TokensSection'
import { AtomsSection } from './sections/AtomsSection'
import { MoleculesSection } from './sections/MoleculesSection'
import { OrganismsSection } from './sections/OrganismsSection'
import { HooksSection } from './sections/HooksSection'
import { DocsLayout } from './DocsLayout'
import { SEO } from './SEO'

const sidebarItems = [
  { id: 'tokens', label: 'Design Tokens', icon: 'grid' as const },
  { id: 'atoms', label: 'Controls', icon: 'grid' as const },
  { id: 'molecules', label: 'Compositions', icon: 'code' as const },
  { id: 'organisms', label: 'Site patterns', icon: 'list' as const },
  { id: 'hooks', label: 'Hooks', icon: 'terminal' as const },
]

function Showcase({ theme, toggleTheme }: { theme: 'dark' | 'light'; toggleTheme: () => void }) {
  const [activeSection, setActiveSection] = useState('tokens')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Track active section via intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    )

    for (const item of sidebarItems) {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'instant', block: 'start' })
      setSidebarOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-white)]">
      <SEO
        title="Component examples"
        description="Existing UI component APIs and shared site patterns built on Astryx."
        path="/components"
        ogImage="/og/home.png"
      />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-20 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--color-accent)] focus:text-[var(--color-bg)] focus:rounded-lg focus:outline-none"
        aria-label="Skip to main content"
      >
        Skip to main content
      </a>

      {/* Nav */}
      <SiteNav />

      {/* Hero */}
      <div className="relative">
        <SiteContainer className="n3wth-site-main">
        <PageHeader
          title="Component examples"
          description="Existing UI APIs stay available through the compatibility layer. Use the primitives entry point for native Astryx APIs, and site components for page structure."
          actions={<>
            <a href="#atoms">Browse components</a>
            <a href="https://github.com/n3wth/n3wth/tree/main/packages/ui">View source</a>
          </>}
        />
        </SiteContainer>
      </div>

      {/* Main content with sidebar */}
      <div id="main-content" className="n3wth-site-container">
        <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-12">
          {/* Sidebar - desktop */}
          <aside className="hidden lg:block">
            <nav className="sticky top-20 space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left',
                    'transition-colors duration-150',
                    activeSection === item.id
                      ? 'bg-[var(--glass-bg)] text-[var(--color-white)] border border-[var(--glass-border)]'
                      : 'text-[var(--color-grey-400)] hover:text-[var(--color-white)] hover:bg-[var(--glass-bg)] border border-transparent'
                  )}
                >
                  <Icon name={item.icon} size="sm" />
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Mobile sidebar toggle */}
          <div className="lg:hidden sticky top-16 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-[var(--color-bg)]/80 backdrop-blur-lg border-b border-[var(--glass-border)]">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex items-center gap-2 text-sm text-[var(--color-grey-400)]"
            >
              <Icon name="menu" size="sm" />
              <span>{sidebarItems.find((i) => i.id === activeSection)?.label || 'Navigate'}</span>
              <Icon name={sidebarOpen ? 'chevron-up' : 'chevron-down'} size="xs" />
            </button>
            {sidebarOpen && (
              <nav className="mt-2 p-2 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] space-y-1">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollTo(item.id)}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left',
                      'transition-colors duration-150',
                      activeSection === item.id
                        ? 'bg-[var(--glass-bg)] text-[var(--color-white)]'
                        : 'text-[var(--color-grey-400)]'
                    )}
                  >
                    <Icon name={item.icon} size="sm" />
                    {item.label}
                  </button>
                ))}
              </nav>
            )}
          </div>

          {/* Content */}
          <main className="min-w-0">
            <TokensSection />
            <AtomsSection />
            <MoleculesSection theme={theme} onThemeToggle={toggleTheme} />
            <OrganismsSection />
            <HooksSection />
          </main>
        </div>
      </div>

      {/* Footer */}
      <SiteFooter sourceHref="https://github.com/n3wth/ui" legalLinks={<a href={`${siteUrls.home}/privacy`}>Privacy</a>} />
    </div>
  )
}

export function App() {
  useGoogleAnalytics()
  const { theme, toggleTheme } = useTheme()

  return (
    <N3wthProvider mode={theme}>
    <Routes>
      <Route path="/" element={<SystemHome />} />
      <Route path="/components" element={<Showcase theme={theme} toggleTheme={toggleTheme} />} />
      <Route path="/docs/:slug" element={<DocsLayout />} />
      <Route path="/docs" element={<Navigate to="/docs/getting-started" replace />} />
    </Routes>
    </N3wthProvider>
  )
}
