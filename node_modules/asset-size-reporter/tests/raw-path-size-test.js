'use strict';

const rawPathSize = require('../src/raw-path-size');

const FIXTURE_PATH = `${__dirname}/fixtures`;

let tests = [
  ['default/dist/file-inside-dist.js', 1855],
  ['default/dist/text-file-in-dist.txt', 3937],
  ['default/dist/foo/nested-file-inside-dist.js', 3075],
];

tests.forEach(([fixturePath, expectedSize, level]) => {
  test(fixturePath, async () => {
    expect(await rawPathSize(`${FIXTURE_PATH}/${fixturePath}`, { level })).toEqual(expectedSize);
  });
});

test('rejects for missing files', async () => {
  try {
    await rawPathSize(`${FIXTURE_PATH}/does-not-exist.txt`);
    expect(true).toBeFalsy();
  } catch (e) {
    expect(() => { throw e; }).toThrowError('no such file or directory');
  }
});
