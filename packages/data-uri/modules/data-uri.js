import { URL } from 'url';

import { dataToEsm } from '@rollup/pluginutils';

const reDataUri = /^([^/]+\/[^;,]+)(;base64)?,([\s\S]*)$/;
const mimeTypes = {
  js: 'text/javascript',
  json: 'application/json'
};

/**
 * A Rollup plugin which imports modules from Data URIs.
 * @returns {Plugin}
 */
export function dataUri() {
  /** @type {{ [key: string]: { mime: string | null; content: string | null } }} */
  const resolved = {};

  /** @type {Plugin} */
  const plugin = {
    name: 'data-uri',
    resolveId(id) {
      if (resolved[id]) {
        return id;
      }
      if (!reDataUri.test(id)) {
        return null;
      }
      const uri = new URL(id);
      if (uri.protocol !== 'data:') {
        return null;
      }
      const empty = [null, null, null, null, null];
      const [, mime, format, data] = reDataUri.exec(uri.pathname) || empty;
      if (mime && Object.values(mimeTypes).includes(mime) && data) {
        const base64 = format && /base64/i.test(format.substring(1));
        const content = base64 ? Buffer.from(data, 'base64').toString('utf-8') : data;
        resolved[id] = { mime, content };
        return id;
      }
      return null;
    },
    load(id) {
      if (!resolved[id]) {
        return null;
      }
      const { mime, content } = resolved[id];
      if (!content) {
        return null;
      }
      if (mime === 'text/javascript') {
        return content;
      } else if (mime === 'application/json') {
        let json = '';
        try {
          json = JSON.parse(content);
        } catch (e) {
          const err = /** @type {Error} */ (e);
          const error = {
            message: err.toString(),
            parserError: err,
            plugin: '@rollup/plugin-data-uri',
            pluginCode: 'DU$JSON'
          };
          this.error(error);
        }
        return dataToEsm(json, {
          preferConst: true,
          compact: false,
          namedExports: true,
          indent: '  '
        });
      }
      return null;
    }
  };
  return plugin;
}

export default dataUri;
/**
 * @typedef {import('rollup').Plugin} Plugin
 */
