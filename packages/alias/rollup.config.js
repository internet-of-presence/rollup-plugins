export default {
  input: 'modules/alias.js',
  // external: [...Object.keys(pkg.dependencies), 'os'],
  output: {
    format: 'cjs',
    entryFileNames: '[name].cjs',
    dir: 'dist',
    exports: 'named'
  }
};
