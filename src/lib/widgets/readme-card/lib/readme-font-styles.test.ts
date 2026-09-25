import { describe, expect, test } from 'bun:test'
import { PRESET_THEMES } from '$lib/entities/theme/model/theme-manager'
import { buildOgStyles, buildReadmeFontStyles } from './readme-font-styles'

const THEME = PRESET_THEMES['Rosé Pine']

describe('buildReadmeFontStyles', () => {
  test('embeds compressed local fonts', () => {
    const styles = buildReadmeFontStyles(
      {
        monoFontDataUri: 'data:font/woff2;base64,mono',
        serifFontDataUri: 'data:font/woff2;base64,serif',
      },
      THEME,
    )

    expect(styles).toContain("url('data:font/woff2;base64,mono') format('woff2')")
    expect(styles).toContain("url('data:font/woff2;base64,serif') format('woff2')")
  })

  test('omits invalid font faces when no font data is available', () => {
    const styles = buildReadmeFontStyles({ monoFontDataUri: '', serifFontDataUri: '' }, THEME)

    expect(styles).not.toContain('@font-face')
    expect(styles).toContain('.text-main')
  })

  test('ships the entrance animations with the browser-facing card', () => {
    const styles = buildReadmeFontStyles({ monoFontDataUri: '', serifFontDataUri: '' }, THEME)

    expect(styles).toContain('@keyframes fade-up')
    expect(styles).toContain('.anim-grow')
  })
})

describe('buildOgStyles', () => {
  test('keeps the rasterized card free of animations', () => {
    const styles = buildOgStyles(THEME)

    expect(styles).toContain('.text-serif')
    expect(styles).not.toContain('@keyframes')
  })
})
