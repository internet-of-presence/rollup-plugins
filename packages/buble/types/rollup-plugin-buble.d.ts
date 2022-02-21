export default buble;
export type Plugin = import('rollup').Plugin;
export type FilterPattern = import('@rollup/pluginutils').FilterPattern;
export type TransformOptions = import('buble').TransformOptions;
export interface pluginOptions {
  /**
   * A minimatch pattern, or array of patterns,
   * of files that should be processed by this plugin (if omitted, all files are included by default)
   */
  include?: FilterPattern | undefined;
  /**
   * Files that should be excluded, if `include` is otherwise too permissive.
   */
  exclude?: FilterPattern | undefined;
}
export type RollupBubleOptions = TransformOptions & pluginOptions;
export type rollupTransformPluginError = Error & {
  plugin: string;
  loc: {
    file?: string;
  };
  frame: string;
  snippet: string;
};
/**
 * Convert ES2015 with buble.
 * @param {RollupBubleOptions} [options]
 * @returns {Plugin}
 */
export function buble(options?: RollupBubleOptions | undefined): Plugin;
