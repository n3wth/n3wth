import { test, expect } from '@playwright/test'

test('reading pages center their columns and put dates below the title', async ({ page }, testInfo) => {
  for (const slug of ['personal-knowledge-graph', 'audit-retrieval-before-trusting-an-answer']) {
    await page.goto(`/thinking/${slug}`)
    const title = page.getByRole('heading', { level: 1 })
    await expect(title).toBeVisible()
    const bounds = await page.locator('.thinking-reading-page').boundingBox()
    // The root reserves a stable scrollbar gutter even before content overflows.
    // Measure the rendered body rather than viewport/clientWidth, which include it.
    const body = await page.locator('body').boundingBox()
    const left = bounds!.x - body!.x
    const right = body!.x + body!.width - bounds!.x - bounds!.width
    expect(Math.abs(left - right), JSON.stringify({ bounds, body })).toBeLessThan(2)
    const heading = await title.boundingBox()
    const date = await page.locator('main time').first().boundingBox()
    expect(date!.y).toBeGreaterThan(heading!.y + heading!.height)
    await expect(page.locator('main a', { hasText: 'Oliver Newth' })).toHaveCount(0)
    await page.screenshot({ path: testInfo.outputPath(`${slug}.png`) })
  }
})

test('section openings keep readable titles and purposeful visuals', async ({ page }, testInfo) => {
  let opening: { x: number; y: number; size: string } | undefined
  for (const route of ['/art', '/thinking', '/work', '/library', '/projects', '/contact']) {
    await page.goto(route)
    await expect(page.locator('.portfolio-section-title')).toBeVisible()
    const position = await page.locator('.portfolio-section-title').evaluate(element => ({ x: element.getBoundingClientRect().x, y: element.getBoundingClientRect().y, size: getComputedStyle(element).fontSize }))
    if (opening) expect(position).toEqual(opening)
    else opening = position
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({ path: testInfo.outputPath(`${route.slice(1)}-hero.png`) })
  }
})

test('Art uses each installation image once', async ({ page }) => {
  await page.goto('/art')
  await expect(page.getByRole('heading', { name: 'Art', exact: true })).toBeVisible()
  const images = await page.locator('main img').evaluateAll(elements => elements.map(element => element.getAttribute('src')))
  expect(images).toHaveLength(3)
  expect(new Set(images).size).toBe(3)
})
import { expectSiteFoundation } from './site-foundation'

