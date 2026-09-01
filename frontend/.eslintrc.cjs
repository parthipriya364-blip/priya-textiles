module.exports = {
  root: true,
  env: { browser: true, es2021: true },
  extends: ['eslint:recommended', 'plugin:react-hooks/recommended'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
  settings: { react: { version: '18.3' } },
  plugins: ['react-refresh'],
  rules: {
    'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]' }],
    'react-refresh/only-export-components': 'warn',
  },
}
