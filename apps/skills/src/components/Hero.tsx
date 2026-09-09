'use client'
import { PageHeader, SiteContainer, SiteText } from '@n3wth/ui/site'
import { categoryConfig } from '../config/categories'
import { siteConfig } from '../config/site'
import { CategoryShape } from './CategoryShape'

export function Hero() {
  return (
    <div className="relative min-h-[50vh] sm:min-h-[60vh] flex items-end overflow-hidden">
      <SiteContainer className="w-full py-12 sm:py-16 md:py-24">
        <div className="max-w-2xl">
          <PageHeader
            style={{ paddingBlock: 0 }}
            title={<>Skills for<br />coding agents</>}
            description={<>{siteConfig.description}<br />{siteConfig.tagline}</>}
          />

          {/* Category indicators - quiet, minimal */}
          <div className="flex flex-wrap items-center gap-3 mt-6 mb-8">
            {Object.entries(categoryConfig).map(([key]) => (
              <div key={key} className="flex items-center gap-1.5">
                <CategoryShape category={key} size={8} />
                <SiteText as="span" variant="supporting">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </SiteText>
              </div>
            ))}
          </div>

          {/* CTA */}
          <a
            href="#main-content"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium btn-press transition-colors"
            style={{
              color: 'var(--color-white)',
              backgroundColor: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
            }}
          >
            Browse Skills
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </a>
        </div>
      </SiteContainer>
    </div>
  )
}
