import { fireEvent, render, screen, within } from '@testing-library/react'
import { N3wthProvider } from '@n3wth/ui/site'
import { describe, it, expect } from 'vitest'
import { TokensSection, tokenGroups } from './TokensSection'
import { TypographySection } from './TypographySection'
import { AtomsSection } from './AtomsSection'

describe('documentation specimens', () => {
  it('groups live semantic tokens by purpose without legacy swatches', () => {
    const { container } = render(<N3wthProvider><TokensSection /></N3wthProvider>)
    for (const group of tokenGroups) {
      expect(screen.getByRole('heading', { name: group.title })).toBeInTheDocument()
      for (const [token] of group.tokens) {
        expect(screen.getByText(token, { selector: 'code' })).toBeInTheDocument()
      }
    }
    expect(container.querySelectorAll('.docs-swatch')).toHaveLength(12)
    expect(container.querySelector('.docs-swatch')).toHaveStyle({ backgroundColor: 'var(--color-background-body)' })
  })

  it('renders actual heading roles without adding a second page heading', () => {
    render(<N3wthProvider><TypographySection /></N3wthProvider>)
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'A useful idea', level: 3 })).toHaveClass('n3wth-site-heading--page')
    expect(screen.getByRole('heading', { name: 'How it works', level: 3 })).toHaveClass('n3wth-site-heading--section')
    expect(screen.getByRole('heading', { name: 'The details', level: 3 })).toHaveClass('n3wth-site-heading--item')
  })

  it('preserves interactive controls and input state in compact layouts', () => {
    render(<N3wthProvider><AtomsSection /></N3wthProvider>)
    const buttonBlock = screen.getByRole('heading', { name: 'Button', exact: true }).parentElement!.parentElement!
    const secondary = within(buttonBlock).getByRole('button', { name: 'secondary', exact: true })
    fireEvent.click(secondary)
    expect(secondary).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(within(buttonBlock).getByRole('button', { name: 'Loading', exact: true }))
    expect(within(buttonBlock).getByRole('button', { name: 'Loading', exact: true })).toHaveAttribute('aria-pressed', 'true')
    const input = screen.getByRole('textbox', { name: 'Example input' })
    fireEvent.change(input, { target: { value: 'Readable examples' } })
    expect(input).toHaveValue('Readable examples')
  })
})
