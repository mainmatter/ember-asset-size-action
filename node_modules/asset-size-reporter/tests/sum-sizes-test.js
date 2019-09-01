'use strict';

const sumSizes = require('../src/sum-sizes');

test('sums up sizes correctly', () => {
  let a = { raw: 4242, gzip: 424, brotli: 42 };
  let b = { raw: 1234, gzip: 123, brotli: 12 };
  let c = { raw: 5476, gzip: 547, brotli: 54 };

  expect(sumSizes(a, b)).toEqual(c);
});

test('sums up sizes with nulls correctly', () => {
  let a = { raw: 4242, gzip: 424, brotli: null };
  let b = { raw: 1234, gzip: null, brotli: null };
  let c = { raw: 5476, gzip: 424, brotli: null };

  expect(sumSizes(a, b)).toEqual(c);
});
