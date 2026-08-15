// eslint-disable-next-line @stylistic/max-len -- import specifier can't be wrapped
import instrumentSerif from '@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2?url&inline'
// eslint-disable-next-line @stylistic/max-len -- import specifier can't be wrapped
import jetBrainsMono from '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2?url&inline'

// Vite embeds these compressed files in the server bundle. README requests therefore never
// wait on Google Fonts and cannot fail because a font CDN is slow or unavailable.
export const README_FONT_DATA_URIS = {
  mono: jetBrainsMono,
  serif: instrumentSerif,
} as const
