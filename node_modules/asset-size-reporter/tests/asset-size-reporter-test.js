'use strict';

const path = require('path');
const stripAnsi = require('strip-ansi');

const report = require('../src/asset-size-reporter');

const FIXTURE_PATH = `${__dirname}/fixtures`;

class FakeConsole {
  constructor() {
    this.messages = [];
  }

  log(message = '') {
    this.messages.push(message);
  }

  get output() {
    return this.messages.join('\n');
  }
}

describe('asset-size-reporter', () => {
  describe('text reporter', () => {
    test('reports results as text by default', async () => {
      let cwd = path.join(FIXTURE_PATH, 'default');

      let patterns = [
        'dist/**/*.js',
        '!dist/ignored-*.js',
      ];

      let fakeConsole = new FakeConsole();

      await report({ patterns, cwd, console: fakeConsole });

      expect(stripAnsi(fakeConsole.output)).toMatchSnapshot();
    });

    test('supports `gzip: false`', async () => {
      let cwd = path.join(FIXTURE_PATH, 'default');

      let patterns = [
        'dist/**/*.js',
        '!dist/ignored-*.js',
      ];

      let fakeConsole = new FakeConsole();

      await report({ patterns, cwd, gzip: false, console: fakeConsole });

      expect(stripAnsi(fakeConsole.output)).toMatchSnapshot();
    });
  });

  describe('JSON reporter', () => {
    test('reports results as JSON if `json` option is used', async () => {
      let cwd = path.join(FIXTURE_PATH, 'default');

      let patterns = [
        'dist/**/*.js',
        '!dist/ignored-*.js',
      ];

      let fakeConsole = new FakeConsole();

      await report({ patterns, json: true, cwd, console: fakeConsole });

      let path1 = path.join('dist', 'file-inside-dist.js');
      let path2 = path.join('dist', 'foo', 'nested-file-inside-dist.js');

      expect(JSON.parse(fakeConsole.output)).toEqual({
        [path1]: { raw: 1855, gzip: 377, brotli: null },
        [path2]: { raw: 3075, gzip: 636, brotli: null },
      });
    });

    test('supports `gzip: false`', async () => {
      let cwd = path.join(FIXTURE_PATH, 'default');

      let patterns = [
        'dist/**/*.js',
        '!dist/ignored-*.js',
      ];

      let fakeConsole = new FakeConsole();

      await report({ patterns, json: true, gzip: false, cwd, console: fakeConsole });

      let path1 = path.join('dist', 'file-inside-dist.js');
      let path2 = path.join('dist', 'foo', 'nested-file-inside-dist.js');

      expect(JSON.parse(fakeConsole.output)).toEqual({
        [path1]: { raw: 1855, gzip: null, brotli: null },
        [path2]: { raw: 3075, gzip: null, brotli: null },
      });
    });
  });

  describe('compare reporter', () => {
    test('reports results as text by default', async () => {
      let cwd = path.join(FIXTURE_PATH, 'default');

      let patterns = [
        'dist/**/*.{js,txt}',
        '!dist/ignored-*.js',
      ];

      let path1 = path.join('dist', 'file-inside-dist.js');
      let path2 = path.join('dist', 'foo', 'nested-file-inside-dist.js');
      let path4 = path.join('dist', 'deleted-file-inside-dist.js');

      let compare = {
        [path1]: { raw: 1275, gzip: 144, brotli: null },
        [path2]: { raw: 3075, gzip: 636, brotli: null },
        [path4]: { raw: 4242, gzip: 42, brotli: null },
      };

      let fakeConsole = new FakeConsole();

      await report({ patterns, compare, cwd, console: fakeConsole });

      expect(stripAnsi(fakeConsole.output)).toMatchSnapshot();
    });

    test('supports `gzip: false`', async () => {
      let cwd = path.join(FIXTURE_PATH, 'default');

      let patterns = [
        'dist/**/*.js',
        '!dist/ignored-*.js',
      ];

      let path1 = path.join('dist', 'file-inside-dist.js');
      let path2 = path.join('dist', 'foo', 'nested-file-inside-dist.js');

      let compare = {
        [path1]: { raw: 1275, gzip: null, brotli: null },
        [path2]: { raw: 32075, gzip: null, brotli: null },
      };

      let fakeConsole = new FakeConsole();

      await report({ patterns, compare, gzip: false, cwd, console: fakeConsole });

      expect(stripAnsi(fakeConsole.output)).toMatchSnapshot();
    });
  });
});
