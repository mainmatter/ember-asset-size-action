import { expect } from 'chai';
import { diffSizes } from '../lib/helpers';

describe('Diff Sizes', function () {
  it('should show correct diffs for each file', function () {
    const prAssets = {
      'auto-import-fastboot.js': { raw: 221142, gzip: 76707, brotli: null },
      'ember-website-fastboot.js': { raw: 956, gzip: 414, brotli: null },
      'ember-website.js': { raw: 389351, gzip: 71886, brotli: null },
      'vendor.js': { raw: 2717593, gzip: 796082, brotli: null },
      'ember-website.css': { raw: 40196, gzip: 10223, brotli: null },
      'vendor.css': { raw: 57988, gzip: 17920, brotli: null },
    };

    const masterAssets = {
      'ember-website.js': { raw: 386356, gzip: 70873, brotli: null },
      'ember-website-fastboot.js': { raw: 956, gzip: 414, brotli: null },
      'vendor.js': { raw: 2329192, gzip: 666522, brotli: null },
      'ember-website.css': { raw: 40196, gzip: 10223, brotli: null },
      'vendor.css': { raw: 57988, gzip: 17920, brotli: null },
    };

    const diff = diffSizes(masterAssets, prAssets);

    expect(diff).to.deep.equal({
      'auto-import-fastboot.js': { raw: 221142, gzip: 76707 },
      'ember-website.js': { raw: 2995, gzip: 1013 },
      'ember-website-fastboot.js': { raw: 0, gzip: 0 },
      'vendor.js': { raw: 388401, gzip: 129560 },
      'ember-website.css': { raw: 0, gzip: 0 },
      'vendor.css': { raw: 0, gzip: 0 },
    });
  });
});
