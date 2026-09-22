import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { NotesIndex } from '../NotesIndex'
import notes from '../../../data/writing-index.json'
import { registeredPieces } from '../registry'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

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
  expect(document.querySelector('time')).toBeNull()
})

it('shows when a note was tended with an exact accessible date', () => {
  const note = notes[0] as typeof notes[number] & { updated?: string }
  const value = note.updated ?? note.date
  const now = new Date(value)
  now.setUTCDate(now.getUTCDate() + 4)
  now.setUTCHours(12)
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(now)
  render(<MemoryRouter initialEntries={[`/thinking?q=${encodeURIComponent(note.title)}`]}><NotesIndex /></MemoryRouter>)
  const date = screen.getByText('Tended 4 days ago')
  expect(date).toHaveAttribute('datetime', value)
  expect(date).toHaveAttribute('aria-label', `Tended ${new Date(value).toLocaleDateString('en', { dateStyle: 'long', timeZone: 'UTC' })}`)
  expect(date.parentElement).toHaveTextContent(`Tended 4 days ago · Note · ${note.readingTime}`)
})

it('searches articles and notes together and resets a later page on search', () => {
  render(<MemoryRouter initialEntries={['/thinking?page=2']}><NotesIndex /></MemoryRouter>)
  expect(within(screen.getByRole('list')).getAllByRole('listitem')).toHaveLength(48)
  fireEvent.change(screen.getByRole('textbox', { name: 'Search writing' }), { target: { value: registeredPieces[0].meta.title } })
  expect(screen.getByRole('link', { name: registeredPieces[0].meta.title })).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Load more' })).not.toBeInTheDocument()
  fireEvent.change(screen.getByRole('textbox', { name: 'Search writing' }), { target: { value: '5 Whys' } })
  expect(screen.getByRole('link', { name: '5 Whys', exact: true })).toHaveAttribute('href', '/thinking/frameworks/5-whys')
})

it('appends writing and preserves format and sort in the accessible fallback', () => {
  render(<MemoryRouter initialEntries={['/thinking?kind=notes&sort=title']}><NotesIndex /></MemoryRouter>)
  const results = screen.getByRole('list')
  expect(within(results).getAllByRole('listitem')).toHaveLength(24)
  const firstTitle = within(results).getAllByRole('link')[0].textContent
  expect(screen.getByRole('link', { name: 'Load more' })).toHaveAttribute('href', '/thinking?kind=notes&sort=title&page=2')
  fireEvent.click(screen.getByRole('link', { name: 'Load more' }))
  expect(within(results).getAllByRole('listitem')).toHaveLength(48)
  expect(within(results).getAllByRole('link')[0]).toHaveTextContent(firstTitle!)
  expect(screen.getByRole('link', { name: 'Load more' })).toHaveAttribute('href', '/thinking?kind=notes&sort=title&page=3')
})
