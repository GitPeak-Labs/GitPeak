import type { ThemeTokens } from '$lib/theme/theme-manager'

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

// For SVG served directly to browsers (api/readme) — browsers resolve @font-face data URIs
// natively.
export function buildReadmeFontStyles(
  monoFontDataUri: string,
  serifFontDataUri: string,
  theme: ThemeTokens,
): string {
  return `
    ${
      monoFontDataUri
        ? `@font-face {
      font-family: 'JetBrains Mono';
      src: url('${monoFontDataUri}') format('woff2');
      font-weight: 400;
      font-style: normal;
    }`
        : ''
    }
    ${
      serifFontDataUri
        ? `@font-face {
      font-family: 'Instrument Serif';
      src: url('${serifFontDataUri}') format('woff2');
      font-weight: 400;
      font-style: normal;
    }`
        : ''
    }
    ${buildCardStyles(theme)}
  `
}

// For SVG rasterized server-side via resvg (og) — resvg does not resolve @font-face data URIs,
// so fonts must instead be registered via Resvg's `font.fontFiles` option.
export function buildOgStyles(theme: ThemeTokens): string {
  return buildCardStyles(theme)
}
