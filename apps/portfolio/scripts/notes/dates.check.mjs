import assert from 'node:assert/strict'
import test from 'node:test'
import { noteDates, feedDate } from './lib/dates.mjs'

test('feed dates accept date-only and full timestamps without fabricating freshness', () => {
  assert.equal(feedDate('2026-07-22'), '2026-07-22T00:00:00.000Z')
  assert.equal(feedDate('2026-09-25T07:12:34Z'), '2026-09-25T07:12:34.000Z')
  assert.throws(() => feedDate(undefined), /Invalid article date/)
  assert.throws(() => feedDate('bad-date'), /Invalid article date/)
})

test('reviewed updates preserve publication and supersede migration history', () => {
  assert.deepEqual(noteDates({ date: '2026-07-14', updated: '2026-09-25' }, { c: '2026-06-01', m: '2026-07-20' }), { date: '2026-07-14', updated: '2026-09-25' })
})

test('history supplies missing dates without inventing build timestamps', () => {
  assert.deepEqual(noteDates({}, { c: '2026-02-15T08:00:00Z', m: '2026-07-13T09:00:00Z' }), { date: '2026-02-15', updated: '2026-07-13' })
  assert.deepEqual(noteDates({}, {}), {})
  assert.deepEqual(noteDates({ date: '2026-07-14', updated: '2026-06-01' }), { date: '2026-07-14', updated: '2026-07-14' })
})

test('invalid explicit dates fail instead of emitting misleading freshness', () => {
  assert.throws(() => noteDates({ updated: 'not-a-date' }), /Invalid updated date/)
})
