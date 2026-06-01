module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'prettier'
  ],
  env: {
    node: true,
    es2022: true,
    jest: true
  },
  rules: {
    // Add project‑specific overrides here
    '@typescript-eslint/no-explicit-any': 'warn',
    'import/order': ['error', { 'newlines-between': 'always' }]
  }
};
