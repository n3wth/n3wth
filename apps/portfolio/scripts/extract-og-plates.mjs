/**
 * Lift the baked lettering off the original route OG cards, leaving clean
 * background plates for scripts/generate-og-images.mjs to draw onto.
 *
 * The four cards in public/og/ shipped as flat PNGs with the mark, wordmark,
 * eyebrow, title and subtitle already rendered into the pixels, so the artwork
 * and the type could not be separated. This reconstructs the background that
 * was underneath: Satoshi outlines are laid down on the metrics measured off
 * these same PNGs to mask exactly the glyphs that are present, the mask is
 * topped up with any bright pixels still sitting next to it, and everything
 * covered is refilled by solving Laplace's equation across the masked pixels
 * with the surrounding ones held fixed.
 *
 * Harmonic fill suits these plates because the lettering only ever sits on
 * smooth material - the lit sky on art, a near-black field on work, the soft
 * light trail on thinking - and glyph strokes are narrow next to it. Every
 * pixel outside the mask is passed through untouched and that is asserted, so
 * the artwork itself cannot drift.
 *
 * Run against the original lettered cards only; it refuses to run on cards
 * that have already been regenerated. Output is lossless WebP, kept out of
 * public/ because plates are a build input and should not be served.
 *
 *   node scripts/extract-og-plates.mjs [--report]
 */
import { mkdirSync, existsSync } from 'node:fs'
import { join, relative } from 'node:path'
import sharp from 'sharp'
import {
  WIDTH,
  HEIGHT,
  ROOT,
  OG_DIR,
  PLATE_DIR,
  MEASURED,
  CARDS,
  baselines,
  loadFonts,
  layoutText,
  rasterizePath,
  assertRasterMatchesLayout,
} from './og-design.mjs'

/* Plates describe the cards as they were, so extraction works from the
   measured metrics, never from whatever the generator is drawing today. */
const { type: TYPE, layout: LAYOUT } = MEASURED

const reportOnly = process.argv.includes('--report')

/* Ink widths measured off the original cards, used to confirm the strings and
   metrics still describe what is actually in the PNG. Only elements the
   detector could read cleanly are listed: art's eyebrow is grey on a lit sky,
   and every element on work sits in a field of bright lattice dots that
   inflates any measured box, so those are not asserted against a contaminated
   number - the removal check at the end covers them instead. */
const EXPECTED_INK_W = {
  art: { title0: 483, subtitle: 599 },
  thinking: { eyebrow: 111, title1: 522, subtitle: 410 },
  contact: { eyebrow: 107, title0: 326, subtitle: 379 },
}

const WIDTH_TOLERANCE = 5
const MASK_DILATE = 3
const TOPUP_REACH = 8
const BRIGHT_CONTRAST = 45

function lumaAt(data, ch, x, y) {
  const o = (y * WIDTH + x) * ch
  return 0.299 * data[o] + 0.587 * data[o + 1] + 0.114 * data[o + 2]
}

function percentile(sorted, p) {
  const i = Math.max(0, Math.min(sorted.length - 1, Math.floor(p * (sorted.length - 1))))
  return sorted[i]
}

/**
 * Pixels in a band that are brighter than their own row's background. Judging
 * against the row rather than a fixed level is what lets one threshold work
 * over both art's lit sky and thinking's near-black field.
 */
function brightPixels(data, ch, [x0, y0, x1, y1], threshold) {
  const hits = []
  for (let y = y0; y < y1; y++) {
    const row = []
    for (let x = x0; x < x1; x++) row.push(lumaAt(data, ch, x, y))
    const sorted = [...row].sort((a, b) => a - b)
    const bg = percentile(sorted, 0.2)
    for (let x = x0; x < x1; x++) {
      if (row[x - x0] - bg > threshold) hits.push(y * WIDTH + x)
    }
  }
  return hits
}

