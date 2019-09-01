'use strict';

const prettyBytes = require('pretty-bytes');

module.exports = (num, { signed } = {}) => {
  if (signed) {
    if (num === 0) {
      return '±0 B';
    }

    let pretty = prettyBytes(num);
    return num < 0 ? pretty : `+${pretty}`;

  } else {
    return prettyBytes(num);
  }
};
