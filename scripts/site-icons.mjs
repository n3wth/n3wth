import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import sharp from 'sharp'
import { siteIconSvg } from '../packages/site-config/icons.js'

const root = fileURLToPath(new URL('../', import.meta.url))
const apps = ['portfolio', 'skills']

for (const app of apps) {
  const directory = join(root, 'apps', app, 'public')
  await mkdir(directory, { recursive: true })
  const svg = siteIconSvg(app)
  await writeFile(join(directory, 'favicon.svg'), svg + '\n')
  await writeFile(join(directory, 'logo.svg'), siteIconSvg(app, { background: false }) + '\n')
  for (const variant of ['black', 'white']) {
    await writeFile(join(directory, `logo-${variant}.svg`), siteIconSvg(app, { background: false, variant }) + '\n')
  }
  const sizes = { 'favicon-16x16.png': 16, 'favicon-32x32.png': 32, 'favicon-96.png': 96, 'favicon.png': 96, 'apple-touch-icon.png': 180, 'icon-192.png': 192, 'icon-512.png': 512 }
  if (app === 'skills') Object.assign(sizes, { 'icons/icon-192.png': 192, 'icons/icon-512.png': 512 })
  for (const [file, size] of Object.entries(sizes)) {
    await mkdir(join(directory, file, '..'), { recursive: true })
    await sharp(Buffer.from(svg)).resize(size, size).png().toFile(join(directory, file))
  }
  // ICO supports PNG image payloads. Keep one 32px frame for browser fallbacks.
  const png = await sharp(Buffer.from(svg)).resize(32, 32).png().toBuffer()
  const header = Buffer.alloc(22)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(1, 4)
  header[6] = 32
  header[7] = 32
  header.writeUInt16LE(1, 10)
  header.writeUInt16LE(32, 12)
  header.writeUInt32LE(png.length, 14)
  header.writeUInt32LE(22, 18)
  const ico = Buffer.concat([header, png])
  await writeFile(join(directory, 'favicon.ico'), ico)
}
