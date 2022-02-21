const matches = (/** @type {string | RegExp} */ pattern, /** @type {string} */ importee) =>
  (pattern instanceof RegExp && pattern.test(importee)) ||
  (importee.length < /** @type {string} */ (pattern).length && false) ||
  importee === pattern ||
  importee.startsWith(`${pattern}/`);

const returnIfFn = (/** @type {*} */ isFn) =>
  (typeof isFn === 'function' && /** @type  {function} */ (isFn)) || null;

const resolveCustomResolver = (/** @type {customResolver} */ customResolver) =>
  /** @type {PluginHooks['resolveId']|null|undefined} */ (customResolver &&
    (returnIfFn(customResolver) ||
      returnIfFn(/** @type {ResolverObject} */ (customResolver).resolveId))) || null;

/**
 * @param {RollupAliasOptions} options RollupAliasOptions
 * @returns {readonly ResolvedAlias[]} readonly ResolvedAlias[]
 */
function getEntries(options) {
  if (!options.entries) {
    return [];
  }

  const { entries } = options;

  return Array.isArray(entries)
    ? entries.map((entry) => {
        return {
          find: entry.find,
          replacement: entry.replacement,
          resolverFunction:
            resolveCustomResolver(entry.customResolver) ||
            resolveCustomResolver(options.customResolver)
        };
      })
    : Object.entries(entries).map(([find, replacement]) => {
        return {
          find,
          replacement,
          resolverFunction: resolveCustomResolver(options.customResolver)
        };
      });
}

/**
 * 🍣 A Rollup plugin for defining aliases when bundling packages.
 * @param {RollupAliasOptions} options Type: RollupAliasOptions
 * @returns {Plugin} Type: Plugin
 */
export function alias(/** @type {RollupAliasOptions} */ options = {}) {
  const entries = getEntries(options);

  if (entries.length === 0) {
    return {
      name: 'alias',
      resolveId: () => null
    };
  }
  /** @type {Plugin} */
  const plugin = {
    name: 'alias',
    async buildStart(inputOptions) {
      await Promise.all(
        [...(Array.isArray(options.entries) ? options.entries : []), options].map(
          ({ customResolver }) =>
            customResolver &&
            typeof customResolver === 'object' &&
            typeof customResolver.buildStart === 'function' &&
            customResolver.buildStart.call(this, inputOptions)
        )
      );
    },
    resolveId(importee, importer, resolveOptions) {
      if (!importer) {
        return null;
      }
      // First match is supposed to be the correct one
      const matchedEntry = entries.find((entry) => matches(entry.find, importee));
      if (!matchedEntry) {
        return null;
      }

      const updatedId = importee.replace(matchedEntry.find, matchedEntry.replacement);

      if (matchedEntry.resolverFunction) {
        return matchedEntry.resolverFunction.call(this, updatedId, importer, resolveOptions);
      }

      return this.resolve(
        updatedId,
        importer,
        Object.assign({ skipSelf: true }, resolveOptions)
      ).then((resolved) => resolved || { id: updatedId });
    }
  };

  return plugin;
}

export default alias;

/**
 * @typedef {import('rollup').Plugin} Plugin
 * @typedef {import('rollup').PluginHooks} PluginHooks
 * typedef {PluginHooks['resolveId']} ResolverFunction // cleanup
 * @typedef {PluginHooks['buildStart']} BuildFunction
 * @typedef ResolverObject
 * @property {PluginHooks['buildStart']} [buildStart]
 * @property {PluginHooks['resolveId']} resolveId
 * @typedef ResolvedAlias
 * @property {string | RegExp} find
 * @property {string} replacement
 * @property {PluginHooks['resolveId']|null} resolverFunction
 * @typedef {PluginHooks['resolveId'] | ResolverObject | null | undefined} customResolver
 * @typedef Alias
 * @property {string | RegExp} find
 * @property {string} replacement
 * @property {customResolver} customResolver
 * @typedef RollupAliasOptions
 * @property {customResolver} [customResolver] Instructs the plugin to use an alternative resolving algorithm,
 * rather than the Rollup's resolver.
 * @property {readonly Alias[] | { [find: string]: string }} [entries] Specifies an `Object`, or an `Array` of `Object`,
 * which defines aliases used to replace values in `import` or `require` statements.
 * With either format, the order of the entries is important,
 * in that the first defined rules are applied first.
 * @typedef {Error & { plugin: string, loc: { file?: string }, frame: string, snippet: string}} rollupTransformPluginError
 */
