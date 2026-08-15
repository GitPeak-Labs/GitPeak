import { describe, expect, test } from 'bun:test'
import { PRESET_THEMES } from '$lib/theme/theme-manager'
import { buildReadmeFontStyles } from './readme-font-styles'

describe('buildReadmeFontStyles', () => {
  test('embeds compressed local fonts', () => {
    const styles = buildReadmeFontStyles(
      'data:font/woff2;base64,mono',
      'data:font/woff2;base64,serif',
      PRESET_THEMES['Rosé Pine'],
    )

    expect(styles).toContain("url('data:font/woff2;base64,mono') format('woff2')")
    expect(styles).toContain("url('data:font/woff2;base64,serif') format('woff2')")
  })

  test('omits invalid font faces when no font data is available', () => {
    const styles = buildReadmeFontStyles('', '', PRESET_THEMES['Rosé Pine'])

    expect(styles).not.toContain('@font-face')
    expect(styles).toContain('.text-main')
  })
})
