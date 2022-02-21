// eslint-disable-next-line spaced-comment
import { transform } from 'buble';
import { createFilter } from '@rollup/pluginutils';

// TODO: when we remove the jsdoc returns part tsc -b resolves rollup and does that wrong

/**
 * Convert ES2015 with buble.
 * @param {RollupBubleOptions} [options]
 * @returns {Plugin}
 */
function buble(/** @type {RollupBubleOptions} */ options = {}) {
  const filter = createFilter(options.include, options.exclude);
  const transformOptions = { ...options, transforms: { ...options.transforms, modules: false } };
  /** @type {Plugin} */
  const plugin = {
    name: 'buble',

    transform(code, id) {
      if (!filter(id)) return null;
      try {
        return transform(code, transformOptions);
      } catch (e) {
        const error = /** @type {rollupTransformPluginError} */ (e);
        error.plugin = 'buble';
        if (!error.loc) error.loc = {};
        error.loc.file = id;
        error.frame = error.snippet;
        throw e;
      }
    }
  };
  return plugin;
}

/**
 * @typedef {import('rollup').Plugin} Plugin
 * @typedef {import('@rollup/pluginutils').FilterPattern} FilterPattern
 * @typedef {import('buble').TransformOptions} TransformOptions
 * @typedef bubleOptions
 * @property {FilterPattern|undefined} [include] A minimatch pattern, or array of patterns,
 * of files that should be processed by this plugin (if omitted, all files are included by default)
 * @property {FilterPattern|undefined} [exclude] Files that should be excluded, if `include` is otherwise too permissive.
 * @typedef {TransformOptions & bubleOptions} RollupBubleOptions
 * @typedef {Error & { plugin: string, loc: { file?: string }, frame: string, snippet: string}} rollupTransformPluginError
 */

export default buble;

export { buble };
