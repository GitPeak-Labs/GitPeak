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
const JETBRAINS_MONO_FONT_FILENAME = 'gitpeak-jetbrains-mono-400.ttf'
const NOTO_SANS_JP_FONT_FILENAME = 'gitpeak-noto-sans-jp-400.ttf'
const NOTO_SERIF_JP_FONT_FILENAME = 'gitpeak-noto-serif-jp-400.ttf'

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

export function getOgFontFiles(): Promise<{
  mono: string
  serif: string
  jp: string
  serifJp: string
}> {
  return Promise.all([
    persistBundledFont(JETBRAINS_MONO_FONT_FILENAME, jetBrainsMono),
    persistBundledFont('gitpeak-instrument-serif-400.ttf', instrumentSerif),
    persistBundledFont(NOTO_SANS_JP_FONT_FILENAME, notoSansJp),
    persistBundledFont(NOTO_SERIF_JP_FONT_FILENAME, notoSerifJp),
  ]).then(([mono, serif, jp, serifJp]) => ({ mono, serif, jp, serifJp }))
}

export type WallpaperFontFiles = {
  mono: string
  bookSerif: string
  bookSerifBold: string
  jp: string
  serifJp: string
  serifJpBold: string
}

export function getWallpaperFontFiles(): Promise<WallpaperFontFiles> {
  return Promise.all([
    persistBundledFont(JETBRAINS_MONO_FONT_FILENAME, jetBrainsMono),
    persistBundledFont('gitpeak-gelasio-400.ttf', gelasio),
    persistBundledFont('gitpeak-gelasio-700.ttf', gelasioBold),
    persistBundledFont(NOTO_SANS_JP_FONT_FILENAME, notoSansJp),
    persistBundledFont(NOTO_SERIF_JP_FONT_FILENAME, notoSerifJp),
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
