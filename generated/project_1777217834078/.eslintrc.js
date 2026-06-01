module.exports = {
  env: {
    node: true,
    es2022: true,
    jest: true,
  },
  extends: ['airbnb-base', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        ts: 'never',
        js: 'never',
      },
    ],
    'no-console': 'warn',
    'class-methods-use-this': 'off',
  },
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
};
