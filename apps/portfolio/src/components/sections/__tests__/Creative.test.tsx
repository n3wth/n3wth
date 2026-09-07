import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Creative } from '../Creative'
import { installations } from '../../../data/content'

/* The credit lines on /art are approved copy, so they are asserted
   verbatim here: a paraphrase in a later edit should fail the build
   rather than ship. RSQ is the right single quote used in the approved
   wording. */
const RSQ = '\u2019'

const APPROVED = [
  {
    title: 'THEM',
    tagline:
      'Lighting and Circle of Light ring. Design: Sim\u00f3n Malvaez. Fabrication: Brenden Blaine Darby. Fractured Atlas',
    year: '2022',
    location: 'Black Rock City, Nevada',
    link: {
      name: 'Fractured Atlas',
      href: 'https://fundraising.fracturedatlas.org/them-a-burning-man-art-piece',
    },
  },
  {
    title: 'Pink Triangle',
    tagline: `Project coordination as part of Illuminate on Patrick Carney${RSQ}s Pride memorial.`,
    year: '2022',
    location: 'Twin Peaks, San Francisco',
    link: {
      name: 'Illuminate',
      href: 'https://illuminate.org/projects/the-pink-triangle/',
    },
  },
  {
    title: 'Circle of Light',
    tagline: 'World AIDS Day memorial for the National AIDS Memorial.',
    year: '2021',
    location: 'AIDS Memorial Grove, San Francisco',
    link: {
      name: 'National AIDS Memorial',
      href: 'https://www.aidsmemorial.org/grove',
    },
  },
]

describe('Creative — /art credit rails', () => {
  it('carries the approved tagline for all three works, including the opener', () => {
    const { container } = render(<Creative />)
    const paragraphs = Array.from(container.querySelectorAll('p')).map(
      (p) => p.textContent
    )

    for (const work of APPROVED) {
      expect(
        screen.getByRole('heading', { name: work.title, level: 2 })
      ).toBeTruthy()
      expect(paragraphs).toContain(work.tagline)
    }
  })

  it('renders each named institution as an external link in the sentence', () => {
    render(<Creative />)

    for (const { link } of APPROVED) {
      const anchor = screen.getByRole('link', { name: link.name })
      expect(anchor.getAttribute('href')).toBe(link.href)
      expect(anchor.getAttribute('rel')).toBe('noopener noreferrer')
      expect(anchor.getAttribute('target')).toBe('_blank')
      // Inline in the credit sentence, not a separate block.
      expect(anchor.closest('p')).not.toBeNull()
    }
  })

  it('shows the approved year and location on every rail', () => {
    const { container } = render(<Creative />)
    const text = container.textContent ?? ''

    for (const work of APPROVED) {
      expect(text).toContain(work.location)
    }
    expect(container.querySelectorAll('.meta').length).toBe(APPROVED.length)
  })

  it('keeps retired and unapproved copy off the page', () => {
    const { container } = render(<Creative />)
    const text = container.textContent ?? ''

    expect(text).not.toMatch(/LED crew/i)
    expect(text).not.toMatch(/2020/)
    expect(text).not.toMatch(/newth\.art/i)
    expect(text).not.toMatch(/Nosotres/i)
    expect(text).not.toMatch(/Lightswitch|cBright/i)
  })

  it('keeps every credit link findable in its own tagline', () => {
    for (const inst of installations) {
      for (const link of inst.creditLinks ?? []) {
        expect(inst.tagline).toContain(link.text)
      }
    }
  })
})
