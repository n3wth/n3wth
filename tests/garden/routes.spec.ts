import { test, expect } from '@playwright/test'

function gardenAnswer(...chunks: string[]) {
  return chunks.map(content => `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`).join('') + 'data: [DONE]\n\n'
}

test('typing a garden query keeps results local until explicitly asked', async ({ page }) => {
  const requests: string[] = []
  await page.route('**/api/ai-search', async route => {
    requests.push(route.request().postData() ?? '')
    await route.fulfill({ contentType: 'text/event-stream', body: gardenAnswer('Unexpected remote answer.') })
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Search notes', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Search the garden' })
  await dialog.getByRole('combobox').fill('Atomic Notes')
  await expect(dialog.getByRole('option', { name: /Atomic Notes/ })).toBeVisible()
  await expect(dialog.getByRole('button', { name: 'Ask the garden', exact: true })).toBeEnabled()
  await page.waitForTimeout(650)
  expect(requests).toEqual([])
})

for (const preference of ['light', 'dark'] as const) {
test(`asking the garden renders streamed answers in dark mode with ${preference} system preference`, async ({ page }, testInfo) => {
  await page.emulateMedia({ colorScheme: preference })
  const requests: { method: string; body: unknown }[] = []
  await page.route('**/api/ai-search', async route => {
    requests.push({ method: route.request().method(), body: route.request().postDataJSON() })
    await route.fulfill({
      contentType: 'text/event-stream',
      body: gardenAnswer('An atomic note holds ', 'one self-contained idea.'),
    })
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Search notes', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Search the garden' })
  await dialog.getByRole('combobox').fill('Atomic Notes')
  await dialog.getByRole('button', { name: 'Ask the garden', exact: true }).click()
  await expect(dialog.getByText('An atomic note holds one self-contained idea.', { exact: true })).toBeVisible()
  expect(requests).toEqual([{ method: 'POST', body: { query: 'Atomic Notes' } }])
  await expect(dialog.getByRole('option', { name: /Atomic Notes/ })).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.screenshot({ path: testInfo.outputPath(`garden-answer-${preference}-preference.png`) })
})
}

