import prettier from 'eslint-config-prettier'
import path from 'node:path'
import { includeIgnoreFile } from '@eslint/compat'
import js from '@eslint/js'
import svelte from 'eslint-plugin-svelte'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import ts from 'typescript-eslint'
import stylistic from '@stylistic/eslint-plugin'
import unicorn from 'eslint-plugin-unicorn'
import importPlugin from 'eslint-plugin-import'
import functional from 'eslint-plugin-functional'
import sonarjs from 'eslint-plugin-sonarjs'
import svelteConfig from './svelte.config.js'

const gitignorePath = path.resolve(import.meta.dirname, '.gitignore')

const noCommentsRule = {
  meta: {
    type: 'suggestion',
    schema: [],
    messages: {
      comment: 'Comments are not allowed. Rename something or extract a named helper instead.',
    },
  },
  create(context) {
    const report = (node) => context.report({ loc: node.loc, messageId: 'comment' })
    return {
      Program() {
        context.sourceCode.getAllComments().forEach(report)
      },
      SvelteHTMLComment: report,
    }
  },
}

const standards = { rules: { 'no-comments': noCommentsRule } }

const VAGUE_NAMES = [
  'item',
  'items',
  'value',
  'values',
  'result',
  'results',
  'tmp',
  'temp',
  'cb',
  'callback',
  'obj',
  'val',
  'res',
  'ret',
  'foo',
  'bar',
  'el',
  'btn',
  'e',
  'err',
  'evt',
  'arr',
  'str',
  'num',
  'info',
  'stuff',
  'thing',
]

const FSD_LAYER_ZONES = [
  {
    target: './src',
    from: './src/**/helpers.ts',
    message: 'Standard 3.6: Do not use generic helper files.',
  },
  {
    target: './src/lib/shared',
    from: ['./src/lib/entities', './src/lib/features', './src/lib/widgets', './src/lib/server'],
    message: 'shared/ is foundational and cannot import from any other layer.',
  },
  {
    target: './src/lib/entities',
    from: ['./src/lib/features', './src/lib/widgets', './src/routes'],
    message: 'entities/ may only depend on shared/.',
  },
  {
    target: './src/lib/features',
    from: ['./src/lib/widgets', './src/routes'],
    message: 'features/ may depend on entities/ and shared/, not widgets/ or routes/.',
  },
  {
    target: './src/lib/features/search-profile',
    from: './src/lib/features/customize-theme',
    message: 'A feature never imports another feature.',
  },
  {
    target: './src/lib/features/customize-theme',
    from: './src/lib/features/search-profile',
    message: 'A feature never imports another feature.',
  },
  {
    target: './src/lib/widgets',
    from: './src/routes',
    message: 'widgets/ cannot import from routes/.',
  },
  {
    target: ['./src/lib/shared', './src/lib/entities', './src/lib/features', './src/lib/widgets'],
    from: './src/lib/server',
    message: 'Server-only code is importable from routes/ and src/lib/server/ only.',
  },
]

