'use strict';

const createSizeMap = require('../src/create-size-map');

const FIXTURE_PATH = `${__dirname}/fixtures`;

test('`default` fixture: JS files in `dist`', async () => {
  let cwd = `${FIXTURE_PATH}/default`;

  let patterns = [
    'dist/**/*.js',
    '!dist/ignored-*.js',
  ];

  let sizeMap = await createSizeMap(patterns, { gzip: true, cwd });

  expect(sizeMap).toEqual({
    'dist/file-inside-dist.js': { raw: 1855, gzip: 377, brotli: null },
    'dist/foo/nested-file-inside-dist.js': { raw: 3075, gzip: 636, brotli: null },
  });
});

test('`fingerprinted` fixture: CSS+JS files', async () => {
  let cwd = `${FIXTURE_PATH}/fingerprinted`;

  let patterns = [
    '**/*.css',
    '**/*.js',
  ];

  let sizeMap = await createSizeMap(patterns, { gzip: true, cwd });

  expect(sizeMap).toEqual({
    'index-384db273a7f0263ce0862ad0f6c6e98a.js': { raw: 3966, gzip: 650, brotli: null },
    'nested/module-7de664e1a5819d059bcda372a0b198d9.js': { raw: 1855, gzip: 377, brotli: null },
    'styles-807f81099a9ab6ff33cfede0fee287cc.css': { raw: 1846, gzip: 370, brotli: null },
  });
});

test('`fingerprinted` fixture: CSS+JS files with `fingerprintPattern`', async () => {
  let cwd = `${FIXTURE_PATH}/fingerprinted`;

  let patterns = [
    '**/*.css',
    '**/*.js',
  ];

  let fingerprintPattern = '(-[a-f\\d]{32})\\.';

  let sizeMap = await createSizeMap(patterns, { gzip: true, fingerprintPattern, cwd });

  expect(sizeMap).toEqual({
    'index.js': { raw: 3966, gzip: 650, brotli: null },
    'nested/module.js': { raw: 1855, gzip: 377, brotli: null },
    'styles.css': { raw: 1846, gzip: 370, brotli: null },
  });
});
