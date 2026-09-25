import adapter from '@sveltejs/adapter-auto'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  compilerOptions: {
    runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true),
  },
  kit: {
    adapter: adapter(),
    csp: {
      mode: 'auto',
      directives: {
        'default-src': ['self'],
        'connect-src': [
          'self',
          'https://ghfetch.amanekai.workers.dev',
          'https://avatars.githubusercontent.com',
          'https://fonts.googleapis.com',
          'https://fonts.gstatic.com',
        ],
        'img-src': [
          'self',
          'data:',
          'https://avatars.githubusercontent.com',
          'https://cdn.simpleicons.org',
          'https://cdn.jsdelivr.net',
        ],
        'font-src': ['self', 'data:', 'https://fonts.gstatic.com'],
        'style-src': ['self', 'unsafe-inline', 'https://fonts.googleapis.com'],
        'script-src': ['self', 'unsafe-inline', 'unsafe-eval'],
        'worker-src': ['self', 'blob:'],
      },
    },
  },
}

export default config
