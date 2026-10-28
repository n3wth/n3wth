import { describe, expect, it } from 'vitest'
import { answerLinkHref } from '../answerLinks'

describe('AI answer link destinations', () => {
  it.each([
    'javascript:alert', 'JaVaScRiPt:alert', 'java\tscript:alert',
    'data:text/html,test', 'vbscript:test', 'file:///tmp/test',
    'https://[invalid', '', '  ',
  ])('rejects non-web or invalid destination %j', href => {
    expect(answerLinkHref(href)).toBeNull()
  })

  it.each([
    '/work', '#details', './projects', 'https://n3wth.com/work',
    'http://example.com', '//example.com/path',
  ])('preserves a valid web destination %j', href => {
    expect(answerLinkHref(href)).toBe(href)
  })
})
