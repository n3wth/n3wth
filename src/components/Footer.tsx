import { Linkedin, Mail, ArrowUp } from 'lucide-react'
import { siteConfig } from '../data/content'

const sites = [
  { name: 'n3wth', href: 'https://n3wth.com', current: true },
  { name: 'Skills', href: 'https://skills.n3wth.com' },
  { name: 'UI', href: 'https://ui.n3wth.com' },
  { name: 'Garden', href: 'https://garden.n3wth.com' },
]

const legal = [
  { name: 'Terms', href: '/terms' },
  { name: 'Privacy', href: '/privacy' },
]

const navLinks = [
  { name: 'Home', href: '#' },
  { name: 'Experience', href: '#work' },
  { name: 'Frameworks', href: '#frameworks' },
  { name: 'Creative', href: '#creative' },
  { name: 'Contact', href: '#contact' },
]

const socialLinks = [
  {
    name: 'LinkedIn',
    href: siteConfig.social.linkedin,
    icon: Linkedin,
    external: true,
  },
  {
    name: 'Email',
    href: `mailto:${siteConfig.email}`,
    icon: Mail,
    external: false,
  },
]

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

export function Footer() {
  return (
    <footer
      className="relative py-12 sm:py-16 md:py-20 px-6 md:px-12 border-t"
      style={{ borderColor: 'var(--glass-border)' }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-8 mb-12 sm:mb-16">
          <div>
            <p className="label mb-4">Connect</p>
            <div className="flex items-center gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  {...(link.external && { target: '_blank', rel: 'noopener noreferrer' })}
                  className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 focus-ring"
                  style={{
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--color-grey-400)',
                  }}
                  aria-label={link.name}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--glass-highlight)'
                    e.currentTarget.style.color = 'var(--color-white)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--glass-border)'
                    e.currentTarget.style.color = 'var(--color-grey-400)'
                  }}
                >
                  <link.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="label mb-4">Navigate</p>
            <ul className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm transition-colors hover:text-white link-hover py-1 inline-block"
                    style={{ color: 'var(--color-grey-400)' }}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="label mb-4">Sites</p>
            <ul className="flex flex-col gap-2">
              {sites.map((site) => (
                <li key={site.name}>
                  <a
                    href={site.href}
                    className="text-sm transition-colors hover:text-white link-hover py-1 inline-block"
                    style={{ color: site.current ? 'var(--color-white)' : 'var(--color-grey-400)' }}
                    {...(!site.current && { target: '_blank', rel: 'noopener noreferrer' })}
                  >
                    {site.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex sm:justify-end">
            <button
              type="button"
              onClick={scrollToTop}
              className="flex items-center gap-2 text-sm transition-all duration-200 focus-ring rounded-full px-5 py-2.5 cursor-pointer"
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                color: 'var(--color-grey-400)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--glass-highlight)'
                e.currentTarget.style.color = 'var(--color-white)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--glass-border)'
                e.currentTarget.style.color = 'var(--color-grey-400)'
              }}
              aria-label="Back to top"
            >
              <ArrowUp size={16} />
              <span>Back to top</span>
            </button>
          </div>
        </div>

        <div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-8 border-t"
          style={{ borderColor: 'var(--glass-border)' }}
        >
          <p className="text-xs" style={{ color: 'var(--color-grey-600)' }}>
            &copy; {new Date().getFullYear()} {siteConfig.name}
          </p>

          <div className="flex items-center gap-3 sm:gap-4 text-xs" style={{ color: 'var(--color-grey-500)' }}>
            {legal.map((link, i) => (
              <span key={link.name} className="flex items-center gap-3 sm:gap-4">
                <a
                  href={link.href}
                  className="hover:text-white transition-colors py-1"
                >
                  {link.name}
                </a>
                {i < legal.length - 1 && (
                  <span style={{ color: 'var(--color-grey-700)' }}>/</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
