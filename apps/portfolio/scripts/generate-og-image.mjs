/**
 * Generate the main OG image for n3wth.com
 * 
 * Family spec:
 * - 1200×630 black background
 * - n3wth mark (white) + "Oliver Newth" title
 * - No chips, no subtitle, far-away readable
 */
import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const publicDir = join(here, '../public')

const WIDTH = 1200
const HEIGHT = 630
const BG_COLOR = '#08090b'
const TEXT_COLOR = '#ffffff'

const markSvg = readFileSync(join(publicDir, 'logo.svg'), 'utf8')
const markWithColor = markSvg.replace('currentColor', TEXT_COLOR)

const markSize = 80
const markX = (WIDTH - markSize) / 2
const markY = 200

const fontSize = 64
const textY = markY + markSize + 80

const svg = `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${BG_COLOR}"/>
  <g transform="translate(${markX}, ${markY})">
    <svg width="${markSize}" height="${markSize}" viewBox="0 0 32 32">
      <path d="M9.4 6.6 25.2 14a1.5 1.5 0 0 1-.15 2.78l-6.1 1.78a2 2 0 0 0-1.32 1.24l-2.2 6.1c-.5 1.36-2.42 1.27-2.78-.15L8.0 8.2A1.6 1.6 0 0 1 9.4 6.6Z" fill="${TEXT_COLOR}"/>
    </svg>
  </g>
  <text x="${WIDTH / 2}" y="${textY}" 
        font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" 
        font-size="${fontSize}" 
        font-weight="600"
        fill="${TEXT_COLOR}" 
        text-anchor="middle"
        dominant-baseline="middle">Oliver Newth</text>
</svg>`

const outputPath = join(publicDir, 'og-image.png')

await sharp(Buffer.from(svg))
  .png()
  .toFile(outputPath)

console.log(`[generate-og-image] Created ${outputPath}`)
console.log(`[generate-og-image] ${WIDTH}×${HEIGHT}, black bg, white type`)
