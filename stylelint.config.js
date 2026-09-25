import stylelint from 'stylelint'

const noCommentsRuleName = 'standards/no-comments'
const noCommentsMessages = stylelint.utils.ruleMessages(noCommentsRuleName, {
  rejected: 'Comments are not allowed. Rename the selector or split the rule instead.',
})

const noComments = stylelint.createPlugin(noCommentsRuleName, () => (root, result) => {
  root.walkComments((comment) => {
    stylelint.utils.report({
      ruleName: noCommentsRuleName,
      result,
      node: comment,
      message: noCommentsMessages.rejected,
    })
  })
})
noComments.ruleName = noCommentsRuleName
noComments.messages = noCommentsMessages

const KEBAB_CASE_PATTERN = '^[a-z][a-z0-9]*(-[a-z0-9]+)*$'

export default {
  extends: ['stylelint-config-standard'],
  ignoreFiles: ['src/lib/shared/ui/**'],
  plugins: [noComments],
  rules: {
    'standards/no-comments': true,
    'color-no-hex': true,
    'color-named': 'never',
    'declaration-no-important': true,
    'selector-max-id': 0,
    'max-nesting-depth': 2,
    'selector-max-compound-selectors': 4,
    'selector-class-pattern': KEBAB_CASE_PATTERN,
    'keyframes-name-pattern': KEBAB_CASE_PATTERN,
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'theme',
          'apply',
          'custom-variant',
          'plugin',
          'utility',
          'variant',
          'source',
        ],
      },
    ],
    'import-notation': 'string',
  },
  overrides: [
    {
      files: ['**/*.svelte'],
      customSyntax: 'postcss-html',
      rules: {
        'no-invalid-position-declaration': null,
        'selector-pseudo-class-no-unknown': [true, { ignorePseudoClasses: ['global'] }],
      },
    },
    {
      files: ['src/app.css'],
      rules: { 'color-no-hex': null, 'declaration-no-important': null },
    },
  ],
}
