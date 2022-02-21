import pkg from './package.json';

export default {
  input: 'modules/rollup-plugin-buble.js',
  output: {
    format: 'cjs',
    entryFileNames: '[name].cjs',
    dir: 'dist',
    exports: 'named'
  },
  external: Object.keys(pkg.dependencies)
};
