import { writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import gelasio from './fonts/gelasio-400.ttf?url&inline'
import gelasioBold from './fonts/gelasio-700.ttf?url&inline'
import instrumentSerif from './fonts/instrument-serif-400.ttf?url&inline'
import jetBrainsMono from './fonts/jetbrains-mono-400.ttf?url&inline'
import notoSansJp from './fonts/noto-sans-jp-400.ttf?url&inline'
import notoSerifJp from './fonts/noto-serif-jp-400.ttf?url&inline'
import notoSerifJpBold from './fonts/noto-serif-jp-700.ttf?url&inline'

const fontFileCache = new Map<string, Promise<string>>()

function persistBundledFont(filename: string, dataUri: string): Promise<string> {
  const cached = fontFileCache.get(filename)
  if (cached) return cached

  const filePath = join(tmpdir(), filename)
  const commaIndex = dataUri.indexOf(',')
  if (commaIndex === -1) throw new Error(`Bundled font ${filename} is not a data URI`)

  const promise = writeFile(filePath, Buffer.from(dataUri.slice(commaIndex + 1), 'base64')).then(
    () => filePath,
  )
  fontFileCache.set(filename, promise)
  return promise
}

// resvg only accepts local TrueType paths in its Node renderer. The font bytes are bundled in the
// server build and copied to the writable temp directory once per cold start—there are no request-
// time font downloads. `serifJp` keeps mixed-script display names visually consistent.
export function getOgFontFiles(): Promise<{
  mono: string
  serif: string
  jp: string
  serifJp: string
}> {
  return Promise.all([
    persistBundledFont('gitpeak-jetbrains-mono-400.ttf', jetBrainsMono),
    persistBundledFont('gitpeak-instrument-serif-400.ttf', instrumentSerif),
    persistBundledFont('gitpeak-noto-sans-jp-400.ttf', notoSansJp),
    persistBundledFont('gitpeak-noto-serif-jp-400.ttf', notoSerifJp),
  ]).then(([mono, serif, jp, serifJp]) => ({ mono, serif, jp, serifJp }))
}

export interface WallpaperFontFiles {
  mono: string
  bookSerif: string
  bookSerifBold: string
  jp: string
  serifJp: string
  serifJpBold: string
}

// The wallpaper matches the live dashboard's actual `font-serif` look (a plain Georgia/Times
// book-serif — Tailwind's `font-serif` utility isn't wired to Instrument Serif there, see
// app.css), not the README/OG card's Instrument Serif treatment. Gelasio is a Google Fonts
// metric- and shape-compatible substitute for Georgia, so this renders the same regardless of
// the server's OS instead of depending on whatever system serif happens to be installed.
// Both weights are registered for the CJK fallback too — requesting font-weight 700 text with
// only a 400-weight CJK file registered leaves resvg unable to match that family+weight combo for
// CJK glyphs specifically, and it falls back badly for just those characters.
export function getWallpaperFontFiles(): Promise<WallpaperFontFiles> {
  return Promise.all([
    persistBundledFont('gitpeak-jetbrains-mono-400.ttf', jetBrainsMono),
    persistBundledFont('gitpeak-gelasio-400.ttf', gelasio),
    persistBundledFont('gitpeak-gelasio-700.ttf', gelasioBold),
    persistBundledFont('gitpeak-noto-sans-jp-400.ttf', notoSansJp),
    persistBundledFont('gitpeak-noto-serif-jp-400.ttf', notoSerifJp),
    persistBundledFont('gitpeak-noto-serif-jp-700.ttf', notoSerifJpBold),
  ]).then(([mono, bookSerif, bookSerifBold, jp, serifJp, serifJpBold]) => ({
    mono,
    bookSerif,
    bookSerifBold,
    jp,
    serifJp,
    serifJpBold,
  }))
}
