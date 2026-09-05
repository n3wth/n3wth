/**
 * Generate OG cards for pages that use solid backgrounds: /library and /thinking/:slug
 *
 * These cards don't have photographic plates like /work, /art, etc. They use:
 * - True black background (#08090b, the site's body background)
 * - The n3wth cursor mark (white)
 * - Page title in Satoshi Bold, with eyebrow label
 *
 * Style: family consistency with the photographic cards but no background image.
 *
 *   node scripts/generate-og-solid.mjs [--check]
 */
import { existsSync, mkdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import sharp from 'sharp'
import {
  WIDTH,
  HEIGHT,
  ROOT,
  OG_DIR,
  INK,
  loadFonts,
  layoutText,
  dartPath,
  measureDart,
  dartGroup,
} from './og-design.mjs'

const checkOnly = process.argv.includes('--check')

// Site's true black background
const BG_COLOR = '#08090b'

// Layout for solid cards (positioned differently than photographic ones)
const SOLID_LAYOUT = {
  penX: 80,
  markInk: { x: 84, y: 73, h: 30 },
  eyebrowBaseline: 180,
  titleBaseline: 280,
  titleSize: 72,
  titleTracking: -2.5,
  eyebrowSize: 22,
  eyebrowTracking: 3.5,
  lineStep: 84,
  maxTitleWidth: 1000,
}

// Cards to generate: library + all thinking pieces
function getSolidCards() {
  // Import the registry dynamically since it's TypeScript
  const cards = [
    {
      id: 'library',
      eyebrow: 'LIBRARY',
      titleLines: ['Help yourself'],
      outputPath: 'og/library.png',
    },
  ]

  // Thinking pieces - we'll add these from the registry
  const thinkingPieces = [
    { id: 'night-field', title: 'What the night field broke' },
    { id: 'agents-org-design', title: 'Agents are an org design problem' },
    { id: 'trust-production', title: 'Trust is a runtime property' },
    { id: 'ambient-ai', title: 'AI should be present, not summoned' },
    { id: 'gtd-mini', title: 'The machine that runs my todo list while I sleep' },
    { id: 'ai-design-slop', title: 'Why every AI-generated UI looks the same' },
    { id: 'live-artifacts', title: 'Live artifacts are three different architectures' },
    { id: 'personal-knowledge-graph', title: 'A knowledge base becomes a graph once something else can query it' },
    { id: 'home-automation', title: 'Automation is arbitration plumbing' },
    { id: 'compound-engineering', title: 'Compound engineering, applied to a personal site' },
    { id: 'autonomous-agents', title: 'What "autonomous" actually means in production' },
    { id: 'llm-inference', title: 'The toll booth is memory, not math' },
    { id: 'edge-typescript', title: 'TypeScript at the edge' },
    { id: 'hop-flights', title: 'A computed verdict can still be wrong' },
    { id: 'kroots-map', title: 'Kroots: mapping a graph nobody else could see' },
    { id: 'twilio-compliance', title: 'The toll-free verification maze' },
    { id: 'agent-desks', title: 'A standing team with named desks' },
    { id: '2026-goals', title: 'Working notes: 2026' },
    { id: 'pdf-charspace', title: 'The PDF gotcha that cost an afternoon' },
    { id: 'this-page', title: 'How this backlog got built' },
    { id: 'field-guide', title: 'Tell it as a place' },
  ]

  for (const piece of thinkingPieces) {
    cards.push({
      id: `thinking-${piece.id}`,
      eyebrow: 'THINKING',
      titleLines: wrapTitle(piece.title, 28),
      outputPath: `og/thinking/${piece.id}.png`,
    })
  }

  return cards
}

/** Wrap a title into lines at word boundaries */
function wrapTitle(title, maxChars) {
  if (title.length <= maxChars) return [title]

  const words = title.split(' ')
  const lines = []
  let currentLine = ''

  for (const word of words) {
    const test = currentLine ? `${currentLine} ${word}` : word
    if (test.length <= maxChars) {
      currentLine = test
    } else {
      if (currentLine) lines.push(currentLine)
      currentLine = word
    }
  }
  if (currentLine) lines.push(currentLine)

  // Limit to 3 lines max
  if (lines.length > 3) {
    lines.length = 3
    lines[2] = lines[2].slice(0, -3) + '...'
  }

  return lines
}

function buildSolidOverlay(card, fonts, dart, dartBox) {
  const layers = []
  const layout = SOLID_LAYOUT

  // Mark
  layers.push(dartGroup(dart, dartBox, layout.markInk, INK.dart))

  // Eyebrow
  const eyebrow = layoutText(
    fonts.medium,
    card.eyebrow,
    layout.eyebrowSize,
    layout.eyebrowTracking,
    layout.penX,
    layout.eyebrowBaseline
  )
  layers.push(`<path d="${eyebrow.d}" fill="${INK.eyebrow}"/>`)

  // Title lines
  const titles = card.titleLines.map((line, i) => {
    const baseline = layout.titleBaseline + i * layout.lineStep
    const laid = layoutText(
      fonts.bold,
      line,
      layout.titleSize,
      layout.titleTracking,
      layout.penX,
      baseline
    )
    layers.push(`<path d="${laid.d}" fill="${INK.title}"/>`)
    return laid
  })

  return {
    svg: `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">${layers.join('')}</svg>`,
    eyebrow,
    titles,
  }
}

async function main() {
  const fonts = await loadFonts()
  const dart = dartPath()
  const dartBox = await measureDart(dart)
  const cards = getSolidCards()

  // Ensure thinking OG subdirectory exists
  mkdirSync(join(OG_DIR, 'thinking'), { recursive: true })

  console.log(`Generating ${cards.length} solid-background OG cards...\n`)

  for (const card of cards) {
    const { svg, eyebrow, titles } = buildSolidOverlay(card, fonts, dart, dartBox)

    // Create card with solid background
    const bgSvg = `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg"><rect width="${WIDTH}" height="${HEIGHT}" fill="${BG_COLOR}"/></svg>`
    const bgBuffer = await sharp(Buffer.from(bgSvg)).removeAlpha().raw().toBuffer()

    const png = await sharp(bgBuffer, { raw: { width: WIDTH, height: HEIGHT, channels: 3 } })
      .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
      .removeAlpha()
      .png({ compressionLevel: 9, palette: false })
      .toBuffer()

    const out = join(ROOT, 'public', card.outputPath)
    const meta = await sharp(png).metadata()

    // Ensure output directory exists
    const outDir = join(out, '..')
    mkdirSync(outDir, { recursive: true })

    console.log(
      `${card.id.padEnd(25)} ${meta.width}x${meta.height}  ${(png.length / 1024).toFixed(0)}KB  ` +
        `"${card.eyebrow}" + ${JSON.stringify(card.titleLines)}`
    )

    if (meta.width !== WIDTH || meta.height !== HEIGHT) {
      throw new Error(`${card.id}: rendered ${meta.width}x${meta.height}`)
    }

    if (checkOnly) {
      if (existsSync(out)) {
        const before = await sharp(out).removeAlpha().raw().toBuffer()
        const after = await sharp(png).removeAlpha().raw().toBuffer()
        let differing = 0
        for (let i = 0; i < before.length; i += 3) {
          if (before[i] !== after[i] || before[i + 1] !== after[i + 1] || before[i + 2] !== after[i + 2]) differing++
        }
        console.log(
          `          would change ${differing} of ${WIDTH * HEIGHT} pixels ` +
            `(${((differing / (WIDTH * HEIGHT)) * 100).toFixed(2)}%)`
        )
      } else {
        console.log(`          would create new file`)
      }
      continue
    }

    await sharp(png).toFile(out)
    console.log(`          wrote ${relative(ROOT, out)}`)
  }

  console.log('\nDone.')
}

main().catch((err) => {
  console.error(err.message ?? err)
  process.exit(1)
})
