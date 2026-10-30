import { expect, test, describe } from 'bun:test'
import { readFileSync } from 'node:fs'
import { PRESET_THEMES } from './theme-manager'

const APP_CSS = readFileSync(new URL('../../../../app.css', import.meta.url), 'utf8')
const THEME_BLOCK_PATTERN = /\[data-theme='([^']+)'\]\s*\{([^}]*)\}/g
const TOKEN_PATTERN = /--([a-z-]+):\s*(#[0-9a-fA-F]{6})\s*;/g

function parseCssThemes(): Record<string, Record<string, string>> {
  const themes: Record<string, Record<string, string>> = {}
  for (const [, themeName, body] of APP_CSS.matchAll(THEME_BLOCK_PATTERN)) {
    themes[themeName] = Object.fromEntries(
      [...body.matchAll(TOKEN_PATTERN)].map(([, tokenName, color]) => [tokenName, color]),
    )
  }
  return themes
}

describe('theme palettes', () => {
  const cssThemes = parseCssThemes()

  test('app.css defines exactly the preset themes', () => {
    expect(Object.keys(cssThemes).sort()).toEqual(Object.keys(PRESET_THEMES).sort())
  })

  for (const [themeName, tokens] of Object.entries(PRESET_THEMES)) {
    test(`${themeName} matches between app.css and theme-manager`, () => {
      expect(cssThemes[themeName]).toEqual(tokens)
    })
  }
})
