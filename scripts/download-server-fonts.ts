import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const GOOGLE_FONTS_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8)'
const REQUEST_TIMEOUT_MILLISECONDS = 30_000
const outputDirectory = new URL('../src/lib/readme/fonts/', import.meta.url)

const fonts = [
  { family: 'JetBrains Mono', weight: 400, filename: 'jetbrains-mono-400.ttf' },
  { family: 'Instrument Serif', weight: 400, filename: 'instrument-serif-400.ttf' },
  { family: 'Noto Sans JP', weight: 400, filename: 'noto-sans-jp-400.ttf' },
  { family: 'Noto Serif JP', weight: 400, filename: 'noto-serif-jp-400.ttf' },
  { family: 'Noto Serif JP', weight: 700, filename: 'noto-serif-jp-700.ttf' },
  { family: 'Gelasio', weight: 400, filename: 'gelasio-400.ttf' },
  { family: 'Gelasio', weight: 700, filename: 'gelasio-700.ttf' },
] as const

async function fetchFont(family: string, weight: number): Promise<Uint8Array> {
  const familyQuery = family.replaceAll(' ', '+')
  const cssUrl = `https://fonts.googleapis.com/css2?family=${familyQuery}:wght@${weight}&display=swap`
  const cssResponse = await fetch(cssUrl, {
    headers: { 'User-Agent': GOOGLE_FONTS_USER_AGENT },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MILLISECONDS),
  })

  if (!cssResponse.ok) throw new Error(`${family} ${weight} CSS returned ${cssResponse.status}`)

  const css = await cssResponse.text()
  const fontUrl = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1]
  if (!fontUrl) throw new Error(`Could not find a TrueType URL for ${family} ${weight}`)

  const fontResponse = await fetch(fontUrl, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MILLISECONDS),
  })
  if (!fontResponse.ok) throw new Error(`${family} ${weight} file returned ${fontResponse.status}`)

  return new Uint8Array(await fontResponse.arrayBuffer())
}

const downloadedFonts = await Promise.all(
  fonts.map(async (font) => ({ ...font, contents: await fetchFont(font.family, font.weight) })),
)

await mkdir(outputDirectory, { recursive: true })
await Promise.all(
  downloadedFonts.map(async ({ filename, contents }) => {
    await writeFile(new URL(filename, outputDirectory), contents)
    console.log(
      `Wrote ${fileURLToPath(new URL(filename, outputDirectory))} (${contents.length} bytes)`,
    )
  }),
)
