module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    '@electron-toolkit/eslint-config-ts/recommended',
    '@electron-toolkit/eslint-config-prettier'
  ],
  rules: {
    // Disable prop-types globally since you're using TypeScript
    'react/prop-types': 'off',
    // If you want to enforce explicit return types on functions in TypeScript
    '@typescript-eslint/explicit-function-return-type': 'warn' // Or 'error' if you prefer stricter rules
  }
}
