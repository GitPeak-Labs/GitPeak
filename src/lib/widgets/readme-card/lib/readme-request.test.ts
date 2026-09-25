import { describe, expect, test } from 'bun:test'
import { DEFAULT_PRESET_NAME, PRESET_THEMES } from '$lib/entities/theme/model/theme-manager'
import { embedStylesInSvg, resolveReadmeTheme, sizedAvatarUrl } from './readme-request'

describe('resolveReadmeTheme', () => {
  test('falls back to the default theme when none or an unknown one is requested', () => {
    expect(resolveReadmeTheme(null)).toBe(PRESET_THEMES[DEFAULT_PRESET_NAME])
    expect(resolveReadmeTheme('not-a-theme')).toBe(PRESET_THEMES[DEFAULT_PRESET_NAME])
  })

  test('matches an exact preset name', () => {
    expect(resolveReadmeTheme('Rosé Pine')).toBe(PRESET_THEMES['Rosé Pine'])
  })

  test('matches URL-friendly spellings without the accent or spaces', () => {
    expect(resolveReadmeTheme('rose-pine')).toBe(PRESET_THEMES['Rosé Pine'])
    expect(resolveReadmeTheme('ROSE_PINE')).toBe(PRESET_THEMES['Rosé Pine'])
  })
})

describe('sizedAvatarUrl', () => {
  test('asks GitHub for a small avatar and keeps the existing query', () => {
    expect(sizedAvatarUrl('https://avatars.githubusercontent.com/u/1?v=4')).toBe(
      'https://avatars.githubusercontent.com/u/1?v=4&s=128',
    )
  })

  test('replaces a size that is already set', () => {
    expect(sizedAvatarUrl('https://avatars.githubusercontent.com/u/1?s=460')).toBe(
      'https://avatars.githubusercontent.com/u/1?s=128',
    )
  })

  test('leaves an unparseable url untouched', () => {
    expect(sizedAvatarUrl('not a url')).toBe('not a url')
  })
})

describe('embedStylesInSvg', () => {
  test('puts the styles at the top of the defs', () => {
    expect(embedStylesInSvg('<svg><defs></defs></svg>', '.a{}')).toBe(
      '<svg><defs><style>.a{}</style></defs></svg>',
    )
  })

  test('strips the comments svelte leaves in rendered markup', () => {
    expect(embedStylesInSvg('  <svg><!--[--><defs></defs><!--]--></svg>  ', '')).toBe(
      '<svg><defs><style></style></defs></svg>',
    )
  })
})
