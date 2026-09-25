import {
  DEFAULT_PRESET_NAME,
  PRESET_THEMES,
  TOKEN_LABELS,
  type ThemeTokens,
} from '$lib/entities/theme/model/theme-manager'

const THEME_TOKEN_KEYS = Object.keys(TOKEN_LABELS)
const HEX_COLOR_PATTERN = /^[0-9a-fA-F]{3,8}$/
const TOKEN_SEPARATOR = '-'
const LEADING_HASH_PATTERN = /^#/

export function packThemeTokens(tokens: ThemeTokens): string {
  return THEME_TOKEN_KEYS.map((key) => stripLeadingHash(tokens[key] ?? '')).join(TOKEN_SEPARATOR)
}

export function parseThemeParameter(packed: string | null): ThemeTokens | null {
  if (!packed) return null

  const hexDigitGroups = packed.split(TOKEN_SEPARATOR)
  const hasOneColorPerToken = hexDigitGroups.length === THEME_TOKEN_KEYS.length
  const isEveryGroupHex = hexDigitGroups.every((hexDigits) => HEX_COLOR_PATTERN.test(hexDigits))
  if (!hasOneColorPerToken || !isEveryGroupHex) return null

  return Object.fromEntries(
    THEME_TOKEN_KEYS.map((key, index) => [key, `#${hexDigitGroups[index]}`]),
  )
}

export function resolveWallpaperTheme(
  presetName: string | null,
  packedCustomTokens: string | null,
): ThemeTokens {
  return (
    parseThemeParameter(packedCustomTokens) ??
    presetThemeNamed(presetName) ??
    PRESET_THEMES[DEFAULT_PRESET_NAME]
  )
}

function presetThemeNamed(presetName: string | null): ThemeTokens | undefined {
  const isKnownPreset = presetName !== null && Object.hasOwn(PRESET_THEMES, presetName)
  return isKnownPreset ? PRESET_THEMES[presetName] : undefined
}

function stripLeadingHash(color: string): string {
  return color.trim().replace(LEADING_HASH_PATTERN, '')
}
