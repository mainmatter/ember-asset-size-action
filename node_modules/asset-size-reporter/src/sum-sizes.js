'use strict';

module.exports = (a, b) => ({
  raw: a.raw + b.raw,
  gzip: (a.gzip === null && b.gzip === null) ? null : a.gzip + b.gzip,
  brotli: (a.brotli === null && b.brotli === null) ? null : a.brotli + b.brotli,
});
