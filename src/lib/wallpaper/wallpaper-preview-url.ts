import type { WallpaperFormat } from './wallpaper-formats'

export const DEFAULT_PREVIEW_CONTAINER_WIDTH_PIXELS = 700
export const DEFAULT_PREVIEW_CONTAINER_HEIGHT_PIXELS = 500
export const DEFAULT_PREVIEW_PADDING_PIXELS = 48

export const MOBILE_BREAKPOINT_PIXELS = 640
export const MOBILE_PREVIEW_VIEWPORT_WIDTH_RATIO = 0.96
export const MOBILE_PREVIEW_VIEWPORT_HEIGHT_RATIO = 0.4
export const MOBILE_PREVIEW_MIN_HEIGHT_PIXELS = 220
export const MOBILE_PREVIEW_PADDING_PIXELS = 16

const RASTER_BUCKET_PIXELS = 120
const MIN_RASTER_WIDTH_PIXELS = 240
export const MAX_PREVIEW_RASTER_WIDTH_PIXELS = 720

export function estimatePreviewContainerSize(
  viewportWidth: number,
  viewportHeight: number,
): { width: number; height: number; padding: number } {
  if (viewportWidth >= MOBILE_BREAKPOINT_PIXELS) {
    return {
      width: DEFAULT_PREVIEW_CONTAINER_WIDTH_PIXELS,
      height: DEFAULT_PREVIEW_CONTAINER_HEIGHT_PIXELS,
      padding: DEFAULT_PREVIEW_PADDING_PIXELS,
    }
  }

  return {
    width: viewportWidth * MOBILE_PREVIEW_VIEWPORT_WIDTH_RATIO,
    height: Math.max(
      viewportHeight * MOBILE_PREVIEW_VIEWPORT_HEIGHT_RATIO,
      MOBILE_PREVIEW_MIN_HEIGHT_PIXELS,
    ),
    padding: MOBILE_PREVIEW_PADDING_PIXELS,
  }
}

export function computeRasterPreviewWidth(
  format: WallpaperFormat,
  containerWidthPixels: number,
  containerHeightPixels: number,
  paddingPixels: number,
  devicePixelRatio: number,
): number {
  const widthScale = (containerWidthPixels - paddingPixels) / format.width
  const heightScale = (containerHeightPixels - paddingPixels) / format.height
  const scaleMultiplier =
    format.width > 0 && format.height > 0 ? Math.min(widthScale, heightScale) : 1

  const scaledPixels = format.width * scaleMultiplier * Math.min(devicePixelRatio, 1.5)
  const bucketedWidth = Math.ceil(scaledPixels / RASTER_BUCKET_PIXELS) * RASTER_BUCKET_PIXELS
  const cappedWidth = Math.min(MAX_PREVIEW_RASTER_WIDTH_PIXELS, bucketedWidth)

  return Math.min(format.width, Math.max(MIN_RASTER_WIDTH_PIXELS, cappedWidth))
}

export function buildWallpaperUrl(
  username: string,
  format: WallpaperFormat,
  theme: string,
): string {
  return (
    `/wallpaper?username=${encodeURIComponent(username)}` +
    `&format=${format.id}` +
    `&theme=${encodeURIComponent(theme)}`
  )
}

export function buildWallpaperPreviewUrl(
  username: string,
  format: WallpaperFormat,
  theme: string,
  rasterWidth: number,
): string {
  return `${buildWallpaperUrl(username, format, theme)}&previewWidth=${rasterWidth}`
}
