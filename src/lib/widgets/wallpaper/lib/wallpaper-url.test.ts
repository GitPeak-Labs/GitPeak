import { describe, expect, test } from 'bun:test'
import { ALLOWED_WALLPAPER_FORMATS } from './wallpaper-formats'
import { buildWallpaperUrl, withAvatarSizeHint } from './wallpaper-url'

const desktop = ALLOWED_WALLPAPER_FORMATS[0]

describe('buildWallpaperUrl', () => {
  test('encodes the username and passes the preset name by name', () => {
    const url = new URL(
      `https://gitpeak.test${buildWallpaperUrl({ username: 'a b', format: desktop, presetName: 'Rosé Pine' })}`,
    )

    expect(url.pathname).toBe('/wallpaper')
    expect(url.searchParams.get('username')).toBe('a b')
    expect(url.searchParams.get('format')).toBe(desktop.id)
    expect(url.searchParams.get('theme')).toBe('Rosé Pine')
    expect(url.searchParams.has('t')).toBe(false)
  })

  test('sends packed custom tokens instead of a preset name when provided', () => {
    const url = new URL(
      `https://gitpeak.test${buildWallpaperUrl({ username: 'octocat', format: desktop, presetName: 'Rosé Pine', packedCustomTokens: '191724-1f1d2e' })}`,
    )

    expect(url.searchParams.get('t')).toBe('191724-1f1d2e')
    expect(url.searchParams.has('theme')).toBe(false)
  })

  test('falls back to the default preset when the preset name is null', () => {
    const url = new URL(
      `https://gitpeak.test${buildWallpaperUrl({ username: 'octocat', format: desktop, presetName: null })}`,
    )

    expect(url.searchParams.get('theme')).toBe('Rosé Pine')
  })
})

describe('withAvatarSizeHint', () => {
  test('adds a size query parameter to a valid url', () => {
    expect(withAvatarSizeHint('https://avatars.githubusercontent.com/u/1?v=4', 160)).toBe(
      'https://avatars.githubusercontent.com/u/1?v=4&size=160',
    )
  })

  test('overwrites an existing size parameter', () => {
    expect(withAvatarSizeHint('https://example.test/a?size=40', 160)).toBe(
      'https://example.test/a?size=160',
    )
  })

  test('returns the input unchanged when it is not a url', () => {
    expect(withAvatarSizeHint('not a url', 160)).toBe('not a url')
  })
})
