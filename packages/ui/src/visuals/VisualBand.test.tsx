import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { VisualBand } from './VisualBand'

describe('VisualBand', () => {
  it('renders artwork immediately without a reveal controller', () => {
    const ref = createRef<HTMLDivElement>()
    render(<VisualBand ref={ref} height={240}><svg data-testid="art" /></VisualBand>)
    expect(ref.current).toContainElement(screen.getByTestId('art'))
    expect(ref.current).toHaveAttribute('aria-hidden', 'true')
    expect(ref.current).toHaveStyle({ height: '240px' })
    expect(ref.current).not.toHaveAttribute('data-reveal')
  })
})