test.beforeEach(async ({ page }) => {
  await page.route(/https:\/\/(elephant\.n3wth\.com|[^/]*posthog\.(com|net))\//, route => route.abort())
})

test('Thinking notes keep local links, topics, anchors and browser Back', async ({ page, request }) => {
  await page.goto('/thinking/frameworks/5-whys#usage')
  await expect(page.getByRole('heading', { level: 1, name: '5 Whys', exact: true })).toBeVisible()
  await expect(page.locator('#usage')).toBeInViewport()
  const contents = page.getByRole('button', { name: 'Contents', exact: true })
  await expect(contents).toHaveAttribute('aria-expanded', 'false')
  await contents.click()
  await expect(contents).toHaveAttribute('aria-expanded', 'true')
  await expect(page.locator('.thinking-note-outline a[href="#usage"]')).toBeVisible()
  await contents.click()
  await expect(contents).toHaveAttribute('aria-expanded', 'false')
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://n3wth.com/thinking/frameworks/5-whys')
  await expect(page.locator('.thinking-note-prose img').first()).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.getByRole('navigation', { name: 'Note topics' }).getByRole('link', { name: 'strategy', exact: true }).click()
  await expect(page).toHaveURL(/\/thinking\?topic=strategy#notes$/)
  await expect(page.getByLabel('Search writing', { exact: true })).toBeVisible()
  await page.getByLabel('Search writing', { exact: true }).fill('5 Whys')
  await expect(page.getByRole('status')).toContainText('1 result')
  await page.locator('#notes').getByRole('link', { name: '5 Whys', exact: true }).click()
  await expect(page).toHaveURL(/\/thinking\/frameworks\/5-whys$/)
  await expect(page.getByRole('heading', { name: 'Linked from', exact: true })).toBeVisible()
  await page.goBack()
  await expect(page.getByLabel('Search writing', { exact: true })).toHaveValue('5 Whys')
  const html = await (await request.get('/thinking/frameworks/5-whys/index.html')).text()
  expect(html).toContain('<h1>5 Whys</h1>')
  expect(html).toContain('https://n3wth.com/thinking/frameworks/5-whys')
  expect(html).toContain('href="/thinking/frameworks/frameworks-map"')
})

test('Thinking loads more writing on scroll and restores its collection and filters', async ({ page }) => {
  await page.goto('/thinking')
  await expect(page.getByRole('heading', { level: 1, name: 'Thinking', exact: true })).toBeVisible()
  await expect(page.locator('.writing-results > li')).toHaveCount(24)
  const scrollBeforeSearch = await page.evaluate(() => scrollY)
  await page.getByLabel('Search writing', { exact: true }).fill('agents')
  await expect(page).toHaveURL(/q=agents#notes$/)
  expect(await page.evaluate(() => scrollY)).toBe(scrollBeforeSearch)
  await page.getByLabel('Search writing', { exact: true }).fill('')
  await page.getByRole('navigation', { name: 'Writing format' }).getByRole('link', { name: 'Articles', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('21 results')
  await page.getByRole('navigation', { name: 'Writing format' }).getByRole('link', { name: 'Notes', exact: true }).click()
  await expect(page).toHaveURL(/kind=notes#notes$/)
  await expect(page.locator('.writing-results > li')).toHaveCount(24)
  await page.locator('.writing-results > li').last().scrollIntoViewIfNeeded()
  await expect(page).toHaveURL(/kind=notes&page=2$/)
  await expect(page.locator('.writing-results > li')).toHaveCount(48)
  const first = page.locator('.writing-results a').nth(23)
  const title = await first.innerText()
  await first.scrollIntoViewIfNeeded()
  const readingPosition = await page.evaluate(() => scrollY)
  await first.click()
  await expect(page.getByRole('heading', { level: 1, name: title, exact: true })).toBeVisible()
  await page.goBack()
  await expect(page).toHaveURL(/kind=notes&page=2$/)
  await expect(page.locator('.writing-results > li')).toHaveCount(48)
  await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(readingPosition, -1)
  await page.getByLabel('Search writing', { exact: true }).fill('5 Whys')
  await expect(page.getByRole('status')).toHaveText('1 result')
  await expect(page.locator('.writing-results a')).toHaveText('5 Whys')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('projects index connects navigation, product pages and documentation', async ({ page, request }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/projects/')
  await expect(page.getByRole('heading', { level: 1, name: 'Projects', exact: true })).toBeVisible()
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://n3wth.com/projects')
  const navigation = page.locator('.n3wth-site-navigation-links')
  await expect(navigation.locator('a').nth(0)).toHaveText('Projects')
  await expect(navigation.locator('a').nth(1)).toHaveText('Work')
  for (const [slug, title] of [['r3', 'r3'], ['ui', '@n3wth/ui'], ['skills', 'Agent Skills']]) {
    await expect(page.getByRole('heading', { level: 2, name: title, exact: true }).getByRole('link')).toBeVisible()
    // Vite preview serves clean URLs through its SPA fallback; inspect the
    // prerendered file that Cloudflare resolves for the production route.
    const response = await request.get(`/projects/${slug}/index.html`)
    expect(response.status()).toBe(200)
    expect(await response.text()).toContain(`<h1>${title}</h1>`)
    await page.goto(`/projects/${slug}`)
    await expect(page.getByRole('heading', { level: 1, name: title, exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Documentation', exact: true })).toHaveAttribute('href', `https://docs.n3wth.com/${slug}/quickstart`)
    await expect(page.getByRole('link', { name: 'All projects', exact: true })).toHaveCount(0)
    await expect(page.locator('.project-install button')).toBeVisible()
    await page.getByRole('button', { name: 'Copy code', exact: true }).click()
    const command = await page.locator('.project-install code').innerText()
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(command)
    if (slug === 'ui') {
      const checkbox = page.getByRole('checkbox', { name: 'Selected', exact: true })
      await expect(checkbox).toBeChecked()
      await checkbox.click()
      await expect(checkbox).not.toBeChecked()
    }
    const projectsLink = navigation.getByRole('link', { name: 'Projects', exact: true })
    if (!await projectsLink.isVisible()) await page.getByRole('button', { name: 'Open menu', exact: true }).click()
    await projectsLink.click()
    await expect(page).toHaveURL(/\/projects$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Projects', exact: true })).toBeVisible()
  }
  expect(await (await request.get('/sitemap.xml')).text()).toContain('<loc>https://n3wth.com/projects</loc>')
})

test('lazy content and its footer appear together', async ({ page }) => {
  let releasePage: () => void = () => {}
  const pendingPage = new Promise<void>(resolve => { releasePage = resolve })
  await page.route('**/assets/Thinking-*.js', async route => {
    await pendingPage
    await route.continue()
  })
  try {
    await page.goto('/thinking', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('main[aria-busy="true"]')).toBeAttached()
    await expect(page.locator('header').first()).toBeVisible()
    await expect(page.locator('.n3wth-site-footer')).toHaveCount(0)
  } finally {
    releasePage()
  }
  await expect(page.locator('main[aria-busy="true"]')).toHaveCount(0)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page).toHaveTitle('Thinking — Oliver Newth')
  await expect(page.locator('.n3wth-site-footer')).toHaveCount(1)
})

test('the project action reaches the projects page after a cold route load', async ({ page }) => {
  // Keep GPU startup out of this routing check. Scene rendering is covered by
  // the home-page checks; this also exercises navigation while it is loading.
  let releaseScene: () => void = () => {}
  const pendingScene = new Promise<void>(resolve => { releaseScene = resolve })
  await page.route('**/assets/NightField-*.js', async route => {
    await pendingScene
    await route.continue()
  })
  await page.route('**/assets/Projects-*.js', async route => {
    await new Promise(resolve => setTimeout(resolve, 600))
    await route.continue()
  })
  try {
    await page.goto('/')
    await page.getByRole('link', { name: 'Explore my projects', exact: true }).click()
    await expect(page).toHaveURL(/\/projects$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Projects' })).toBeInViewport()
  } finally {
    releaseScene()
    await page.unrouteAll({ behavior: 'wait' })
  }
})

test('missing-page recovery works with the keyboard', async ({ page }) => {
  for (const [label, destination] of [['Go home', '/'], ['View work', '/work'], ['Contact', '/contact']]) {
    await page.goto('/missing-portfolio-page')
    const recovery = page.getByRole('link', { name: label, exact: true }).first()
    await recovery.focus()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(destination)
    await expect(page.locator('main')).toBeVisible()
  }
})

test('public navigation clears article and utility metadata', async ({ page }) => {
  for (const initial of ['/error', '/thinking/gtd-mini']) {
    await page.goto(initial)
    const toggle = page.locator('.n3wth-site-navigation-toggle')
    if (await toggle.isVisible()) await toggle.click()
    await page.locator('.n3wth-site-navigation-links').getByRole('link', { name: 'Work', exact: true }).click()
    await expect(page).toHaveTitle('Work — Oliver Newth')
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://n3wth.com/work')
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0)
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website')
    await expect(page.locator('meta[property="article:published_time"]')).toHaveCount(0)
    const articleCount = await page.locator('script[type="application/ld+json"]').evaluateAll(elements => elements.flatMap(element => {
      const schema = JSON.parse(element.textContent || '{}')
      return Array.isArray(schema) ? schema : [schema]
    }).filter(schema => schema['@type'] === 'Article').length)
    expect(articleCount).toBe(0)
  }
})

test('site identity is present in initial HTML and rendered routes', async ({ page, request }) => {
  const response = await request.get('/')
  expect(await response.text()).toContain('"@type": "WebSite"')
  for (const route of ['/', '/work', '/']) {
    await page.goto(route)
    const websites = await page.locator('script[type="application/ld+json"]').evaluateAll(elements => elements.map(element => JSON.parse(element.textContent || '{}')).filter(schema => schema['@type'] === 'WebSite'))
    expect(websites).toHaveLength(1)
    expect(websites[0]).toMatchObject({ name: 'Oliver Newth', alternateName: 'n3wth.com', url: 'https://n3wth.com/' })
  }
  await expect(page.getByText('I build new ways to work with AI.', { exact: true })).toHaveAttribute('data-nosnippet', 'true')
})

test('diagrams are immediately visible with normal motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  for (const route of ['/thinking/gtd-mini', '/library']) {
    await page.goto(route)
    const nodes = page.locator('.kit-node-in')
    await expect(nodes.first()).toBeAttached()
    for (const node of await nodes.all()) await expect(node).toHaveCSS('opacity', '1')
    for (const line of await page.locator('.kit-line-draw').all()) {
      await expect(line).toHaveCSS('stroke-dashoffset', '0px')
    }
  }
})

for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  test(`shared visual bands remain visible with ${reducedMotion} motion`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion })
    for (const route of ['/library', '/contact']) {
      await page.goto(route)
      const band = page.locator('.n3wth-visual-band').first()
      await expect(band).toBeAttached()
      await band.scrollIntoViewIfNeeded()
      await expect(band).toBeVisible()
      await expect(band).toHaveAttribute('aria-hidden', 'true')
      await expect.poll(() => band.evaluate(element => {
        const marks = [...element.querySelectorAll('.n3wth-visual-dot, .n3wth-visual-light-path')]
        return marks.length > 0 && marks.every(mark => {
          const style = getComputedStyle(mark)
          return Number(style.opacity) > 0 && style.visibility !== 'hidden'
            && (!mark.classList.contains('n3wth-visual-light-path') || Number.parseFloat(style.strokeDashoffset) === 0)
        })
      })).toBe(true)
      expect(await band.locator('[data-reveal]').count()).toBe(0)
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true)
    }
  })
}

test('work uses the shared theme and a usable resume action', async ({ page }) => {
  await page.goto('/work')
  await expectSiteFoundation(page, { sectionTopPadding: '0px' })
  await expect(page.locator('#building')).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'Open resume', exact: true })).toHaveAttribute('href', 'https://r2.n3wth.com/resume/oliver-newth-resume.pdf')
})

test('AI answers start automatically after typing pauses', async ({ page }) => {
  let requests = 0
  await page.route('**/api/search', async route => {
    requests += 1
    await route.fulfill({ json: { answer: 'An answer from the site. Sources: [UI](https://ui.n3wth.com/), [Agent Skills](https://n3wth.com/projects/skills).' } })
  })
  await page.goto('/work')
  await page.getByRole('button', { name: 'Search', exact: true }).click()
  await page.getByRole('combobox').fill('garden')
  await expect(page.getByRole('option').first()).toBeVisible()
  await expect(page.getByRole('status', { name: 'Searching', exact: true })).toBeVisible()
  await expect(page.getByText('An answer from the site.')).toBeVisible()
  await expect(page.getByText('AI answer from this site and garden notes')).toHaveCount(0)
  await expect(page.getByRole('navigation', { name: 'Answer sources' }).getByRole('link')).toHaveCount(2)
  expect(requests).toBe(1)
  await expect(page).toHaveURL(/\/work$/)
})

for (const route of ['/', '/work', '/art', '/thinking', '/library', '/contact']) {
  test(`${route} renders without runtime errors or horizontal overflow`, async ({ page }, testInfo) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    const response = await page.goto(route)
    expect(response?.ok()).toBe(true)
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('header').first()).toBeVisible()
    if (route !== '/') await expect(page.locator('h1').first()).toBeVisible()
    if (route === '/') {
      test.setTimeout(60_000)
      await expect(page.locator('.night-field-stage.is-settled')).toBeVisible({ timeout: 45_000 })
      await expect(page.locator('.night-field-loader')).toHaveAttribute('data-ready', 'true')
      for (const name of ['Art', 'Work', 'Thinking', 'Contact', 'Notes', 'Pink Triangle']) {
        const label = page.locator(`.world-portal-link[aria-label="${name}"]`)
        await expect(label).toBeVisible()
      }
      const work = page.locator('.world-portal-link[aria-label="Work"]')
      await work.click({ trial: true })
      const screenshot = testInfo.outputPath('portfolio-home.png')
      await page.screenshot({ path: screenshot })
      await testInfo.attach('portfolio-home', { path: screenshot, contentType: 'image/png' })
    }
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true)
    expect(errors).toEqual([])
  })
}

