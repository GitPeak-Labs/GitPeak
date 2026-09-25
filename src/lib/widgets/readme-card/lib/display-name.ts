import { containsCjk } from '$lib/shared/lib/script-segments'

const CJK_GLYPH_WIDTH_EM = 1
const UPPERCASE_GLYPH_WIDTH_EM = 0.47
const LOWERCASE_OR_DIGIT_GLYPH_WIDTH_EM = 0.39
const SPACE_GLYPH_WIDTH_EM = 0.25
const PUNCTUATION_GLYPH_WIDTH_EM = 0.22
const UPPERCASE_PATTERN = /[A-Z]/
const PUNCTUATION_PATTERN = /[,.:;'!|]/
const ELLIPSIS = '…'

function glyphWidthEm(character: string): number {
  if (containsCjk(character)) return CJK_GLYPH_WIDTH_EM
  if (UPPERCASE_PATTERN.test(character)) return UPPERCASE_GLYPH_WIDTH_EM
  if (PUNCTUATION_PATTERN.test(character)) return PUNCTUATION_GLYPH_WIDTH_EM
  if (character === ' ') return SPACE_GLYPH_WIDTH_EM
  return LOWERCASE_OR_DIGIT_GLYPH_WIDTH_EM
}

export function serifTextWidth(text: string, fontSize: number): number {
  return (
    Array.from(text).reduce((width, character) => width + glyphWidthEm(character), 0) * fontSize
  )
}

export function fitDisplayName(displayName: string, maxWidthEm: number): string {
  const characters = Array.from(displayName.trim())
  const runningWidths = characters.reduce<number[]>(
    (widths, character) => [...widths, (widths.at(-1) ?? 0) + glyphWidthEm(character)],
    [],
  )
  const isTooWide = (runningWidths.at(-1) ?? 0) > maxWidthEm
  if (!isTooWide) return characters.join('')

  const widthBeforeEllipsis = maxWidthEm - glyphWidthEm(ELLIPSIS)
  const fittingCount = runningWidths.filter((width) => width <= widthBeforeEllipsis).length
  return `${characters.slice(0, fittingCount).join('').trimEnd()}${ELLIPSIS}`
}
