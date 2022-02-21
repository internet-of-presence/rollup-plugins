import nodeResolve from '@rollup/plugin-node-resolve';

import pkg from './package.json';

export default {
  input: 'modules/data-uri.js',
  plugins: [nodeResolve()],
  external: [...Object.keys(pkg.devDependencies), 'url'],
  output: {
    format: 'cjs',
    entryFileNames: 'data-uri.cjs',
    dir: 'dist',
    sourcemap: true,
    // was auto
    exports: 'named'
  }
};
