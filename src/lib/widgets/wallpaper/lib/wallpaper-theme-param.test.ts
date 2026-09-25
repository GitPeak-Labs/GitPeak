import { describe, expect, test } from 'bun:test'
import { PRESET_THEMES } from '$lib/entities/theme/model/theme-manager'
import {
  packThemeTokens,
  parseThemeParameter,
  resolveWallpaperTheme,
} from './wallpaper-theme-param'

describe('packThemeTokens / parseThemeParameter', () => {
  test('round-trips a preset theme through pack and parse', () => {
    const original = PRESET_THEMES['Tokyo Night']

    expect(parseThemeParameter(packThemeTokens(original))).toEqual(original)
  })

  test('drops the leading hash when packing and restores it when parsing', () => {
    const packed = packThemeTokens(PRESET_THEMES.Nord)

    expect(packed.startsWith('#')).toBe(false)
    expect(parseThemeParameter(packed)?.base).toBe(PRESET_THEMES.Nord.base)
  })

  test('returns null for empty, malformed, or wrong-length input', () => {
    expect(parseThemeParameter(null)).toBeNull()
    expect(parseThemeParameter('')).toBeNull()
    expect(parseThemeParameter('abc-def')).toBeNull()
  })

  test('rejects a token that is not a hex colour', () => {
    const tokenParts = packThemeTokens(PRESET_THEMES['Rosé Pine']).split('-')
    const tamperedParts = tokenParts.map((part, index) => (index === 3 ? 'red);attr' : part))

    expect(parseThemeParameter(tamperedParts.join('-'))).toBeNull()
  })
})

describe('resolveWallpaperTheme', () => {
  test('prefers valid packed custom tokens over the preset name', () => {
    const custom = packThemeTokens(PRESET_THEMES['Gruvbox Dark'])

    expect(resolveWallpaperTheme('Nord', custom)).toEqual(PRESET_THEMES['Gruvbox Dark'])
  })

  test('falls back to the named preset when there are no custom tokens', () => {
    expect(resolveWallpaperTheme('Catppuccin Mocha', null)).toEqual(
      PRESET_THEMES['Catppuccin Mocha'],
    )
  })

  test('falls back to the default preset for an unknown name and invalid tokens', () => {
    expect(resolveWallpaperTheme('not-a-theme', 'garbage')).toEqual(PRESET_THEMES['Rosé Pine'])
  })
})
