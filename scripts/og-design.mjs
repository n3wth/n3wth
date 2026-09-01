/**
 * Shared design tokens and text-layout helpers for the per-route OG cards.
 *
 * The four route cards (public/og/*.png) were originally hand-composed and
 * shipped as flat PNGs with the lettering baked in, so there was nothing to
 * re-run when the copy or the mark changed. These tokens were recovered by
 * fitting Satoshi outlines back onto those PNGs: every value below was
 * measured off the originals rather than invented, so a regenerated card
 * lands its type in the same place as the card it replaces.
 *
 * Type is drawn as vector outlines pulled straight from the woff2 files in
 * public/fonts. librsvg (what sharp rasterises SVG with) ignores @font-face,
 * so anything set in `font-family` would silently fall back to a system sans;
 * converting to outlines is what actually guarantees Satoshi.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import sharp from 'sharp'
import * as wawoff2 from 'wawoff2'
import opentype from 'opentype.js'

const here = dirname(fileURLToPath(import.meta.url))
export const ROOT = join(here, '..')
export const PUBLIC = join(ROOT, 'public')
export const OG_DIR = join(PUBLIC, 'og')
export const PLATE_DIR = join(here, 'og-plates')

export const WIDTH = 1200
export const HEIGHT = 630

/* Sampled from the opaque core of each element in the original cards. The
   eyebrow reads identically over art's lit sky and thinking's near-black, so
   it is a flat grey rather than a white at partial opacity. */
export const INK = {
  title: '#f2f3f5',
  eyebrow: '#99a0a5',
  subtitle: '#c9cdd3',
  /* The mark is specified white; against a photo the 13 levels between this
     and the title grey are not separable by eye. */
  dart: '#ffffff',
}

/**
 * What the original cards were set in, recovered by fitting Satoshi back onto
 * them. The plate extractor works from these numbers, because they describe
 * the lettering it has to lift off; nothing here should change.
 *
 * Sizes come from cap heights, which are independent of tracking: the leading
 * capital of the title measures 65px tall on art, work and contact alike
 * (65 / 0.731 = 89), the eyebrow caps 14px (19.15) and the subtitle caps 18px
 * (24.9). Tracking then falls out of the ink widths and agrees to a hundredth
 * of a pixel across independent strings - title -3.03/-3.08/-3.11, subtitle
 * 0.87/0.87/0.84 - which is what a design token looks like from the outside.
 *
 * The title needs the heavy cut and fits it unambiguously. The eyebrow is a
 * coin flip on the evidence (correlation 0.939/0.942 bold against 0.922/0.946
 * medium, i.e. each wins once), so it takes Medium, which is also what the
 * repo's house rule on font weights asks for.
 *
 * The text column is bottom-anchored: the last title line always lands on the
 * same baseline, earlier lines step up, and the eyebrow sits a fixed distance
 * above the first line. That one rule reproduces the measured position of
 * every element on all four cards to within a pixel, including contact's
 * lower block (one title line instead of two).
 */
export const MEASURED = {
  type: {
    title: { weight: 'bold', size: 89, tracking: -3.07 },
    eyebrow: { weight: 'medium', size: 19.15, tracking: 3.2 },
    subtitle: { weight: 'medium', size: 24.9, tracking: 0.86 },
  },
  layout: {
    penX: 80,
    lastTitleBaseline: 489.8,
    lineStep: 86.3,
    eyebrowRise: 104.1,
    subtitleBaseline: 549.5,
    markInk: { x: 84, y: 73, h: 20 },
    /* The old mark's ink sat at x 84..101, y 73..92; the wordmark beside it
       ran to x 204, so the strip is cleared wholesale to drop the wordmark. */
    headerClear: { x0: 78, y0: 68, x1: 210, y1: 99 },
  },
}

/**
 * What gets drawn now.
 *
 * The subtitle carried the bottom third of the card. With it gone the old
 * metrics leave the block stranded 140px above the lower edge, and the eyebrow
 * - 14px of cap height - is unreadable at the size these actually get shown
 * at. So the column is scaled up and re-anchored to sit on roughly the bottom
 * margin the subtitle used to hold (about 70px under the descenders).
 *
 * Everything derives from TITLE_SIZE so the proportions stay put: tracking
 * holds at -0.034em, the line step and the eyebrow's rise keep their ratio to
 * the title, and the mark grows with it. The eyebrow is scaled harder than the
 * title on purpose, since it is the element that was actually failing to read.
 *
 * The ceiling is the longest title: "Most AI safety calls" is 8.11x the title
 * size in ink width, so at 108 it runs to x 956 and still leaves a 244px right
 * margin. Past about 120 it starts crowding the edge.
 */
const TITLE_SIZE = 108
const TITLE_REF = MEASURED.type.title.size

export const TYPE = {
  title: {
    weight: 'bold',
    size: TITLE_SIZE,
    tracking: MEASURED.type.title.tracking * (TITLE_SIZE / TITLE_REF),
  },
  eyebrow: { weight: 'medium', size: 26, tracking: 4.34 },
  subtitle: MEASURED.type.subtitle,
}

