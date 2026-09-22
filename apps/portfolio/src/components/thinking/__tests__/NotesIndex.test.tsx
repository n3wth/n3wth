import { afterEach, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { NotesIndex } from '../NotesIndex'
import notes from '../../../data/writing-index.json'
import { registeredPieces } from '../registry'

afterEach(cleanup)

it('restores topic and search from the URL and links notes locally', () => {
  const note = notes.find(entry => entry.tags.length > 0)!
  const query = new URLSearchParams({ topic: note.tags[0], q: note.title })
  render(<MemoryRouter initialEntries={[`/thinking?${query}#notes`]}><NotesIndex /></MemoryRouter>)
  expect(screen.getByRole('textbox', { name: 'Search writing' })).toHaveValue(note.title)
  expect(screen.getByRole('link', { name: note.title })).toHaveAttribute('href', note.href)
  fireEvent.change(screen.getByRole('textbox', { name: 'Search writing' }), { target: { value: 'no-match-72930811' } })
  expect(screen.getByRole('status')).toHaveTextContent('0 results')
})

it('makes the articles grove filter resolve to existing articles', () => {
  render(<MemoryRouter initialEntries={['/thinking?topic=articles#notes']}><NotesIndex /></MemoryRouter>)
  const { meta } = registeredPieces[0]
  expect(screen.getByRole('link', { name: meta.title })).toHaveAttribute('href', `/thinking/${meta.id}`)
})
