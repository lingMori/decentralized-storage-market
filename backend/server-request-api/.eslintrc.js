module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    // project: 'module',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
    // extraFileExtensions: ['.json'],
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  // remove the eslint type check in *.json / *.md kind files
  ignorePatterns: ['.eslintrc.js', 'package*.json', 'tsconfig.json', '*.json', '*.md'],
  
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
