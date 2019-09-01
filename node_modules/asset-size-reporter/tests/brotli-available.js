'use strict';

const execa = require('execa');

const BROTLI_AVAILABLE = isBrotliAvailable();

function isBrotliAvailable() {
  try {
    return execa.sync('brotli', ['--version'], { preferLocal: false }).status === 0;

  } catch (e) {
    if (e.code === 'ENOENT') {
      return false;
    } else {
      throw e;
    }
  }
}

module.exports = BROTLI_AVAILABLE;
