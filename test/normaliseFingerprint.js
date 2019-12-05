import { expect } from 'chai';

import { normaliseFingerprint } from '../lib/helpers';

describe('Normalise Fingerprint', function () {
  it('should remove fingerprints from file names', function () {
    const assets = {
      'dist/assets/auto-import-fastboot-12a5d6f444be918dea6cd3914e6c0fc7.js': { raw: 221142, gzip: 76707, brotli: null },
      'dist/assets/chunk.c63c634560451d1b7290.js': { raw: 221142, gzip: 76707, brotli: null },
      'dist/assets/ember-website-fastboot-1d9d1bfbc74315a1a7f3621398cec1ab.js': { raw: 956, gzip: 414, brotli: null },
      'dist/assets/ember-website-fc52cd4affc83e3b7f52fe490e20b0b8.js': { raw: 389351, gzip: 71886, brotli: null },
      'dist/assets/vendor-169741f10d77b36e0ade129f9972d7a0.js': { raw: 2717593, gzip: 796082, brotli: null },
      'dist/assets/ember-website-506a93c76155d8f06d58747c39e85f4d.css': { raw: 40196, gzip: 10223, brotli: null },
      'dist/assets/vendor-2007b7bcbd16fa425d0d0e589d1b93a4.css': { raw: 57988, gzip: 17920, brotli: null },
    };

    const normalisedAssets = normaliseFingerprint(assets);

    expect(normalisedAssets).to.deep.equal({
      'auto-import-fastboot.js': { raw: 221142, gzip: 76707, brotli: null },
      'ember-website-fastboot.js': { raw: 956, gzip: 414, brotli: null },
      'ember-website.js': { raw: 389351, gzip: 71886, brotli: null },
      'vendor.js': { raw: 2717593, gzip: 796082, brotli: null },
      'ember-website.css': { raw: 40196, gzip: 10223, brotli: null },
      'vendor.css': { raw: 57988, gzip: 17920, brotli: null },
    });
  });
});