test('home keeps ordinary writing navigation when WebGL is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (...args) {
      return String(args[0]).includes('webgl') ? null : getContext.apply(this, args)
    } as typeof getContext
  })
  await page.goto('/')
  await expect(page.locator('section[aria-label="Explore the night scene"] img')).toBeVisible()
  await expect(page.locator('canvas')).toHaveCount(0)
  const thinking = page.locator('#primary-navigation').getByRole('link', { name: 'Thinking', exact: true })
  if (!await thinking.isVisible()) await page.getByRole('button', { name: 'Open menu', exact: true }).click()
  await thinking.focus()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/thinking$/)
  await expect(page.getByLabel('Search writing', { exact: true })).toBeVisible()
  await page.getByLabel('Search writing', { exact: true }).fill('5 Whys')
  await page.locator('#notes').getByRole('link', { name: '5 Whys', exact: true }).click()
  await expect(page).toHaveURL(/\/thinking\/frameworks\/5-whys$/)
  await expect(page.getByRole('heading', { level: 1, name: '5 Whys', exact: true })).toBeVisible()
})

test('home primary navigation works before the scene settles', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('navigation', { name: 'Scene destinations' })).toHaveCount(0)
  const navigation = page.locator('#primary-navigation')
  if (!await navigation.getByRole('link', { name: 'Work', exact: true }).isVisible()) {
    await page.getByRole('button', { name: 'Open menu', exact: true }).click()
  }
  for (const name of ['Work', 'Art', 'Thinking', 'Library']) {
    const link = navigation.getByRole('link', { name, exact: true })
    await expect(link).toBeVisible()
    const box = await link.boundingBox()
    expect(box?.height).toBeGreaterThanOrEqual(44)
  }
  await expect(page.locator('h1')).toHaveCount(1)
  await navigation.getByRole('link', { name: 'Work', exact: true }).click()
  await expect(page).toHaveURL(/\/work$/)
})

test('primary navigation opens Work', async ({ page }) => {
  await page.goto('/art')
  const work = page.locator('#primary-navigation').getByRole('link', { name: 'Work', exact: true })
  // Compact navigation exposes the same links through its menu toggle.
  if (!await work.isVisible()) {
    await page.getByRole('button', { name: 'Open menu', exact: true }).click()
  }
  await work.click()
  await expect(page).toHaveURL(/\/work$/)
  await expect(page.locator('h1').first()).toBeVisible()
})