function dilate(mask, r) {
  let cur = mask
  for (let pass = 0; pass < r; pass++) {
    const next = new Uint8Array(cur)
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        if (cur[y * WIDTH + x]) continue
        let hit = 0
        for (let dy = -1; dy <= 1 && !hit; dy++) {
          for (let dx = -1; dx <= 1 && !hit; dx++) {
            const nx = x + dx
            const ny = y + dy
            if (nx < 0 || ny < 0 || nx >= WIDTH || ny >= HEIGHT) continue
            if (cur[ny * WIDTH + nx]) hit = 1
          }
        }
        if (hit) next[y * WIDTH + x] = 1
      }
    }
    cur = next
  }
  return cur
}

/**
 * Refill masked pixels with a harmonic function matching the unmasked
 * surroundings: seed by interpolating along each row, then relax with
 * over-corrected Gauss-Seidel until the field stops moving.
 */
function inpaint(planes, mask, { maxIter = 8000, tol = 0.05, omega = 1.85 } = {}) {
  const idx = []
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      if (mask[y * WIDTH + x]) idx.push(y * WIDTH + x)
    }
  }
  if (idx.length === 0) return { iterations: 0 }

  for (const plane of planes) {
    for (let y = 0; y < HEIGHT; y++) {
      let x = 0
      while (x < WIDTH) {
        if (!mask[y * WIDTH + x]) {
          x++
          continue
        }
        let end = x
        while (end < WIDTH && mask[y * WIDTH + end]) end++
        const leftX = x - 1
        const rightX = end
        const hasL = leftX >= 0
        const hasR = rightX < WIDTH
        const lv = hasL ? plane[y * WIDTH + leftX] : 0
        const rv = hasR ? plane[y * WIDTH + rightX] : 0
        for (let k = x; k < end; k++) {
          if (hasL && hasR) {
            const t = (k - leftX) / (rightX - leftX)
            plane[y * WIDTH + k] = lv + (rv - lv) * t
          } else if (hasL) plane[y * WIDTH + k] = lv
          else if (hasR) plane[y * WIDTH + k] = rv
        }
        x = end
      }
    }
  }

  let iterations = 0
  for (let it = 0; it < maxIter; it++) {
    let maxDelta = 0
    for (const plane of planes) {
      for (let n = 0; n < idx.length; n++) {
        const i = idx[n]
        const x = i % WIDTH
        const y = (i - x) / WIDTH
        let sum = 0
        let cnt = 0
        if (x > 0) {
          sum += plane[i - 1]
          cnt++
        }
        if (x < WIDTH - 1) {
          sum += plane[i + 1]
          cnt++
        }
        if (y > 0) {
          sum += plane[i - WIDTH]
          cnt++
        }
        if (y < HEIGHT - 1) {
          sum += plane[i + WIDTH]
          cnt++
        }
        const delta = omega * (sum / cnt - plane[i])
        plane[i] += delta
        const ad = delta < 0 ? -delta : delta
        if (ad > maxDelta) maxDelta = ad
      }
    }
    iterations = it + 1
    if (maxDelta < tol) break
  }
  return { iterations }
}

