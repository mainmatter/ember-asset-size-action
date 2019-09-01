'use strict';

const gzipPathSize = require('../src/gzip-path-size');

const FIXTURE_PATH = `${__dirname}/fixtures`;

let tests = [
  ['default/dist/file-inside-dist.js', 377],
  ['default/dist/file-inside-dist.js', 377, 9],
  ['default/dist/file-inside-dist.js', 395, 1],
  ['default/dist/file-inside-dist.js', 1878, 0],
  ['default/dist/text-file-in-dist.txt', 640],
  ['default/dist/foo/nested-file-inside-dist.js', 635],
];

tests.forEach(([fixturePath, expectedSize, level]) => {
  let testName = fixturePath;
  if (level !== undefined) {
    testName += ` (level: ${level})`;
  }

  test(testName, async () => {
    expect(await gzipPathSize(`${FIXTURE_PATH}/${fixturePath}`, { level })).toEqual(expectedSize);
  });
});

test('rejects for missing files', async () => {
  try {
    await gzipPathSize(`${FIXTURE_PATH}/does-not-exist.txt`);
    expect(true).toBeFalsy();
  } catch (e) {
    expect(() => { throw e; }).toThrowError('no such file or directory');
  }
});
