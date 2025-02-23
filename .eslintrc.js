module.exports = {
  extends: ['rollup', 'plugin:import/typescript'],
  parserOptions: {
    project: ['./tsconfig.eslint.json', './packages/*/tsconfig.json','./modules/*/tsconfig.json', './modules/tsconfig.json'],
    tsconfigRootDir: __dirname
  },
  rules: {
    // disabling sort keys for now so we can get the rest of the linting shored up
    'sort-keys': 'off',
    'typescript-sort-keys/interface': 'off'
  },
  overrides: [
    {
      files: ['**/fixtures/**'],
      rules: {
        'no-console': 'off',
        'import/extensions': 'off',
        'import/no-unresolved': 'off'
      }
    },
    {
      files: ['**/test/**', '**/test.ava/**'],
      rules: {
        'import/extensions': 'off'
      }
    }
  ]
};