export default defineConfig(
  includeIgnoreFile(gitignorePath),
  {
    ignores: [
      'dist/**',
      'build/**',
      'node_modules/**',
      '.svelte-kit/**',
      '*.config.js',
      '*.config.mjs',
      '*.config.ts',
      'src/lib/shared/ui/**',
    ],
  },
  {
    linterOptions: {
      noInlineConfig: true,
      reportUnusedDisableDirectives: 'error',
    },
  },
  js.configs.recommended,
  ts.configs.strictTypeChecked,
  ts.configs.stylisticTypeChecked,
  svelte.configs.recommended,
  prettier,
  svelte.configs.prettier,
  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js', '**/*.ts', '**/*.js'],
    plugins: {
      '@stylistic': stylistic,
      unicorn,
      import: importPlugin,
      sonarjs,
      standards,
    },
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        projectService: { allowDefaultProject: ['scripts/*.ts'] },
        extraFileExtensions: ['.svelte'],
        parser: ts.parser,
        svelteConfig,
      },
    },
    settings: {
      'import/resolver': {
        typescript: { project: './tsconfig.json' },
      },
    },
    rules: {
      'no-undef': 'off',
      'standards/no-comments': 'error',

      '@stylistic/semi': ['error', 'never'],
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
      '@stylistic/max-len': ['error', { code: 100, ignoreUrls: true }],

      'id-denylist': ['error', ...VAGUE_NAMES],
      'id-length': ['error', { min: 2, exceptions: ['x', 'y', '_'] }],
      'unicorn/prevent-abbreviations': [
        'error',
        {
          checkFilenames: false,
          replacements: {
            props: false,
            params: false,
            args: false,
            env: false,
            src: false,
            ref: false,
          },
        },
      ],
      '@typescript-eslint/no-magic-numbers': [
        'error',
        {
          ignore: [-1, 0, 1, 2],
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true,
          ignoreEnums: true,
          ignoreNumericLiteralTypes: true,
          ignoreReadonlyClassProperties: true,
          ignoreTypeIndexes: true,
          enforceConst: true,
        },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'typeLike', format: ['PascalCase'] },
        {
          selector: 'interface',
          format: ['PascalCase'],
          custom: { regex: '^I[A-Z]', match: false },
        },
        {
          selector: 'variable',
          types: ['boolean'],
          format: ['PascalCase', 'UPPER_CASE'],
          prefix: ['is', 'has', 'can', 'should', 'was', 'will', 'did', 'IS_', 'HAS_', 'CAN_'],
        },
      ],

      'sonarjs/no-duplicate-string': ['error', { threshold: 2 }],
      'sonarjs/no-identical-functions': 'error',
      'sonarjs/cognitive-complexity': ['error', 10],

      complexity: ['error', 8],
      'max-depth': ['error', 3],
      'max-params': ['error', 3],
      'max-lines': ['error', { max: 300, skipBlankLines: true }],
      'max-lines-per-function': ['error', { max: 40, skipBlankLines: true }],
      'max-statements': ['error', 15],

      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      '@typescript-eslint/prefer-nullish-coalescing': [
        'error',
        { ignorePrimitives: { string: true } },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/no-deprecated': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { varsIgnorePattern: '^_', argsIgnorePattern: '^_' },
      ],
      'no-console': ['error', { allow: ['warn', 'error'] }],

      'svelte/require-each-key': 'error',
      'svelte/button-has-type': 'error',
      'svelte/prefer-const': 'error',
      'svelte/block-lang': ['error', { script: ['ts'], style: null }],
      // $app/paths' resolve() cannot be called in this project at all — even
      // resolve('/wallpaper/export'), a bare static param-free route with no
      // interpolation, fails "Expected 2 arguments, but got 1" under the pinned
      // typescript@6.0.3, verified in isolation and unrelated to any app code.
      // Until that upstream/TS-version incompatibility is fixed, this rule can't be
      // satisfied without introducing a real type error, so it's off here rather
      // than papered over with a disable comment (inert anyway under noInlineConfig).
      'svelte/no-navigation-without-resolve': 'off',

      'import/no-restricted-paths': ['error', { zones: FSD_LAYER_ZONES }],
    },
  },
  {
    files: ['src/lib/**/*.ts'],
    ignores: [
      'src/lib/**/*.test.ts',
      'src/lib/**/*.svelte.ts',
      'src/lib/**/api/**',
      'src/lib/server/**',
    ],
    plugins: { functional },
    rules: {
      'functional/no-let': 'error',
      'functional/immutable-data': 'error',
      'functional/no-loop-statements': 'error',
      'functional/no-classes': 'error',
      'functional/no-this-expressions': 'error',
      'no-param-reassign': ['error', { props: true }],
    },
  },
  {
    files: ['**/*.svelte'],
    rules: {
      '@typescript-eslint/no-useless-default-assignment': 'off',
    },
  },
  {
    files: ['**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-magic-numbers': 'off',
      'sonarjs/no-duplicate-string': 'off',
      'max-lines-per-function': 'off',
      'max-statements': 'off',
    },
  },
  {
    files: ['scripts/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },
)
