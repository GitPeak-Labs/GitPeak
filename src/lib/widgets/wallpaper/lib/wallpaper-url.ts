import { DEFAULT_PRESET_NAME } from '$lib/entities/theme/model/theme-manager'
import type { WallpaperFormat } from './wallpaper-formats'

export const PREVIEW_AVATAR_SIZE_PIXELS = 160

type WallpaperUrlInput = {
  username: string
  format: WallpaperFormat
  presetName: string | null
  packedCustomTokens?: string
}

export function buildWallpaperUrl({
  username,
  format,
  presetName,
  packedCustomTokens,
}: WallpaperUrlInput): string {
  const parameters = new URLSearchParams({ username, format: format.id })

  if (packedCustomTokens) parameters.set('t', packedCustomTokens)
  else parameters.set('theme', presetName ?? DEFAULT_PRESET_NAME)

  return `/wallpaper?${parameters.toString()}`
}

export function withAvatarSizeHint(avatarUrl: string, sizePixels: number): string {
  try {
    const url = new URL(avatarUrl)
    url.searchParams.set('size', String(sizePixels))
    return url.toString()
  } catch {
    return avatarUrl
  }
}
