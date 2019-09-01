'use strict';

const prettyBytes = require('../src/pretty-bytes');

test('works normally', () => {
  expect(prettyBytes(42)).toEqual('42 B');
  expect(prettyBytes(-42)).toEqual('-42 B');
  expect(prettyBytes(0)).toEqual('0 B');
});

test('has `signed` option', () => {
  expect(prettyBytes(42, { signed: true })).toEqual('+42 B');
  expect(prettyBytes(-42, { signed: true })).toEqual('-42 B');
  expect(prettyBytes(0, { signed: true })).toEqual('±0 B');
});
