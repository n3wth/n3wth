import { expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import ThinkingNote, { type Note } from '../ThinkingNote'

it('uses the UTC calendar date for timestamp publication metadata', () => {
  const note: Note = { slug: 'date-check', href: '/thinking/date-check', title: 'Date check', description: '', date: '2026-07-22T23:45:00-07:00', tags: [], stage: 'seedling', readingTime: '1 min read', html: '<p>Note.</p>', headings: [], backlinks: [] }
  const document = new DOMParser().parseFromString(renderToString(<ThinkingNote note={note} />), 'text/html')
  expect(document.querySelector('time')?.textContent).toBe('Jul 23, 2026')
})
