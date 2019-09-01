'use strict';

const { resolve } = require('path');
const globby = require('globby');

const pathSizes = require('./path-sizes');

module.exports = async (patterns, { cwd, gzip, brotli, fingerprintPattern } = {}) => {
  let paths = await globby(patterns, { cwd });

  let result = {};
  for (let path of paths) {
    let resolvedPath = resolve(cwd, path);
    let displayPath = removeFingerprint(path, fingerprintPattern);
    result[displayPath] = await pathSizes(resolvedPath, { gzip, brotli });
  }

  return result;
};

function removeFingerprint(path, pattern) {
  if (!pattern) {
    return path;
  }

  if (typeof pattern === 'string') {
    pattern = new RegExp(pattern);
  }

  return path.replace(pattern, (match, fingerprint) => match.replace(fingerprint, ''));
}
