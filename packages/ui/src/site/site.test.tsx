import { fireEvent, render, screen } from '@testing-library/react'
import { N3wthProvider, PageHeader, SiteContainer, SiteFooter, SiteHeading, SiteNavigation, SiteSection, SiteText, n3wthTheme } from './index'
import { generateThemeCSS } from '@astryxdesign/core/theme'

describe('shared site composition', () => {
  it('preserves the document outline and native action links', () => {
    render(<N3wthProvider><SiteContainer as="main"><PageHeader title="Work" description="Selected projects" actions={<a href="/resume.pdf">Resume (PDF)</a>} /><SiteSection aria-labelledby="projects"><SiteHeading id="projects">Projects</SiteHeading><SiteHeading variant="item" level={4}>Nested project</SiteHeading><SiteText variant="supporting">Independent work</SiteText></SiteSection></SiteContainer></N3wthProvider>)
    expect(screen.getByRole('main')).toContainElement(screen.getByRole('heading', { name: 'Work', level: 1 }))
    expect(screen.getByRole('region', { name: 'Projects' })).toContainElement(screen.getByRole('heading', { name: 'Nested project', level: 4 }))
    expect(screen.getByRole('link', { name: 'Resume (PDF)' })).toHaveAttribute('href', '/resume.pdf')
    expect(screen.getByText('Selected projects').tagName).toBe('P')
    expect(screen.getByText('Independent work')).toHaveClass('n3wth-site-text--supporting')
    expect(screen.getByRole('main').closest('[data-astryx-theme]')).toHaveAttribute('data-astryx-theme', 'n3wth')
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
  })

  it('renders ReactNode titles without empty optional header slots', () => {
    const { container } = render(<PageHeader title={<span>Garden</span>} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Garden')
    expect(container.querySelector('.n3wth-site-actions')).toBeNull()
    expect(container.querySelector('.n3wth-site-description')).toBeNull()
  })

  it('generates the canonical theme with the shared brand fonts and neutral palette', () => {
    const { component } = generateThemeCSS(n3wthTheme)
    expect(component).toContain('Satoshi')
    expect(component).toContain('Geist Sans')
    expect(component).toContain('#08090b')
    expect(component).toContain('#f2f3f5')
  })

  it('honors an explicit provider mode and header level', () => {
    render(<N3wthProvider mode="light"><PageHeader title="Details" level={2} id="details" /></N3wthProvider>)
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
    expect(screen.getByRole('heading', { level: 2, name: 'Details' }).closest('header')).toHaveAttribute('id', 'details')
    expect(screen.getByRole('heading', { level: 2, name: 'Details' })).toHaveClass('n3wth-site-heading--section')
  })

  it('closes navigation with Escape and restores focus to its trigger', () => {
    render(<SiteNavigation brand={<a href="/">Site</a>} links={<a href="/docs">Docs</a>} />)
    const toggle = screen.getByRole('button', { name: 'Open menu' })
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveFocus()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveFocus()
  })

  it('keeps app link actions and dismisses navigation after activation or outside clicks', () => {
    let activated = false
    render(<SiteNavigation brand={<a href="/">Site</a>} links={<a href="/docs" onClick={event => { event.preventDefault(); activated = true }}>Docs</a>} />)
    const toggle = screen.getByRole('button', { name: 'Open menu' })
    fireEvent.click(toggle)
    fireEvent.click(screen.getByRole('link', { name: 'Docs' }))
    expect(activated).toBe(true)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(toggle)
    fireEvent.pointerDown(document.body)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('keeps hero demonstrations outside the text and gives footer links a landmark', () => {
    render(<><PageHeader title="Kit" actions={<a href="/docs">Start</a>} aside={<pre>Example</pre>} /><SiteFooter brand={<a href="/">Kit</a>} links={<a href="/privacy">Privacy</a>}>Built by Oliver</SiteFooter></>)
    expect(screen.getByText('Example').closest('.n3wth-site-page-header-aside')).not.toBeNull()
    expect(screen.getByRole('navigation', { name: 'Footer' })).toContainElement(screen.getByRole('link', { name: 'Privacy' }))
    expect(screen.getByRole('contentinfo')).toHaveTextContent('Built by Oliver')
  })
})
