/**
 * Draw the per-route OG cards: public/og/{art,work,thinking,contact}.png.
 *
 * Each card is a background plate from scripts/og-plates/ with an overlay
 * composited on top - the n3wth mark, an all-caps eyebrow and the title, set
 * in Satoshi outlines on the metrics in og-design.mjs. Plates are the original
 * artwork with the baked lettering lifted off (see extract-og-plates.mjs), so
 * the photography and the type are finally separable and a copy change is a
 * one-line edit here rather than a hand-composed PNG.
 *
 * Type is converted to outlines rather than set with font-family: librsvg,
 * which sharp rasterises SVG with, ignores @font-face, so a named family would
 * quietly fall back to whatever sans the machine happens to have.
 *
 *   node scripts/generate-og-images.mjs [--check]
 *
 * --check compares against the committed PNGs and reports what would change
 * without writing anything.
 */
import { existsSync } from 'node:fs'
import { join, relative } from 'node:path'
import sharp from 'sharp'
import {
  WIDTH,
  HEIGHT,
  ROOT,
  OG_DIR,
  PLATE_DIR,
  INK,
  TYPE,
  LAYOUT,
  CARDS,
  loadFonts,
  rasterizePath,
  assertRasterMatchesLayout,
  dartPath,
  measureDart,
  buildOverlay,
} from './og-design.mjs'

const checkOnly = process.argv.includes('--check')

async function main() {
  const fonts = await loadFonts()
  const dart = dartPath()
  const dartBox = await measureDart(dart)
  console.log(
    `mark: ink ${dartBox.w.toFixed(2)}x${dartBox.h.toFixed(2)} in a 32-unit box, drawn ` +
      `${LAYOUT.markInk.h}px tall at (${LAYOUT.markInk.x}, ${LAYOUT.markInk.y}) in ${INK.dart}`
  )
  console.log(
    `type:  title ${TYPE.title.size}/${TYPE.title.tracking.toFixed(2)} ${TYPE.title.weight}, ` +
      `eyebrow ${TYPE.eyebrow.size}/${TYPE.eyebrow.tracking} ${TYPE.eyebrow.weight}, ` +
      `last baseline ${LAYOUT.lastTitleBaseline}, line step ${LAYOUT.lineStep.toFixed(1)}\n`
  )

  for (const card of CARDS) {
    const platePath = join(PLATE_DIR, `${card.id}.webp`)
    if (!existsSync(platePath)) {
      throw new Error(`missing plate ${relative(ROOT, platePath)} - run: node scripts/extract-og-plates.mjs`)
    }

    const plate = await sharp(platePath).removeAlpha().raw().toBuffer({ resolveWithObject: true })
    if (plate.info.width !== WIDTH || plate.info.height !== HEIGHT) {
      throw new Error(`${card.id}: plate is ${plate.info.width}x${plate.info.height}, expected ${WIDTH}x${HEIGHT}`)
    }

    const { svg, eyebrow, titles, baselines: bl } = buildOverlay(card, fonts, dart, dartBox)

    /* Confirm the overlay reached pixels intact before it goes onto the card:
       a compound path that fails to parse loses its tail silently. */
    const overlayRaster = await rasterizePath(
      [eyebrow.d, ...titles.map((t) => t.d)].join(' ')
    )
    const laidOut = {
      x0: Math.min(eyebrow.ink.x0, ...titles.map((t) => t.ink.x0)),
      x1: Math.max(eyebrow.ink.x1, ...titles.map((t) => t.ink.x1)),
    }
    assertRasterMatchesLayout(`${card.id}/overlay`, laidOut, overlayRaster.ink)

    /* removeAlpha keeps these opaque RGB like the cards they replace; the
       composite would otherwise leave an alpha channel behind, costing bytes
       on every unfurl for a transparency none of them use. */
    const png = await sharp(plate.data, { raw: { width: WIDTH, height: HEIGHT, channels: 3 } })
      .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
      .removeAlpha()
      .png({ compressionLevel: 9, palette: false })
      .toBuffer()

    const out = join(OG_DIR, `${card.id}.png`)
    const meta = await sharp(png).metadata()
    console.log(
      `${card.id.padEnd(9)} ${meta.width}x${meta.height}  ${(png.length / 1024).toFixed(0)}KB  ` +
        `eyebrow "${card.eyebrow}" @${bl.eyebrow.toFixed(1)}  title ${JSON.stringify(card.titleLines)} @${bl.title.map((b) => b.toFixed(1)).join('/')}`
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
      }
      continue
    }

    await sharp(png).toFile(out)
    console.log(`          wrote ${relative(ROOT, out)}`)
  }
}

main().catch((err) => {
  console.error(err.message ?? err)
  process.exit(1)
})
