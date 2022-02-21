/**
 * A Rollup plugin which imports modules from Data URIs.
 * @returns {Plugin}
 */
export function dataUri(): Plugin;
export default dataUri;
export type Plugin = import('rollup').Plugin;
