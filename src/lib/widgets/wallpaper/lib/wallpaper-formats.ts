export type WallpaperFormat = {
  id: string
  name: string
  subtitle: string
  width: number
  height: number
}

export const ALLOWED_WALLPAPER_FORMATS: WallpaperFormat[] = [
  { id: 'desktop', name: 'Desktop', subtitle: '16:9', width: 1920, height: 1080 },
  { id: 'mac', name: 'MacBook', subtitle: '16:10', width: 2560, height: 1600 },
  { id: 'phone', name: 'Phone', subtitle: '9:16', width: 1080, height: 1920 },
  { id: 'tall', name: 'Tall', subtitle: '9:21', width: 1080, height: 2520 },
]

export function getWallpaperFormat(id: string | null): WallpaperFormat | undefined {
  return ALLOWED_WALLPAPER_FORMATS.find((format) => format.id === id)
}