export const LAYOUT = {
  penX: MEASURED.layout.penX,
  lastTitleBaseline: 534,
  lineStep: MEASURED.layout.lineStep * (TITLE_SIZE / TITLE_REF),
  eyebrowRise: MEASURED.layout.eyebrowRise * (TITLE_SIZE / TITLE_REF),
  subtitleBaseline: MEASURED.layout.subtitleBaseline,
  markInk: { x: 84, y: 73, h: 30 },
  headerClear: MEASURED.layout.headerClear,
}

export const CARDS = [
  {
    id: 'art',
    eyebrow: 'AFTER DARK',
    titleLines: ['I build things', 'that glow'],
    /* Subtitles are retained only so the extractor knows what to lift off the
       plate; they are not drawn back on. The dash here is an en dash: an em
       dash renders 12px wider than the ink actually in the PNG. */
    subtitle: 'Light installations \u2013 Burning Man & San Francisco',
  },
  {
    id: 'work',
    eyebrow: 'WORK',
    titleLines: ['A decade of AI,', 'in production'],
    subtitle: 'Google \u00b7 Covariant \u00b7 Meta \u00b7 Microsoft',
  },
  {
    id: 'thinking',
    eyebrow: 'THINKING',
    titleLines: ['Most AI safety calls', 'are trade-offs'],
    subtitle: 'Positions from shipping AI at scale',
  },
  {
    id: 'contact',
    eyebrow: 'CONTACT',
    titleLines: ["Let's talk"],
    subtitle: 'oliver@newth.ai \u00b7 San Francisco',
  },
]

/** Baselines for a card, derived from the bottom-anchored rule above. */
export function baselines(card, layout = LAYOUT) {
  const n = card.titleLines.length
  const title = card.titleLines.map((_, i) => layout.lastTitleBaseline - (n - 1 - i) * layout.lineStep)
  return { title, eyebrow: title[0] - layout.eyebrowRise, subtitle: layout.subtitleBaseline }
}

let fontCache = null
export async function loadFonts() {
  if (fontCache) return fontCache
  const read = async (file) => {
    const ttf = await wawoff2.decompress(readFileSync(join(PUBLIC, 'fonts', file)))
    return opentype.parse(ttf.buffer.slice(ttf.byteOffset, ttf.byteOffset + ttf.byteLength))
  }
  fontCache = {
    bold: await read('Satoshi-Bold.woff2'),
    medium: await read('Satoshi-Medium.woff2'),
  }
  return fontCache
}

/**
 * Serialise path commands by hand.
 *
 * opentype.js 2.0.0's toPathData() compacts its output and, for some
 * fractional pen positions, writes a literal "NaN" in place of a coordinate.
 * librsvg stops parsing a path at the first thing it cannot read and keeps
 * whatever it had, so a line of type comes out half-drawn with no warning
 * anywhere. Writing every number plainly costs a few hundred bytes per line
 * and removes the failure mode.
 */
export function pathData(commands, precision = 2) {
  const f = (v) => v.toFixed(precision)
  const out = []
  for (const c of commands) {
    switch (c.type) {
      case 'M':
        out.push(`M ${f(c.x)} ${f(c.y)}`)
        break
      case 'L':
        out.push(`L ${f(c.x)} ${f(c.y)}`)
        break
      case 'C':
        out.push(`C ${f(c.x1)} ${f(c.y1)} ${f(c.x2)} ${f(c.y2)} ${f(c.x)} ${f(c.y)}`)
        break
      case 'Q':
        out.push(`Q ${f(c.x1)} ${f(c.y1)} ${f(c.x)} ${f(c.y)}`)
        break
      case 'Z':
        out.push('Z')
        break
      default:
        throw new Error(`pathData: unhandled command type ${c.type}`)
    }
  }
  return out.join(' ')
}

/**
 * Lay a string out glyph by glyph so tracking can be applied between glyphs
 * (opentype's getPath has no letter-spacing). Returns path data plus the ink
 * bounding box, which the callers use to verify they are drawing what the
 * original card had.
 */
export function layoutText(font, text, size, tracking, penX, penY) {
  const glyphs = font.stringToGlyphs(text)
  const missing = []
  const commands = []
  let x = penX
  let x0 = Infinity
  let x1 = -Infinity
  let y0 = Infinity
  let y1 = -Infinity
  for (let i = 0; i < glyphs.length; i++) {
    const g = glyphs[i]
    if (g.index === 0) missing.push(text[i])
    const path = g.getPath(x, penY, size)
    if (path.commands.length) {
      commands.push(...path.commands)
      const bb = path.getBoundingBox()
      if (Number.isFinite(bb.x1)) {
        x0 = Math.min(x0, bb.x1)
        x1 = Math.max(x1, bb.x2)
        y0 = Math.min(y0, bb.y1)
        y1 = Math.max(y1, bb.y2)
      }
    }
    let adv = (g.advanceWidth * size) / font.unitsPerEm
    if (i + 1 < glyphs.length) {
      adv += (font.getKerningValue(g, glyphs[i + 1]) * size) / font.unitsPerEm
    }
    x += adv + tracking
  }
  const d = pathData(commands)
  if (d.includes('NaN')) {
    throw new Error(`layoutText: non-finite coordinate in path for ${JSON.stringify(text)}`)
  }
  return {
    d,
    missing,
    ink: { x0, x1, y0, y1, w: x1 - x0, h: y1 - y0 },
  }
}

