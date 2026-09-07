'use client'
import { categoryConfig } from '../config/categories'
import { siteConfig } from '../config/site'
import { CategoryShape } from './CategoryShape'

export function Hero() {
  return (
    <div className="relative min-h-[50vh] sm:min-h-[60vh] flex items-end overflow-hidden">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-12 py-12 sm:py-16 md:py-24">
        <div className="max-w-2xl">
          {/* Heading - Satoshi display, left-aligned */}
          <h1 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.15] mb-6"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <span className="text-white">Skills for</span>
            <br />
            <span className="text-white">coding agents</span>
          </h1>

          {/* Description */}
          <p
            className="text-sm sm:text-base leading-relaxed max-w-md mb-6"
            style={{ color: 'var(--color-grey-300)' }}
          >
            {siteConfig.description}
            <br />
            {siteConfig.tagline}
          </p>

          {/* Category indicators - quiet, minimal */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            {Object.entries(categoryConfig).map(([key]) => (
              <div key={key} className="flex items-center gap-1.5">
                <CategoryShape category={key} size={8} />
                <span className="text-xs" style={{ color: 'var(--color-grey-400)' }}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </span>
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
      </div>
    </div>
  )
}
