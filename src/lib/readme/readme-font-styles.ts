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
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes growX {
      from { transform: scaleX(0); }
      to { transform: scaleX(1); }
    }
    @keyframes popIn {
      0% { opacity: 0; transform: scale(0.7); }
      70% { opacity: 1; transform: scale(1.06); }
      100% { opacity: 1; transform: scale(1); }
    }
    .stagger { animation: fadeUp 0.5s ease-out forwards; }
    .delay-1 { animation-delay: 0.05s; }
    .delay-2 { animation-delay: 0.15s; }
    .delay-3 { animation-delay: 0.25s; }
    .delay-4 { animation-delay: 0.35s; }
    .anim-card { animation: fadeUp 0.45s ease-out forwards; }
    .anim-row { animation: fadeUp 0.35s ease-out forwards; }
    .anim-slice { animation: popIn 0.4s cubic-bezier(0.33, 1, 0.68, 1) forwards; }
    .bar-fill { animation: growX 0.5s ease-out forwards; }
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