test('an upstream garden answer failure keeps local notes usable', async ({ page }) => {
  await page.route('**/api/ai-search', route => route.fulfill({ status: 503, body: 'Unavailable' }))
  await page.goto('/')
  await page.getByRole('button', { name: 'Search notes', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Search the garden' })
  await dialog.getByRole('combobox').fill('Atomic Notes')
  const localNote = dialog.getByRole('option', { name: /Atomic Notes/ })
  await expect(localNote).toBeVisible()
  await dialog.getByRole('button', { name: 'Ask the garden', exact: true }).click()
  await expect(dialog.getByRole('alert')).toContainText('The garden could not answer. Try again or open a note from the results.')
  await expect(localNote).toBeVisible()
  await localNote.click()
  await expect(page).toHaveURL(/\/atomic-notes$/)
})

test('a partial garden answer ending without DONE shows an error and keeps local notes usable', async ({ page }) => {
  await page.route('**/api/ai-search', route => route.fulfill({
    contentType: 'text/event-stream',
    body: `data: ${JSON.stringify({ choices: [{ delta: { content: 'An incomplete answer.' } }] })}\n\n`,
  }))
  await page.goto('/')
  await page.getByRole('button', { name: 'Search notes', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Search the garden' })
  await dialog.getByRole('combobox').fill('Atomic Notes')
  await dialog.getByRole('button', { name: 'Ask the garden', exact: true }).click()
  await expect(dialog.getByRole('alert')).toContainText('The garden could not answer. Try again or open a note from the results.')
  await expect(dialog.getByText('An incomplete answer.', { exact: true })).toHaveCount(0)
  const localNote = dialog.getByRole('option', { name: /Atomic Notes/ })
  await expect(localNote).toBeVisible()
  await localNote.click()
  await expect(page).toHaveURL(/\/atomic-notes$/)
})

test('editing a garden query clears its previous answer without asking again', async ({ page }) => {
  let requests = 0
  await page.route('**/api/ai-search', async route => {
    requests += 1
    await route.fulfill({ contentType: 'text/event-stream', body: gardenAnswer('The previous query answer.') })
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Search notes', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Search the garden' })
  const input = dialog.getByRole('combobox')
  await input.fill('Atomic Notes')
  await dialog.getByRole('button', { name: 'Ask the garden', exact: true }).click()
  const answer = dialog.getByText('The previous query answer.', { exact: true })
  await expect(answer).toBeVisible()
  await input.fill('5 Whys')
  await expect(answer).toHaveCount(0)
  await expect(dialog.getByRole('option', { name: /5 Whys/ })).toBeVisible()
  await page.waitForTimeout(650)
  expect(requests).toBe(1)
  await expect(answer).toHaveCount(0)
})

test('closing and reopening garden search clears the query and answer', async ({ page }) => {
  let requests = 0
  await page.route('**/api/ai-search', async route => {
    requests += 1
    await route.fulfill({ contentType: 'text/event-stream', body: gardenAnswer('An answer from the previous visit.') })
  })
  await page.goto('/')
  const openSearch = page.getByRole('button', { name: 'Search notes', exact: true })
  await openSearch.click()
  const dialog = page.getByRole('dialog', { name: 'Search the garden' })
  const input = dialog.getByRole('combobox')
  await input.fill('Atomic Notes')
  await dialog.getByRole('button', { name: 'Ask the garden', exact: true }).click()
  await expect(dialog.getByText('An answer from the previous visit.', { exact: true })).toBeVisible()
  await input.press('Escape')
  await expect(dialog).toBeHidden()
  await openSearch.click()
  await expect(input).toHaveValue('')
  await expect(dialog.getByText('An answer from the previous visit.', { exact: true })).toHaveCount(0)
  await expect(dialog.getByRole('alert')).toHaveCount(0)
  await page.waitForTimeout(650)
  expect(requests).toBe(1)
})

for (const action of ['editing', 'closing'] as const) {
  test(`${action} garden search cancels an in-flight answer`, async ({ page }) => {
    let releaseAnswer: () => void = () => {}
    const pendingAnswer = new Promise<void>(resolve => { releaseAnswer = resolve })
    await page.route('**/api/ai-search', async route => {
      await pendingAnswer
      await route.fulfill({ contentType: 'text/event-stream', body: gardenAnswer('A stale delayed answer.') })
    })
    try {
      await page.goto('/')
      const openSearch = page.getByRole('button', { name: 'Search notes', exact: true })
      await openSearch.click()
      const dialog = page.getByRole('dialog', { name: 'Search the garden' })
      const input = dialog.getByRole('combobox')
      await input.fill('Atomic Notes')
      const requestStarted = page.waitForRequest('**/api/ai-search')
      await dialog.getByRole('button', { name: 'Ask the garden', exact: true }).click()
      const request = await requestStarted
      await expect(dialog.getByRole('status').filter({ hasText: 'Searching the garden...' })).toBeVisible()
      const requestCancelled = page.waitForEvent('requestfailed', { predicate: failed => failed === request, timeout: 5000 })
      if (action === 'editing') {
        await input.fill('5 Whys')
        await expect(dialog.getByRole('option', { name: /5 Whys/ })).toBeVisible()
      } else {
        await input.press('Escape')
        await expect(dialog).toBeHidden()
        await openSearch.click()
        await expect(input).toHaveValue('')
      }
      expect((await requestCancelled).failure()?.errorText).toContain('ERR_ABORTED')
      releaseAnswer()
      await page.unrouteAll({ behavior: 'wait' })
      await expect(dialog.getByText('A stale delayed answer.', { exact: true })).toHaveCount(0)
      await expect(dialog.getByRole('alert')).toHaveCount(0)
      await expect(dialog.getByText('Searching the garden...', { exact: true })).toHaveCount(0)
    } finally {
      releaseAnswer()
      await page.unrouteAll({ behavior: 'wait' })
    }
  })
}

test('article calendar date stays stable across browser timezones', async ({ browser }) => {
  for (const timezoneId of ['America/Los_Angeles', 'Asia/Tokyo']) {
    const context = await browser.newContext({ timezoneId })
    const page = await context.newPage()
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('http://127.0.0.1:4284/astryx-vs-shadcn-vs-angular-material')
    await expect(page.locator('time[datetime="2026-07-14T00:00:00.000Z"]')).toHaveText('Jul 14, 2026')
    await page.getByRole('button', { name: 'Search notes' }).click()
    expect(errors).toEqual([])
    await context.close()
  }
})

test('note listing and nested note remain readable', async ({ page }, testInfo) => {
  for (const route of ['/', '/notes', '/frameworks/5-whys']) {
    const response = await page.goto(route)
    expect(response?.ok()).toBe(true)
    await expect(page.locator('main h1').first()).toBeVisible()
    await expect(page.locator('main')).toContainText(route === '/' ? 'A garden of growing ideas' : route === '/notes' ? 'Every plant' : '5 Whys')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true)
    const nav = await page.locator('.n3wth-site-navigation-island').boundingBox()
    expect(nav).not.toBeNull()
    expect(nav!.x).toBeGreaterThanOrEqual(0)
    expect(nav!.x + nav!.width).toBeLessThanOrEqual(page.viewportSize()!.width)
    if (route === '/') {
      const heading = await page.locator('main h1').first().boundingBox()
      expect(heading!.y).toBeGreaterThanOrEqual(nav!.y + nav!.height)
    }
    for (const control of await page.locator('.n3wth-site-navigation-island a:visible, .n3wth-site-navigation-island button:visible').all()) {
      const bounds = await control.boundingBox()
      expect(bounds).not.toBeNull()
      expect(bounds!.x).toBeGreaterThanOrEqual(0)
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width)
    }
    await page.screenshot({ path: testInfo.outputPath(route === '/' ? 'home.png' : route === '/notes' ? 'notes.png' : 'note.png') })
  }
})

test('home offers a textual notes entry and the index can reset its filters', async ({ page }) => {
  await page.goto('/')
  const notes = page.getByRole('link', { name: 'Notes', exact: true })
  if (!await notes.isVisible()) {
    await page.getByRole('button', { name: 'Open menu', exact: true }).click()
  }
  await notes.click()
  await expect(page).toHaveURL(/\/notes$/)
  await expect(page.getByRole('button', { name: 'Reset', exact: true })).toHaveCount(0)
  await page.getByPlaceholder(/Search \d+ notes/).fill('evergreen')
  const reset = page.getByRole('button', { name: 'Reset', exact: true })
  await expect(reset).toBeVisible()
  await reset.click()
  await expect(reset).toHaveCount(0)
})

test('discovery feeds and note OG assets remain available', async ({ request }) => {
  for (const [route, type] of [
    ['/feed.xml', 'application/rss+xml'], ['/sitemap.xml', 'application/xml'],
    ['/robots.txt', 'text/plain'], ['/llms.txt', 'text/plain'], ['/og/frameworks/5-whys', 'image/png'],
  ]) {
    const response = await request.get(route)
    expect(response.ok()).toBe(true)
    expect(response.headers()['content-type']).toContain(type)
  }
})

test('comparison leads to the ownership guide', async ({ page, request }, testInfo) => {
  await page.goto('/astryx-vs-shadcn-vs-angular-material')
  await page.getByRole('link', { name: 'Choose UI component ownership', exact: true }).click()
  await expect(page).toHaveURL(/\/choose-ui-component-ownership$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Choose UI component ownership')
  await expect(page.getByRole('heading', { name: 'Assign fixes and checks', exact: true })).toBeAttached()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true)
  expect(await page.evaluate(() => window.scrollY)).toBe(0)
  await page.screenshot({ path: testInfo.outputPath('ownership.png') })
  await page.goBack()
  await expect(page).toHaveURL(/\/astryx-vs-shadcn-vs-angular-material$/)
  const sitemap = await request.get('/sitemap.xml')
  expect(await sitemap.text()).toContain('https://garden.n3wth.com/choose-ui-component-ownership')
})
