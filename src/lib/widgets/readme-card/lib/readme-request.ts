import {
  DEFAULT_PRESET_NAME,
  PRESET_THEMES,
  type ThemeTokens,
} from '$lib/entities/theme/model/theme-manager'

const AVATAR_PIXEL_SIZE_FOR_2X_SHARPNESS = 128
const AVATAR_SIZE_PARAM = 's'
const SVG_COMMENT_PATTERN = /<!--[\s\S]*?-->/g
const THEME_NAME_SEPARATOR_PATTERN = /[-_+]/g
const ACCENTED_E_PATTERN = /é/g

function normalizeThemeName(themeName: string): string {
  return themeName
    .toLowerCase()
    .replace(ACCENTED_E_PATTERN, 'e')
    .replace(THEME_NAME_SEPARATOR_PATTERN, ' ')
    .trim()
}

export function resolveReadmeTheme(requestedThemeName: string | null): ThemeTokens {
  const defaultTheme = PRESET_THEMES[DEFAULT_PRESET_NAME]
  if (!requestedThemeName) return defaultTheme

  const normalizedRequest = normalizeThemeName(requestedThemeName)
  const matchingPreset = Object.entries(PRESET_THEMES).find(
    ([presetName]) =>
      presetName === requestedThemeName || normalizeThemeName(presetName) === normalizedRequest,
  )
  return matchingPreset?.[1] ?? defaultTheme
}

export function sizedAvatarUrl(avatarUrl: string): string {
  if (!URL.canParse(avatarUrl)) return avatarUrl

  const parsedUrl = new URL(avatarUrl)
  const sizedSearchParams = new URLSearchParams({
    ...Object.fromEntries(parsedUrl.searchParams),
    [AVATAR_SIZE_PARAM]: String(AVATAR_PIXEL_SIZE_FOR_2X_SHARPNESS),
  })
  return `${parsedUrl.origin}${parsedUrl.pathname}?${sizedSearchParams.toString()}`
}

export function embedStylesInSvg(svg: string, styles: string): string {
  return svg
    .replace('<defs>', `<defs><style>${styles}</style>`)
    .replace(SVG_COMMENT_PATTERN, '')
    .trim()
}