/** Rasterise a path over the card area, returning coverage plus its ink box. */
export async function rasterizePath(d) {
  const svg = `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg"><rect width="${WIDTH}" height="${HEIGHT}" fill="#000"/><path d="${d}" fill="#fff"/></svg>`
  const { data, info } = await sharp(Buffer.from(svg)).greyscale().raw().toBuffer({ resolveWithObject: true })
  if (info.width !== WIDTH || info.height !== HEIGHT) {
    throw new Error(`rasterizePath: got ${info.width}x${info.height}, expected ${WIDTH}x${HEIGHT}`)
  }
  let x0 = Infinity
  let x1 = -Infinity
  let y0 = Infinity
  let y1 = -Infinity
  let count = 0
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      if (data[y * WIDTH + x] > 8) {
        count++
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
    }
  }
  return { data, ink: { x0, x1, y0, y1 }, count }
}

/**
 * Confirm what actually rasterised matches what was laid out. A silent
 * mismatch here means glyphs went missing on the way to pixels.
 */
export function assertRasterMatchesLayout(label, layoutInk, rasterInk, tol = 3) {
  const dx0 = Math.abs(rasterInk.x0 - layoutInk.x0)
  const dx1 = Math.abs(rasterInk.x1 - layoutInk.x1)
  if (!(dx0 <= tol && dx1 <= tol)) {
    throw new Error(
      `${label}: rasterised ink x ${rasterInk.x0}..${rasterInk.x1} does not match laid-out ` +
        `x ${layoutInk.x0.toFixed(1)}..${layoutInk.x1.toFixed(1)} (tolerance ${tol}px)`
    )
  }
}

/** The n3wth mark, read from favicon.svg so there is one source of truth. */
export function dartPath() {
  const svg = readFileSync(join(PUBLIC, 'favicon.svg'), 'utf8')
  const paths = [...svg.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1])
  if (paths.length !== 1) {
    throw new Error(`og-design: expected exactly one <path> in favicon.svg, found ${paths.length}`)
  }
  return paths[0]
}

/**
 * Measure the mark's ink box inside its 32-unit viewBox by rasterising it,
 * so the placement maths does not depend on hand-parsing arc segments.
 */
export async function measureDart(d, probe = 512) {
  const svg = `<svg width="${probe}" height="${probe}" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="${d}" fill="#fff"/></svg>`
  const { data, info } = await sharp(Buffer.from(svg)).greyscale().raw().toBuffer({ resolveWithObject: true })
  let x0 = Infinity
  let x1 = -Infinity
  let y0 = Infinity
  let y1 = -Infinity
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[y * info.width + x] > 8) {
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
    }
  }
  const k = 32 / probe
  return { x0: x0 * k, y0: y0 * k, w: (x1 - x0 + 1) * k, h: (y1 - y0 + 1) * k }
}

/**
 * SVG group that draws the mark with its ink box landing exactly on
 * (target.x, target.y) at target.h tall, preserving aspect.
 */
export function dartGroup(d, box, target, fill) {
  const s = target.h / box.h
  const tx = target.x - box.x0 * s
  const ty = target.y - box.y0 * s
  return `<g transform="translate(${tx.toFixed(3)} ${ty.toFixed(3)}) scale(${s.toFixed(5)})"><path d="${d}" fill="${fill}"/></g>`
}

/**
 * The card overlay: mark, eyebrow, title. Returns the SVG plus the laid-out
 * elements so callers can check what they are about to draw.
 */
export function buildOverlay(card, fonts, dart, dartBox, { type = TYPE, layout = LAYOUT } = {}) {
  const bl = baselines(card, layout)
  const layers = [dartGroup(dart, dartBox, layout.markInk, INK.dart)]

  const eyebrow = layoutText(
    fonts[type.eyebrow.weight],
    card.eyebrow,
    type.eyebrow.size,
    type.eyebrow.tracking,
    layout.penX,
    bl.eyebrow
  )
  if (eyebrow.missing.length) throw new Error(`${card.id}: no glyph for ${eyebrow.missing.join('')}`)
  layers.push(`<path d="${eyebrow.d}" fill="${INK.eyebrow}"/>`)

  const titles = card.titleLines.map((line, i) => {
    const laid = layoutText(
      fonts[type.title.weight],
      line,
      type.title.size,
      type.title.tracking,
      layout.penX,
      bl.title[i]
    )
    if (laid.missing.length) throw new Error(`${card.id}: no glyph for ${laid.missing.join('')}`)
    layers.push(`<path d="${laid.d}" fill="${INK.title}"/>`)
    return laid
  })

  return {
    svg: `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">${layers.join('')}</svg>`,
    eyebrow,
    titles,
    baselines: bl,
  }
}
