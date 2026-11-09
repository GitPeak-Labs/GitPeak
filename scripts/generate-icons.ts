import { readFile } from 'node:fs/promises'
import sharp from 'sharp'

const APPLE_TOUCH_ICON_SIZE_PIXELS = 180
const ANDROID_ICON_SMALL_SIZE_PIXELS = 192
const ANDROID_ICON_LARGE_SIZE_PIXELS = 512

const iconVariants = [
  { dimension: APPLE_TOUCH_ICON_SIZE_PIXELS, filePath: 'static/apple-touch-icon.png' },
  { dimension: ANDROID_ICON_SMALL_SIZE_PIXELS, filePath: 'static/icon-192.png' },
  { dimension: ANDROID_ICON_LARGE_SIZE_PIXELS, filePath: 'static/icon-512.png' },
] as const

const faviconSvgBuffer = await readFile(new URL('../static/favicon.svg', import.meta.url))

await Promise.all(
  iconVariants.map(({ dimension, filePath }) =>
    sharp(faviconSvgBuffer).resize(dimension, dimension).png().toFile(filePath),
  ),
)

console.log('Icons generated successfully!')
