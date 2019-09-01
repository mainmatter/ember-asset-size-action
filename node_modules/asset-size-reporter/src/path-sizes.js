'use strict';

const rawPathSize = require('./raw-path-size');
const gzipPathSize = require('./gzip-path-size');
const brotliPathSize = require('./brotli-path-size');

module.exports = async (path, { gzip, brotli } = {}) => {
  if (gzip === true) {
    gzip = 9;
  }

  if (brotli === true) {
    brotli = 'Z';
  }

  let [rawSize, gzipSize, brotliSize] = await Promise.all([
    rawPathSize(path),
    gzip ? gzipPathSize(path, { level: gzip }) : null,
    brotli ? brotliPathSize(path, { level: brotli }) : null,
  ]);

  return { raw: rawSize, gzip: gzipSize, brotli: brotliSize };
};
