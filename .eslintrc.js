/* .eslintrc.js */
module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true
  },
  extends: 'airbnb', // 使用 eslint-config-airbnb
  parser: 'babel-eslint', // 增强语法识别能力
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2017,
    sourceType: 'module'
  },
  rules: {
    'no-restricted-syntax': 0,
    'no-console': 0,
    // 'import/prefer-default-export': 0,
    // 'import/no-extraneous-dependencies': [2, { devDependencies: true }],
    'react/prop-types': 0,
    'no-param-reassign': 0,
    'no-unused-vars': 1,
    // 'react/forbid-prop-types': 0,
    // 'jsx-a11y/anchor-is-valid': 0,

    // VSCode 的 ESLint 扩展插件暂时无法正确修复这条规则带来的错误
    'react/jsx-one-expression-per-line': 0,
    'class-methods-use-this': 1,
    'guard-for-in': 0,
    'react/destructuring-assignment': 0,

    // 自定义
    'semi': [2, 'never'],
    'max-len': ["error", { "code": 120 }],
    'react/jsx-filename-extension': [2, { extensions: ['.js', '.jsx', '.tsx'] }],
    'jsx-quotes': ['error', 'prefer-single'],
    'react/prefer-stateless-function': 0,
    'import/no-unresolved': 0,
    'import/extensions': 0,
    'comma-dangle': ['error', 'never'],
    'arrow-parens': ['error', 'as-needed'],
    'object-curly-newline': [
      'error',
      {
        ObjectExpression: { multiline: true },
        ObjectPattern: { multiline: true },
        ImportDeclaration: { multiline: true },
        ExportDeclaration: { multiline: true }
      }
    ],
    'jsx-a11y/click-events-have-key-events': 0,
    'jsx-a11y/no-noninteractive-element-interactions': 0
  }
}
