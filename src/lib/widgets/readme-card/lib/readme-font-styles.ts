import type { ThemeTokens } from '$lib/entities/theme/model/theme-manager'

const ENTRANCE_ANIMATION_STYLES = `
    @keyframes fade-up {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes grow-x {
      from { transform: scaleX(0); }
      to { transform: scaleX(1); }
    }
    @keyframes pop-in {
      0% { opacity: 0; transform: scale(0.7); }
      70% { opacity: 1; transform: scale(1.06); }
      100% { opacity: 1; transform: scale(1); }
    }
    .stagger { animation: fade-up 0.5s ease-out forwards; }
    .delay-1 { animation-delay: 0.2s; }
    .delay-2 { animation-delay: 0.3s; }
    .anim-row { animation: fade-up 0.35s ease-out forwards; }
    .anim-slice { animation: pop-in 0.4s cubic-bezier(0.33, 1, 0.68, 1) forwards; }
    .anim-grow { animation: grow-x 0.7s cubic-bezier(0.33, 1, 0.68, 1) forwards; }
`

type EmbeddedFonts = {
  monoFontDataUri: string
  serifFontDataUri: string
}

function buildCardStyles(theme: ThemeTokens): string {
  return `
    .text-main { font-family: 'JetBrains Mono', 'Noto Sans JP', monospace; fill: ${theme.text}; }
    .text-serif { font-family: 'Instrument Serif', 'Noto Serif JP', serif; fill: ${theme.text}; }
    .text-subtle {
      font-family: 'JetBrains Mono', monospace;
      fill: ${theme.subtle};
      font-size: 11px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }
  `
}

function fontFaceRule(fontFamily: string, fontDataUri: string): string {
  if (!fontDataUri) return ''

  return `@font-face {
      font-family: '${fontFamily}';
      src: url('${fontDataUri}') format('woff2');
      font-weight: 400;
      font-style: normal;
    }`
}

export function buildReadmeFontStyles(fonts: EmbeddedFonts, theme: ThemeTokens): string {
  return [
    fontFaceRule('JetBrains Mono', fonts.monoFontDataUri),
    fontFaceRule('Instrument Serif', fonts.serifFontDataUri),
    buildCardStyles(theme),
    ENTRANCE_ANIMATION_STYLES,
  ].join('\n')
}

export function buildOgStyles(theme: ThemeTokens): string {
  return buildCardStyles(theme)
}
