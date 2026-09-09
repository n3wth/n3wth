import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Tooltip } from './Tooltip'

describe('Tooltip compatibility', () => {
  it('associates the tooltip with the interactive child, while preserving its handler and wrapper ref', () => {
    const onClick = vi.fn()
    const ref = vi.fn()
    render(<Tooltip ref={ref} content="More detail"><button onClick={onClick}>Details</button></Tooltip>)
    const trigger = screen.getByRole('button', { name: 'Details' })
    const tooltip = screen.getByRole('tooltip', { hidden: true })
    expect(trigger).toHaveAttribute('aria-describedby', tooltip.id)
    expect(tooltip).toHaveTextContent('More detail')
    trigger.click()
    expect(onClick).toHaveBeenCalledOnce()
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement))
  })
})
