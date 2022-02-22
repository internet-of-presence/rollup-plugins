import { readFile, stat } from './fs';

const onError = (/** @type {{ code: string }} */ error) => {
  if (error.code === 'ENOENT') {
    return false;
  }
  throw error;
};

const makeCache = (
  /** @type {{ (file: any): Promise<boolean>; (file: any): Promise<boolean>; (path: import("fs").PathOrFileDescriptor, options?: { encoding?: null | undefined; flag?: string | undefined; } | null | undefined): Promise<Buffer>; (path: import("fs").PathOrFileDescriptor, options: { encoding: BufferEncoding; flag?: string | undefined; } | BufferEncoding): Promise<string>; (path: import("fs").PathOrFileDescriptor, options?: BufferEncoding | (import("fs").ObjectEncodingOptions & { flag?: string | undefined; }) | null | undefined): Promise<string | Buffer>; (arg0: any): Promise<any>; }} */ fn
) => {
  const cache = new Map();
  const wrapped = async (
    /** @type {any} */ param,
    /** @type {(arg0: unknown, arg1: undefined) => any} */ done
  ) => {
    if (cache.has(param) === false) {
      cache.set(
        param,
        fn(param).catch((err) => {
          cache.delete(param);
          throw err;
        })
      );
    }

    try {
      const result = cache.get(param);
      const value = await result;
      return done(null, value);
    } catch (error) {
      // @ts-ignore
      return done(error);
    }
  };

  wrapped.clear = () => cache.clear();

  return wrapped;
};

// @ts-ignore
export const isDirCached = makeCache(async (file) => {
  try {
    const stats = await stat(file);
    return stats.isDirectory();
  } catch (error) {
    // @ts-ignore
    return onError(error);
  }
});

// @ts-ignore
export const isFileCached = makeCache(async (file) => {
  try {
    const stats = await stat(file);
    return stats.isFile();
  } catch (error) {
    // @ts-ignore
    return onError(error);
  }
});

// @ts-ignore
export const readCachedFile = makeCache(readFile);