async function main() {
  const fonts = await loadFonts()
  mkdirSync(PLATE_DIR, { recursive: true })

  for (const card of CARDS) {
    const src = join(OG_DIR, `${card.id}.png`)
    if (!existsSync(src)) throw new Error(`missing ${src}`)
    const { data, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true })
    const ch = info.channels
    if (info.width !== WIDTH || info.height !== HEIGHT) {
      throw new Error(`${card.id}: expected ${WIDTH}x${HEIGHT}, got ${info.width}x${info.height}`)
    }

    console.log(`\n${'='.repeat(72)}\n${card.id}\n${'='.repeat(72)}`)

    /* The wordmark must still be there, otherwise this is a card we already
       regenerated and re-extracting would start eating the artwork. */
    const wordmarkInk = brightPixels(data, ch, [121, 70, 205, 96], 60)
    if (wordmarkInk.length < 40) {
      throw new Error(
        `${card.id}: no wordmark found (${wordmarkInk.length} bright px). This looks like an ` +
          `already-regenerated card - extract only from the original lettered PNGs.`
      )
    }
    console.log(`  wordmark present (${wordmarkInk.length} bright px)`)

    const bl = baselines(card, LAYOUT)
    const pieces = [
      { name: 'eyebrow', type: TYPE.eyebrow, text: card.eyebrow, penY: bl.eyebrow },
      ...card.titleLines.map((line, i) => ({
        name: `title${i}`,
        type: TYPE.title,
        text: line,
        penY: bl.title[i],
      })),
      { name: 'subtitle', type: TYPE.subtitle, text: card.subtitle, penY: bl.subtitle },
    ]

    const glyphMask = new Uint8Array(WIDTH * HEIGHT)
    for (const p of pieces) {
      const laid = layoutText(fonts[p.type.weight], p.text, p.type.size, p.type.tracking, LAYOUT.penX, p.penY)
      if (laid.missing.length) {
        throw new Error(`${card.id}/${p.name}: font has no glyph for ${JSON.stringify(laid.missing.join(''))}`)
      }
      const raster = await rasterizePath(laid.d)
      assertRasterMatchesLayout(`${card.id}/${p.name}`, laid.ink, raster.ink)

      const expected = EXPECTED_INK_W[card.id]?.[p.name]
      const delta = expected === undefined ? null : laid.ink.w - expected
      console.log(
        `  ${p.name.padEnd(9)} ink w=${laid.ink.w.toFixed(1).padStart(6)} x0=${laid.ink.x0.toFixed(1).padStart(5)} baseline=${p.penY.toFixed(1)}` +
          (delta === null ? '' : `  vs measured ${expected} (${delta >= 0 ? '+' : ''}${delta.toFixed(1)})`)
      )
      if (delta !== null && Math.abs(delta) > WIDTH_TOLERANCE) {
        throw new Error(
          `${card.id}/${p.name}: rendered ink is ${delta.toFixed(1)}px off the original ` +
            `(${laid.ink.w.toFixed(1)} vs ${expected}) - the string or the metrics no longer match the card`
        )
      }

      /* Judge removal over the glyphs' own footprint. A wider band would pick
         up the lattice dots on work, the light trail on thinking and the lit
         sky on art, none of which this is meant to measure. */
      p.band = [
        Math.max(0, Math.floor(laid.ink.x0) - 6),
        Math.max(0, Math.floor(laid.ink.y0) - 6),
        Math.min(WIDTH, Math.ceil(laid.ink.x1) + 6),
        Math.min(HEIGHT, Math.ceil(laid.ink.y1) + 6),
      ]
      p.solid = 0
      for (let i = 0; i < raster.data.length; i++) {
        if (raster.data[i] > 8) glyphMask[i] = 1
        if (raster.data[i] > 128) p.solid++
      }
    }

    /* Top up with bright pixels the outlines did not quite cover - a glyph the
       metrics place a pixel or two off would otherwise leave an edge behind.
       Bounded to the neighbourhood of the outlines so it cannot reach out and
       swallow the light trail or a lattice dot that belongs to the artwork. */
    const reachable = dilate(glyphMask, TOPUP_REACH)
    const mask = Uint8Array.from(glyphMask)
    let toppedUp = 0
    for (const p of pieces) {
      for (const i of brightPixels(data, ch, p.band, BRIGHT_CONTRAST)) {
        if (reachable[i] && !mask[i]) {
          mask[i] = 1
          toppedUp++
        }
      }
    }
    console.log(`  topped up ${toppedUp} bright px adjacent to the outlines`)

    const { x0, y0, x1, y1 } = LAYOUT.headerClear
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) mask[y * WIDTH + x] = 1

    const grown = dilate(mask, MASK_DILATE)
    let maskedCount = 0
    for (let i = 0; i < grown.length; i++) if (grown[i]) maskedCount++

    const planes = [
      new Float32Array(WIDTH * HEIGHT),
      new Float32Array(WIDTH * HEIGHT),
      new Float32Array(WIDTH * HEIGHT),
    ]
    for (let i = 0; i < WIDTH * HEIGHT; i++) {
      planes[0][i] = data[i * ch]
      planes[1][i] = data[i * ch + 1]
      planes[2][i] = data[i * ch + 2]
    }
    const started = Date.now()
    const { iterations } = inpaint(planes, grown)
    console.log(
      `  mask ${maskedCount} px (${((maskedCount / (WIDTH * HEIGHT)) * 100).toFixed(2)}% of card), ` +
        `relaxed in ${iterations} iterations, ${Date.now() - started}ms`
    )

    const out = Buffer.alloc(WIDTH * HEIGHT * 3)
    let changedOutside = 0
    for (let i = 0; i < WIDTH * HEIGHT; i++) {
      for (let c = 0; c < 3; c++) {
        const v = Math.max(0, Math.min(255, Math.round(planes[c][i])))
        out[i * 3 + c] = v
        if (!grown[i] && v !== data[i * ch + c]) changedOutside++
      }
    }
    console.log(`  pixels changed outside the mask: ${changedOutside}`)
    if (changedOutside !== 0) throw new Error(`${card.id}: inpaint touched unmasked pixels`)

    /* Did the lettering actually come off? Count bright pixels in each band
       before and after: the drop should account for the glyph body. Comparing
       counts rather than a peak keeps this readable on work and thinking,
       where the artwork itself puts bright pixels inside these bands. */
    for (const p of pieces) {
      const before = brightPixels(data, ch, p.band, BRIGHT_CONTRAST).length
      const after = brightPixels(out, 3, p.band, BRIGHT_CONTRAST).length
      const dropped = before - after

      /* Some elements are too close in tone to what they sit on to be counted
         this way - art's grey eyebrow over the lit sky separates by about 15
         luma, under any threshold that would not also pick up sky texture.
         Where there is nothing measurable to remove, a leftover edge would be
         equally invisible, so the outline mask is left to speak for itself. */
      if (before < Math.max(30, p.solid * 0.2)) {
        console.log(
          `  removed ${p.name.padEnd(9)} not measurable (only ${before} px of the ${p.solid}px glyph body ` +
            `separate from this background; covered by the outline mask)`
        )
        continue
      }

      const ratio = p.solid ? dropped / p.solid : 1
      const ok = ratio >= 0.6
      console.log(
        `  removed ${p.name.padEnd(9)} bright px ${String(before).padStart(6)} -> ${String(after).padStart(5)} ` +
          `(-${String(dropped).padStart(5)}, ${(ratio * 100).toFixed(0)}% of the ${p.solid}px glyph body)${ok ? '' : '  <-- INCOMPLETE'}`
      )
      if (!ok) {
        throw new Error(
          `${card.id}/${p.name}: only ${(ratio * 100).toFixed(0)}% of the glyph body was removed; ` +
            `lettering is probably still visible on the plate`
        )
      }
    }

    if (reportOnly) continue

    const platePath = join(PLATE_DIR, `${card.id}.webp`)
    await sharp(out, { raw: { width: WIDTH, height: HEIGHT, channels: 3 } })
      .webp({ lossless: true, effort: 6 })
      .toFile(platePath)

    const back = await sharp(platePath).removeAlpha().raw().toBuffer()
    let diff = 0
    for (let i = 0; i < back.length; i++) if (back[i] !== out[i]) diff++
    if (diff !== 0) throw new Error(`${card.id}: plate did not round-trip losslessly (${diff} bytes differ)`)
    console.log(`  wrote ${relative(ROOT, platePath)} (lossless)`)
  }
}

main().catch((err) => {
  console.error(err.message ?? err)
  process.exit(1)
})
