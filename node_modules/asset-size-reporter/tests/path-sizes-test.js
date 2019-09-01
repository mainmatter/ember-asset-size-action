'use strict';

const pathSizes = require('../src/path-sizes');

const BROTLI_AVAILABLE = require('./brotli-available');

const FIXTURE_PATH = `${__dirname}/fixtures`;

let tests = [
  [{}, { raw: 1855, gzip: null, brotli: null }],
  [{ gzip: true }, { raw: 1855, gzip: 377, brotli: null }],
  [{ gzip: false }, { raw: 1855, gzip: null, brotli: null }],
  [{ gzip: 9 }, { raw: 1855, gzip: 377, brotli: null }],
  [{ gzip: 1 }, { raw: 1855, gzip: 395, brotli: null }],
  [{ brotli: true }, { raw: 1855, gzip: null, brotli: 357 }],
  [{ brotli: false }, { raw: 1855, gzip: null, brotli: null }],
  [{ brotli: 'Z' }, { raw: 1855, gzip: null, brotli: 357 }],
  [{ brotli: 9 }, { raw: 1855, gzip: null, brotli: 365 }],
  [{ brotli: 1 }, { raw: 1855, gzip: null, brotli: 383 }],
];

tests.forEach(([options, expected]) => {
  let testName = JSON.stringify(options);
  let skip = 'brotli' in options && !BROTLI_AVAILABLE;

  (skip ? test.skip : test)(testName, async () => {
    expect(await pathSizes(`${FIXTURE_PATH}/default/dist/file-inside-dist.js`, options)).toEqual(expected);
  });
});

test('rejects for missing files', async () => {
  try {
    await pathSizes(`${FIXTURE_PATH}/does-not-exist.txt`);
    expect(true).toBeFalsy();
  } catch (e) {
    expect(() => { throw e; }).toThrowError('no such file or directory');
  }
});
