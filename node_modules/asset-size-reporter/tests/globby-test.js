'use strict';

const path = require('path');
const globby = require('globby');

const FIXTURE_PATH = `${__dirname}/fixtures`;

describe('globby', () => {
  test('finds and ignores files correctly', () => {
    let cwd = path.join(FIXTURE_PATH, 'default');
    let patterns = [
      'dist/**/*.js',
      '!dist/ignored-*.js',
    ];

    return expect(globby(patterns, { cwd })).resolves.toEqual([
      'dist/file-inside-dist.js',
      'dist/foo/nested-file-inside-dist.js',
    ]);
  });
});
