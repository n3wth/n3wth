import { readFileSync } from 'fs'
import path from 'path'
import { ImageResponse } from 'next/og'

export const OG_SIZE = { width: 1200, height: 630 }

// n3wth wireframe palette (dark) — mirrors src/theme/n3wthTheme.ts
const BG = '#08090b'
const INK = '#f2f3f5'
const INK_SECONDARY = '#9aa0a8'

/* Lazy + cached: module-scope readFileSync crashed EVERY serverless
   function that transitively imported this file when the .ttf files
   weren't traced into its bundle (544 ENOENTs/day on the note route in
   production). Fonts now load on first OG render only, and
   next.config.ts traces them into all bundles. */
let fontCache: { satoshiBold: Buffer; geistRegular: Buffer } | null = null
function loadFonts() {
  if (!fontCache) {
    const fontDir = path.join(process.cwd(), 'src/lib/og-fonts')
    fontCache = {
      satoshiBold: readFileSync(path.join(fontDir, 'Satoshi-Bold.ttf')),
      geistRegular: readFileSync(path.join(fontDir, 'Geist-Regular.ttf')),
    }
  }
  return fontCache
}

/** The canonical n3wth mark — dart/cursor from n3wth.com favicon. */
function n3wthMark({ size = 64 }: { size?: number } = {}) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M9.4 6.6 25.2 14a1.5 1.5 0 0 1-.15 2.78l-6.1 1.78a2 2 0 0 0-1.32 1.24l-2.2 6.1c-.5 1.36-2.42 1.27-2.78-.15L8.0 8.2A1.6 1.6 0 0 1 9.4 6.6Z" fill="#ffffff" />
    </svg>
  )
}

interface OgCardOptions {
  title?: string
  subtitle?: string
}

/** Family-spec OG card: cursor mark + page-specific title.
    1200×630, black canvas, white Satoshi type. */
export function ogCard(options: OgCardOptions = {}) {
  const { title = 'n3wth/garden', subtitle } = options
  const { satoshiBold, geistRegular } = loadFonts()

  const titleFontSize = title.length > 40 ? 48 : title.length > 25 ? 56 : 64

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 32,
          padding: '80px 100px',
          background: BG,
        }}
      >
        {n3wthMark({ size: 56 })}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            maxWidth: '100%',
          }}
        >
          <div
            style={{
              fontFamily: 'Satoshi',
              fontSize: titleFontSize,
              fontWeight: 700,
              letterSpacing: '-0.025em',
              color: INK,
              textAlign: 'center',
              lineHeight: 1.15,
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              maxWidth: '100%',
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                fontFamily: 'Geist',
                fontSize: 24,
                fontWeight: 400,
                color: INK_SECONDARY,
                textAlign: 'center',
                display: 'flex',
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 48,
            fontFamily: 'Geist',
            fontSize: 18,
            fontWeight: 400,
            color: INK_SECONDARY,
            display: 'flex',
          }}
        >
          garden.n3wth.com
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: 'Satoshi', data: satoshiBold, weight: 700 as const, style: 'normal' as const },
        { name: 'Geist', data: geistRegular, weight: 400 as const, style: 'normal' as const },
      ],
    }
  )
}
